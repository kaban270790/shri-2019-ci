import express, {Response} from "express";
import bodyParser from "body-parser";
import indexController from './src/controllers/index';
import notFoundController from './src/controllers/notFound';
import buildViewController from './src/controllers/buildView';
import agentNotifyController from './src/controllers/agent/notify';
import agentDisableController from './src/controllers/agent/disable';
import agentResultController from './src/controllers/agent/result';

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/', indexController);

app.get('/build/:buildId', buildViewController);

app.post('/notify_agent', agentNotifyController);

app.post('/disable_notify_agent', agentDisableController);

app.post('/notify_build_result', agentResultController);

app.get('/404', notFoundController);

app.listen(port, () => console.log(`app listening on port ${port}`));
