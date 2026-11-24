// 单条消息类型
export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    isWelcome?: boolean;
}

// 发送给AI的请求格式
export interface ChatRequest {
    messages: ChatMessage[];
}

// AI返回的响应格式
export interface ChatResponse {
    content: string;
}

