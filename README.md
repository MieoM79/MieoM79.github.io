# MieoM79の树洞

> 把心事，说给这里听。

一个个人博客站点：Hexo 生成 + Stellar 主题 + GitHub Pages 托管，配 Decap CMS 网页后台，改内容不用碰代码。

| | |
|---|---|
| 🌐 网站 | https://MieoM79.github.io |
| ✍️ 后台 | https://MieoM79.github.io/admin/ |
| 🎨 主题 | [Stellar](https://github.com/xaoxuu/hexo-theme-stellar) |
| ⚙️ 部署 | GitHub Actions 自动构建 → `gh-pages` 分支 |

## 功能

- **文章**：Markdown 写作，支持标签、归档、搜索
- **后台编辑**：网页里写文章、传图，保存即发布（1 分钟内自动上线）
- **背景壁纸**：后台可选图、调浓淡 / 模糊 / 轮换间隔
- **全站样式**：霞鹜文楷中文网页字体、左右侧栏、暗色模式切换
- **阅读区纸面**：壁纸作背景时，正文落在半透明纸面上，保证可读

## 目录结构

```
.
├── .github/workflows/     # 自动构建并发布到 gh-pages
├── scripts/
│   └── bg-config.js       # 把背景配置输出为 /bg-config.json
├── source/
│   ├── _posts/            # 文章（Markdown，后台可编辑）
│   ├── _data/
│   │   └── background.yml # 背景壁纸配置（后台「站点设置」可编辑）
│   ├── images/            # 图片资源（壁纸、头像）
│   ├── admin/             # Decap CMS 后台入口与配置
│   ├── about/             # 「关于」页面
│   ├── page-bg.css/.js    # 背景层样式与轮换逻辑
│   ├── site-custom.css    # 站点自定义样式（侧栏、纸面等）
│   └── robots.txt         # 禁止收录 /admin/
├── themes/stellar/        # 主题（含默认配置与文档）
├── _config.yml            # 站点主配置
└── _config.stellar.yml    # 主题站点级配置
```

## 日常使用

**发一篇文章**

1. 打开 https://MieoM79.github.io/admin/ ，用 GitHub 登录
2. 左侧「文章」→ 新建 → 填标题和正文 → 发布
3. 约 1 分钟后自动上线

**换背景**

1. 后台左侧「站点设置」→「背景壁纸」
2. 添加 / 删除壁纸、拖动「可见度 / 模糊程度 / 切换间隔」
3. 发布 → 约 1 分钟生效

## 部署流程

推送到 `main` → GitHub Actions 执行 `hexo generate` → 产物同步到 `gh-pages` 分支 → GitHub Pages 对外发布。

## 说明

- 仓库公开是为了使用免费的 GitHub Pages；**仓库内不含任何密钥**（后台登录所需的 Client Secret 保存在 Vercel 环境变量中，不在本仓库）。
- 后台仅对拥有本仓库写权限的 GitHub 账号开放，其他人打开只会停在登录页。
- 站点壁纸素材来自网络，版权归原作者所有，仅作本站美化使用。
