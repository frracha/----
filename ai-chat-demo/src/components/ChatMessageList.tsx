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
    const listRef = useRef<HTMLDivElement>(null)

    //    5.副作用：消息/加载状态变化时 自动滚动到底部
    useEffect(() => {
        const dom = listRef.current
        if (!dom) return

        // 在流式输出时，连续增量更新会触发多次渲染；
        // 只要用户接近底部，就保持“跟随最新消息”。
        const isUserAtBottom = dom.clientHeight + dom.scrollTop >= dom.scrollHeight - 20
        if (isUserAtBottom) {
            requestAnimationFrame(() => {
                dom.scrollTo({
                    top: dom.scrollHeight,
                    behavior: 'smooth'
                })
            })
        }
    }, [messages, loading])

    // 6.渲染页面
    return (

        <div ref={listRef} className="chat-list">
            {/* 遍历消息列表 渲染每条消息气泡 */}
            {messages.map(msg => (
                <ChatMessageItem key={msg.id} message={msg} />
            ))}
        </div>

    )


}

export default ChatMessageList