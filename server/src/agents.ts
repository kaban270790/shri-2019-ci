import md5 from "md5";
import {Random} from "random-js";

const random = new Random();

export type AgentType = {
    host: string,
    port: number,
    protocol: 'http' | 'https',
    secretKey: string,
};

export let agents: AgentType[] = [];

export const find = (secretKey: string): number => {
    for (let i = 0, l = agents.length; i < l; i++) {
        if (agents[i].secretKey === secretKey) {
            return i;
        }
    }
    return -1;
};
export const push = (agent: AgentType): void => {
    const agentIndex = find(agent.secretKey);
    if (agentIndex >= 0) {
        throw new Error("Agent has exist");
    } else {
        agents.push(agent);
    }
};

export const remove = (agent: AgentType): void => {
    const agentIndex = find(agent.secretKey);
    if (agentIndex === -1) {
        throw new Error("Agent not found");
    } else {
        agents.splice(agentIndex, 1);
    }
};

export const randSecret = (agent: AgentType): string => {
    return md5(`${agent.protocol}://${agent.host}:${agent.port}`);
};

export function getAgent(): AgentType {
    if (agents.length === 0) {
        throw new Error("Agents not found");
    }
    if (agents.length > 1) {
        return agents[random.integer(0, agents.length - 1)]
    } else {
        return agents[0];
    }
}
