import {resolve as pathResolve} from "path";
import {mkdir, writeFile} from "fs";
import {Builder as XmlBuilder} from "xml2js";
import request from "request";
import {getAgent} from "./agents";

export const enum RESULTS {
    'created' = 0,
    'send to task' = 1,
    'error sending to task' = 2,
    'in work' = 5,
    'completed without errors' = 10,
    'completed with an error' = 11
}

export type BuildResultType = {
    id?: number,
    repository: string,
    commit_hash: string,
    result: RESULTS,
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
            if (error || response.body.result === false) {
                build.result = RESULTS['error sending to task'];
                update(build).then(() => {
                    console.error(error.toString());
                    reject(error || "Error sending to task");
                });
            }
            build.result = RESULTS['send to task'];
            update(build).then(build => {
                resolve(build);
            });
        });
    }));
}
