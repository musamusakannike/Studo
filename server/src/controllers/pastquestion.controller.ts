import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import PastQuestion from '../models/pastquestion.model';
import PastQuestionAccess from '../models/pastquestion-access.model';
import Wallet from '../models/wallet.model';
import Transaction from '../models/transaction.model';
import User from '../models/user.model';
import { addMonthsToDate, calculateTutorEarning } from '../utils/helpers.util';
import { sendPastQuestionPurchaseNotification } from '../utils/email.util';

export const createPastQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?._id;
    const { title, description, level, isFree, price, passMark, timeLimit, questions } = req.body;

    const pastQuestion = await PastQuestion.create({
      creator: creatorId,
      title,
      description,
      level,
      isFree,
      price: isFree ? 0 : price,
      passMark,
      timeLimit,
      questions,
    });

    res.status(201).json({
      success: true,
      message: 'Past question created successfully',
      data: pastQuestion,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePastQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pastQuestionId } = req.params;
    const creatorId = req.user?._id;

    const pastQuestion = await PastQuestion.findOne({ _id: pastQuestionId, creator: creatorId });
    if (!pastQuestion) {
      res.status(404).json({ success: false, message: 'Past question not found or unauthorized' });
      return;
    }

    Object.assign(pastQuestion, req.body);
    await pastQuestion.save();

    res.json({
      success: true,
      message: 'Past question updated successfully',
      data: pastQuestion,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPastQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { level, search, page = 1, limit = 20 } = req.query;

    const query: any = { isActive: true };
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pastQuestions = await PastQuestion.find(query)
      .select('-questions')
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

export const getPastQuestionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pastQuestionId } = req.params;
    const userId = req.user?._id;

    const pastQuestion = await PastQuestion.findById(pastQuestionId)
      .select('-questions')
      .populate('creator', 'fullName email');

    if (!pastQuestion) {
      res.status(404).json({ success: false, message: 'Past question not found' });
      return;
    }

    const hasAccess = pastQuestion.isFree || 
      await PastQuestionAccess.exists({ user: userId, pastQuestion: pastQuestionId, isActive: true });

    res.json({
      success: true,
      data: {
        ...pastQuestion.toObject(),
        hasAccess: !!hasAccess,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const purchasePastQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pastQuestionId } = req.params;
    const userId = req.user?._id;

    const pastQuestion = await PastQuestion.findById(pastQuestionId).populate('creator');
    if (!pastQuestion) {
      res.status(404).json({ success: false, message: 'Past question not found' });
      return;
    }

    if (pastQuestion.isFree) {
      res.status(400).json({ success: false, message: 'This past question is free' });
      return;
    }

    const existingAccess = await PastQuestionAccess.findOne({ 
      user: userId, 
      pastQuestion: pastQuestionId,
      isActive: true 
    });
    if (existingAccess) {
      res.status(400).json({ success: false, message: 'Already purchased this past question' });
      return;
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet || wallet.balance < pastQuestion.price) {
      res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      return;
    }

    wallet.balance -= pastQuestion.price;
    await wallet.save();

    const creatorEarning = calculateTutorEarning(pastQuestion.price);
    const creatorWallet = await Wallet.findOne({ user: pastQuestion.creator._id });
    if (creatorWallet) {
      creatorWallet.balance += creatorEarning;
      await creatorWallet.save();

      await Transaction.create({
        user: pastQuestion.creator._id,
        type: 'credit',
        purpose: 'tutor_earning',
        amount: creatorEarning,
        status: 'success',
        balanceBefore: creatorWallet.balance - creatorEarning,
        balanceAfter: creatorWallet.balance,
        relatedPastQuestion: pastQuestionId,
      });
    }

    await Transaction.create({
      user: userId,
      type: 'debit',
      purpose: 'pastquestion_purchase',
      amount: pastQuestion.price,
      status: 'success',
      balanceBefore: wallet.balance + pastQuestion.price,
      balanceAfter: wallet.balance,
      relatedPastQuestion: pastQuestionId,
    });

    const access = await PastQuestionAccess.create({
      user: userId,
      pastQuestion: pastQuestionId,
      purchasedAt: new Date(),
      expiresAt: addMonthsToDate(new Date(), 3),
      isActive: true,
      attempts: [],
    });

    const creator = await User.findById(pastQuestion.creator._id);
    if (creator) {
      await sendPastQuestionPurchaseNotification(
        creator.email,
        creator.fullName,
        pastQuestion.title,
        pastQuestion.price,
        creatorEarning
      );
    }

    res.status(201).json({
      success: true,
      message: 'Successfully purchased past question',
      data: access,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPastQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;

    const accesses = await PastQuestionAccess.find({ user: userId, isActive: true })
      .populate('pastQuestion')
      .sort({ purchasedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const freePastQuestions = await PastQuestion.find({ isFree: true, isActive: true })
      .select('-questions')
      .limit(10);

    const total = await PastQuestionAccess.countDocuments({ user: userId, isActive: true });

    res.json({
      success: true,
      data: {
        purchased: accesses,
        free: freePastQuestions,
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

export const attemptPastQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pastQuestionId } = req.params;
    const userId = req.user?._id;

    const pastQuestion = await PastQuestion.findById(pastQuestionId);
    if (!pastQuestion) {
      res.status(404).json({ success: false, message: 'Past question not found' });
      return;
    }

    const hasAccess = pastQuestion.isFree || 
      await PastQuestionAccess.exists({ user: userId, pastQuestion: pastQuestionId, isActive: true });

    if (!hasAccess) {
      res.status(403).json({ success: false, message: 'You do not have access to this past question' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: pastQuestion._id,
        title: pastQuestion.title,
        description: pastQuestion.description,
        passMark: pastQuestion.passMark,
        timeLimit: pastQuestion.timeLimit,
        questions: pastQuestion.questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          image: q.image,
          latex: q.latex,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitPastQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pastQuestionId } = req.params;
    const userId = req.user?._id;
    const { answers, timeSpent } = req.body;

    const pastQuestion = await PastQuestion.findById(pastQuestionId);
    if (!pastQuestion) {
      res.status(404).json({ success: false, message: 'Past question not found' });
      return;
    }

    let correctAnswers = 0;
    pastQuestion.questions.forEach((question, i) => {
      if (answers[i] === question.correctOption) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / pastQuestion.questions.length) * 100;
    const passed = score >= pastQuestion.passMark;

    if (pastQuestion.isFree) {
      pastQuestion.leaderboard.push({
        user: userId,
        score,
        timeToComplete: timeSpent,
        attemptedAt: new Date(),
      });
      pastQuestion.leaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeToComplete - b.timeToComplete;
      });
      pastQuestion.leaderboard = pastQuestion.leaderboard.slice(0, 100);
      pastQuestion.totalAttempts += 1;
      await pastQuestion.save();
    } else {
      const access = await PastQuestionAccess.findOne({ 
        user: userId, 
        pastQuestion: pastQuestionId 
      });
      if (access) {
        access.attempts.push({
          score,
          timeToComplete: timeSpent,
          passed,
          attemptedAt: new Date(),
        });
        if (score > access.bestScore) {
          access.bestScore = score;
        }
        await access.save();
      }
    }

    res.json({
      success: true,
      message: passed ? 'Congratulations! You passed!' : 'Keep trying!',
      data: {
        score,
        passed,
        correctAnswers,
        totalQuestions: pastQuestion.questions.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pastQuestionId } = req.params;

    const pastQuestion = await PastQuestion.findById(pastQuestionId)
      .select('title leaderboard')
      .populate('leaderboard.user', 'fullName');

    if (!pastQuestion) {
      res.status(404).json({ success: false, message: 'Past question not found' });
      return;
    }

    if (!pastQuestion.isFree) {
      res.status(400).json({ success: false, message: 'Leaderboard only available for free past questions' });
      return;
    }

    res.json({
      success: true,
      data: {
        title: pastQuestion.title,
        leaderboard: pastQuestion.leaderboard.slice(0, 50),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
