// 最终的用户认证测试
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 生成UUID
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 内存数据库（模拟 CloudBase）
const database = {
  users: [],
  platforms: [],
  usageLogs: []
};

// 数据库操作
const DB = {
  users: {
    create: async (userData) => {
      const user = {
        id: generateId(),
        email: userData.email,
        password: userData.password,
        name: userData.name || userData.email.split('@')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      database.users.push(user);
      console.log(`✅ 用户已保存到数据库: ${user.email} (ID: ${user.id})`);
      return user;
    },
    
    findByEmail: async (email) => {
      return database.users.find(u => u.email === email) || null;
    },
    
    findById: async (id) => {
      return database.users.find(u => u.id === id) || null;
    },
    
    getAll: () => {
      return database.users;
    }
  }
};

// 认证服务
const AuthService = {
  async register(email, password, name) {
    console.log(`\n📝 开始注册用户: ${email}`);
    
    // 检查用户是否已存在
    const existingUser = await DB.users.findByEmail(email);
    if (existingUser) {
      throw new Error('用户已存在');
    }

    // 加密密码
    console.log('🔐 正在加密密码...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    console.log('💾 正在保存用户到数据库...');
    const user = await DB.users.create({
      email,
      password: hashedPassword,
      name,
    });

    // 生成JWT token
    console.log('🎫 正在生成JWT token...');
    const token = this.generateToken(user.id);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    console.log('✅ 用户注册成功!');
    
    return {
      user: userWithoutPassword,
      token,
    };
  },

  async login(email, password) {
    console.log(`\n🔑 开始登录用户: ${email}`);
    
    // 查找用户
    const user = await DB.users.findByEmail(email);
    if (!user) {
      throw new Error('用户不存在');
    }
    console.log('👤 找到用户');

    // 验证密码
    console.log('🔍 正在验证密码...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }
    console.log('✅ 密码验证成功');

    // 生成JWT token
    const token = this.generateToken(user.id);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    console.log('✅ 用户登录成功!');
    
    return {
      user: userWithoutPassword,
      token,
    };
  },

  async getUserById(id) {
    const user = await DB.users.findById(id);
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  generateToken(userId) {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ userId }, secret, { expiresIn });
  },

  verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      throw new Error('无效的token');
    }
  }
};

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证token',
      });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await AuthService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '认证失败',
    });
  }
};

// API 路由
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码不能为空',
      });
    }

    const result = await AuthService.register(email, password, name);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: result,
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(400).json({
      success: false,
      message: error.message || '注册失败',
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码不能为空',
      });
    }

    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      message: '登录成功',
      data: result,
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(401).json({
      success: false,
      message: error.message || '登录失败',
    });
  }
});

app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
    });
  }
});

// 数据库状态路由
app.get('/api/database/stats', (req, res) => {
  const stats = {
    users: database.users.length,
    platforms: database.platforms.length,
    usageLogs: database.usageLogs.length,
    totalRecords: database.users.length + database.platforms.length + database.usageLogs.length
  };
  
  res.json({
    success: true,
    message: '数据库统计信息',
    data: stats
  });
});

// 获取所有用户（仅用于测试）
app.get('/api/users', (req, res) => {
  const users = DB.users.getAll().map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.json({
    success: true,
    data: users
  });
});

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Token Management API 运行正常',
    timestamp: new Date().toISOString(),
    environment: 'CloudBase Integration',
    database: 'Memory Storage (替代 CloudBase)',
  });
});

// 自动测试函数
async function runAutoTests() {
  console.log('\n🧪 开始自动测试...\n');
  
  const testUsers = [
    { email: 'alice@example.com', password: 'alice123456', name: 'Alice' },
    { email: 'bob@example.com', password: 'bob123456', name: 'Bob' }
  ];
  
  for (const userData of testUsers) {
    try {
      const result = await AuthService.register(userData.email, userData.password, userData.name);
      console.log(`✅ ${userData.name} 自动注册成功`);
    } catch (error) {
      console.log(`ℹ️ ${userData.name} 可能已存在:`, error.message);
    }
  }
  
  console.log('\n📊 数据库统计:');
  console.log(`   用户数量: ${database.users.length}`);
  console.log(`   平台数量: ${database.platforms.length}`);
  console.log(`   日志数量: ${database.usageLogs.length}`);
  console.log('\n🎉 自动测试完成!\n');
}

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log('🚀 Token Management API 服务器启动成功!');
  console.log(`📊 API 地址: http://localhost:${PORT}/api`);
  console.log('🔐 用户数据将保存到数据库中 (当前使用内存存储模拟 CloudBase)');
  console.log('📝 支持的功能:');
  console.log('   - 用户注册: POST /api/auth/register');
  console.log('   - 用户登录: POST /api/auth/login');
  console.log('   - 获取用户信息: GET /api/auth/profile');
  console.log('   - 数据库统计: GET /api/database/stats');
  console.log('   - 用户列表: GET /api/users');
  console.log('   - 测试接口: GET /api/test\n');
  
  // 运行自动测试
  await runAutoTests();
});

module.exports = { app, AuthService, DB };