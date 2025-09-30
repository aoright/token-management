import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';

// 验证schemas
const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      // 验证请求数据
      const { email, password, name } = registerSchema.parse(req.body);

      // 注册用户
      const result = await AuthService.register(email, password, name);

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: result,
      });
    } catch (error: any) {
      console.error('注册错误:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: '输入数据无效',
          errors: error.errors,
        });
      }

      res.status(400).json({
        success: false,
        message: error.message || '注册失败',
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      // 验证请求数据
      const { email, password } = loginSchema.parse(req.body);

      // 用户登录
      const result = await AuthService.login(email, password);

      res.json({
        success: true,
        message: '登录成功',
        data: result,
      });
    } catch (error: any) {
      console.error('登录错误:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: '输入数据无效',
          errors: error.errors,
        });
      }

      res.status(401).json({
        success: false,
        message: error.message || '登录失败',
      });
    }
  }

  static async getProfile(req: any, res: Response) {
    try {
      const user = await AuthService.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在',
        });
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