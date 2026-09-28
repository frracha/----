import React, { useState } from 'react'
import { ChatMessage } from './types/chat'
import ChatMessageList from './components/ChatMessageList'
import ChatInput from './components/ChatInput'
import './App.css'
import { sendChatRequest } from './services/chat'

const App: React.FC = () => {
  // 抽常量 定义初始消息常量，写在组件最顶部
  const INIT_MESSAGE_LIST: ChatMessage[] = [
    {
      id: 1,
      role: 'assistant',
      content: '你好！我是AI助手，有什么可以帮你的吗？'
    }
  ]

  // 全局状态：消息列表
  const [messages, setMessages] = useState<ChatMessage[]>(INIT_MESSAGE_LIST)
  // 全局状态：是否正在加载AI回复
  const [isLoading, setIsLoading] = useState(false)

  // 新增错误提示
  const [errorMsg, setErrorMsg] = useState('')

  // 处理发送消息
  const handleSend = async (content: string) => {
    // console.log(content);
    // 发送新消息 清空旧的错误消息
    setErrorMsg('')
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
      const aiReplyText = await sendChatRequest(newMessages);
      // 6.构造AI回复消息
      const aiMsg: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        content: aiReplyText
      }
      // 7.追加到消息列表
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      // 错误处理：真实接口会用到，模拟版暂时不会触发
      console.error("发送失败", error)
      // 捕获到错误 更新错误state
      setErrorMsg('消息发送失败，请稍后重试')
    } finally {
      // 8.无论成功失败，都取消加载状态
      setIsLoading(false)
    }
  }

  // 清空对话函数 
  const handleClearChat = () => {
    // 判断AI回复加载
    if (isLoading) return
    // 写 `setMessages([])`（空数组） 消息列表一条消息都不剩，空白页面，连那句 “你好！我是 AI 助手” 都消失
    setMessages(INIT_MESSAGE_LIST)
    setErrorMsg('')
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
          {/* 清空按钮 */}
          <button className="clear-btn" onClick={handleClearChat} disabled={isLoading}>清空聊天</button>
        </div >

        {/* 消息列表组件：把全局状态通过 props 传下去 */}
        < ChatMessageList messages={messages} loading={isLoading} />

        {/* 错误消息提示 */}
        {errorMsg && <div style={{ color: 'red', textAlign: 'center', padding: '4px' }}>{errorMsg}</div>}

        {/* 输入框 */}
        <ChatInput loading={isLoading} onSend={handleSend} />
      </div >
    </>
  )
}

export default App
