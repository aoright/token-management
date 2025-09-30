import { Request, Response } from 'express';
import { PlatformService } from '../services/platform.service';

export class PlatformController {
  static async getAll(req: Request, res: Response) {
    try {
      const platforms = await PlatformService.findAll(req.user.id);
      res.json(platforms);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch platforms' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const platform = await PlatformService.findOne(req.params.id, req.user.id);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      res.json(platform);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch platform' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const platform = await PlatformService.create({
        userId: req.user.id,
        ...req.body,
      });
      res.status(201).json(platform);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create platform' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const platform = await PlatformService.update(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json(platform);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update platform' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await PlatformService.delete(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete platform' });
    }
  }
}