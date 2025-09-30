// 用户模型（使用 Prisma，此处仅作类型定义）
export interface UserModel {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}