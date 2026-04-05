import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: (req.file as any).location || req.file.path,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadMultipleFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({ success: false, message: 'No files uploaded' });
      return;
    }

    const files = (req.files as Express.Multer.File[]).map(file => ({
      url: (file as any).location || file.path,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: files,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
