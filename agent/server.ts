import express, {Response} from "express";
import {Server} from "http";
import request from "request";
import bodyParser from "body-parser";
import addToQueue, {BuildResultType} from "./src/build";

const app = express();
const port = 3001;
let secretKey: string | undefined;
let server: Server;

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

app.use(bodyParser.json());

app.post('/build', function (req, res) {
    let build: BuildResultType = {
        id: parseInt(req.body.id),
        command: req.body.command,
        repository: req.body.repository,
        commit_hash: req.body.commit_hash,
        result: 0
    };
    addToQueue(build);
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
