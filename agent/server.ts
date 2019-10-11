import express, {Response} from "express";
import {Server} from "http";
import request from "request";
import Signals = NodeJS.Signals;

const app = express();
const port = 3001;
let secretKey: string | undefined;
let server: Server;

// fixme
////////////////////////////////////////////////////
// let s: Signals[] = ["SIGABRT", "SIGALRM", "SIGBUS", "SIGCHLD", "SIGCONT", "SIGFPE", "SIGHUP", "SIGILL", "SIGINT", "SIGIO",
//     "SIGIOT", "SIGKILL", "SIGPIPE", "SIGPOLL", "SIGPROF", "SIGPWR", "SIGQUIT", "SIGSEGV", "SIGSTKFLT",
//     "SIGSTOP", "SIGSYS", "SIGTERM", "SIGTRAP", "SIGTSTP", "SIGTTIN", "SIGTTOU", "SIGUNUSED", "SIGURG",
//     "SIGUSR1", "SIGUSR2", "SIGVTALRM", "SIGWINCH", "SIGXCPU", "SIGXFSZ", "SIGBREAK", "SIGLOST", "SIGINFO"];
//
// s.forEach((value: Signals) => {
//     process.on(value, () => {
//         console.log(value);
//     });
// });
////////////////////////////////////////////////////

const actionNotFound = (res: Response) => {
    res.status(404).send('Not found!');
};

type ResponseNotifyAgent = {
    secretKey: string,
    result: boolean,
}

type ResponseDisableNotifyAgent = {
    result: boolean,
}

const sendSigOpen = () => {
    request({
        method: 'POST',
        url: 'http://localhost:3000/notify_agent', //todo из параметров
        json: {
            host: 'localhost',
            port: port,
            protocol: 'http'
        }
    }, (error, response) => {
        if (error) {
            console.error(error.toString());//todo возможно еще как-то уведомлять связи с сервером
            process.exit();
        }
        const json: ResponseNotifyAgent = response.body;
        //todo Обрабатывать связывание с сервером
        secretKey = json.secretKey;
    });
};
const sendSigClose = () => {
    if (!secretKey) {
        return;
    }
    request({
        method: 'POST',
        url: 'http://localhost:3000/disable_notify_agent', //todo из параметров
        json: {secretKey}
    }, (error, response) => {
        if (error) {
            console.error(error.toString());//todo возможно еще как-то уведомлять связи с сервером
            process.exit();
        }
        const json: ResponseDisableNotifyAgent = response.body;
        //todo Обрабатывать связывание с сервером
        server.close();
    });
};

app.post('/build', function (req, res) {
    res.json({result: true});
});

app.get('/404', function (req, res) {
    actionNotFound(res);
});

server = app
    .listen(port, () => {
        console.log(`app listening on port ${port}`);

        process.addListener("SIGINT", code => { //Сигнал остановки скрипта
            sendSigClose();
            return true;
        });
        sendSigOpen();
    })
    .on("error", (a) => {
        sendSigClose();
        return true;
    });