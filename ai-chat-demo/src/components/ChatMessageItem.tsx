import { ChatMessage } from '../types/chat';
import './ChatMessageItem.css'

interface Props {
    message: ChatMessage;
}

const ChatMessageItem: React.FC<Props> = ({ message }) => {
    const role = message.role
    return (
        // 用模板字符串拼接类名：`基础类 + 状态类`
        <div className={`chat-message-item ${role}`}
        >
            <div className={`chat-message-bubble ${role}`}>
                {role === 'assistant' && message.content === '' ? (
                    <span className="chat-loading-text">正在思考中...</span>
                ) : (
                    message.content
                )}
            </div>
        </div>
    )
}

export default ChatMessageItem;