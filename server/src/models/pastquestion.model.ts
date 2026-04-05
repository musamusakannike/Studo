import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import slugify from 'slugify';

export interface IPastQuestionQuestion {
  questionText: string;
  options: string[];
  correctOption: number;
  image?: string;
  latex?: string;
  solutionExplanation?: string;
}

export interface ILeaderboardEntry {
  user: mongoose.Types.ObjectId;
  score: number;
  timeToComplete: number;
  attemptedAt: Date;
}

export interface IPastQuestion extends Document {
  creator: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  level: '100' | '200' | '300' | '400' | '500';
  isFree: boolean;
  price: number;
  passMark: number;
  timeLimit: number;
  questions: IPastQuestionQuestion[];
  leaderboard: ILeaderboardEntry[];
  totalAttempts: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pastQuestionQuestionSchema = new Schema<IPastQuestionQuestion>({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length >= 2,
      message: 'At least 2 options are required',
    },
  },
  correctOption: {
    type: Number,
    required: true,
  },
  image: String,
  latex: String,
  solutionExplanation: String,
});

const leaderboardEntrySchema = new Schema<ILeaderboardEntry>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  timeToComplete: {
    type: Number,
    required: true,
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

const pastQuestionSchema = new Schema<IPastQuestion>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    level: {
      type: String,
      enum: ['100', '200', '300', '400', '500'],
      required: [true, 'Level is required'],
      index: true,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    passMark: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    questions: {
      type: [pastQuestionQuestionSchema],
      required: true,
      validate: {
        validator: (v: IPastQuestionQuestion[]) => v.length > 0,
        message: 'At least one question is required',
      },
    },
    leaderboard: {
      type: [leaderboardEntrySchema],
      default: [],
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

pastQuestionSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

pastQuestionSchema.plugin(mongoosePaginate);

export default mongoose.model<IPastQuestion>('PastQuestion', pastQuestionSchema);
