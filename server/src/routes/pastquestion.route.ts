import { Router } from 'express';
import * as pastQuestionController from '../controllers/pastquestion.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createPastQuestionSchema,
  updatePastQuestionSchema,
  submitPastQuestionSchema,
} from '../validations/pastquestion.validation';

const router: any = Router();

router.post('/', authenticate, validate(createPastQuestionSchema), pastQuestionController.createPastQuestion);
router.put('/:pastQuestionId', authenticate, validate(updatePastQuestionSchema), pastQuestionController.updatePastQuestion);
router.get('/', pastQuestionController.getPastQuestions);
router.get('/my-past-questions', authenticate, pastQuestionController.getMyPastQuestions);
router.get('/:pastQuestionId', authenticate, pastQuestionController.getPastQuestionById);
router.post('/:pastQuestionId/purchase', authenticate, pastQuestionController.purchasePastQuestion);
router.get('/:pastQuestionId/attempt', authenticate, pastQuestionController.attemptPastQuestion);
router.post('/:pastQuestionId/submit', authenticate, validate(submitPastQuestionSchema), pastQuestionController.submitPastQuestion);
router.get('/:pastQuestionId/leaderboard', pastQuestionController.getLeaderboard);

export default router;
