// 1.导入依赖
import React, { useEffect, useRef } from 'react'
import ChatMessageItem from './ChatMessageItem'
import { ChatMessage } from '../types/chat'

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
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    // 6.渲染页面
    return (

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#fafafa' }}>
            {/* 遍历消息列表 渲染每条消息气泡 */}
            {messages.map(msg => (
                <ChatMessageItem key={msg.id} message={msg} />
            ))}

            {/* 条件渲染：加载中时显示提示 */}
            {loading && (<div style={{ display: 'flex', marginBottom: '12px' }}>
                <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#f5f5f5', fontSize: '14px', color: '#666' }}>正在思考中...</div>
            </div>)}

            {/* 滚动锚点：标记列表最底部 */}
            <div ref={bottomRef} />
        </div>

    )



}

export default ChatMessageList