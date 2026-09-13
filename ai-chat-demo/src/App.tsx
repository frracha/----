import React, { useState } from 'react'
import { ChatMessage } from './types/chat'
import ChatMessageList from './components/ChatMessageList'
import ChatInput from './components/ChatInput'
import './App.css'

const App: React.FC = () => {
  // 全局状态：消息列表
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: '你好！我是AI助手，有什么可以帮你的吗？'
    }
  ])
  // 全局状态：是否正在加载AI回复
  const [isLoading, setIsLoading] = useState(false)

  // 处理发送消息
  const handleSend = (content: string) => {
    // console.log(content);
    // 1.构造用户消息
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content
    }
    // 2.追加到消息列表
    setMessages(prev => [...prev, userMsg])
    // 3.设置加载状态
    setIsLoading(true)
    // 4.模拟异步请求AI回复
    setTimeout(() => {
      // 5.构造AI回复消息
      const aiMsg: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `这是AI的回复：${content}`
      }
      // 6.追加到消息列表
      setMessages(prev => [...prev, aiMsg])
      // 7.取消加载状态
      setIsLoading(false)
    }, 1000)
  }
  return (
    <>
      {/* 外层全屏容器：纵向 flex 布局 */}
      <div className="app-container">
        {/* 顶部标题栏 */}
        <div className="app-header">
          <h2 className="app-title">
            AI智能对话助手
          </h2>
        </div >

        {/* 消息列表组件：把全局状态通过 props 传下去 */}
        < ChatMessageList messages={messages} loading={isLoading} />

        {/* 输入框 */}
        <ChatInput loading={isLoading} onSend={handleSend} />
      </div >
    </>
  )
}

export default App
