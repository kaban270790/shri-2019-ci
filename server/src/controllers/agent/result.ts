import setResultBuild from "../../setResultBuild";
import {Request, Response} from "express";

export default function (req: Request, res: Response) {
    setResultBuild(req.body)
        .then(result => res.json(result))
        .catch(reason => res.status(500).json({error: reason}));
}
