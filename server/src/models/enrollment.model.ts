import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface ILessonProgress {
  lessonIndex: number;
  completed: boolean;
  quizAttempts: {
    score: number;
    passed: boolean;
    attemptedAt: Date;
  }[];
  completedAt?: Date;
}

export interface IEnrollment extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  enrolledAt: Date;
  expiresAt: Date;
  isActive: boolean;
  progress: ILessonProgress[];
  hasRated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>({
  lessonIndex: {
    type: Number,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  quizAttempts: [{
    score: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  completedAt: Date,
});

const enrollmentSchema = new Schema<IEnrollment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    progress: {
      type: [lessonProgressSchema],
      default: [],
    },
    hasRated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.plugin(mongoosePaginate);

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
