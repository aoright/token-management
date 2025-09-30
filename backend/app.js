const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// JWT认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    const user = storage.users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Token Monitor API Server',
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = storage.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: '用户已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = {
      id: generateId(),
      email,
      name: username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    storage.users.push(user);

    // 生成token
    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '7d' });

    res.json({
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
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = storage.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: '用户不存在' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: '密码错误' });
    }

    // 生成token
    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '7d' });

    res.json({
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
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: '登出成功' });
});

app.get('/api/auth/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    },
  });
});

// Platform routes
app.get('/api/platforms', authMiddleware, (req, res) => {
  try {
    const platforms = storage.platforms.filter(p => p.userId === req.user.id);
    res.json(platforms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

app.post('/api/platforms', authMiddleware, (req, res) => {
  try {
    const platform = {
      id: generateId(),
      userId: req.user.id,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    storage.platforms.push(platform);
    res.status(201).json(platform);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create platform' });
  }
});

app.get('/api/platforms/:id', authMiddleware, (req, res) => {
  try {
    const platform = storage.platforms.find(p => p.id === req.params.id && p.userId === req.user.id);
    if (!platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    res.json(platform);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch platform' });
  }
});

app.put('/api/platforms/:id', authMiddleware, (req, res) => {
  try {
    const index = storage.platforms.findIndex(p => p.id === req.params.id && p.userId === req.user.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    storage.platforms[index] = {
      ...storage.platforms[index],
      ...req.body,
      updatedAt: new Date(),
    };
    
    res.json(storage.platforms[index]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update platform' });
  }
});

app.delete('/api/platforms/:id', authMiddleware, (req, res) => {
  try {
    const index = storage.platforms.findIndex(p => p.id === req.params.id && p.userId === req.user.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    storage.platforms.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete platform' });
  }
});

// Usage routes
app.get('/api/usage/logs', authMiddleware, (req, res) => {
  try {
    const { platformId, startDate, endDate, model, page = 1, limit = 50 } = req.query;
    
    let logs = storage.usageLogs.filter(log => {
      const platform = storage.platforms.find(p => p.id === log.platformId);
      return platform && platform.userId === req.user.id;
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
      logs = logs.filter(log => log.model === model);
    }
    
    // 分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedLogs = logs.slice(offset, offset + parseInt(limit));
    
    res.json({
      logs: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length,
        totalPages: Math.ceil(logs.length / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch usage logs' });
  }
});

app.get('/api/usage/stats', authMiddleware, (req, res) => {
  try {
    const { platformId } = req.query;
    
    let logs = storage.usageLogs.filter(log => {
      const platform = storage.platforms.find(p => p.id === log.platformId);
      return platform && platform.userId === req.user.id;
    });
    
    if (platformId) {
      logs = logs.filter(log => log.platformId === platformId);
    }
    
    // 计算总统计
    const totalStats = logs.reduce((acc, log) => ({
      promptTokens: acc.promptTokens + log.promptTokens,
      completionTokens: acc.completionTokens + log.completionTokens,
      totalTokens: acc.totalTokens + log.totalTokens,
      estimatedCost: acc.estimatedCost + log.estimatedCost,
    }), { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 });
    
    // 计算今日统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = logs.filter(log => new Date(log.createdAt) >= today);
    
    const todayStats = todayLogs.reduce((acc, log) => ({
      promptTokens: acc.promptTokens + log.promptTokens,
      completionTokens: acc.completionTokens + log.completionTokens,
      totalTokens: acc.totalTokens + log.totalTokens,
      estimatedCost: acc.estimatedCost + log.estimatedCost,
    }), { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 });
    
    res.json({
      total: totalStats,
      today: todayStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.post('/api/usage/report', authMiddleware, (req, res) => {
  try {
    const log = {
      id: generateId(),
      ...req.body,
      createdAt: new Date(),
    };
    storage.usageLogs.push(log);
    res.status(201).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to report usage' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});