// CloudBase 数据库操作封装
import bcrypt from 'bcryptjs';

// 生成UUID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 用户接口
interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 平台接口
interface Platform {
  id: string;
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

// 使用日志接口
interface UsageLog {
  id: string;
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

// 内存存储（作为数据库的备用方案）
const memoryStorage = {
  users: [] as User[],
  platforms: [] as Platform[],
  usageLogs: [] as UsageLog[],
};

// 数据库操作接口
export const dbCloudBase = {
  user: {
    create: async (data: {
      email: string;
      password: string;
      name?: string;
    }): Promise<User> => {
      const user: User = {
        id: generateId(),
        email: data.email,
        password: data.password,
        name: data.name || data.email.split('@')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        // 保存到内存存储
        memoryStorage.users.push(user);
        
        console.log('✅ 用户创建成功:', {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt.toISOString()
        });
        
        return user;
      } catch (error) {
        console.error('❌ 创建用户失败:', error);
        throw new Error('创建用户失败');
      }
    },

    findUnique: async (where: { id?: string; email?: string }): Promise<User | null> => {
      try {
        const user = memoryStorage.users.find(u => 
          (where.id && u.id === where.id) || 
          (where.email && u.email === where.email)
        );
        
        return user || null;
      } catch (error) {
        console.error('❌ 查询用户失败:', error);
        return null;
      }
    },

    findMany: async (): Promise<User[]> => {
      try {
        return memoryStorage.users;
      } catch (error) {
        console.error('❌ 查询用户列表失败:', error);
        return [];
      }
    },

    update: async (where: { id: string }, data: Partial<{
      email: string;
      password: string;
      name: string;
    }>): Promise<User | null> => {
      try {
        const index = memoryStorage.users.findIndex(u => u.id === where.id);
        if (index !== -1) {
          memoryStorage.users[index] = {
            ...memoryStorage.users[index],
            ...data,
            updatedAt: new Date(),
          };
          
          console.log('✅ 用户更新成功:', memoryStorage.users[index].id);
          return memoryStorage.users[index];
        }
        
        return null;
      } catch (error) {
        console.error('❌ 更新用户失败:', error);
        throw new Error('更新用户失败');
      }
    },
  },

  platform: {
    create: async (data: {
      userId: string;
      name: string;
      provider: string;
      apiKeyEncrypted: string;
      baseUrl?: string;
      pricingConfig: any;
      monthlyQuota?: number;
      alertThreshold?: number;
      isActive?: boolean;
    }): Promise<Platform> => {
      const platform: Platform = {
        id: generateId(),
        userId: data.userId,
        name: data.name,
        provider: data.provider,
        apiKeyEncrypted: data.apiKeyEncrypted,
        baseUrl: data.baseUrl,
        pricingConfig: data.pricingConfig,
        monthlyQuota: data.monthlyQuota,
        alertThreshold: data.alertThreshold || 80,
        isActive: data.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        memoryStorage.platforms.push(platform);
        console.log('✅ 平台创建成功:', platform.id);
        return platform;
      } catch (error) {
        console.error('❌ 创建平台失败:', error);
        throw new Error('创建平台失败');
      }
    },

    findMany: async (where?: { userId?: string }): Promise<Platform[]> => {
      try {
        let platforms = memoryStorage.platforms;
        if (where?.userId) {
          platforms = platforms.filter(p => p.userId === where.userId);
        }
        return platforms;
      } catch (error) {
        console.error('❌ 查询平台列表失败:', error);
        return [];
      }
    },

    findUnique: async (where: { id: string }): Promise<Platform | null> => {
      try {
        return memoryStorage.platforms.find(p => p.id === where.id) || null;
      } catch (error) {
        console.error('❌ 查询平台失败:', error);
        return null;
      }
    },

    update: async (where: { id: string }, data: any): Promise<Platform | null> => {
      try {
        const index = memoryStorage.platforms.findIndex(p => p.id === where.id);
        if (index !== -1) {
          memoryStorage.platforms[index] = {
            ...memoryStorage.platforms[index],
            ...data,
            updatedAt: new Date(),
          };
          
          console.log('✅ 平台更新成功:', memoryStorage.platforms[index].id);
          return memoryStorage.platforms[index];
        }
        return null;
      } catch (error) {
        console.error('❌ 更新平台失败:', error);
        throw new Error('更新平台失败');
      }
    },

    delete: async (where: { id: string }): Promise<Platform | null> => {
      try {
        const index = memoryStorage.platforms.findIndex(p => p.id === where.id);
        if (index !== -1) {
          const deleted = memoryStorage.platforms[index];
          memoryStorage.platforms.splice(index, 1);
          console.log('✅ 平台删除成功:', deleted.id);
          return deleted;
        }
        return null;
      } catch (error) {
        console.error('❌ 删除平台失败:', error);
        throw new Error('删除平台失败');
      }
    },
  },

  usageLog: {
    create: async (data: {
      platformId: string;
      model: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      estimatedCost: number;
      requestId?: string;
      metadata?: any;
    }): Promise<UsageLog> => {
      const log: UsageLog = {
        id: generateId(),
        platformId: data.platformId,
        model: data.model,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        estimatedCost: data.estimatedCost,
        requestId: data.requestId,
        metadata: data.metadata,
        createdAt: new Date(),
      };

      try {
        memoryStorage.usageLogs.push(log);
        console.log('✅ 使用日志创建成功:', log.id);
        return log;
      } catch (error) {
        console.error('❌ 创建使用日志失败:', error);
        throw new Error('创建使用日志失败');
      }
    },

    findMany: async (where?: {
      platformId?: string;
      createdAt?: { gte?: Date; lte?: Date };
    }): Promise<UsageLog[]> => {
      try {
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
        console.error('❌ 查询使用日志失败:', error);
        return [];
      }
    },
  },

  // 获取存储统计信息
  getStorageStats: () => {
    return {
      users: memoryStorage.users.length,
      platforms: memoryStorage.platforms.length,
      usageLogs: memoryStorage.usageLogs.length,
      totalRecords: memoryStorage.users.length + memoryStorage.platforms.length + memoryStorage.usageLogs.length
    };
  },

  // 清空所有数据（仅用于测试）
  clearAll: () => {
    memoryStorage.users = [];
    memoryStorage.platforms = [];
    memoryStorage.usageLogs = [];
    console.log('🗑️ 所有数据已清空');
  }
};

export default dbCloudBase;