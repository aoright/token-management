import { Router } from 'express';
import { UsageController } from '../controllers/usage.controller';

const router = Router();

router.get('/logs', UsageController.getLogs);
router.get('/stats', UsageController.getStats);

export default router;