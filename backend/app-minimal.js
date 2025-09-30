const http = require('http');
const url = require('url');
const querystring = require('querystring');

// 内存数据库
const storage = {
  users: [],
  platforms: [],
  usageLogs: [],
};

// 生成ID
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 简单的密码哈希（生产环境应使用bcrypt）
function simpleHash(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

// 简单的JWT实现
function createToken(userId) {
  const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }; // 7天
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// CORS处理
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// 解析请求体
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

// 认证中间件
function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }
  
  const user = storage.users.find(u => u.id === payload.userId);
  return user || null;
}

// 发送JSON响应
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// 创建服务器
const server = http.createServer(async (req, res) => {
  setCORSHeaders(res);
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  
  console.log(`${method} ${path}`);
  
  try {
    // 健康检查
    if (path === '/' || path === '/health') {
      return sendJSON(res, 200, { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Token Monitor API Server'
      });
    }
    
    // 注册
    if (path === '/api/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      const { username, email, password } = body;
      
      if (!email || !password) {
        return sendJSON(res, 400, { error: '邮箱和密码不能为空' });
      }
      
      // 检查用户是否已存在
      const existingUser = storage.users.find(u => u.email === email);
      if (existingUser) {
        return sendJSON(res, 400, { error: '用户已存在' });
      }
      
      // 创建用户
      const user = {
        id: generateId(),
        email,
        name: username || email.split('@')[0],
        password: simpleHash(password),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      storage.users.push(user);
      
      // 生成token
      const token = createToken(user.id);
      
      return sendJSON(res, 200, {
        success: true,
        message: '注册成功',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
      });
    }
    
    // 登录
    if (path === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const { email, password } = body;
      
      if (!email || !password) {
        return sendJSON(res, 400, { error: '邮箱和密码不能为空' });
      }
      
      // 查找用户
      const user = storage.users.find(u => u.email === email);
      if (!user) {
        return sendJSON(res, 400, { error: '用户不存在' });
      }
      
      // 验证密码
      if (user.password !== simpleHash(password)) {
        return sendJSON(res, 400, { error: '密码错误' });
      }
      
      // 生成token
      const token = createToken(user.id);
      
      return sendJSON(res, 200, {
        success: true,
        message: '登录成功',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
      });
    }
    
    // 需要认证的路由
    const user = authenticate(req);
    if (!user && path.startsWith('/api/') && path !== '/api/auth/register' && path !== '/api/auth/login') {
      return sendJSON(res, 401, { error: 'Unauthorized' });
    }
    
    // 获取用户资料
    if (path === '/api/auth/profile' && method === 'GET') {
      return sendJSON(res, 200, {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }
    
    // 获取平台列表
    if (path === '/api/platforms' && method === 'GET') {
      const platforms = storage.platforms.filter(p => p.userId === user.id);
      return sendJSON(res, 200, platforms);
    }
    
    // 创建平台
    if (path === '/api/platforms' && method === 'POST') {
      const body = await parseBody(req);
      const platform = {
        id: generateId(),
        userId: user.id,
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storage.platforms.push(platform);
      return sendJSON(res, 201, platform);
    }
    
    // 获取使用记录
    if (path === '/api/usage/logs' && method === 'GET') {
      const { platformId, startDate, endDate, model, page = 1, limit = 50 } = parsedUrl.query;
      
      let logs = storage.usageLogs.filter(log => {
        const platform = storage.platforms.find(p => p.id === log.platformId);
        return platform && platform.userId === user.id;
      });
      
      // 添加平台名称到日志中
      logs = logs.map(log => {
        const platform = storage.platforms.find(p => p.id === log.platformId);
        return {
          ...log,
          platformName: platform ? platform.name : 'Unknown Platform'
        };
      });
      
      if (platformId) {
        logs = logs.filter(log => log.platformId === platformId);
      }
      
      if (startDate) {
        logs = logs.filter(log => new Date(log.createdAt) >= new Date(startDate));
      }
      
      if (endDate) {
        logs = logs.filter(log => new Date(log.createdAt) <= new Date(endDate));
      }
      
      if (model) {
        logs = logs.filter(log => log.model && log.model.includes(model));
      }
      
      // 排序（最新的在前）
      logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // 分页
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const paginatedLogs = logs.slice(offset, offset + parseInt(limit));
      
      return sendJSON(res, 200, {
        logs: paginatedLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: logs.length,
          totalPages: Math.ceil(logs.length / parseInt(limit)),
        },
      });
    }
    
    // 获取使用统计
    if (path === '/api/usage/stats' && method === 'GET') {
      const { platformId } = parsedUrl.query;
      
      let logs = storage.usageLogs.filter(log => {
        const platform = storage.platforms.find(p => p.id === log.platformId);
        return platform && platform.userId === user.id;
      });
      
      if (platformId) {
        logs = logs.filter(log => log.platformId === platformId);
      }
      
      // 计算统计
      const totalStats = logs.reduce((acc, log) => ({
        promptTokens: acc.promptTokens + (log.promptTokens || 0),
        completionTokens: acc.completionTokens + (log.completionTokens || 0),
        totalTokens: acc.totalTokens + (log.totalTokens || 0),
        estimatedCost: acc.estimatedCost + (log.estimatedCost || 0),
      }), { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 });
      
      // 今日统计
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLogs = logs.filter(log => new Date(log.createdAt) >= today);
      
      const todayStats = todayLogs.reduce((acc, log) => ({
        promptTokens: acc.promptTokens + (log.promptTokens || 0),
        completionTokens: acc.completionTokens + (log.completionTokens || 0),
        totalTokens: acc.totalTokens + (log.totalTokens || 0),
        estimatedCost: acc.estimatedCost + (log.estimatedCost || 0),
      }), { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 });
      
      return sendJSON(res, 200, {
        total: totalStats,
        today: todayStats,
      });
    }
    
    // 获取系统信息
    if (path === '/api/system/info' && method === 'GET') {
      const userPlatforms = storage.platforms.filter(p => p.userId === user.id);
      const userLogs = storage.usageLogs.filter(log => {
        const platform = storage.platforms.find(p => p.id === log.platformId);
        return platform && platform.userId === user.id;
      });
      
      const totalStats = userLogs.reduce((acc, log) => ({
        totalCalls: acc.totalCalls + 1,
        totalTokens: acc.totalTokens + (log.totalTokens || 0),
        totalCost: acc.totalCost + (log.estimatedCost || 0),
      }), { totalCalls: 0, totalTokens: 0, totalCost: 0 });
      
      return sendJSON(res, 200, {
        version: 'v1.0.0',
        lastUpdate: '2025-09-30',
        databaseStatus: 'normal',
        apiStatus: 'normal',
        statistics: {
          platformCount: userPlatforms.length,
          totalCalls: totalStats.totalCalls,
          totalTokens: totalStats.totalTokens,
          totalCost: totalStats.totalCost,
        },
      });
    }
    
    // 上报使用数据
    if (path === '/api/usage/report' && method === 'POST') {
      const body = await parseBody(req);
      const log = {
        id: generateId(),
        ...body,
        createdAt: new Date(),
      };
      storage.usageLogs.push(log);
      return sendJSON(res, 201, log);
    }
    
    // 404
    sendJSON(res, 404, { error: 'Not Found' });
    
  } catch (error) {
    console.error('Server Error:', error);
    sendJSON(res, 500, { error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});