import {resolve as pathResolve} from 'path';
import {readFile} from 'fs';
import {parseString} from 'xml2js';

export type BuildResult = {
    id: number,
    repository: string,
    commit_hash: string,
    result: number,
    command?: string,
    stdout?: string,
    stderr?: string
};

const getBuildData = (buildDir: string) => {
    return (new Promise<BuildResult>((resolve, reject) => {
        readFile(pathResolve(buildDir, 'data.xml'), {flag: 'r'}, ((err, data) => {
            if (err) {
                reject(err);
            }
            parseString(data.toString(), {explicitArray: false, explicitRoot: false}, (err, xml) => {
                if (err) {
                    reject(err);
                }
                resolve(xml);
            })
        }));
    }))
};

export default (buildId: number) => (new Promise<BuildResult>((resolve, reject) => {
    //todo проверять существование папки
    const dir = pathResolve(__dirname, '..', 'data_base', 'results', buildId.toString());
    getBuildData(dir).then(buildData => resolve(buildData));
}));
