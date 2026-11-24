import { ChatMessage } from '../types/chat';
import './ChatMessageItem.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useRef, useEffect, useState } from 'react';


interface Props {
    message: ChatMessage;
}

const ChatMessageItem: React.FC<Props> = ({ message }) => {
    const role = message.role
    const bubbleRef = useRef<HTMLDivElement>(null)
    // 整条消息复制的文字提示状态
    const [copyAllText, setCopyAllText] = useState('复制整条')
    // 定时器ref，用来清理
    const copyAllTimerRef = useRef<number | null>(null)

    // 同一计算气泡内渲染内容
    const renderBubbleContent = () => {
        // 1.优先判断加载态:AI且内容为空
        if (role === 'assistant' && message.content === '') {
            return <span className="chat-loading-text">正在思考中...</span>;
        }
        // 2.AI有内容 -> Markdown 渲染
        if (role === 'assistant') {
            return (
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                >
                    {message.content}
                </ReactMarkdown>
            )
        }
        // 3.用户消息 -> 纯文本直接显示
        return message.content
    }

    // 代码块复制
    useEffect(() => {
        // 拿不到DOM就直接返回
        if (!bubbleRef.current) return
        // 查找当前气泡里面所有的代码块
        const codeBlocks = bubbleRef.current.querySelectorAll('pre')
        // 遍历每个代码块
        codeBlocks.forEach((pre) => {
            // 重复添加防御
            if (pre.querySelector('.copy-btn')) return
            // 1.创建按钮元素
            const copyBtn = document.createElement('button')
            copyBtn.className = 'copy-btn'
            copyBtn.textContent = '复制'
            // 2.绑定点击事件
            copyBtn.addEventListener('click', async () => {
                // 先清除这个按钮上之前还没跑完的定时器（防止快速多次点击叠加多个定时器）
                // `copyBtn` 是原生 `HTMLButtonElement` 类型的 DOM 对象。原生 DOM 本身没有 timerId 这个属性
                // `as any`：强制 TS 放开类型检查，允许我们手动给这个 DOM 对象挂一个自定义属性 timerId，用来存属于这个按钮自己的定时器编号
                if ((copyBtn as any).timerId) {
                    clearTimeout((copyBtn as any).timerId)
                }
                try {
                    // 点击复制核心逻辑
                    // 获取元素里面的纯文本内容
                    const code = pre.textContent || ''
                    // 浏览器原生剪贴板API
                    await navigator.clipboard.writeText(code)
                    // 交互反馈
                    copyBtn.textContent = '已复制'
                } catch (error) {
                    copyBtn.textContent = '复制失败'
                }
                // 把定时器id挂载到DOM元素上
                (copyBtn as any).timerId = setTimeout(() => {
                    copyBtn.textContent = "复制"
                }, 1500)
            })
            // 3.把按钮插入页面 `appendChild(元素)` 就是把一个元素，插入到父元素的内部最后面
            pre.appendChild(copyBtn)
        })
    }, [message.content])

    // 复制整条消息的函数
    const handleCopyAll = async () => {
        if (copyAllTimerRef.current) {
            clearTimeout(copyAllTimerRef.current)
        }
        try {
            navigator.clipboard.writeText(message.content)
            setCopyAllText("已复制")
        } catch (error) {
            console.error("复制整条失败", error)
            setCopyAllText("复制失败")
        }
        // 1.5秒重置文字
        copyAllTimerRef.current = window.setTimeout(() => {
            setCopyAllText("复制整条")
        }, 1500)
    }

    return (
        // 用模板字符串拼接类名：`基础类 + 状态类`
        <div className={`chat-message-item ${role}`}>
            <div className={`chat-message-bubble ${role}`} ref={bubbleRef}>
                {renderBubbleContent()}
                {role === 'assistant'
                    && message.content !== ''
                    && !message.isWelcome
                    && (
                        <button className='copy-btn copy-all-btn' onClick={handleCopyAll}>
                            {copyAllText}
                        </button>
                    )}
            </div>
        </div>
    )


}

export default ChatMessageItem;