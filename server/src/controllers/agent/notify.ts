import {Request, Response} from "express";
import {AgentType, push as pushAgent, randSecret} from "../../agents";

export default function (req: Request, res: Response) {
    let agent: AgentType = req.body;
    try {
        agent.secretKey = randSecret(agent);
        pushAgent(agent);
    } catch (e) {
        res.status(400).json({result: false, error: e.message});
    }
    res.json({result: true, secretKey: agent.secretKey});
}
