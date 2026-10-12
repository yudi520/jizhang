# 记账应用

一个基于 uni-app 的简单实用记账应用。

## 功能特性

- ✅ 收支记录管理
- ✅ 分类统计
- ✅ 预算管理
- ✅ 数据导出/导入
- ✅ 本地存储

## 技术栈

- Vue 3
- TypeScript
- Pinia (状态管理)
- uni-app (跨平台框架)
- Vite

## 运行项目

### 安装依赖

```bash
npm install
```

### 运行 H5 版本

```bash
npm run dev:h5
```

访问 http://localhost:8080

### 构建 H5 版本

```bash
npm run build:h5
```

### 运行微信小程序版本

```bash
npm run dev:mp-weixin
```

然后使用微信开发者工具打开 `dist/dev/mp-weixin` 目录。

## 项目结构

```
├── components/          # 组件
├── pages/              # 页面
│   ├── index/         # 首页
│   ├── add/           # 添加记录
│   ├── stats/         # 统计
│   ├── budget/        # 预算
│   └── settings/      # 设置
├── stores/            # 状态管理
├── types/             # 类型定义
├── utils/             # 工具函数
└── static/            # 静态资源
```

## 使用说明

1. 首页显示本月收支汇总和最近记录
2. 点击"记一笔"按钮添加新记录
3. 统计页面查看分类统计
4. 预算页面管理各分类预算
5. 设置页面管理数据和应用设置

