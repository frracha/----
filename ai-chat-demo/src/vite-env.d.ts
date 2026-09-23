// vite 的类型声明
// `import.meta.env` 是 Vite 专属的环境变量语法，原生 TS 不知道 `import.meta` 身上有 `.env` 这一套属性，所以 TS 类型检查报红
/// <reference types="vite/client"/>