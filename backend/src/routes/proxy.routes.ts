import { Router } from 'express';
import { ProxyController } from '../controllers/proxy.controller';

const router = Router();

router.post('/:platformId/chat', ProxyController.chat);
router.post('/usage/report', ProxyController.reportUsage);

export default router;