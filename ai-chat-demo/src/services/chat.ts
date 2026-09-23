import { ChatMessage } from "../types/chat";

// 参数：消息数组 传给大模型接口
export async function sendChatRequest(messages: ChatMessage[]) {
    // 1.发起fetch, await等待请求完成
    const res = await fetch('/api/ark/api/v3/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': "application/json",
        },
        body: JSON.stringify({
            // 从环境变量读取模型名称 不硬编码
            model: import.meta.env.VITE_AI_MODEL,
            messages: messages
        })
    })

    // 2.关键：判断请求是否成功
    // fetch 大坑：只有断网才自动抛错；400、401、429、500 这些 HTTP 错误状态码，fetch 不会自动抛异常！必须我们手动判断 res.ok + throw
    if (!res.ok) {
        // 把后端返回的错误信息抛出去 组件catch捕获
        const errorInfo = await res.json()
        throw new Error(`接口调用失败: ${res.status}, ${JSON.stringify(errorInfo)}`)
    }
    // 3.拿到返回的json
    const data = await res.json()

    // 4.从返回体提取AI回复文本
    // 火山方舟返回结构：data.choices[0].message.content
    const aiText = data.choices[0].message.content

    // 返回给调用方(App组件)
    return aiText
}