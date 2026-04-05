import multer from 'multer';
import multerS3 from 'multer-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName } from '../config/aws.config';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const folder = req.body.folder || 'uploads';
      const uniqueName = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);
export const uploadFields = upload.fields([
  { name: 'bannerImages', maxCount: 5 },
  { name: 'profileImage', maxCount: 1 },
]);
