import { CloudBase } from '@cloudbase/node-sdk';

// 初始化CloudBase
const app = CloudBase.init({
  env: process.env.TCB_ENV_ID || 'cloud1-4gzm74v7ed7f175b',
  secretId: process.env.TCB_SECRET_ID,
  secretKey: process.env.TCB_SECRET_KEY,
});

// 获取数据库实例
const db = app.database();

// 数据库集合
export const collections = {
  users: db.collection('users'),
  platforms: db.collection('platforms'),
  usageLogs: db.collection('usage_logs'),
};

export default db;