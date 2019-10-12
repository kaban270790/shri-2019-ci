import {Request, Response} from "express";
import readBuilds from "../readBuilds";

export default (req: Request, res: Response) => {
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
