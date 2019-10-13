import request from "request";
import {mkdirSync} from "fs";
import {resolve as pathResolve} from "path";
import {spawnSync,} from "child_process";
import {Base64} from "js-base64";
import {server_url} from "./params";

let promiseQueue = (new Promise((resolve) => {
    resolve()
}));

const TMP_BUILD_DIR = pathResolve(__dirname, '..', 'tmp');

export type BuildResultType = {
    id: number,
    repository: string,
    commit_hash: string,
    result: number,
    command: string,
    stdout?: string,
    stderr?: string
};

type ResultData = { id: number, status: number, stdout: string, stderr?: string };

const sendResult = (data: ResultData) => {
    data.stdout = Base64.toBase64(data.stdout || '');
    data.stderr = Base64.toBase64(data.stderr || '');
    request({
        method: 'POST',
        url: `${server_url}/notify_build_result`, //todo из параметров
        json: data
    }, (error) => {
        if (error) {
            console.error(error.toString());//todo возможно еще как-то уведомлять связи с сервером
        }
    });
};

export default function addToQueue(build: BuildResultType) {
    promiseQueue.then(() => {
        return createBuild(build)
            .then(data => {
                sendResult(data);
            })
            .catch(reason => {
                sendResult({id: build.id, status: 1, stdout: reason, stderr: reason});
            });
    });
}

const createBuild = (build: BuildResultType) => {
    return (new Promise<ResultData>((resolve) => {
            const cwd = pathResolve(TMP_BUILD_DIR, build.id.toString());
            mkdirSync(cwd);
            let result = {
                id: build.id,
                status: 0,
                stdout: '',
                stderr: ''
            };
            let commands = build.command.split("\n");
            commands.unshift(`git checkout ${build.commit_hash}`);
            commands.unshift(`git clone ${build.repository} ./`);

            let promiseExec = (new Promise<ResultData>((res) => {
                res(result);
            }));
            promiseExec.then((result) => {
                for (let i = 0, l = commands.length; i < l; i++) {
                    let command = commands[i];
                    let commandArray = command.split(" ");
                    const file = commandArray.shift() || '';
                    if (file.length > 0) {//todo надо изучить make и уйти от этой х-ни
                        let {stderr, stdout, status} = spawnSync(file, commandArray, {cwd});
                        let stdoutCommand = `\nCommand: ${command}\n`;
                        if (status && status > 0) {
                            result.status = status;
                            result.stderr = (stdoutCommand + stderr);
                            break;
                        } else {
                            result.stdout += (stdoutCommand + stdout);
                        }
                    }
                }
                return result;
            });

            promiseExec.catch((stderr) => {
                result.stderr = stderr;
                resolve(result);
            });
            promiseExec.then((result) => {
                resolve(result);
            });
        }
    ));
};

