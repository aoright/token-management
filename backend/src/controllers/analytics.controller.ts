import { Request, Response } from 'express';
import prisma from '../config/database';

export class AnalyticsController {
  static async getDailyAnalytics(req: Request, res: Response) {
    try {
      const { platformId, days = '30' } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));
      
      const where: any = {
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

      res.json({
        data: dailyData,
        period: {
          start: startDate,
          end: new Date()
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
}