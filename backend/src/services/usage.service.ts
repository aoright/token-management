import prisma from '../config/database';
import { UsageLog } from '../types';

interface FindLogsOptions {
  platformId?: string;
  startDate?: Date;
  endDate?: Date;
  model?: string;
  page?: number;
  limit?: number;
}

export class UsageService {
  static async findLogs(userId: string, options: FindLogsOptions) {
    const { platformId, startDate, endDate, model, page = 1, limit = 20 } = options;
    
    const where: any = {
      platform: {
        userId
      }
    };

    if (platformId) {
      where.platformId = platformId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    if (model) {
      where.model = model;
    }

    const [logs, total] = await Promise.all([
      prisma.usageLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.usageLog.count({ where })
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getStats(userId: string, platformId?: string) {
    const where: any = {
      platform: {
        userId
      }
    };

    if (platformId) {
      where.platformId = platformId;
    }

    // 获取总计数据
    const totalStats = await prisma.usageLog.aggregate({
      where,
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        estimatedCost: true
      }
    });

    // 获取今日数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStats = await prisma.usageLog.aggregate({
      where: {
        ...where,
        createdAt: {
          gte: today
        }
      },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        estimatedCost: true
      }
    });

    return {
      total: {
        promptTokens: totalStats._sum.promptTokens || 0,
        completionTokens: totalStats._sum.completionTokens || 0,
        totalTokens: totalStats._sum.totalTokens || 0,
        estimatedCost: totalStats._sum.estimatedCost?.toNumber() || 0
      },
      today: {
        promptTokens: todayStats._sum.promptTokens || 0,
        completionTokens: todayStats._sum.completionTokens || 0,
        totalTokens: todayStats._sum.totalTokens || 0,
        estimatedCost: todayStats._sum.estimatedCost?.toNumber() || 0
      }
    };
  }

  static async create(data: Partial<UsageLog>): Promise<UsageLog> {
    return prisma.usageLog.create({
      data
    });
  }
}