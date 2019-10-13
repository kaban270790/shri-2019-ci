import {Request, Response} from "express";
import getResultBuild from "../getResultBuild";
import {Base64} from "js-base64";
import {BuildResultType} from "../build";
import moment from "moment";

export default function (req: Request, res: Response) {
    getResultBuild(parseInt(req.params.buildId)).then((buildResult: BuildResultType) => {
        res.end(`
<div><a href="/">Main</a></div>
<div>id: ${buildResult.id}</div>
<div>repository: ${buildResult.repository}</div>
<div>commit_hash: ${buildResult.commit_hash}</div>
<div>start: ${moment(buildResult.timeStart ? (buildResult.timeStart * 1000) : '').format('lll')}</div>
<div>end: ${moment(buildResult.timeEnd ? (buildResult.timeEnd * 1000) : '').format('lll')}</div>
<div>commit_hash: ${buildResult.commit_hash}</div>
<div>result: ${buildResult.result}</div>
<div>Command:<br><textarea readonly style="width: 100%; min-height: 200px;">${buildResult.command}</textarea></div>
<div>Stdout:<br><textarea readonly style="width: 100%; min-height: 300px;">${Base64.fromBase64(buildResult.stdout || '')}</textarea></div>
<div>Stderr:<br><textarea readonly style="width: 100%; min-height: 300px;">${Base64.fromBase64(buildResult.stderr || '')}</textarea></div>
`);
    });
}
