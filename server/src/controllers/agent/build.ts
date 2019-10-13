import {Request, Response} from "express";
import {BuildResultType, RESULTS, save as saveBuild, sendToAgent} from "../../build";


export default function (req: Request, res: Response) {
    let build: BuildResultType = {
        repository: req.body['repository'] || '',
        commit_hash: req.body['commit_hash'] || '',
        command: req.body['command'] || '',
        result: RESULTS.created
    };
    saveBuild(build)
        .then((build: BuildResultType) => {
            return sendToAgent(build);
        })
        .then((build: BuildResultType) => {
            res.redirect('/build/' + build.id);
        })
        .catch((reason: string) => {
            res.status(400).send(reason);
        });
}
