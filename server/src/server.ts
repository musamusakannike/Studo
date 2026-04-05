import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { Server } from 'socket.io';
import http from 'http';
import { connectDatabase } from './config/database.config';
import { initializeFirebase } from './config/firebase.config';
import { errorHandler, notFound } from './middleware/error.middleware';
import { generalLimiter } from './middleware/ratelimit.middleware';
import { startCronJobs } from './jobs/cron.jobs';
import logger from './utils/logger.util';

import authRoutes from './routes/auth.route';
import walletRoutes from './routes/wallet.route';
import courseRoutes from './routes/course.route';
import pastQuestionRoutes from './routes/pastquestion.route';
import adminRoutes from './routes/admin.route';
import uploadRoutes from './routes/upload.route';
import webhookRoutes from './routes/webhook.route';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(generalLimiter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Studo API',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/past-questions', pastQuestionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/webhooks', webhookRoutes);

io.on('connection', (socket) => {
  logger.info('New socket connection:', socket.id);

  socket.on('disconnect', () => {
    logger.info('Socket disconnected:', socket.id);
  });
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    
    initializeFirebase();
    
    startCronJobs();

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { io };
