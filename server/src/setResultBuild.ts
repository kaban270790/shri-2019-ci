import {resolve as pathResolve} from 'path';
import {readFile, writeFile} from 'fs';
import {Builder as XmlBuilder, parseString} from 'xml2js';
import {BuildResultType} from "./build";

export type BuildResult = {
    id: number,
    repository: string,
    commit_hash: string,
    result: number,
    command?: string,
    stdout?: string,
    stderr?: string
};

export type BuildResultJson = {
    id: number,
    status: number,
    stdout?: string,
    stderr?: string,
    timeEnd?: number,
    timeStart?: number,
};

const setBuildResult = (buildDir: string, buildResult: BuildResultJson) => {
    return (new Promise<boolean>((resolve, reject) => {
        const pathResultFile = pathResolve(buildDir, 'data.xml');
        readFile(pathResultFile, {flag: 'r'}, ((err, data) => {
            if (err) {
                reject(err);
            }
            parseString(data.toString(), {explicitArray: false, explicitRoot: false}, (err, xml: BuildResultType) => {
                if (err) {
                    reject(err);
                }
                xml.timeEnd = buildResult.timeEnd;
                xml.timeStart = buildResult.timeStart;
                xml.result = buildResult.status;
                xml.stdout = buildResult.stdout;
                xml.stderr = buildResult.stderr;
                const builder = new XmlBuilder();
                const xmlToStr = builder.buildObject(xml);
                writeFile(pathResultFile, xmlToStr, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                });
            })
        }));
    }))
};

export default (buildResult: BuildResultJson) => (new Promise<{ result: boolean }>((resolve, reject) => {
    //todo проверять существование папки
    const dir = pathResolve(__dirname, '..', 'data_base', 'results', buildResult.id.toString());
    setBuildResult(dir, buildResult).then(result => {
        resolve({result});
    });
}));
