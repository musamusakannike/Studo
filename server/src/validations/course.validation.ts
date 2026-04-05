import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Course title must be at least 3 characters'),
  courseCode: z.string().min(2, 'Course code must be at least 2 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  level: z.enum(['100', '200', '300', '400', '500']),
  price: z.number().min(0, 'Price must be a positive number'),
  requireSequentialCompletion: z.boolean().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createLessonSchema = z.object({
  title: z.string().min(3, 'Lesson title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  order: z.number().min(0, 'Order must be a positive number'),
  isActive: z.boolean().optional(),
  contents: z.array(z.object({
    type: z.enum(['text', 'link', 'image', 'audio', 'latex', 'video', 'youtubeURL', 'PDF', 'code']),
    value: z.string().min(1, 'Content value is required'),
    order: z.number().min(0, 'Order must be a positive number'),
  })).min(1, 'At least one content item is required'),
  quiz: z.object({
    passMark: z.number().min(0).max(100),
    timeLimit: z.number().min(1),
    questions: z.array(z.object({
      questionText: z.string().min(1, 'Question text is required'),
      options: z.array(z.string()).min(2, 'At least 2 options are required'),
      correctOption: z.number().min(0),
      image: z.string().optional(),
      latex: z.string().optional(),
      solutionExplanation: z.string().optional(),
    })).min(1, 'At least one question is required'),
  }).optional(),
});

export const rateCourseSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

export const submitQuizSchema = z.object({
  answers: z.array(z.number()),
  timeSpent: z.number().min(0),
});
