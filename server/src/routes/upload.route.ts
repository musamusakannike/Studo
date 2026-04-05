import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingle, uploadMultiple } from '../utils/upload.util';

const router: any = Router();

router.post('/single', authenticate, uploadSingle, uploadController.uploadFile);
router.post('/multiple', authenticate, uploadMultiple, uploadController.uploadMultipleFiles);

export default router;
