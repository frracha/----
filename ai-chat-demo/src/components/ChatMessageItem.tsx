
import { ChatMessage } from '../types/chat';

interface Props {
    message: ChatMessage;
}

const ChatMessageItem: React.FC<Props> = ({ message }) => {
    const isUser = message.role === 'user'
    return (
        <div style={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
        }}>
            <div style={{
                maxWidth: '70%',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                backgroundColor: isUser ? '#1677ff' : '#f5f5f5',
                color: isUser ? 'white' : '#333'
            }}>
                {message.content}
            </div>
        </div>
    )
}

export default ChatMessageItem;