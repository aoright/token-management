import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PlatformService } from './services/platform.service';
import { UsageService } from './services/usage.service';
import { ProxyController } from './controllers/proxy.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// 简单的认证中间件（实际项目中应该使用 JWT）
const authMiddleware = (req: any, res: any, next: any) => {
  // 模拟用户认证
  req.user = { id: 'demo-user-id' };
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Platform routes
app.get('/api/platforms', authMiddleware, async (req: any, res) => {
  try {
    const platforms = await PlatformService.findAll(req.user.id);
    res.json(platforms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

app.post('/api/platforms', authMiddleware, async (req: any, res) => {
  try {
    const platform = await PlatformService.create({
      userId: req.user.id,
      ...req.body,
    });
    res.status(201).json(platform);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create platform' });
  }
});

app.get('/api/platforms/:id', authMiddleware, async (req: any, res) => {
  try {
    const platform = await PlatformService.findOne(req.params.id, req.user.id);
    if (!platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    res.json(platform);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch platform' });
  }
});

app.put('/api/platforms/:id', authMiddleware, async (req: any, res) => {
  try {
    const platform = await PlatformService.update(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json(platform);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update platform' });
  }
});

app.delete('/api/platforms/:id', authMiddleware, async (req: any, res) => {
  try {
    await PlatformService.delete(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete platform' });
  }
});

// Usage routes
app.get('/api/usage/logs', authMiddleware, async (req: any, res) => {
  try {
    const { platformId, startDate, endDate, model, page, limit } = req.query;
    
    const result = await UsageService.findLogs(req.user.id, {
      platformId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      model,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch usage logs' });
  }
});

app.get('/api/usage/stats', authMiddleware, async (req: any, res) => {
  try {
    const { platformId } = req.query;
    const stats = await UsageService.getStats(req.user.id, platformId);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Proxy routes
app.post('/api/proxy/:platformId/chat', authMiddleware, ProxyController.chat);
app.post('/api/usage/report', authMiddleware, ProxyController.reportUsage);

// Analytics routes
app.get('/api/analytics/daily', authMiddleware, async (req: any, res) => {
  try {
    const { platformId, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // 这里可以添加更复杂的分析逻辑
    res.json({ message: 'Daily analytics endpoint' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});