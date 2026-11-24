# AI智能聊天机器人

基于 React + TypeScript + Vite 的AI对话网页端Demo

## 功能特性

- SSE流式打字输出AI回复
- AbortController 停止生成，中断网络请求
- Markdown渲染 + 代码块语法高亮
- 代码块复制按钮、整条AI消息复制
- localStorage聊天记录、主题持久化
- 浅色/深色全局主题切换
- 消息列表智能自动滚动到底部
- Textarea输入框高度自适应
- Enter发送消息，Shift+Enter换行
- 清空聊天二次确认弹窗
- 完善加载状态、异常容错处理

## 技术栈

- React 函数组件 + Hooks
- TypeScript 类型约束
- Vite
- react‑markdown / remark‑gfm / rehype‑highlight
- localStorage 本地持久化
- CSS变量全局主题

## 本地运行

```bash
# 安装依赖
npm install

# 本地启动开发服务
npm run dev

# 打包构建
npm run build
```
