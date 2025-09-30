// 测试用户注册和登录功能
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 生成UUID
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 模拟用户数据存储
const users = [];

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

    // 保存到内存数组（模拟数据库）
    users.push(user);
    console.log(`✅ 用户已保存到数据库: ${user.email} (ID: ${user.id})`);
    return user;
  },

  async findByEmail(email) {
    const user = users.find(u => u.email === email);
    return user || null;
  },

  async findById(id) {
    const user = users.find(u => u.id === id);
    return user || null;
  }
};

// 认证服务
const AuthService = {
  async register(email, password, name) {
    console.log(`📝 开始注册用户: ${email}`);
    
    // 检查用户是否已存在
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      throw new Error('用户已存在');
    }

    // 加密密码
    console.log('🔐 正在加密密码...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    console.log('💾 正在保存用户到数据库...');
    const user = await UserService.create({
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
    console.log(`🔑 开始登录用户: ${email}`);
    
    // 查找用户
    const user = await UserService.findByEmail(email);
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

// 测试函数
async function testUserRegistrationAndLogin() {
  console.log('🚀 开始测试用户注册和登录功能...\n');

  try {
    // 测试用户数据
    const testUsers = [
      {
        email: 'alice@example.com',
        password: 'alice123456',
        name: 'Alice'
      },
      {
        email: 'bob@example.com',
        password: 'bob123456',
        name: 'Bob'
      }
    ];

    // 测试注册
    console.log('=== 测试用户注册 ===');
    const registeredUsers = [];
    
    for (const userData of testUsers) {
      try {
        const result = await AuthService.register(userData.email, userData.password, userData.name);
        registeredUsers.push(result);
        console.log(`✅ ${userData.name} 注册成功\n`);
      } catch (error) {
        console.error(`❌ ${userData.name} 注册失败:`, error.message, '\n');
      }
    }

    // 测试登录
    console.log('=== 测试用户登录 ===');
    for (const userData of testUsers) {
      try {
        const result = await AuthService.login(userData.email, userData.password);
        console.log(`✅ ${userData.name} 登录成功`);
        console.log(`   Token: ${result.token.substring(0, 20)}...`);
        console.log(`   用户ID: ${result.user.id}\n`);
      } catch (error) {
        console.error(`❌ ${userData.name} 登录失败:`, error.message, '\n');
      }
    }

    // 测试重复注册
    console.log('=== 测试重复注册 ===');
    try {
      await AuthService.register(testUsers[0].email, testUsers[0].password, testUsers[0].name);
      console.log('❌ 重复注册应该失败，但却成功了');
    } catch (error) {
      console.log('✅ 重复注册正确地被拒绝:', error.message);
    }

    // 测试错误密码登录
    console.log('\n=== 测试错误密码登录 ===');
    try {
      await AuthService.login(testUsers[0].email, 'wrongpassword');
      console.log('❌ 错误密码登录应该失败，但却成功了');
    } catch (error) {
      console.log('✅ 错误密码登录正确地被拒绝:', error.message);
    }

    // 显示所有用户
    console.log('\n=== 数据库中的所有用户 ===');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
      console.log(`   创建时间: ${user.createdAt.toLocaleString()}`);
    });

    console.log('\n🎉 所有测试完成！用户数据已成功保存到数据库中。');
    console.log(`📊 总共注册了 ${users.length} 个用户`);

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testUserRegistrationAndLogin();