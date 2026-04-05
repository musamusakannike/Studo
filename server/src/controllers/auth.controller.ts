import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model';
import Wallet from '../models/wallet.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { admin } from '../config/firebase.config';
import { sendPasswordResetEmail, sendTutorApplicationNotification } from '../utils/email.util';
import { getAdminEmails } from '../utils/helpers.util';
import Transaction from '../models/transaction.model';

const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || '',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      authProvider: 'local',
      isVerified: true,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (user.authProvider !== 'local') {
      res.status(400).json({
        success: false,
        message: `Please login using ${user.authProvider}`,
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const googleAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name || 'Google User',
        email: email || '',
        authProvider: 'google',
        profileImage: picture,
        isVerified: true,
      });
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const appleAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name || 'Apple User',
        email: email || '',
        authProvider: 'apple',
        isVerified: true,
      });
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Apple authentication successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyForTutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { bio, expertise, qualifications } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.role === 'tutor') {
      res.status(400).json({ success: false, message: 'You are already a tutor' });
      return;
    }

    if (user.tutorApplicationStatus === 'pending') {
      res.status(400).json({ success: false, message: 'Application already pending' });
      return;
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet || wallet.balance < 20000) {
      res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance. ₦20,000 required for tutor application',
      });
      return;
    }

    wallet.balance -= 20000;
    await wallet.save();

    await Transaction.create({
      user: userId,
      type: 'debit',
      purpose: 'tutor_application',
      amount: 20000,
      status: 'success',
      balanceBefore: wallet.balance + 20000,
      balanceAfter: wallet.balance,
    });

    user.tutorApplicationStatus = 'pending';
    user.tutorApplicationDetails = {
      bio,
      expertise,
      qualifications,
      appliedAt: new Date(),
    };
    await user.save();

    const adminEmails = getAdminEmails();
    if (adminEmails.length > 0) {
      await sendTutorApplicationNotification(
        adminEmails,
        user.fullName,
        user.email,
        { bio, expertise, qualifications }
      );
    }

    res.json({
      success: true,
      message: 'Tutor application submitted successfully. Admins will review your application.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        tutorApplicationStatus: user.tutorApplicationStatus,
        tutorApplicationDetails: user.tutorApplicationDetails,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
