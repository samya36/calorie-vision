# Calorie Vision

AI 食物热量分析 · 拍一张照，立刻知道这餐多少卡。

## 部署步骤（手机端 30 分钟）

### 1. 上传到 GitHub

1. 打开 GitHub App，创建新仓库（Public，名字随便，比如 `calorie-vision`）
2. 把这三个文件传上去：
   - `index.html`（前端）
   - `api/analyze.js`（后端 Serverless Function）
   - `vercel.json`（路由配置）

### 2. 部署到 Vercel

1. 手机浏览器打开 vercel.com → 用 GitHub 登录
2. **Add New** → **Project** → 选刚才创建的仓库
3. **Framework Preset** 选 **Other**
4. **Environment Variables** 加一项：
   - Name: `OPENROUTER_API_KEY`
   - Value: 你的 OpenRouter API key
5. 点 **Deploy** → 30 秒后拿到链接

### 3. 测试

用手机打开 vercel 给的 URL，上传一张食物照片测试。

## 修改和迭代

直接在 GitHub App 里编辑 `index.html` → Commit → Vercel 自动部署。

## 成本估算

- gpt-4o-mini Vision (low detail): ~$0.001-0.002 / 次
- 1000 次分析：~$1-2
- Vercel 免费版：100GB 流量 / 月，足够用

## 文件说明

| 文件 | 作用 |
|------|------|
| `index.html` | 前端 UI，纯 HTML+CSS+JS，无构建依赖 |
| `api/analyze.js` | Serverless 后端，安全调用 OpenAI |
| `vercel.json` | Vercel 配置 |

## 自定义

- 改 ko-fi 用户名：搜 `ko-fi.com/deliadou` 替换
- 改微信号：搜 `kbhero21` 替换
- 改主品牌色：CSS 顶部 `--orange: #FF6B35`
