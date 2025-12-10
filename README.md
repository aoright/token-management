# Token Monitor Platform

一个轻量级的 AI API Token 使用监控平台，支持监控 OpenAI、Anthropic、Azure 等多个平台的 Token 消耗情况。

## 功能特性

- **多平台支持** - 支持 OpenAI、Anthropic、Azure、Gemini 等主流 AI 平台
- **实时监控** - 实时记录和统计 Token 使用量
- **成本计算** - 自动计算每次调用的预估费用
- **数据分析** - 提供详细的使用趋势和分布分析
- **配额预警** - 达到阈值时自动提醒
- **安全加密** - API Key 加密存储
- **代理模式** - 支持作为 API 代理自动记录使用量

## 技术栈

### 后端
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT 认证

### 前端
- React 18 + TypeScript
- Ant Design UI
- Recharts 图表
- React Query
- Zustand 状态管理

## 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 克隆项目
git clone <your-repo>
cd token-monitor

# 使用 Docker Compose 启动
docker-compose up -d

# 访问应用
open http://localhost:3000
```

### 方式二：本地开发

#### 1. 环境要求
- Node.js 18+
- PostgreSQL 14+
- npm 或 yarn

#### 2. 后端设置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接等信息

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 启动开发服务器
npm run dev
```

后端服务运行在 `http://localhost:3001`

#### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
npm run dev
```

前端应用运行在 `http://localhost:5173`

## 环境变量配置

### 后端 (.env)

```bash
# 数据库连接
DATABASE_URL="postgresql://postgres:password@localhost:5432/token_monitor?schema=public"

# 服务器配置
PORT=3001
NODE_ENV=development

# JWT 密钥
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# 加密密钥（32字节的十六进制字符串）
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# CORS 配置
CORS_ORIGIN="http://localhost:5173"
```

### 前端 (.env)

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

## 使用方法

### 1. 添加平台

1. 访问 "平台管理" 页面
2. 点击 "添加平台" 按钮
3. 填写平台信息：
   - 平台名称（如：OpenAI GPT-4）
   - 提供商（openai/anthropic/azure/gemini）
   - API Key
   - Base URL（可选）
   - 定价配置（输入/输出价格 per 1K tokens）
   - 月度配额（可选）
   - 预警阈值

### 2. 记录使用量

#### 方式 A：使用代理模式（推荐）

```typescript
// 通过监控平台的代理接口调用 API
const response = await fetch('http://localhost:3001/api/proxy/{platformId}/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
    model: 'gpt-4',
  }),
});

// 使用量会自动记录到数据库
```

#### 方式 B：手动上报

```typescript
// 先调用你的 AI API
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});

// 然后上报使用数据
await fetch('http://localhost:3001/api/usage/report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    platformId: 'your-platform-id',
    model: response.model,
    promptTokens: response.usage.prompt_tokens,
    completionTokens: response.usage.completion_tokens,
    totalTokens: response.usage.total_tokens,
  }),
});
```

### 3. 查看统计

- **仪表板** - 查看今日和本月的总体使用情况
- **使用记录** - 查看详细的每次调用记录
- **数据分析** - 查看趋势图表和分布分析

## API 文档

### Platform APIs

```
GET    /api/platforms          # 获取平台列表
POST   /api/platforms          # 创建平台
GET    /api/platforms/:id      # 获取平台详情
PUT    /api/platforms/:id      # 更新平台
DELETE /api/platforms/:id      # 删除平台
```

### Usage APIs

```
GET    /api/usage/logs         # 获取使用记录（支持筛选）
GET    /api/usage/stats        # 获取统计数据
POST   /api/usage/report       # 手动上报使用量
```

### Proxy APIs

```
POST   /api/proxy/:platformId/chat    # OpenAI 兼容的聊天代理
```

## 开发命令

### 后端

```bash
npm run dev          # 启动开发服务器
npm run build        # 编译 TypeScript
npm start            # 启动生产服务器
npx prisma studio    # 打开数据库管理界面
npx prisma migrate dev --name xxx  # 创建新的数据库迁移
```

### 前端

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
```

## 数据库结构

主要表结构：

- **users** - 用户表
- **platforms** - 平台配置表
- **usage_logs** - Token 使用记录表

详细 Schema 见 `backend/prisma/schema.prisma`

## 安全注意事项

1. **API Key 加密**：所有 API Key 使用 AES-256-CBC 加密存储
2. **环境变量**：敏感信息通过环境变量配置，不要提交到版本控制
3. **HTTPS**：生产环境务必使用 HTTPS
4. **JWT 密钥**：使用强随机密钥并定期更换
5. **加密密钥**：生成方式：
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## 性能优化建议

1. 为 `usage_logs` 表添加适当的索引
2. 定期清理或归档历史数据
3. 使用 Redis 缓存热点数据
4. 考虑实现数据分页和懒加载

## 版本更新

```bash
# 更新数据库
cd backend
npx prisma migrate deploy

# 重启服务
docker-compose restart backend
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 开源协议

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系维护者。

---

## 路线图

- [ ] 用户认证系统
- [ ] 多用户/团队支持
- [ ] 邮件/Webhook 告警
- [ ] 更多图表和分析功能
- [ ] 导出报表功能
- [ ] API 速率限制
- [ ] 成本预算管理
- [ ] 移动端适配
