# KeyVault

本地 API 密钥管理工具，保存各种服务的密钥（OpenRouter、OpenAI 等），一键复制到剪贴板。

## 功能

- **密钥管理** — 添加、编辑、删除密钥（名称 / Key / 分组 / 备注）
- **一键复制** — 点击复制按钮，Key 直接进剪贴板，图标变绿勾 + Toast 提示
- **显示/隐藏** — 密钥默认遮罩，点击眼睛图标切换，5 秒后自动恢复遮罩
- **置顶收藏** — 星标置顶常用密钥，始终排在最前
- **分组筛选** — 按服务商或用途分组，标签栏快速切换
- **搜索** — 实时搜索密钥名称、分组、备注
- **导入/导出** — JSON 文件备份和恢复，导入时自动检测重复（可选跳过/覆盖/追加）
- **时间追踪** — 显示创建时间（北京时间）和上次复制的相对时间
- **本地存储** — 数据保存在浏览器 localStorage，不上传任何服务器

## 在线使用

部署在 Vercel，打开链接即可使用，支持手机：

> 部署后将链接填写在此处

## 本地开发

```bash
npm install
npm run dev
```

## 构建部署

```bash
npm run build
```

产出 `dist/` 目录，可部署到 Vercel / Netlify / GitHub Pages 等任意静态托管。

## 技术栈

- Vue 3 + TypeScript
- Vite
- localStorage 持久化

## 项目结构

```
src/
├── types/index.ts              # KeyItem 类型定义
├── composables/
│   ├── useKeys.ts              # 密钥 CRUD、置顶、复制记录、搜索过滤、导入导出
│   └── useClipboard.ts         # 剪贴板复制 + toast 提示
├── components/
│   ├── KeyCard.vue             # 密钥卡片（置顶、复制、显示/隐藏、编辑、删除、时间）
│   ├── KeyForm.vue             # 添加/编辑表单弹窗
│   ├── GroupTabs.vue           # 分组标签栏
│   ├── ImportExport.vue        # 导入导出按钮
│   ├── ConfirmDialog.vue       # 自定义确认弹窗（替代浏览器 confirm）
│   └── ImportDialog.vue        # 导入重复检测弹窗
├── App.vue                     # 主页面
└── style.css                   # 全局样式（暗色主题）
```

## 数据格式

导出的 JSON 格式：

```json
[
  {
    "id": "uuid",
    "name": "OpenRouter",
    "key": "sk-or-xxx",
    "group": "AI",
    "note": "主账号",
    "pinned": true,
    "createdAt": 1709136000000,
    "lastCopiedAt": 1709136060000
  }
]
```

导入时只需 `name` 和 `key` 字段，其余可选。
