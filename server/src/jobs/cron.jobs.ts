import cron from 'node-cron';
import Enrollment from '../models/enrollment.model';
import PastQuestionAccess from '../models/pastquestion-access.model';
import logger from '../utils/logger.util';

export const startCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running daily cron job: Checking expired enrollments and past question access');

      const now = new Date();

      const expiredEnrollments = await Enrollment.updateMany(
        { expiresAt: { $lt: now }, isActive: true },
        { $set: { isActive: false } }
      );

      const expiredAccesses = await PastQuestionAccess.updateMany(
        { expiresAt: { $lt: now }, isActive: true },
        { $set: { isActive: false } }
      );

      logger.info('Cron job completed:', {
        expiredEnrollments: expiredEnrollments.modifiedCount,
        expiredAccesses: expiredAccesses.modifiedCount,
      });
    } catch (error) {
      logger.error('Cron job error:', error);
    }
  });

  logger.info('Cron jobs started successfully');
};
