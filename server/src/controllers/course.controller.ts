import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Course from '../models/course.model';
import Enrollment from '../models/enrollment.model';
import Wallet from '../models/wallet.model';
import Transaction from '../models/transaction.model';
import { addMonthsToDate, calculateTutorEarning } from '../utils/helpers.util';
import { sendCourseEnrollmentNotification } from '../utils/email.util';
import User from '../models/user.model';

export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tutorId = req.user?._id;
    const { title, courseCode, description, level, price, requireSequentialCompletion } = req.body;

    const course = await Course.create({
      tutor: tutorId,
      title,
      courseCode,
      description,
      level,
      price,
      requireSequentialCompletion: requireSequentialCompletion || false,
      lessons: [],
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const tutorId = req.user?._id;

    const course = await Course.findOne({ _id: courseId, tutor: tutorId });
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
      return;
    }

    Object.assign(course, req.body);
    await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const tutorId = req.user?._id;

    const course = await Course.findOne({ _id: courseId, tutor: tutorId });
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
      return;
    }

    course.lessons.push(req.body);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: course,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonIndex } = req.params;
    const tutorId = req.user?._id;

    const course = await Course.findOne({ _id: courseId, tutor: tutorId });
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
      return;
    }

    const index = parseInt(lessonIndex);
    if (index < 0 || index >= course.lessons.length) {
      res.status(400).json({ success: false, message: 'Invalid lesson index' });
      return;
    }

    Object.assign(course.lessons[index], req.body);
    await course.save();

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: course,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { level, search, page = 1, limit = 20 } = req.query;

    const query: any = { isActive: true };
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('tutor', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('tutor', 'fullName email profileImage')
      .populate('ratings.user', 'fullName');

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    const topRatings = course.ratings.slice(0, 5);

    res.json({
      success: true,
      data: {
        ...course.toObject(),
        ratings: topRatings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;

    const course = await Course.findById(courseId).populate('tutor');
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment && existingEnrollment.isActive) {
      res.status(400).json({ success: false, message: 'Already enrolled in this course' });
      return;
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet || wallet.balance < course.price) {
      res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      return;
    }

    wallet.balance -= course.price;
    await wallet.save();

    const tutorEarning = calculateTutorEarning(course.price);
    const tutorWallet = await Wallet.findOne({ user: course.tutor._id });
    if (tutorWallet) {
      tutorWallet.balance += tutorEarning;
      await tutorWallet.save();

      await Transaction.create({
        user: course.tutor._id,
        type: 'credit',
        purpose: 'tutor_earning',
        amount: tutorEarning,
        status: 'success',
        balanceBefore: tutorWallet.balance - tutorEarning,
        balanceAfter: tutorWallet.balance,
        relatedCourse: courseId,
      });
    }

    await Transaction.create({
      user: userId,
      type: 'debit',
      purpose: 'course_purchase',
      amount: course.price,
      status: 'success',
      balanceBefore: wallet.balance + course.price,
      balanceAfter: wallet.balance,
      relatedCourse: courseId,
    });

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      enrolledAt: new Date(),
      expiresAt: addMonthsToDate(new Date(), 6),
      isActive: true,
      progress: [],
    });

    course.totalStudents += 1;
    await course.save();

    const tutor = await User.findById(course.tutor._id);
    if (tutor) {
      await sendCourseEnrollmentNotification(
        tutor.email,
        tutor.fullName,
        course.title,
        course.price,
        tutorEarning
      );
    }

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;

    const enrollments = await Enrollment.find({ user: userId, isActive: true })
      .populate('course')
      .sort({ enrolledAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Enrollment.countDocuments({ user: userId, isActive: true });

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;
    const { rating, comment } = req.body;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId, isActive: true });
    if (!enrollment) {
      res.status(403).json({ success: false, message: 'You must be enrolled to rate this course' });
      return;
    }

    if (enrollment.hasRated) {
      res.status(400).json({ success: false, message: 'You have already rated this course' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    course.ratings.push({
      user: userId,
      rating,
      comment,
      createdAt: new Date(),
    });

    enrollment.hasRated = true;
    await enrollment.save();
    await course.save();

    res.json({
      success: true,
      message: 'Course rated successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonIndex } = req.params;
    const userId = req.user?._id;
    const { answers, timeSpent } = req.body;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId, isActive: true });
    if (!enrollment) {
      res.status(403).json({ success: false, message: 'Not enrolled in this course' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    const index = parseInt(lessonIndex);
    const lesson = course.lessons[index];
    if (!lesson || !lesson.quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    let correctAnswers = 0;
    lesson.quiz.questions.forEach((question, i) => {
      if (answers[i] === question.correctOption) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / lesson.quiz.questions.length) * 100;
    const passed = score >= lesson.quiz.passMark;

    let lessonProgress = enrollment.progress.find(p => p.lessonIndex === index);
    if (!lessonProgress) {
      lessonProgress = {
        lessonIndex: index,
        completed: false,
        quizAttempts: [],
      };
      enrollment.progress.push(lessonProgress);
    }

    lessonProgress.quizAttempts.push({
      score,
      passed,
      attemptedAt: new Date(),
    });

    if (passed) {
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();
    }

    await enrollment.save();

    res.json({
      success: true,
      message: passed ? 'Quiz passed!' : 'Quiz failed. Try again.',
      data: {
        score,
        passed,
        correctAnswers,
        totalQuestions: lesson.quiz.questions.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonIndex } = req.params;
    const userId = req.user?._id;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId, isActive: true });
    if (!enrollment) {
      res.status(403).json({ success: false, message: 'Not enrolled in this course' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    const index = parseInt(lessonIndex);
    const lesson = course.lessons[index];
    if (!lesson) {
      res.status(404).json({ success: false, message: 'Lesson not found' });
      return;
    }

    if (lesson.quiz) {
      res.status(400).json({ success: false, message: 'This lesson has a quiz. Complete the quiz to mark as complete.' });
      return;
    }

    let lessonProgress = enrollment.progress.find(p => p.lessonIndex === index);
    if (!lessonProgress) {
      lessonProgress = {
        lessonIndex: index,
        completed: false,
        quizAttempts: [],
      };
      enrollment.progress.push(lessonProgress);
    }

    lessonProgress.completed = true;
    lessonProgress.completedAt = new Date();
    await enrollment.save();

    res.json({
      success: true,
      message: 'Lesson marked as complete',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
