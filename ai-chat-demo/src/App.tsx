import React, { useState, useEffect } from 'react'
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
  // 真正持久化的历史消息，存localStorage
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>(() => {
    try {
      // 本地存储
      const stored = localStorage.getItem('chat_history')
      if (stored) {
        // 读取到存储数据 返回解析后的数组
        return JSON.parse(stored)
      } else {
        // 没有读取到 返回初始消息
        return INIT_MESSAGE_LIST
      }
    } catch (error) {
      // 解析报错 兜底返回初始消息
      console.warn("本地聊天记录解析失败，使用默认对话", error)
      return INIT_MESSAGE_LIST
    }
  })

  // 专门保存正在流式输出的临时AI消息，不持久化
  const [streamingAiMsg, setStreamingAiMsg] = useState<ChatMessage | null>(null)

  // 拼接渲染用消息：正式历史 + 正在打字的临时AI消息
  // `streamingAiMsg`本身是对象,`[streamingAiMsg]`：把这个对象包进一个数组里面。因为`...`只能展开数组，对象不能直接用`...`
  const renderMessages = [...historyMessages, ...(streamingAiMsg ? [streamingAiMsg] : [])]

  // 全局状态：是否正在加载AI回复
  const [isLoading, setIsLoading] = useState(false)

  // 新增错误提示
  const [errorMsg, setErrorMsg] = useState('')

  // 监听messages变化 自动保存到localStorage
  useEffect(() => {
    // 把messages数组转字符串存入
    localStorage.setItem('chat_history', JSON.stringify(historyMessages))
  }, [historyMessages])

  // 处理发送消息
  const handleSend = async (content: string) => {
    // 新增：去除首尾空格 空内容直接return
    if (!content.trim()) return
    // 发送新消息 清空旧的错误消息
    setErrorMsg('')
    // 1.构造用户消息
    // 优化：避免AI消息id和用户id有可能重复
    const userMsgId = Date.now()
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content
    }
    // 2.构造AI回复消息
    const aiMsgId = userMsgId + 1
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: ""
    }
    let fullAiContent = ''
    // 3.用户消息加入【持久化历史】，空AI消息不进历史
    setHistoryMessages(prev => [...prev, userMsg])
    // 空AI消息放到临时状态，只做UI渲染，不会存localStorage
    setStreamingAiMsg(aiMsg)
    //  4.传给大模型的上下文：历史 + 用户新消息，不要带上空aiMsg
    const sendToApiMessages = [...historyMessages, userMsg]
    // 5.设置加载状态
    setIsLoading(true)
    try {
      // 6.调用服务
      await sendChatRequest(sendToApiMessages, (deltaText) => {
        fullAiContent += deltaText
        // onDelta回调：只更新临时的streamingAiMsg，不动historyMessages
        setStreamingAiMsg(prev => {
          if (!prev) return null
          //  增量拼接文字 返回新对象
          return { ...prev, content: prev.content + deltaText }
        })
      });
    } catch (error) {
      // 错误处理
      console.error("发送失败", error)
      if (error instanceof Error) {
        setErrorMsg(`发送失败：${error.message}`)
      } else {
        // 捕获到错误 更新错误state
        setErrorMsg('消息发送失败，请稍后重试')
      }
    } finally {
      // 7.无论成功失败，都取消加载状态
      setIsLoading(false)
      // 流式全部完成（成功/失败都会走到finally）
      // 如果临时ai消息存在 把完整答案归档进正式历史 然后清空临时占位
      if (fullAiContent.length > 0) {
        const completeAiMsg: ChatMessage = {
          id: aiMsgId,
          role: 'assistant',
          content: fullAiContent
        }
        setHistoryMessages(prev => [...prev, completeAiMsg])
      }
      setStreamingAiMsg(null)
    }
  }

  // 清空对话函数 
  const handleClearChat = () => {
    // 判断AI回复加载
    if (isLoading) return
    //重置持久化历史为初始欢迎消息
    setHistoryMessages(INIT_MESSAGE_LIST)
    // 清空临时AI气泡
    setStreamingAiMsg(null)
    // 清空错误消息
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
        <ChatMessageList messages={renderMessages} loading={isLoading} />

        {/* 错误消息提示 */}
        {errorMsg && <div style={{ color: 'red', textAlign: 'center', padding: '4px' }}>{errorMsg}</div>}

        {/* 输入框 */}
        <ChatInput loading={isLoading} onSend={handleSend} />
      </div >
    </>
  )
}

export default App
