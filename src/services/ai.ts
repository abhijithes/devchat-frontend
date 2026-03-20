import api from "../utils/axios";
import { endpoints } from "../constant/constant";

export type AiAction = "review" | "rewrite" | "custom";

export interface AiIssue {
    severity: "high" | "medium" | "low";
    title: string;
    explanation: string;
}

export interface AiResult {
    summary: string;
    issues?: AiIssue[];
    suggestions?: string[];
    rewrittenCode?: string;
    notes?: string[];
}

export interface RunAiTaskPayload {
    action: AiAction;
    content: string;
    instruction?: string;
    context?: {
        source?: "chat_message";
        messageId?: string;
        roomId?: string;
    };
}

export interface RunAiTaskResponse {
    action: AiAction;
    result: AiResult;
    usage?: {
        provider?: string;
        model?: string;
    };
}

export const runAiTask = async (payload: RunAiTaskPayload) => {
    const { data } = await api.post<RunAiTaskResponse>(endpoints.aiRun, payload);
    return data;
};
