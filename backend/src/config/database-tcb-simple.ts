// CloudBase 简化数据库连接
import * as CloudBase from '@cloudbase/node-sdk';

// 初始化 CloudBase
const app = CloudBase.init({
  env: process.env.TCB_ENV_ID || 'cloud1-4gzm74v7ed7f175b',
  secretId: process.env.TCB_SECRET_ID,
  secretKey: process.env.TCB_SECRET_KEY,
});

// 获取数据库实例
const db = app.database();

// 生成UUID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 数据库操作接口
export const dbSimple = {
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
        const result = await db.collection('users').add(user);
        console.log('用户创建成功:', result);
        return user;
      } catch (error) {
        console.error('创建用户失败:', error);
        throw new Error('创建用户失败');
      }
    },

    findUnique: async (where: { id?: string; email?: string }) => {
      try {
        let result;
        
        if (where.id) {
          result = await db.collection('users').where({ id: where.id }).get();
        } else if (where.email) {
          result = await db.collection('users').where({ email: where.email }).get();
        } else {
          return null;
        }

        if (result.data && result.data.length > 0) {
          return result.data[0];
        }
        
        return null;
      } catch (error) {
        console.error('查询用户失败:', error);
        return null;
      }
    },

    findMany: async () => {
      try {
        const result = await db.collection('users').get();
        return result.data || [];
      } catch (error) {
        console.error('查询用户列表失败:', error);
        return [];
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

        const result = await db.collection('users')
          .where({ id: where.id })
          .update(updateData);

        console.log('用户更新成功:', result);
        
        // 返回更新后的用户信息
        return await dbSimple.user.findUnique({ id: where.id });
      } catch (error) {
        console.error('更新用户失败:', error);
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
        const result = await db.collection('platforms').add(platform);
        console.log('平台创建成功:', result);
        return platform;
      } catch (error) {
        console.error('创建平台失败:', error);
        throw new Error('创建平台失败');
      }
    },

    findMany: async (where?: { userId?: string }) => {
      try {
        let result;
        
        if (where?.userId) {
          result = await db.collection('platforms').where({ userId: where.userId }).get();
        } else {
          result = await db.collection('platforms').get();
        }

        return result.data || [];
      } catch (error) {
        console.error('查询平台列表失败:', error);
        return [];
      }
    },

    findUnique: async (where: { id: string }) => {
      try {
        const result = await db.collection('platforms')
          .where({ id: where.id })
          .get();
        
        if (result.data && result.data.length > 0) {
          return result.data[0];
        }
        
        return null;
      } catch (error) {
        console.error('查询平台失败:', error);
        return null;
      }
    },

    update: async (where: { id: string }, data: any) => {
      try {
        const updateData = {
          ...data,
          updatedAt: new Date(),
        };

        const result = await db.collection('platforms')
          .where({ id: where.id })
          .update(updateData);

        console.log('平台更新成功:', result);
        
        // 返回更新后的平台信息
        return await dbSimple.platform.findUnique({ id: where.id });
      } catch (error) {
        console.error('更新平台失败:', error);
        throw new Error('更新平台失败');
      }
    },

    delete: async (where: { id: string }) => {
      try {
        // 先获取要删除的平台信息
        const platform = await dbSimple.platform.findUnique({ id: where.id });
        
        if (!platform) {
          return null;
        }

        const result = await db.collection('platforms')
          .where({ id: where.id })
          .remove();

        console.log('平台删除成功:', result);
        return platform;
      } catch (error) {
        console.error('删除平台失败:', error);
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
        const result = await db.collection('usage_logs').add(log);
        console.log('使用日志创建成功:', result);
        return log;
      } catch (error) {
        console.error('创建使用日志失败:', error);
        throw new Error('创建使用日志失败');
      }
    },

    findMany: async (where?: {
      platformId?: string;
      createdAt?: { gte?: Date; lte?: Date };
    }) => {
      try {
        let collection = db.collection('usage_logs');
        
        // 构建查询条件
        const conditions: any = {};
        
        if (where?.platformId) {
          conditions.platformId = where.platformId;
        }

        if (where?.createdAt?.gte) {
          conditions.createdAt = db.command.gte(where.createdAt.gte);
        }

        if (where?.createdAt?.lte) {
          if (conditions.createdAt) {
            conditions.createdAt = db.command.and([
              conditions.createdAt,
              db.command.lte(where.createdAt.lte)
            ]);
          } else {
            conditions.createdAt = db.command.lte(where.createdAt.lte);
          }
        }

        const result = await collection
          .where(conditions)
          .orderBy('createdAt', 'desc')
          .get();
        
        return result.data || [];
      } catch (error) {
        console.error('查询使用日志失败:', error);
        return [];
      }
    },
  },
};

export default dbSimple;