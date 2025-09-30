// 测试数据库连接和用户注册功能
const { AuthService } = require('./dist/services/auth.service');

async function testDatabase() {
  try {
    console.log('开始测试数据库连接...');
    
    // 测试用户注册
    const testUser = {
      email: 'test@example.com',
      password: 'test123456',
      name: 'Test User'
    };
    
    console.log('测试用户注册...');
    const result = await AuthService.register(testUser.email, testUser.password, testUser.name);
    console.log('注册成功:', result);
    
    // 测试用户登录
    console.log('测试用户登录...');
    const loginResult = await AuthService.login(testUser.email, testUser.password);
    console.log('登录成功:', loginResult);
    
    // 测试获取用户信息
    console.log('测试获取用户信息...');
    const userInfo = await AuthService.getUserById(result.user.id);
    console.log('用户信息:', userInfo);
    
    console.log('✅ 所有测试通过！数据库连接正常，用户数据已保存到 CloudBase 数据库中。');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行测试
testDatabase();