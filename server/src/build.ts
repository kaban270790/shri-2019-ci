import {resolve as pathResolve} from "path";
import {mkdir, writeFile} from "fs";
import {Builder as XmlBuilder} from "xml2js";
import request from "request";
import {getAgent} from "./agents";


export type BuildResultType = {
    id?: number,
    repository: string,
    commit_hash: string,
    result: number,
    command?: string,
    stdout?: string,
    stderr?: string
};
const DIR_RESULTS = pathResolve(__dirname, '..', 'data_base', 'results',);
const FILENAME_DATA = 'data.xml';

export function save(build: BuildResultType) {
    return (new Promise<BuildResultType>((resolve, reject) => {
        randId(build);
        mkdir(pathResolve(DIR_RESULTS, build.id + ''), err => {
            if (err) {
                reject(err);
            }
            const builder = new XmlBuilder();
            const xmlToStr = builder.buildObject(build);
            writeFile(pathResolve(DIR_RESULTS, build.id + '', FILENAME_DATA), xmlToStr, (err) => {
                if (err) {
                    reject(err);
                }
                resolve(build);
            });
        });
    }))
}

export function update(build: BuildResultType) {
    return (new Promise<BuildResultType>((resolve, reject) => {
        const builder = new XmlBuilder();
        const xmlToStr = builder.buildObject(build);
        writeFile(pathResolve(DIR_RESULTS, build.id + '', FILENAME_DATA), xmlToStr, (err) => {
            if (err) {
                reject(err);
            }
            resolve(build);
        });
    }))
}

function randId(build: BuildResultType) {
    build.id = Date.now();
    //можно будет потом сделать какой то более сложный генератор ид,
    //но пока что думаю запрос не чаще милиисекунды будет
}

export function sendToAgent(build: BuildResultType) {
    return (new Promise<BuildResultType>((resolve, reject) => {
        let agent = getAgent();
        request({
            method: 'POST',
            url: `${agent.protocol}://${agent.host}:${agent.port}/build`,
            json: build
        }, (error, response) => {
            build.result = -1;
            if (error || response.body.result === false) {
                update(build).then(() => {
                    console.error(error.toString());
                    reject(error || "Error sending to task");
                });
            }
            update(build).then(build => {
                resolve(build);
            });
        });
    }));
}
