# 潮汐 Tide · AI 情绪陪伴 Web App

一个全栈心理健康支持类 Web 应用作品集项目，包含 AI 情绪陪伴对话、情绪日记、标准化心理测评（PHQ-9）与呼吸练习四个核心模块。

> ⚠️ 本项目为技术展示 / 作品集用途，不是可上线运营的商业心理咨询产品。AI 对话不能替代专业心理咨询或医疗诊断。

## 技术栈

**前端**
- React 18 + Vite
- React Router（多页面路由）
- Tailwind CSS（自定义设计系统，色彩 / 字体 token 化）
- Recharts（情绪趋势图、测评历史柱状图）

**后端**
- Node.js + Express
- better-sqlite3（轻量级本地数据库，零配置）
- 直连 Anthropic Messages API 实现对话能力

**架构特点**
- 前后端分离，RESTful API
- 危机内容检测中间层：命中风险关键词时不经过大模型，直接返回预设的安全响应 + 求助热线，避免大模型在高风险场景下的不可控输出
- System Prompt 显式约束 AI 角色边界（不诊断、不开药、不替代专业治疗）
- API Key 仅保存在浏览器本地（localStorage），随请求传给后端再转发给 Anthropic，后端不落库存储密钥

## 功能模块

| 模块 | 说明 |
|---|---|
| AI 陪伴对话 | 多会话管理、消息持久化、危机词检测与安全响应 |
| 情绪日记 | 1-10 分心情评分 + 情绪标签 + 文字记录，支持趋势可视化 |
| 心理测评 | PHQ-9 抑郁自评量表，自动评分分级，历史趋势追踪 |
| 呼吸练习 | 3 种呼吸法（4-7-8 / 箱式 / 共振），动态圆圈引导呼吸节奏 |

## 目录结构

```
tide/
├── backend/
│   ├── server.js          # Express 入口
│   ├── db.js               # SQLite 表结构定义
│   ├── safety.js           # 危机检测规则 + system prompt
│   └── routes/
│       ├── chat.js
│       ├── journal.js
│       ├── assessment.js
│       └── breathing.js
└── frontend/
    └── src/
        ├── pages/           # 五个页面：Dashboard / Chat / Journal / Assessment / Breathing
        ├── components/      # Layout、可复用的视觉组件
        ├── ApiKeyContext.jsx
        └── api.js           # 统一的请求封装
```

## 本地运行

需要 Node.js 18+。

### 1. 启动后端

```bash
cd backend
npm install
npm run dev        # http://localhost:4000
```

首次启动会自动在 `backend/data/tide.db` 创建 SQLite 数据库文件。

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

Vite 已配置代理，`/api` 请求会自动转发到后端的 4000 端口。

### 3. 配置 API Key

打开应用后，点击左下角「设置 API Key」，填入你自己的 [Anthropic API Key](https://console.anthropic.com/)（`sk-ant-...`）。AI 陪伴对话功能依赖这个 Key 才能调用大模型。其余三个模块（日记 / 测评 / 呼吸练习）不需要 Key 即可使用。

## 设计说明

视觉主题围绕"潮汐 / 呼吸"的意象展开：深海雾蓝为主色，暖金色作为克制的点缀色，签名视觉元素是一组随呼吸节律扩散的同心圆，在首页背景和呼吸练习页中反复出现，把"情绪的起伏"具象化为可感知的视觉节奏。标题字体使用 Fraunces（人文衬线体，传达温度感），正文使用 Inter 保证可读性。

## 后续可扩展方向（面试可聊的点）

- 危机检测目前是关键词规则，可升级为轻量文本分类模型，并接入人工客服升级通道
- 用户系统 + 多端同步（目前是单用户本地演示）
- 对话历史的语义检索（RAG），实现"AI 记得你上次说过的事"
- 部署：前端可用 Vercel/Netlify，后端 + SQLite 可用 Railway/Render，或替换为 Postgres 做云端持久化
- 无障碍与国际化（i18n）

## 免责声明

本应用及其中的 AI 回复不构成医学建议、诊断或治疗。如果你或你身边的人正经历心理危机，请拨打全国心理援助热线 **12356**，或前往最近的医院精神科 / 心理科就诊。紧急情况请拨打 **120**。
