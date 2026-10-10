import { ChatMessage } from "../types/chat";

// 参数：消息数组 传给大模型接口
export function sendChatRequest(
    messages: ChatMessage[],
    // 回调函数类型定义：接受string，无返回值
    onDelta: (deltaText: string) => void
) {

    // 创建中断控制器
    const controller = new AbortController()

    const request = (async () => {
        // 1.发起fetch, 新增 signal 绑定控制器
        const res = await fetch('/api/ark/api/v3/chat/completions', {
            method: 'POST',
            headers: {
                // 告诉后端服务器：本次请求体 body 里面的数据格式是 JSON 字符串
                'Content-Type': "application/json",
            },
            // HTTP 请求 body 只能传字符串 / 二进制，不能直接传 JS 对象。`JSON.stringify`：JS 对象 → JSON 字符串。
            body: JSON.stringify({
                // 从环境变量读取模型名称 不硬编码
                model: import.meta.env.VITE_AI_MODEL,
                messages: messages,
                stream: true // 开启流式
            }),
            // 新增：把中断信号传给 fetch
            signal: controller.signal
        })

        // 2.关键：判断请求是否成功
        // fetch 大坑：只有断网才自动抛错；400、401、429、500 这些 HTTP 错误状态码，fetch 不会自动抛异常！必须我们手动判断 res.ok + throw
        // `res.ok`：当 HTTP 状态码在 200~299 之间为 true；4xx、5xx 全部 false
        if (!res.ok) {
            // 读取错误响应文本
            const errText = await res.text()
            throw new Error(`请求失败，状态码: ${res.status}, 错误详情：${errText}`)
        }

        // 拿到响应体的可读流，getReader()获取流读取器
        // `res.body`类型是`ReadableStream | undefined`，代表 HTTP 响应体原始二进制流  `.getReader()`：创建一个流读取器，独占这个流
        const reader = res.body?.getReader()
        // 类型守卫：如果body不存在直接抛出异常
        if (!reader) {
            throw new Error("响应流不存在，无法读取流式数据")
        }

        // 创建 UTF-8 解码器：网络流传输过来的数据是二进制字节`Uint8Array`，JS 无法直接当成字符串。TextDecoder 浏览器原生 API，负责把二进制字节 → UTF-8 字符串（中文、英文）
        const decoder = new TextDecoder("utf-8")
        // 缓存：用来存放不完整的片段（跨chunk切割时，一段SSE消息被拆分到两个二进制块，需要缓存拼接）
        // buffer 内容需要不断追加修改，const 不能修改
        let buffer = ""

        // 循环读取流，无限循环直到done=true
        while (true) {
            // 读取一块二进制数据，返回{done: boolean, value：Uint8Array}
            const { done, value } = await reader.read()

            // done为true: 流读取完毕，退出循环
            if (done) break

            // 二进制value -> 转普通字符串，追加到buffer缓存
            // `{stream:true}`：告诉解码器，字符可能跨数据包拆分（比如一个中文占 3 字节，刚好被拆到两个包），解码器保留缓存，等后续字节补齐
            const chunkStr = decoder.decode(value, { stream: true })
            // 本次解析出来的字符串，追加到 buffer 缓存尾部  buffer = 旧的半截消息 + 本次新收到的字符串
            buffer += chunkStr

            // SSE消息以 \n\n 分割多条消息，循环分割buffer里面所有完整消息
            // 字符串切割，返回一个新数组
            const lines = buffer.split("\n\n")
            // 最后一项大概率是不完整片段，放回buffer，下一轮循环继续拼接  `lines.pop()`：取出数组最后一个元素，从 lines 数组删掉
            buffer = lines.pop() || ""

            //`for...of`是 JS 遍历数组语法 
            // 遍历每一条完整SSE消息，每一轮循环，把数组当中的其中一个元素，赋值给局部常量`line`
            for (const line of lines) {
                // SSE每一行以data: 开头，过滤掉无关空行
                if (!line.startsWith("data: ")) continue
                // 截取 data：后面的内容
                const jsonStr = line.replace("data:", "")

                // 火山方舟结束标记：data: [DONE]，代表生成结束
                if (jsonStr === "[DONE]") continue

                try {
                    // 解析这条SSE的JSON
                    const json = JSON.parse(jsonStr)
                    // 提取增量文字 delta.content
                    const deltaText: string | undefined = json.choices?.[0]?.delta?.content
                    // 如果有文字片段，调用回调函数传给App组件
                    if (deltaText) {
                        onDelta(deltaText)
                    }
                } catch (parseErr) {
                    // 单条解析失败不中断整个请求，只打印警告
                    console.warn("SSE片段解析失败", parseErr)
                }
            }
        }
    })()  //这里的()表示立即执行这个async函数，返回一个Promise对象

    // 新增：向外暴露对象：请求 + 取消方法
    return {
        request, //外面await这个，等待流式结束
        cancel: () => {
            // 调用控制器中断，fetch会立刻断开连接
            controller.abort()
        }
    }
}
