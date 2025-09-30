// 使用量模型（使用 Prisma，此处仅作类型定义）
export interface UsageModel {
  id: string;
  platformId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  requestId?: string;
  metadata?: object;
  createdAt: Date;
}