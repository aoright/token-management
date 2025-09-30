import db from '../config/database';
import { Platform } from '../types';

export class PlatformService {
  static async findAll(userId: string): Promise<Platform[]> {
    return db.platform.findMany({ userId });
  }

  static async findOne(id: string, userId: string): Promise<Platform | null> {
    const platform = await db.platform.findUnique({ id });
    if (platform && platform.userId === userId) {
      return platform;
    }
    return null;
  }

  static async create(data: Partial<Platform> & { userId: string }): Promise<Platform> {
    const createData = {
      userId: data.userId,
      name: data.name || '',
      provider: data.provider || '',
      apiKeyEncrypted: data.apiKeyEncrypted || '',
      baseUrl: data.baseUrl,
      pricingConfig: data.pricingConfig || {},
      monthlyQuota: data.monthlyQuota,
      alertThreshold: data.alertThreshold || 80,
      isActive: data.isActive !== undefined ? data.isActive : true,
    };
    return db.platform.create(createData);
  }

  static async update(id: string, userId: string, data: Partial<Platform>): Promise<Platform> {
    const platform = await db.platform.findUnique({ id });
    if (!platform || platform.userId !== userId) {
      throw new Error('Platform not found');
    }
    const result = await db.platform.update({ id }, data);
    if (!result) {
      throw new Error('Failed to update platform');
    }
    return result;
  }

  static async delete(id: string, userId: string): Promise<void> {
    const platform = await db.platform.findUnique({ id });
    if (!platform || platform.userId !== userId) {
      throw new Error('Platform not found');
    }
    await db.platform.delete({ id });
  }
}