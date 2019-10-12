import md5 from "md5";

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
