import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client, bucketName } from '../config/aws.config';
import path from 'path';
import crypto from 'crypto';

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, audio, and PDFs are allowed.'));
  }
};

export const upload = multer({
  storage: multerS3({
    s3: s3Client as any,
    bucket: bucketName,
    metadata: (_req: any, file: any, cb: any) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_req: any, file: any, cb: any) => {
      const folder = 'uploads';
      const uniqueName = `${folder}/${crypto.randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export const uploadSingle: any = upload.single('file');
export const uploadMultiple: any = upload.array('files', 10);
export const uploadFields: any = upload.fields([
  { name: 'bannerImages', maxCount: 5 },
  { name: 'profileImage', maxCount: 1 },
]);
