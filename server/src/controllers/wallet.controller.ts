import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Wallet from '../models/wallet.model';
import Transaction from '../models/transaction.model';
import Withdrawal from '../models/withdrawal.model';
import { assignDedicatedVirtualAccount } from '../utils/paystack.util';
import { calculateWithdrawalCharge, getAdminEmails } from '../utils/helpers.util';
import { sendWithdrawalRequestNotification } from '../utils/email.util';
import logger from '../utils/logger.util';

export const createWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const existingWallet = await Wallet.findOne({ user: userId });
    if (existingWallet) {
      res.status(400).json({ success: false, message: 'Wallet already exists' });
      return;
    }

    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    try {
      const dvaResponse = await assignDedicatedVirtualAccount(
        user.email,
        user.fullName.split(' ')[0] || 'User',
        user.fullName.split(' ')[1] || 'Name',
        '+234' + Math.floor(Math.random() * 10000000000),
        'wema-bank'
      );

      const wallet = await Wallet.create({
        user: userId,
        balance: 0,
        accountNumber: dvaResponse.dedicated_account?.account_number,
        accountName: dvaResponse.dedicated_account?.account_name,
        bankName: dvaResponse.dedicated_account?.bank?.name,
        paystackCustomerCode: dvaResponse.customer?.customer_code,
        dedicatedAccountId: dvaResponse.dedicated_account?.id,
        isActive: true,
      });

      res.status(201).json({
        success: true,
        message: 'Wallet created successfully',
        data: wallet,
      });
    } catch (paystackError: any) {
      logger.error('Paystack DVA creation failed:', paystackError);
      
      const wallet = await Wallet.create({
        user: userId,
        balance: 0,
        isActive: false,
      });

      res.status(201).json({
        success: true,
        message: 'Wallet created. Virtual account assignment pending.',
        data: wallet,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      res.status(404).json({ success: false, message: 'Wallet not found. Please create one first.' });
      return;
    }

    res.json({
      success: true,
      data: wallet,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('relatedCourse', 'title')
      .populate('relatedPastQuestion', 'title');

    const total = await Transaction.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestWithdrawal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { amount, bankName, accountNumber, accountName } = req.body;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      res.status(404).json({ success: false, message: 'Wallet not found' });
      return;
    }

    if (wallet.balance < amount) {
      res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      return;
    }

    const charge = calculateWithdrawalCharge(amount);
    const netAmount = amount - charge;

    wallet.balance -= amount;
    await wallet.save();

    const withdrawal = await Withdrawal.create({
      user: userId,
      amount,
      charge,
      netAmount,
      bankName,
      accountNumber,
      accountName,
      status: 'pending',
    });

    await Transaction.create({
      user: userId,
      type: 'debit',
      purpose: 'withdrawal',
      amount,
      status: 'pending',
      balanceBefore: wallet.balance + amount,
      balanceAfter: wallet.balance,
      relatedWithdrawal: withdrawal._id,
    });

    const adminEmails = getAdminEmails();
    if (adminEmails.length > 0) {
      await sendWithdrawalRequestNotification(
        adminEmails,
        req.user?.fullName || 'User',
        amount,
        { bankName, accountNumber, accountName }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWithdrawals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;

    const withdrawals = await Withdrawal.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Withdrawal.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
