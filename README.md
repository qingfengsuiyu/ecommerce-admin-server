# 全栈电商管理平台 - 后端

基于 Node.js + Express + MongoDB 的电商管理平台后端 API 服务，提供完整的用户认证、商品管理、订单管理和数据统计功能。

## 技术栈

- Node.js + Express
- MongoDB + Mongoose
- JWT 认证 + bcrypt 加密
- RBAC 角色权限控制
- Multer 文件上传

## 功能模块

- 用户认证（注册、登录、JWT Token）
- 商品管理（增删改查、分页、关键字搜索、图片上传）
- 订单管理（创建订单、状态流转、关联查询）
- 用户管理（用户列表、角色修改）
- 数据统计（商品/订单/用户总数、收入统计、订单状态分布）

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env` 文件：

```
MONGODB_URI=你的MongoDB连接字符串
JWT_SECRET=你的JWT密钥
```

### 启动服务

```bash
node index.js
```

服务默认运行在 http://localhost:3000

## API 接口

### 认证

| 方法 | 路径               | 说明         | 需要登录 |
| ---- | ------------------ | ------------ | -------- |
| POST | /api/auth/register | 用户注册     | 否       |
| POST | /api/auth/login    | 用户登录     | 否       |
| GET  | /api/auth/me       | 获取当前用户 | 是       |

### 商品

| 方法   | 路径                 | 说明                  | 权限         |
| ------ | -------------------- | --------------------- | ------------ |
| GET    | /api/products        | 商品列表（分页/搜索） | 公开         |
| GET    | /api/products/:id    | 商品详情              | 公开         |
| POST   | /api/products        | 添加商品              | admin/editor |
| PUT    | /api/products/:id    | 更新商品              | admin/editor |
| DELETE | /api/products/:id    | 删除商品              | admin        |
| POST   | /api/products/upload | 上传图片              | 需登录       |

### 订单

| 方法 | 路径                   | 说明     | 权限   |
| ---- | ---------------------- | -------- | ------ |
| POST | /api/orders            | 创建订单 | 需登录 |
| GET  | /api/orders            | 订单列表 | 需登录 |
| PUT  | /api/orders/:id/status | 更新状态 | admin  |

### 用户管理

| 方法 | 路径                | 说明     | 权限  |
| ---- | ------------------- | -------- | ----- |
| GET  | /api/users          | 用户列表 | admin |
| PUT  | /api/users/:id/role | 修改角色 | admin |

### 数据统计

| 方法 | 路径                 | 说明     | 权限  |
| ---- | -------------------- | -------- | ----- |
| GET  | /api/dashboard/stats | 统计数据 | admin |
