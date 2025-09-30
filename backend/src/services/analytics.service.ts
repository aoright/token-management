import prisma from '../config/database';

export class AnalyticsService {
  static async getDailyAnalytics(userId: string, days: number = 30, platformId?: string) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const where: any = {
      platform: {
        userId
      },
      createdAt: {
        gte: startDate
      }
    };

    if (platformId) {
      where.platformId = platformId;
    }

    // 按天聚合数据
    const dailyData = await prisma.usageLog.groupBy({
      by: ['createdAt'],
      where,
      _sum: {
        totalTokens: true,
        estimatedCost: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return dailyData;
  }

  static async getPlatformDistribution(userId: string) {
    const data = await prisma.usageLog.groupBy({
      by: ['platformId'],
      where: {
        platform: {
          userId
        }
      },
      _sum: {
        totalTokens: true
      }
    });

    return data;
  }
}