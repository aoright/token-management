// 真正的CloudBase数据库适配器
import * as tcb from '@cloudbase/node-sdk';

// 初始化CloudBase
const app = tcb.init({
  env: process.env.TCB_ENV || 'cloud1-4gzm74v7ed7f175b', // 使用我们的环境ID
});

const db = app.database();

interface User {
  _id?: string;
  id?: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Platform {
  _id?: string;
  id?: string;
  userId: string;
  name: string;
  provider: string;
  apiKeyEncrypted: string;
  baseUrl?: string;
  pricingConfig: any;
  monthlyQuota?: number;
  alertThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UsageLog {
  _id?: string;
  id?: string;
  platformId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  requestId?: string;
  metadata?: any;
  createdAt: Date;
}

// 生成UUID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 数据库操作接口
export const dbReal = {
  user: {
    create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      const user = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await db.collection('users').add(user);
      return {
        ...user,
        _id: result.id,
      };
    },
    
    findUnique: async (where: { id?: string; email?: string }) => {
      let query = db.collection('users');
      
      if (where.id) {
        query = query.where({ id: where.id });
      } else if (where.email) {
        query = query.where({ email: where.email });
      }
      
      const result = await query.get();
      return result.data.length > 0 ? result.data[0] : null;
    },
    
    findMany: async () => {
      const result = await db.collection('users').get();
      return result.data;
    },
  },
  
  platform: {
    create: async (data: Omit<Platform, 'id' | 'createdAt' | 'updatedAt'>) => {
      const platform = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await db.collection('platforms').add(platform);
      return {
        ...platform,
        _id: result.id,
      };
    },
    
    findMany: async (where?: { userId?: string }) => {
      let query = db.collection('platforms');
      
      if (where?.userId) {
        query = query.where({ userId: where.userId });
      }
      
      const result = await query.get();
      return result.data;
    },
    
    findUnique: async (where: { id: string }) => {
      const result = await db.collection('platforms').where({ id: where.id }).get();
      return result.data.length > 0 ? result.data[0] : null;
    },
    
    update: async (where: { id: string }, data: Partial<Platform>) => {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      
      await db.collection('platforms').where({ id: where.id }).update(updateData);
      
      // 返回更新后的数据
      const result = await db.collection('platforms').where({ id: where.id }).get();
      return result.data.length > 0 ? result.data[0] : null;
    },
    
    delete: async (where: { id: string }) => {
      const result = await db.collection('platforms').where({ id: where.id }).get();
      const deleted = result.data.length > 0 ? result.data[0] : null;
      
      if (deleted) {
        await db.collection('platforms').where({ id: where.id }).remove();
      }
      
      return deleted;
    },
  },
  
  usageLog: {
    create: async (data: Omit<UsageLog, 'id' | 'createdAt'>) => {
      const log = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
      };
      
      const result = await db.collection('usage_logs').add(log);
      return {
        ...log,
        _id: result.id,
      };
    },
    
    findMany: async (where?: { 
      platformId?: string;
      createdAt?: { gte?: Date; lte?: Date };
    }) => {
      let query = db.collection('usage_logs');
      
      if (where?.platformId) {
        query = query.where({ platformId: where.platformId });
      }
      
      if (where?.createdAt?.gte) {
        query = query.where({
          createdAt: db.command.gte(where.createdAt.gte)
        });
      }
      
      if (where?.createdAt?.lte) {
        query = query.where({
          createdAt: db.command.lte(where.createdAt.lte)
        });
      }
      
      const result = await query.orderBy('createdAt', 'desc').get();
      return result.data;
    },
  },
};

export default dbReal;