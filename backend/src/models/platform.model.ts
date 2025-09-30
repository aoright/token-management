// 平台模型（使用 Prisma，此处仅作类型定义）
export interface PlatformModel {
  id: string;
  userId: string;
  name: string;
  provider: string;
  apiKeyEncrypted: string;
  baseUrl?: string;
  pricingConfig: object;
  monthlyQuota?: number;
  alertThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}