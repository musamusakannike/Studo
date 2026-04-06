import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('[Auth] No token provided');
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        console.log(`[Auth] User not found for ID: ${decoded.userId}`);
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError: any) {
      console.log(`[Auth] JWT Verification failed: ${jwtError.message}. Token: ${token.substring(0, 10)}...`);
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } catch (error: any) {
    console.error(`[Auth] Middleware error: ${error.message}`);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
      return;
    }

    next();
  };
};
