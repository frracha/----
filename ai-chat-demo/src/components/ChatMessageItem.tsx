import { ChatMessage } from '../types/chat';
import './ChatMessageItem.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useRef, useEffect } from 'react';


interface Props {
    message: ChatMessage;
}

const ChatMessageItem: React.FC<Props> = ({ message }) => {
    const role = message.role
    const bubbleRef = useRef<HTMLDivElement>(null)

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
                try {
                    // 点击复制核心逻辑
                    // 获取元素里面的纯文本内容
                    const code = pre.textContent || ''
                    // 浏览器原生剪贴板API
                    await navigator.clipboard.writeText(code)
                    // 交互反馈
                    copyBtn.textContent = '已复制'
                    setTimeout(() => {
                        copyBtn.textContent = '复制'
                    }, 1500);
                } catch (error) {
                    copyBtn.textContent = '复制失败'
                    setTimeout(() => {
                        copyBtn.textContent = '复制'
                    }, 1500);
                }
            })
            // 3.把按钮插入页面 `appendChild(元素)` 就是把一个元素，插入到父元素的内部最后面
            pre.appendChild(copyBtn)
        })
    }, [message.content])

    return (
        // 用模板字符串拼接类名：`基础类 + 状态类`
        <div className={`chat-message-item ${role}`}>
            <div className={`chat-message-bubble ${role}`} ref={bubbleRef}>
                {renderBubbleContent()}
            </div>
        </div>
    )


}

export default ChatMessageItem;