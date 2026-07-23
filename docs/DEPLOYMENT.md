# 部署说明

## 公开测试环境

Cloudflare Pages 的生产或预览环境可按需要设置：

| 环境变量 | 公开测试值 | 正式发布值 |
| --- | --- | --- |
| `VITE_ENABLE_TEST_TOOLS` | `true` | 删除或设为 `false` |

修改变量后必须触发一次重新部署。普通访问地址不会显示测试入口；只有测试工具已编入产物且 URL 带 `?testmode=1` 时才启用，例如：

```text
https://<project-name>.pages.dev/?testmode=1
```

测试状态只保存在当前标签页的 `sessionStorage`，不会写入游戏存档。测试者可从控制台主动退出；正式构建即使访问同一查询参数，也不会加载测试控制台代码。

本项目是无后端的 Vite 静态站点。生产构建输出到 `dist/`，存档保存在访问者浏览器的 `localStorage` 中，不需要数据库、服务器函数或运行时环境变量。

## Cloudflare Pages 部署流程

### 1. 准备 GitHub 仓库

1. 在 GitHub 创建仓库。
2. 将项目源码提交并推送到默认分支，通常为 `main`。
3. 不要提交 `node_modules/`、`dist/`、本地环境文件或日志；这些路径已由 `.gitignore` 排除。

### 2. 连接 Cloudflare Pages

1. 登录 Cloudflare Dashboard。
2. 进入 **Workers & Pages**，选择创建 Pages 项目并连接 GitHub。
3. 授权 Cloudflare 访问目标仓库，选择项目仓库和生产分支。

### 3. 构建设置

使用以下参数：

| 设置 | 值 |
| --- | --- |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `/`（仓库根目录） |
| Node.js | `22.12.0` |

仓库中的 `.nvmrc` 固定了兼容的 Node.js 版本。如 Cloudflare 项目没有自动读取它，可在构建环境变量中增加 `NODE_VERSION=22.12.0`。

项目不需要 Pages Functions、KV、D1、R2 或运行时密钥。

### 4. 访问与域名

首次构建成功后，Cloudflare 会提供 `https://<project-name>.pages.dev` 地址。根路径 `/` 可直接启动游戏。

URL 中的 `#` 片段不会发送到服务器，所以刷新 `/#/chapter2` 不会产生静态服务器 404。当前游戏章节由本地存档和游戏内部导航决定，并不会将 `#/chapter2` 解释为跳过流程的章节入口。

需要自定义域名时，在 Pages 项目的 **Custom domains** 中添加域名并按 Cloudflare 提示配置 DNS。更换域名不会迁移旧域名下的 `localStorage` 存档。

## 本地测试

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
```

构建完成后，待部署文件位于 `dist/`。

## 更新流程

```text
修改代码
   ↓
git commit
   ↓
git push
   ↓
Cloudflare Pages 自动构建并重新部署
```

推送到生产分支会更新正式站点；其他分支或 Pull Request 可按 Cloudflare Pages 项目设置生成预览部署。

## 部署注意事项

- `localStorage` 按源隔离：`pages.dev` 地址与自定义域名拥有不同的本地存档。
- 清理浏览器站点数据、使用隐私模式或更换设备后，存档不会自动同步。
- 项目使用根路径资源地址，Cloudflare Pages 应部署在域名根路径；不要配置 GitHub Pages 风格的仓库名前缀。
- 当前没有需要 SPA fallback 的 Browser Router。不要添加 Pages Functions 或通配重写，除非未来改为真实的 History API 路由。
- 建议保留 Cloudflare 自动生成的预览部署，在合并到生产分支前验证构建结果。

Cloudflare 官方参考：[Vite 项目部署](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/)、[构建配置](https://developers.cloudflare.com/pages/configuration/build-configuration/)、[构建环境与 Node 版本](https://developers.cloudflare.com/pages/configuration/build-image/)。
