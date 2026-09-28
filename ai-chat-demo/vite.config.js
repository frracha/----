// ①导入插件
import react from "@vitejs/plugin-react";
// 导入vite内置工具函数 defineConfig、loadEnv
import { defineConfig, loadEnv } from "vite";

// defineConfig：vite给typescript类型提示工具，不写也能跑，写了编辑器自动提示补全配置
// defineConfig支持传入回调函数，回调参数 {mode}
// mode：运行模式，npm run dev → mode = 'development'；npm run build打包 → mode='production'
export default defineConfig(({ mode }) => {
  // loadEnv(环境模式, 项目根目录)
  // 读取磁盘根目录的.env.local文件，把里面全部变量读取出来保存到env对象。
  // 这行代码运行在Node！浏览器完全看不到这里读取的API_KEY！
  const env = loadEnv(mode, import.meta.dirname);
  // 取出密钥，存放在Node后台内存，不会下发浏览器
  const ARK_API_KEY = env.VITE_AI_API_KEY;

  // 返回vite配置对象
  return {
    // plugins：插件列表，vite很多能力靠插件实现
    plugins: [react()],
    // server：【开发服务器配置】！！！！！！只在 npm run dev本地开发生效！
    // npm run build打包上线之后，这份配置完全失效！上线需要真实后端，不能靠vite代理
    server: {
      // proxy：代理配置，中间人功能在这里写
      proxy: {
        // 匹配规则：只要浏览器请求地址 以字符串 '/api/ark' 开头，就执行这个代理逻辑
        // /api/ark 是【我们自己人为创造的标记前缀】！！！！
        // 火山方舟服务器根本不知道/api/ark是什么！这个字符串唯一作用：告诉vite，这个请求要走代理！
        "/api/ark": {
          // target：目标服务器【域名】！！！！只写域名，不要写后面path路径
          target: "https://ark.cn-beijing.volces.com",
          // changeOrigin: true 修改http请求头Origin字段。第三方接口大多需要开启，否则返回403拒绝访问
          changeOrigin: true,

          // rewrite路径重写！！！
          // path参数：浏览器发过来完整请求路径字符串
          // 正则：匹配开头的 /api/ark，替换为空字符串
         rewrite: (path) => path.replace(/^\/api\/ark/, ""),

          // configure：代理事件钩子，可以监听转发请求的生命周期
          configure(proxy) {
            // proxyReq事件：Vite(Node)准备把请求发送给火山方舟服务器的瞬间触发！！运行在Node后台！！
            proxy.on("proxyReq", (proxyReq) => {
              // 在这里，Node层面，偷偷追加鉴权请求头Authorization
              // 浏览器F12网络面板看不见这一步添加的请求头！！密钥不会泄露！
              proxyReq.setHeader("Authorization", `Bearer ${ARK_API_KEY}`);
            });
          },
        },
      },
    },
  };
});
