import React, { useState } from 'react';
import './ChatInput.css'

interface Props {
    loading: boolean,
    onSend: (content: string) => void,
}

const ChatInput: React.FC<Props> = ({ loading, onSend }) => {
    // 受控组件
    const [inputValue, setInputValue] = useState('')
    // 处理发送消息
    const handleSend = (content: string) => {
        const trimmedContent = content.trim()
        if (trimmedContent === '') return
        // 父组件拿到的数据不是带空格的内容
        onSend(trimmedContent)
        setInputValue('')
    }
    // 处理回车消息
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !loading) {
            // 避免后续如果嵌套表单，按回车会意外提交表单
            e.preventDefault();
            handleSend(inputValue)
        }
    }
    return (
        <div className='chat-input-container'>
            <input className='chat-input' value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} placeholder="请输入消息..." />
            {/* HTML 原生属性的铁则： 当 `<button disabled={loading}>` 时，浏览器会完全禁用这个按钮；不仅视觉上变灰，`onClick` 事件根本不会触发**，用户点击不会有任何反应；*/}
            {/* 所以 `onClick` 里的 `!loading` 判断是完全冗余的，永远走不到。 */}
            <button className='send-btn' onClick={() => handleSend(inputValue)} disabled={loading}>发送</button>
        </div>
    )
}

export default ChatInput;