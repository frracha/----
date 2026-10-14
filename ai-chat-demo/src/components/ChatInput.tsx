import React, { useState } from 'react';
import './ChatInput.css'

interface Props {
    onSend: (content: string) => void,
    isGenerating: boolean,
    onStop: () => void
}

const ChatInput: React.FC<Props> = ({ onSend, isGenerating, onStop }) => {
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
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // 判断是不是回车键
        if (e.key === 'Enter') {
            // 按住Shift + Enter: 允许默认换行,直接return退出函数
            if (e.shiftKey) return
            // 单纯回车:阻止浏览器默认提交
            e.preventDefault()
            // 校验:内容非空,并且不在加载中
            if (inputValue.trim() && !isGenerating) {
                // 调用发送函数
                handleSend(inputValue)
            }
        }
    }
    // 判断发送按钮是发送还是停止
    const handleClick = () => {
        if (isGenerating) {
            // 生成中,点击就是停止
            onStop()
        } else {
            // 非生成中,点击就是发送
            handleSend(inputValue)
        }
    }

    const canSend = !isGenerating && inputValue.trim() === ''
    return (
        <div className='chat-input-container'>
            <textarea className='chat-input'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
                placeholder="请输入消息..." />
            {/* HTML 原生属性的铁则： 当 `<button disabled={loading}>` 时，浏览器会完全禁用这个按钮；不仅视觉上变灰，`onClick` 事件根本不会触发**，用户点击不会有任何反应；*/}
            {/* 所以 `onClick` 里的 `!loading` 判断是完全冗余的，永远走不到。 */}
            <button className='send-btn'
                onClick={handleClick}
                disabled={canSend}>
                {isGenerating ? '停止' : '发送'}
            </button>
        </div>
    )
}

export default ChatInput;