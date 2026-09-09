# MieoM79の树洞

个人博客网站（基于 Hexo + Butterfly 主题），托管于 GitHub Pages，提交后自动构建发布。

## 项目结构

```
.
├── .github/workflows/     # 自动发布流水线：推送 main 后自动构建并部署
├── source/                # 网站内容源（修改这里的文件即可发布）
│   ├── _posts/            # 文章（Markdown 格式，可在后台或 GitHub 编辑）
│   ├── about/             # 「关于」页面
│   ├── images/            # 图片资源
│   │   ├── cover-1.jpg ~ cover-14.jpg   # 首页封面轮换图
│   │   └── avatar.jpg     # 站点头像
│   ├── admin/             # 后台管理入口（Decap CMS）及配置
│   ├── cover-slider.js    # 首页封面轮换脚本
│   ├── cover-slider.css   # 封面轮换样式
│   └── premium.css        # 自定义高级感样式
├── themes/butterfly/      # 主题框架（当前使用）
└── _config.yml            # 站点主配置（标题 / 作者 / 链接等）
```

## 发布方式

- 后台编辑（推荐）：访问 `https://MieoM79.github.io/admin/`
- 或直接编辑 `source/_posts/` 下的 Markdown 文件并提交
- 提交到 `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages

## 部署流程

`main` 分支推送 → 自动执行 `hexo generate` → 同步至 `gh-pages` 分支 → GitHub Pages 对外发布。