# proxy — 博客的 Vercel 后端

本目录是部署在 Vercel 上的无服务器函数，为博客提供两个服务：

| 接口 | 用途 |
|---|---|
| `/api/oauth` + `/api/oauth/callback` | Decap 网页后台（/admin）的 GitHub OAuth 登录中转 |
| `/api/counter` | 文章页「浏览量 / 喜欢」计数（存 Vercel Redis） |

## 为什么放在这里

Vercel 项目已把 **Root Directory 指向本目录**（monorepo 部署）：
改这个目录才会触发后端重新部署；改文章等其它目录不影响它。

## 部署（二选一）

**方式 A：命令行部署（当前在用，无需 Vercel 网页设置）**

```bash
cd proxy
npx vercel login   # 首次登录
npx vercel deploy --prod
```

**方式 B：连接 Git 自动部署（需要 Vercel 网页操作一次）**

到 Vercel 项目设置里把 Git 仓库连到 `MieoM79/MieoM79.github.io`，并把 **Root Directory** 设为 `proxy` —— 之后改 `proxy/` 下的文件并推送到 `main` 即自动部署。

环境变量（在 Vercel 项目 Settings → Environment Variables 中配置）：

- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`：GitHub OAuth 应用的公开 ID 与密钥
- Redis 连接由 Vercel Storage 面板连接数据库后自动注入（`KV_REST_API_URL` 等）

安全机制：

- OAuth 入口校验来源，只允许来自 `mieom79.github.io`（大小写不敏感、限定域名边界）的登录请求
- counter 接口 CORS 仅对博客域名回显放行，key 做字符白名单清洗，带限速
