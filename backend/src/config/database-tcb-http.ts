// CloudBase HTTP API 数据库适配器
import axios from 'axios';

// CloudBase 环境配置
const TCB_ENV = 'cloud1-4gzm74v7ed7f175b';
const TCB_API_BASE = 'https://tcb-api.tencentcloudapi.com';

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

// 内存存储作为备用方案（当HTTP API不可用时）
const memoryStorage = {
  users: [] as User[],
  platforms: [] as Platform[],
  usageLogs: [] as UsageLog[],
};

// 模拟CloudBase HTTP API调用（实际项目中需要真实的API密钥和签名）
async function callCloudBaseAPI(action: string, collection: string, data?: any) {
  try {
    // 这里应该是真实的CloudBase API调用
    // 由于没有API密钥，我们使用内存存储作为备用
    console.log(`CloudBase API Call: ${action} on ${collection}`, data);
    
    // 模拟API响应延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { success: true, data: null };
  } catch (error) {
    console.error('CloudBase API Error:', error);
    throw error;
  }
}

// 数据库操作接口
export const dbHttp = {
  user: {
    create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      const user: User = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      try {
        // 尝试调用CloudBase API
        await callCloudBaseAPI('add', 'users', user);
        
        // 同时保存到内存存储作为备用
        memoryStorage.users.push(user);
        
        return user;
      } catch (error) {
        // API失败时使用内存存储
        memoryStorage.users.push(user);
        return user;
      }
    },
    
    findUnique: async (where: { id?: string; email?: string }) => {
      try {
        // 尝试从CloudBase API查询
        await callCloudBaseAPI('get', 'users', where);
        
        // 备用：从内存存储查询
        return memoryStorage.users.find(u => 
          (where.id && u.id === where.id) || 
          (where.email && u.email === where.email)
        ) || null;
      } catch (error) {
        // API失败时使用内存存储
        return memoryStorage.users.find(u => 
          (where.id && u.id === where.id) || 
          (where.email && u.email === where.email)
        ) || null;
      }
    },
    
    findMany: async () => {
      try {
        // 尝试从CloudBase API查询
        await callCloudBaseAPI('get', 'users');
        
        // 备用：返回内存存储数据
        return memoryStorage.users;
      } catch (error) {
        return memoryStorage.users;
      }
    },
  },
  
  platform: {
    create: async (data: Omit<Platform, 'id' | 'createdAt' | 'updatedAt'>) => {
      const platform: Platform = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      try {
        await callCloudBaseAPI('add', 'platforms', platform);
        memoryStorage.platforms.push(platform);
        return platform;
      } catch (error) {
        memoryStorage.platforms.push(platform);
        return platform;
      }
    },
    
    findMany: async (where?: { userId?: string }) => {
      try {
        await callCloudBaseAPI('get', 'platforms', where);
        
        let platforms = memoryStorage.platforms;
        if (where?.userId) {
          platforms = platforms.filter(p => p.userId === where.userId);
        }
        return platforms;
      } catch (error) {
        let platforms = memoryStorage.platforms;
        if (where?.userId) {
          platforms = platforms.filter(p => p.userId === where.userId);
        }
        return platforms;
      }
    },
    
    findUnique: async (where: { id: string }) => {
      try {
        await callCloudBaseAPI('get', 'platforms', where);
        return memoryStorage.platforms.find(p => p.id === where.id) || null;
      } catch (error) {
        return memoryStorage.platforms.find(p => p.id === where.id) || null;
      }
    },
    
    update: async (where: { id: string }, data: Partial<Platform>) => {
      try {
        await callCloudBaseAPI('update', 'platforms', { where, data });
        
        const index = memoryStorage.platforms.findIndex(p => p.id === where.id);
        if (index !== -1) {
          memoryStorage.platforms[index] = {
            ...memoryStorage.platforms[index],
            ...data,
            updatedAt: new Date(),
          };
          return memoryStorage.platforms[index];
        }
        return null;
      } catch (error) {
        const index = memoryStorage.platforms.findIndex(p => p.id === where.id);
        if (index !== -1) {
          memoryStorage.platforms[index] = {
            ...memoryStorage.platforms[index],
            ...data,
            updatedAt: new Date(),
          };
          return memoryStorage.platforms[index];
        }
        return null;
      }
    },
    
    delete: async (where: { id: string }) => {
      try {
        await callCloudBaseAPI('delete', 'platforms', where);
        
        const index = memoryStorage.platforms.findIndex(p => p.id === where.id);
        if (index !== -1) {
          const deleted = memoryStorage.platforms[index];
          memoryStorage.platforms.splice(index, 1);
          return deleted;
        }
        return null;
      } catch (error) {
        const index = memoryStorage.platforms.findIndex(p => p.id === where.id);
        if (index !== -1) {
          const deleted = memoryStorage.platforms[index];
          memoryStorage.platforms.splice(index, 1);
          return deleted;
        }
        return null;
      }
    },
  },
  
  usageLog: {
    create: async (data: Omit<UsageLog, 'id' | 'createdAt'>) => {
      const log: UsageLog = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
      };
      
      try {
        await callCloudBaseAPI('add', 'usage_logs', log);
        memoryStorage.usageLogs.push(log);
        return log;
      } catch (error) {
        memoryStorage.usageLogs.push(log);
        return log;
      }
    },
    
    findMany: async (where?: { 
      platformId?: string;
      createdAt?: { gte?: Date; lte?: Date };
    }) => {
      try {
        await callCloudBaseAPI('get', 'usage_logs', where);
        
        let logs = memoryStorage.usageLogs;
        
        if (where?.platformId) {
          logs = logs.filter(l => l.platformId === where.platformId);
        }
        
        if (where?.createdAt?.gte) {
          logs = logs.filter(l => l.createdAt >= where.createdAt!.gte!);
        }
        
        if (where?.createdAt?.lte) {
          logs = logs.filter(l => l.createdAt <= where.createdAt!.lte!);
        }
        
        return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } catch (error) {
        let logs = memoryStorage.usageLogs;
        
        if (where?.platformId) {
          logs = logs.filter(l => l.platformId === where.platformId);
        }
        
        if (where?.createdAt?.gte) {
          logs = logs.filter(l => l.createdAt >= where.createdAt!.gte!);
        }
        
        if (where?.createdAt?.lte) {
          logs = logs.filter(l => l.createdAt <= where.createdAt!.lte!);
        }
        
        return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
    },
  },
};

export default dbHttp;