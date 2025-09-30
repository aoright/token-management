import { Request, Response } from 'express';
import axios from 'axios';
import { UsageService } from '../services/usage.service';
import prisma from '../config/database';

export class ProxyController {
  static async chat(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const platform = await prisma.platform.findUnique({
        where: { id: platformId }
      });

      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      // 解密 API Key（实际项目中需要实现解密逻辑）
      const apiKey = platform.apiKeyEncrypted; 
      
      // 构造请求头
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };

      // 转发请求到目标平台
      const response = await axios.post(
        `${platform.baseUrl || 'https://api.openai.com/v1'}/chat/completions`,
        req.body,
        { headers }
      );

      // 记录使用情况
      const usage = response.data.usage;
      if (usage) {
        await UsageService.create({
          platformId,
          model: req.body.model,
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          estimatedCost: 0, // 实际项目中需要根据定价计算
          requestId: response.data.id
        });
      }

      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to proxy request' });
    }
  }

  static async reportUsage(req: Request, res: Response) {
    try {
      const usageData = req.body;
      
      const usageLog = await UsageService.create({
        ...usageData,
        createdAt: new Date()
      });

      res.status(201).json(usageLog);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to report usage' });
    }
  }
}