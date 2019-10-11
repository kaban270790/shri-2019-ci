import express, {Request, Response} from "express";
import readBuilds from "./src/readBuilds";
import getResultBuild, {BuildResult} from "./src/getResultBuild";
import bodyParser from 'body-parser';
import setResultBuild from "./src/setResultBuild";

const app = express();
const port = 3000;
const actionNotFound = (res: Response) => {
    res.status(404).send('Not found!');
};

const actionGetListBuilds = (req: Request, res: Response) => {
    readBuilds().then(builds => {
        let result = '';
        builds.map((build) => {
            result += `<div><a href="/build/${build.name}">build #${build.name}</a></div>`;
        });
        res.end(result);
    }).catch(reason => {
        res.status(500).end(reason);
    });
};

app.get('/', function (req, res) {
    actionGetListBuilds(req, res);
});

app.get('/build/:buildId', function (req: Request, res) {
    getResultBuild(parseInt(req.params.buildId)).then((buildResult: BuildResult) => {
        res.end(`
<div><a href="/">Main</a></div>
<div>id: ${buildResult.id}</div>
<div>repository: ${buildResult.repository}</div>
<div>commit_hash: ${buildResult.commit_hash}</div>
<div>result: ${buildResult.result}</div>
`);
    });
});

app.use(bodyParser.json());

app.get('/notify_agent', function (req, res) {
    res.send('notify_agent');
});

app.post('/notify_build_result', function (req, res) {
    setResultBuild(req.body)
        .then(result => res.json(result))
        .catch(reason => res.status(500).json({error: reason}));
});

app.get('/404', function (req, res) {
    actionNotFound(res);
});

app.listen(port, () => console.log(`app listening on port ${port}`));