// CloudBase数据库适配器
// 使用内存存储模拟数据库操作，实际项目中应该连接到CloudBase

interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

// 内存存储（演示用）
const storage = {
  users: [] as User[],
  platforms: [] as Platform[],
  usageLogs: [] as UsageLog[],
};

// 生成UUID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 数据库操作接口
export const db = {
  user: {
    create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      const user: User = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storage.users.push(user);
      return user;
    },
    findUnique: async (where: { id?: string; email?: string }) => {
      return storage.users.find(u => 
        (where.id && u.id === where.id) || 
        (where.email && u.email === where.email)
      ) || null;
    },
    findMany: async () => {
      return storage.users;
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
      storage.platforms.push(platform);
      return platform;
    },
    findMany: async (where?: { userId?: string }) => {
      if (where?.userId) {
        return storage.platforms.filter(p => p.userId === where.userId);
      }
      return storage.platforms;
    },
    findUnique: async (where: { id: string }) => {
      return storage.platforms.find(p => p.id === where.id) || null;
    },
    update: async (where: { id: string }, data: Partial<Platform>) => {
      const index = storage.platforms.findIndex(p => p.id === where.id);
      if (index !== -1) {
        storage.platforms[index] = {
          ...storage.platforms[index],
          ...data,
          updatedAt: new Date(),
        };
        return storage.platforms[index];
      }
      return null;
    },
    delete: async (where: { id: string }) => {
      const index = storage.platforms.findIndex(p => p.id === where.id);
      if (index !== -1) {
        const deleted = storage.platforms[index];
        storage.platforms.splice(index, 1);
        return deleted;
      }
      return null;
    },
  },
  usageLog: {
    create: async (data: Omit<UsageLog, 'id' | 'createdAt'>) => {
      const log: UsageLog = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
      };
      storage.usageLogs.push(log);
      return log;
    },
    findMany: async (where?: { 
      platformId?: string;
      createdAt?: { gte?: Date; lte?: Date };
    }) => {
      let logs = storage.usageLogs;
      
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
    },
  },
};

export default db;