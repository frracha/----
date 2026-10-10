import { ChatMessage } from '../types/chat';
import './ChatMessageItem.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
    message: ChatMessage;
}

const ChatMessageItem: React.FC<Props> = ({ message }) => {
    const role = message.role
    // 同一计算气泡内渲染内容
    const renderBubbleContent = () => {
        // 1.优先判断加载态:AI且内容为空
        if (role === 'assistant' && message.content === '') {
            return <span className="chat-loading-text">正在思考中...</span>;
        }
        // 2.AI有内容 -> Markdown 渲染
        if (role === 'assistant') {
            return (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                </ReactMarkdown>
            )
        }
        // 3.用户消息 -> 纯文本直接显示
        return message.content
    }
    return (
        // 用模板字符串拼接类名：`基础类 + 状态类`
        <div className={`chat-message-item ${role}`}>
            <div className={`chat-message-bubble ${role}`}>
                {renderBubbleContent()}
            </div>
        </div>
    )
}

export default ChatMessageItem;