import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/user.model';
import Course from '../models/course.model';
import PastQuestion from '../models/pastquestion.model';
import Transaction from '../models/transaction.model';
import Withdrawal from '../models/withdrawal.model';
import Wallet from '../models/wallet.model';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

export const getTutorApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const statusStr = String(status);

    const users = await User.find({ tutorApplicationStatus: statusStr })
      .sort({ 'tutorApplicationDetails.appliedAt': -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments({ tutorApplicationStatus: statusStr });

    res.json({
      success: true,
      data: {
        applications: users,
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

export const approveTutorApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.tutorApplicationStatus !== 'pending') {
      res.status(400).json({ success: false, message: 'Application is not pending' });
      return;
    }

    user.role = 'tutor';
    user.tutorApplicationStatus = 'approved';
    await user.save();

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        isActive: false,
      });
    }

    res.json({
      success: true,
      message: 'Tutor application approved successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectTutorApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.tutorApplicationStatus !== 'pending') {
      res.status(400).json({ success: false, message: 'Application is not pending' });
      return;
    }

    user.tutorApplicationStatus = 'rejected';
    await user.save();

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      wallet.balance += 20000;
      await wallet.save();

      await Transaction.create({
        user: userId,
        type: 'credit',
        purpose: 'wallet_topup',
        amount: 20000,
        status: 'success',
        balanceBefore: wallet.balance - 20000,
        balanceAfter: wallet.balance,
        metadata: { reason: 'Tutor application refund' },
      });
    }

    res.json({
      success: true,
      message: 'Tutor application rejected and fee refunded',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('tutor', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
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

export const toggleCourseStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    course.isActive = !course.isActive;
    await course.save();

    res.json({
      success: true,
      message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPastQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pastQuestions = await PastQuestion.find(query)
      .populate('creator', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await PastQuestion.countDocuments(query);

    res.json({
      success: true,
      data: {
        pastQuestions,
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

export const togglePastQuestionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pastQuestionId } = req.params;

    const pastQuestion = await PastQuestion.findById(pastQuestionId);
    if (!pastQuestion) {
      res.status(404).json({ success: false, message: 'Past question not found' });
      return;
    }

    pastQuestion.isActive = !pastQuestion.isActive;
    await pastQuestion.save();

    res.json({
      success: true,
      message: `Past question ${pastQuestion.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, type, purpose, status } = req.query;

    const query: any = {};
    if (type) query.type = type;
    if (purpose) query.purpose = purpose;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Transaction.countDocuments(query);

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

export const getAllWithdrawals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, status = 'pending' } = req.query;
    const statusStr = String(status);

    const withdrawals = await Withdrawal.find({ status: statusStr })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Withdrawal.countDocuments({ status: statusStr });

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

export const processWithdrawal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { withdrawalId } = req.params;
    const { status, rejectionReason } = req.body;
    const adminId = req.user?._id;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      res.status(404).json({ success: false, message: 'Withdrawal not found' });
      return;
    }

    if (withdrawal.status !== 'pending') {
      res.status(400).json({ success: false, message: 'Withdrawal already processed' });
      return;
    }

    withdrawal.status = status;
    withdrawal.processedBy = adminId!;
    withdrawal.processedAt = new Date();
    if (status === 'rejected') {
      withdrawal.rejectionReason = rejectionReason;

      const wallet = await Wallet.findOne({ user: withdrawal.user });
      if (wallet) {
        wallet.balance += withdrawal.amount;
        await wallet.save();
      }
    }
    await withdrawal.save();

    const transaction = await Transaction.findOne({ relatedWithdrawal: withdrawalId });
    if (transaction) {
      transaction.status = status === 'approved' ? 'success' : 'failed';
      await transaction.save();
    }

    res.json({
      success: true,
      message: `Withdrawal ${status} successfully`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTutors = await User.countDocuments({ role: 'tutor' });
    const totalCourses = await Course.countDocuments();
    const totalPastQuestions = await PastQuestion.countDocuments();
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const pendingApplications = await User.countDocuments({ tutorApplicationStatus: 'pending' });

    const recentTransactions = await Transaction.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalTutors,
          totalCourses,
          totalPastQuestions,
          pendingWithdrawals,
          pendingApplications,
        },
        recentTransactions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
