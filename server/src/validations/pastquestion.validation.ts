import { z } from 'zod';

export const createPastQuestionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  level: z.enum(['100', '200', '300', '400', '500']),
  isFree: z.boolean(),
  price: z.number().min(0, 'Price must be a positive number'),
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
});

export const updatePastQuestionSchema = createPastQuestionSchema.partial();

export const submitPastQuestionSchema = z.object({
  answers: z.array(z.number()),
  timeSpent: z.number().min(0),
});
