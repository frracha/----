// 1.导入依赖
import React, { useEffect, useRef } from 'react'
import ChatMessageItem from './ChatMessageItem'
import { ChatMessage } from '../types/chat'
import './ChatMessageList.css'

// 2.定义组件接受的属性
interface Props {
    messages: ChatMessage[];
    loading: boolean;
}

// 3.定义组件
const ChatMessageList: React.FC<Props> = ({ messages, loading }) => {
    // 4.创建ref 用于标记列表底部的DOM元素
    const bottomRef = useRef<HTMLDivElement>(null)

    //    5.副作用：消息/加载状态变化时 自动滚动到底部
    useEffect(() => {
        if (messages.length === 0) return
        // 获取最后一条消息
        // `at()` 是数组方法: - `arr.at(0)` → 数组第 1 个元素  `arr.at(-1)` → 取数组最后一项元素，等价于 `arr[arr.length - 1]`
        const lastMsg = messages.at(-1)
        // 只有最后一条消息是AI助手 才执行滚动到底
        if (lastMsg?.role === 'assistant') {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // 6.渲染页面
    return (

        <div className="chat-list">
            {/* 遍历消息列表 渲染每条消息气泡 */}
            {messages.map(msg => (
                <ChatMessageItem key={msg.id} message={msg} />
            ))}


            {/* 滚动锚点：标记列表最底部 */}
            <div ref={bottomRef} />
        </div>

    )


}

export default ChatMessageList