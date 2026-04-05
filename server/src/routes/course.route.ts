import { Router } from 'express';
import * as courseController from '../controllers/course.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createCourseSchema,
  updateCourseSchema,
  createLessonSchema,
  rateCourseSchema,
  submitQuizSchema,
} from '../validations/course.validation';

const router: any = Router();

router.post('/', authenticate, authorize('tutor', 'admin'), validate(createCourseSchema), courseController.createCourse);
router.put('/:courseId', authenticate, authorize('tutor', 'admin'), validate(updateCourseSchema), courseController.updateCourse);
router.post('/:courseId/lessons', authenticate, authorize('tutor', 'admin'), validate(createLessonSchema), courseController.addLesson);
router.put('/:courseId/lessons/:lessonIndex', authenticate, authorize('tutor', 'admin'), validate(createLessonSchema), courseController.updateLesson);
router.get('/', courseController.getCourses);
router.get('/my-courses', authenticate, courseController.getMyCourses);
router.get('/:courseId', courseController.getCourseById);
router.post('/:courseId/enroll', authenticate, courseController.enrollInCourse);
router.post('/:courseId/rate', authenticate, validate(rateCourseSchema), courseController.rateCourse);
router.post('/:courseId/lessons/:lessonIndex/quiz', authenticate, validate(submitQuizSchema), courseController.submitQuiz);
router.post('/:courseId/lessons/:lessonIndex/complete', authenticate, courseController.completeLesson);

export default router;
