import request from "request";

let queue = [];
let promiseQueue = (new Promise((resolve) => {
    resolve()
}));

export type BuildResultType = {
    id: number,
    repository: string,
    commit_hash: string,
    result: number,
    command?: string,
    stdout?: string,
    stderr?: string
};

type ResultData = { id: number, status: number, stdout: string, stderr?: string };

const sendResult = (data: ResultData) => {
    request({
        method: 'POST',
        url: 'http://localhost:3000/notify_build_result', //todo из параметров
        json: data
    }, (error, response) => {
        if (error) {
            console.error(error.toString());//todo возможно еще как-то уведомлять связи с сервером
        }
    });
};

export default function addToQueue(build: BuildResultType) {
    promiseQueue.then(value => {
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
    return (new Promise<ResultData>((res, rej) => {
        setTimeout(() => {
            res({
                id: build.id,
                status: 0,
                stdout: 'text'
            });
        }, 10 * 1000);
    }));
};
