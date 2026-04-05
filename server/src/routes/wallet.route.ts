import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { walletLimiter } from '../middleware/ratelimit.middleware';
import { requestWithdrawalSchema } from '../validations/wallet.validation';

const router = Router();

router.post('/create', authenticate, walletLimiter, walletController.createWallet);
router.get('/', authenticate, walletController.getWallet);
router.get('/transactions', authenticate, walletController.getTransactionHistory);
router.post('/withdraw', authenticate, walletLimiter, validate(requestWithdrawalSchema), walletController.requestWithdrawal);
router.get('/withdrawals', authenticate, walletController.getWithdrawals);

export default router;
