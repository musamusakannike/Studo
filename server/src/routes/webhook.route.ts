import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Wallet from '../models/wallet.model';
import Transaction from '../models/transaction.model';
import { verifyPaystackWebhook } from '../utils/helpers.util';
import logger from '../utils/logger.util';

const router = Router();

router.post('/paystack', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const secret = process.env.PAYSTACK_SECRET_KEY || '';

    if (!verifyPaystackWebhook(signature, req.body, secret)) {
      res.status(401).json({ success: false, message: 'Invalid signature' });
      return;
    }

    const { event, data } = req.body;

    logger.info('Paystack webhook received:', { event, data });

    switch (event) {
      case 'charge.success':
        if (data.channel === 'dedicated_nuban') {
          const wallet = await Wallet.findOne({ 
            accountNumber: data.authorization.receiver_bank_account_number 
          });

          if (wallet) {
            const amount = data.amount / 100;
            const balanceBefore = wallet.balance;
            wallet.balance += amount;
            await wallet.save();

            await Transaction.create({
              user: wallet.user,
              type: 'credit',
              purpose: 'wallet_topup',
              amount,
              status: 'success',
              balanceBefore,
              balanceAfter: wallet.balance,
              paystackReference: data.reference,
              metadata: {
                senderName: data.authorization.sender_name,
                senderBank: data.authorization.sender_bank,
              },
            });

            logger.info('Wallet credited successfully:', { 
              walletId: wallet._id, 
              amount 
            });
          }
        }
        break;

      case 'dedicatedaccount.assign.success':
        const wallet = await Wallet.findOne({ 
          paystackCustomerCode: data.customer.customer_code 
        });

        if (wallet) {
          wallet.accountNumber = data.dedicated_account.account_number;
          wallet.accountName = data.dedicated_account.account_name;
          wallet.bankName = data.dedicated_account.bank.name;
          wallet.dedicatedAccountId = data.dedicated_account.id;
          wallet.isActive = true;
          await wallet.save();

          logger.info('Dedicated account assigned:', { 
            walletId: wallet._id, 
            accountNumber: wallet.accountNumber 
          });
        }
        break;

      case 'dedicatedaccount.assign.failed':
        logger.error('Dedicated account assignment failed:', data);
        break;

      default:
        logger.info('Unhandled webhook event:', event);
    }

    res.sendStatus(200);
  } catch (error: any) {
    logger.error('Webhook error:', error);
    res.sendStatus(200);
  }
});

export default router;
