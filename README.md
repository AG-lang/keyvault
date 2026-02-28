# KeyVault

本地 API 密钥管理工具，保存各种服务的密钥（OpenRouter、OpenAI 等），一键复制到剪贴板。

## 功能

- **密钥管理** — 添加、编辑、删除密钥（名称 / Key / 分组 / 备注）
- **一键复制** — 点击复制按钮，Key 直接进剪贴板
- **显示/隐藏** — 密钥默认遮罩，点击眼睛图标切换
- **分组筛选** — 按服务商或用途分组，标签栏快速切换
- **搜索** — 实时搜索密钥名称、分组、备注
- **导入/导出** — JSON 文件备份和恢复
- **本地存储** — 数据保存在浏览器 localStorage，不上传任何服务器

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开终端显示的地址即可使用。

## 技术栈

- Vue 3 + TypeScript
- Vite
- localStorage 持久化

## 项目结构

```
src/
├── types/index.ts            # KeyItem 类型定义
├── composables/
│   ├── useKeys.ts            # 密钥 CRUD、搜索过滤、localStorage 读写
│   └── useClipboard.ts       # 剪贴板复制 + toast 提示
├── components/
│   ├── KeyCard.vue           # 密钥卡片（显示/隐藏、复制、编辑、删除）
│   ├── KeyForm.vue           # 添加/编辑表单弹窗
│   ├── GroupTabs.vue         # 分组标签栏
│   └── ImportExport.vue      # 导入导出
├── App.vue                   # 主页面
└── style.css                 # 全局样式（暗色主题）
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
    "createdAt": 1709136000000
  }
]
```

导入时只需 `name` 和 `key` 字段，其余可选。
