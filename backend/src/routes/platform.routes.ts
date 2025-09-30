import { Router } from 'express';
import { PlatformController } from '../controllers/platform.controller';

const router = Router();

router.get('/', PlatformController.getAll);
router.post('/', PlatformController.create);
router.get('/:id', PlatformController.getById);
router.put('/:id', PlatformController.update);
router.delete('/:id', PlatformController.delete);

export default router;