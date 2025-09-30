import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

// 简单的输入验证函数
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
  return Boolean(password && password.length >= 6);
}

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // 验证输入
      if (!email || !validateEmail(email)) {
        res.status(400).json({
          success: false,
          message: '请输入有效的邮箱地址',
        });
        return;
      }

      if (!password || !validatePassword(password)) {
        res.status(400).json({
          success: false,
          message: '密码至少6位',
        });
        return;
      }

      // 注册用户
      const result = await AuthService.register(email, password, name);

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: result,
      });
    } catch (error: any) {
      console.error('注册错误:', error);
      
      res.status(400).json({
        success: false,
        message: error.message || '注册失败',
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 验证输入
      if (!email || !validateEmail(email)) {
        res.status(400).json({
          success: false,
          message: '请输入有效的邮箱地址',
        });
        return;
      }

      if (!password) {
        res.status(400).json({
          success: false,
          message: '请输入密码',
        });
        return;
      }

      // 用户登录
      const result = await AuthService.login(email, password);

      res.json({
        success: true,
        message: '登录成功',
        data: result,
      });
    } catch (error: any) {
      console.error('登录错误:', error);
      
      res.status(401).json({
        success: false,
        message: error.message || '登录失败',
      });
    }
  }

  static async getProfile(req: any, res: Response): Promise<void> {
    try {
      const user = await AuthService.getUserById(req.user.id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: '用户不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '获取用户信息失败',
      });
    }
  }

  static async logout(req: Request, res: Response) {
    // JWT是无状态的，客户端删除token即可
    res.json({
      success: true,
      message: '退出登录成功',
    });
  }
}