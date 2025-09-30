import { Request, Response } from 'express';
import { UsageService } from '../services/usage.service';

export class UsageController {
  static async getLogs(req: Request, res: Response) {
    try {
      const { platformId, startDate, endDate, model, page, limit } = req.query;
      
      const result = await UsageService.findLogs(req.user.id, {
        platformId: platformId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        model: model as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch usage logs' });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const { platformId } = req.query;
      const stats = await UsageService.getStats(req.user.id, platformId as string);
      res.json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}