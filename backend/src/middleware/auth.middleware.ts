import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

// 扩展Request类型以包含user属性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证token',
      });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 验证token
    const { userId } = AuthService.verifyToken(token);

    // 获取用户信息
    const user = await AuthService.getUserById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error: any) {
    console.error('认证中间件错误:', error);
    
    return res.status(401).json({
      success: false,
      message: error.message || '认证失败',
    });
  }
};

// 可选的认证中间件（用于某些不需要强制登录的接口）
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { userId } = AuthService.verifyToken(token);
      const user = await AuthService.getUserById(userId);
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不返回错误，继续执行
    next();
  }
};