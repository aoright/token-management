import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 简单的认证中间件（实际项目中应该使用 JWT）
  // 模拟用户认证
  (req as any).user = { id: 'demo-user-id' };
  next();
};