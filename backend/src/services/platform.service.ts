import prisma from '../config/database';
import { Platform } from '../types';

export class PlatformService {
  static async findAll(userId: string): Promise<Platform[]> {
    return prisma.platform.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findOne(id: string, userId: string): Promise<Platform | null> {
    return prisma.platform.findFirst({
      where: { id, userId }
    });
  }

  static async create(data: Partial<Platform> & { userId: string }): Promise<Platform> {
    return prisma.platform.create({
      data
    });
  }

  static async update(id: string, userId: string, data: Partial<Platform>): Promise<Platform> {
    return prisma.platform.update({
      where: { id, userId },
      data
    });
  }

  static async delete(id: string, userId: string): Promise<void> {
    await prisma.platform.delete({
      where: { id, userId }
    });
  }
}