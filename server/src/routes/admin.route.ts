import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { processWithdrawalSchema } from '../validations/wallet.validation';

const router: any = Router();

router.use(authenticate, authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/tutor-applications', adminController.getTutorApplications);
router.post('/tutor-applications/:userId/approve', adminController.approveTutorApplication);
router.post('/tutor-applications/:userId/reject', adminController.rejectTutorApplication);
router.get('/courses', adminController.getAllCourses);
router.patch('/courses/:courseId/toggle-status', adminController.toggleCourseStatus);
router.get('/past-questions', adminController.getAllPastQuestions);
router.patch('/past-questions/:pastQuestionId/toggle-status', adminController.togglePastQuestionStatus);
router.get('/transactions', adminController.getAllTransactions);
router.get('/withdrawals', adminController.getAllWithdrawals);
router.post('/withdrawals/:withdrawalId/process', validate(processWithdrawalSchema), adminController.processWithdrawal);
router.get('/dashboard', adminController.getDashboardStats);

export default router;
