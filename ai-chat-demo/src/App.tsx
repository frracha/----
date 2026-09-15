import React, { useState } from 'react'
import { ChatMessage } from './types/chat'
import ChatMessageList from './components/ChatMessageList'
import ChatInput from './components/ChatInput'
import './App.css'
import { sendMessage } from './services/chat'

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
  const handleSend = async (content: string) => {
    // console.log(content);
    // 1.构造用户消息
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content
    }
    // 2.先算出追加用户消息的完整列表
    const newMessages = [...messages, userMsg]
    // 3.更新页面 立刻显示用户发的消息
    setMessages(newMessages)
    // 4.设置加载状态
    setIsLoading(true)
    try {
      // 5.调用服务，传入完整消息列表
      const response = await sendMessage({
        messages: newMessages
      });
      // 6.构造AI回复消息
      const aiMsg: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        content: response.content
      }
      // 7.追加到消息列表
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      // 错误处理：真实接口会用到，模拟版暂时不会触发
      console.error("发送失败", error)
    } finally {
      // 8.无论成功失败，都取消加载状态
      setIsLoading(false)
    }
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
