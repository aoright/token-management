// 最小化的应用，专门测试用户认证和数据库存储
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// CloudBase 数据库连接
const CloudBase = require('@cloudbase/node-sdk');

// 初始化 CloudBase
const app_cb = CloudBase.init({
  env: process.env.TCB_ENV_ID || 'cloud1-4gzm74v7ed7f175b',
  secretId: process.env.TCB_SECRET_ID,
  secretKey: process.env.TCB_SECRET_KEY,
});

const db = app_cb.database();

// 生成UUID
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 用户服务
const UserService = {
  async create(userData) {
    const user = {
      id: generateId(),
      email: userData.email,
      password: userData.password,
      name: userData.name || userData.email.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const result = await db.collection('users').add(user);
      console.log('用户创建成功:', result);
      return user;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw new Error('创建用户失败');
    }
  },

  async findByEmail(email) {
    try {
      const result = await db.collection('users').where({ email }).get();
      return result.data && result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('查询用户失败:', error);
      return null;
    }
  },

  async findById(id) {
    try {
      const result = await db.collection('users').where({ id }).get();
      return result.data && result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('查询用户失败:', error);
      return null;
    }
  }
};

// 认证服务
const AuthService = {
  async register(email, password, name) {
    // 检查用户是否已存在
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      throw new Error('用户已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await UserService.create({
      email,
      password: hashedPassword,
      name,
    });

    // 生成JWT token
    const token = this.generateToken(user.id);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  },

  async login(email, password) {
    // 查找用户
    const user = await UserService.findByEmail(email);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 生成JWT token
    const token = this.generateToken(user.id);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  },

  async getUserById(id) {
    const user = await UserService.findById(id);
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

// 路由
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

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString(),
  });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📊 API 地址: http://localhost:${PORT}/api`);
  console.log('🔐 用户数据将保存到 CloudBase 数据库中');
});

module.exports = { app, AuthService, UserService };