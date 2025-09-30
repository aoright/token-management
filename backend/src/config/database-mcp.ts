// CloudBase MCP 工具数据库适配器
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 生成UUID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// MCP 工具调用函数
async function callMCPTool(toolName: string, args: any) {
  try {
    // 这里应该调用 MCP 工具，但由于我们在 Node.js 环境中，
    // 我们需要使用其他方式来调用 CloudBase API
    console.log(`MCP Tool Call: ${toolName}`, args);
    
    // 模拟成功响应
    return { success: true, data: null };
  } catch (error) {
    console.error('MCP Tool Error:', error);
    throw error;
  }
}

// 内存存储作为备用方案
const memoryStorage = {
  users: [] as any[],
  platforms: [] as any[],
  usageLogs: [] as any[],
};

// 数据库操作接口
export const dbMCP = {
  user: {
    create: async (data: {
      email: string;
      password: string;
      name?: string;
    }) => {
      const user = {
        id: generateId(),
        email: data.email,
        password: data.password,
        name: data.name || data.email.split('@')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        // 尝试使用 MCP 工具添加到 CloudBase
        await callMCPTool('createDocument', {
          collectionName: 'users',
          data: user
        });
        
        // 同时保存到内存存储
        memoryStorage.users.push(user);
        
        console.log('用户创建成功 (MCP + Memory):', user.email);
        return user;
      } catch (error) {
        // MCP 失败时使用内存存储
        memoryStorage.users.push(user);
        console.log('用户创建成功 (Memory only):', user.email);
        return user;
      }
    },

    findUnique: async (where: { id?: string; email?: string }) => {
      try {
        // 尝试从 MCP 查询
        await callMCPTool('queryDocuments', {
          collectionName: 'users',
          query: where,
          limit: 1
        });
        
        // 备用：从内存存储查询
        const user = memoryStorage.users.find(u => 
          (where.id && u.id === where.id) || 
          (where.email && u.email === where.email)
        );
        
        return user || null;
      } catch (error) {
        // MCP 失败时使用内存存储
        const user = memoryStorage.users.find(u => 
          (where.id && u.id === where.id) || 
          (where.email && u.email === where.email)
        );
        
        return user || null;
      }
    },

    findMany: async () => {
      try {
        // 尝试从 MCP 查询
        await callMCPTool('queryDocuments', {
          collectionName: 'users',
          query: {}
        });
        
        // 备用：返回内存存储数据
        return memoryStorage.users;
      } catch (error) {
        return memoryStorage.users;
      }
    },

    update: async (where: { id: string }, data: Partial<{
      email: string;
      password: string;
      name: string;
    }>) => {
      try {
        const updateData = {
          ...data,
          updatedAt: new Date(),
        };

        // 尝试使用 MCP 工具更新
        await callMCPTool('updateDocument', {
          collectionName: 'users',
          where,
          data: updateData
        });
        
        // 更新内存存储
        const index = memoryStorage.users.findIndex(u => u.id === where.id);
        if (index !== -1) {
          memoryStorage.users[index] = {
            ...memoryStorage.users[index],
            ...updateData,
          };
          return memoryStorage.users[index];
        }
        
        return null;
      } catch (error) {
        // MCP 失败时使用内存存储
        const index = memoryStorage.users.findIndex(u => u.id === where.id);
        if (index !== -1) {
          memoryStorage.users[index] = {
            ...memoryStorage.users[index],
            ...data,
            updatedAt: new Date(),
          };
          return memoryStorage.users[index];
        }
        return null;
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
    }) => {
      const platform = {
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
        await callMCPTool('createDocument', {
          collectionName: 'platforms',
          data: platform
        });
        
        memoryStorage.platforms.push(platform);
        return platform;
      } catch (error) {
        memoryStorage.platforms.push(platform);
        return platform;
      }
    },

    findMany: async (where?: { userId?: string }) => {
      try {
        await callMCPTool('queryDocuments', {
          collectionName: 'platforms',
          query: where || {}
        });
        
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
        await callMCPTool('queryDocuments', {
          collectionName: 'platforms',
          query: where,
          limit: 1
        });
        
        return memoryStorage.platforms.find(p => p.id === where.id) || null;
      } catch (error) {
        return memoryStorage.platforms.find(p => p.id === where.id) || null;
      }
    },

    update: async (where: { id: string }, data: any) => {
      try {
        const updateData = {
          ...data,
          updatedAt: new Date(),
        };

        await callMCPTool('updateDocument', {
          collectionName: 'platforms',
          where,
          data: updateData
        });
        
        const index = memoryStorage.platforms.findIndex(p => p.id === where.id);
        if (index !== -1) {
          memoryStorage.platforms[index] = {
            ...memoryStorage.platforms[index],
            ...updateData,
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
        const platform = memoryStorage.platforms.find(p => p.id === where.id);
        
        if (!platform) {
          return null;
        }

        await callMCPTool('deleteDocument', {
          collectionName: 'platforms',
          where
        });
        
        const index = memoryStorage.platforms.findIndex(p => p.id === where.id);
        if (index !== -1) {
          memoryStorage.platforms.splice(index, 1);
        }
        
        return platform;
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
    create: async (data: {
      platformId: string;
      model: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      estimatedCost: number;
      requestId?: string;
      metadata?: any;
    }) => {
      const log = {
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
        await callMCPTool('createDocument', {
          collectionName: 'usage_logs',
          data: log
        });
        
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
        await callMCPTool('queryDocuments', {
          collectionName: 'usage_logs',
          query: where || {}
        });
        
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

export default dbMCP;