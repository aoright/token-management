import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/daily', AnalyticsController.getDailyAnalytics);

export default router;