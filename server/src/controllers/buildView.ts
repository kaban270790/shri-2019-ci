import {Request, Response} from "express";
import getResultBuild, {BuildResult} from "../getResultBuild";

export default function (req: Request, res: Response) {
    getResultBuild(parseInt(req.params.buildId)).then((buildResult: BuildResult) => {
        res.end(`
<div><a href="/">Main</a></div>
<div>id: ${buildResult.id}</div>
<div>repository: ${buildResult.repository}</div>
<div>commit_hash: ${buildResult.commit_hash}</div>
<div>result: ${buildResult.result}</div>
`);
    });
}
