import {agents, AgentType, find, push as pushAgent, randSecret, remove as removeAgent} from "../../agents";
import {Request, Response} from "express";

export default function (req: Request, res: Response) {
    let agent: AgentType = req.body;
    try {
        removeAgent(agent);
    } catch (e) {
        res.status(400).json({result: false, error: e.message});
    }
    res.json({result: true});
}
