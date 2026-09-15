import { ChatRequest, ChatResponse } from "../types/chat";

// 入参是 `ChatRequest` 返回值是 `Promise<ChatResponse>`
export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 拿到用户最后一条消息的内容
            const lastUserMessage = request.messages[request.messages.length - 1].content;
            // 构造和之前一样的模拟回复
            const replyContent = `这是AI的回复：${lastUserMessage}`

            // 按约定的格式返回结果
            resolve({
                content: replyContent
            })
        }, 1000);
    }

    )

}