import prisma from '../config/database';
import { Platform } from '../types';

function mapPlatform(p: any): Platform {
  return {
    ...p,
    baseUrl: p.baseUrl ?? undefined,
    monthlyQuota: p.monthlyQuota ?? undefined,
    pricingConfig: typeof p.pricingConfig === 'string' ? JSON.parse(p.pricingConfig) : p.pricingConfig,
  };
}

export class PlatformService {
  static async findAll(userId: string): Promise<Platform[]> {
    const platforms = await prisma.platform.findMany({
      where: { userId },
    });
    return platforms.map(mapPlatform);
  }

  static async findOne(id: string, userId: string): Promise<Platform | null> {
    const platform = await prisma.platform.findUnique({
      where: { id },
    });
    if (platform && platform.userId === userId) {
      return mapPlatform(platform);
    }
    return null;
  }

  static async create(data: Partial<Platform> & { userId: string }): Promise<Platform> {
    const created = await prisma.platform.create({
      data: {
        userId: data.userId,
        name: data.name || '',
        provider: data.provider || '',
        apiKeyEncrypted: data.apiKeyEncrypted || '',
        baseUrl: data.baseUrl,
        pricingConfig: data.pricingConfig || {},
        monthlyQuota: data.monthlyQuota,
        alertThreshold: data.alertThreshold || 80,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return mapPlatform(created);
  }

  static async update(id: string, userId: string, data: Partial<Platform>): Promise<Platform> {
    const platform = await prisma.platform.findUnique({
      where: { id },
    });
    if (!platform || platform.userId !== userId) {
      throw new Error('Platform not found');
    }
    const updated = await prisma.platform.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.provider !== undefined && { provider: data.provider }),
        ...(data.apiKeyEncrypted !== undefined && { apiKeyEncrypted: data.apiKeyEncrypted }),
        ...(data.baseUrl !== undefined && { baseUrl: data.baseUrl }),
        ...(data.pricingConfig !== undefined && { pricingConfig: data.pricingConfig }),
        ...(data.monthlyQuota !== undefined && { monthlyQuota: data.monthlyQuota }),
        ...(data.alertThreshold !== undefined && { alertThreshold: data.alertThreshold }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return mapPlatform(updated);
  }

  static async delete(id: string, userId: string): Promise<void> {
    const platform = await prisma.platform.findUnique({
      where: { id },
    });
    if (!platform || platform.userId !== userId) {
      throw new Error('Platform not found');
    }
    await prisma.platform.delete({
      where: { id },
    });
  }
}
