import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PlatformService } from './services/platform.service';
import { UsageService } from './services/usage.service';
import { ProxyController } from './controllers/proxy.controller';
import { AuthController } from './controllers/auth.controller';
import { authMiddleware } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Token Monitor API Server',
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (不需要认证)
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/logout', AuthController.logout);

// Protected auth routes (需要认证)
app.get('/api/auth/profile', authMiddleware, AuthController.getProfile);

// Platform routes
app.get('/api/platforms', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const platforms = await PlatformService.findAll(req.user.id);
    res.json(platforms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

app.post('/api/platforms', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
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

app.get('/api/platforms/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const platform = await PlatformService.findOne(req.params.id, req.user.id);
    if (!platform) {
      res.status(404).json({ error: 'Platform not found' });
      return;
    }
    res.json(platform);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch platform' });
  }
});

app.put('/api/platforms/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
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

app.delete('/api/platforms/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    await PlatformService.delete(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete platform' });
  }
});

// Usage routes
app.get('/api/usage/logs', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { platformId, startDate, endDate, model, page, limit } = req.query;
    
    const result = await UsageService.findLogs(req.user.id, {
      platformId: platformId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      model: model as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch usage logs' });
  }
});

app.get('/api/usage/stats', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { platformId } = req.query;
    const stats = await UsageService.getStats(req.user.id, platformId as string);
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
app.get('/api/analytics/daily', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { days = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));
    
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
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
