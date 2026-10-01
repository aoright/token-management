import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { User } from '../types';

export class AuthService {
  static async register(email: string, password: string, name?: string): Promise<{ user: User; token: string }> {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error('用户已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      },
    });

    // 生成JWT token
    const token = this.generateToken(user.id);

    // 返回用户信息（不包含密码）
    const { password: _, name: userName, ...rest } = user;
    return {
      user: {
        ...rest,
        name: userName ?? undefined,
      },
      token,
    };
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 生成JWT token
    const token = this.generateToken(user.id);

    // 返回用户信息（不包含密码）
    const { password: _, name: userName, ...rest } = user;
    return {
      user: {
        ...rest,
        name: userName ?? undefined,
      },
      token,
    };
  }

  static async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return null;
    }

    const { password: _, name: userName, ...rest } = user;
    return {
      ...rest,
      name: userName ?? undefined,
    };
  }

  static generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions);
  }

  static verifyToken(token: string): { userId: string } {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      const decoded = jwt.verify(token, secret) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error('无效的token');
    }
  }
}
