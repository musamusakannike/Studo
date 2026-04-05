import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IPastQuestionAttempt {
  score: number;
  timeToComplete: number;
  passed: boolean;
  attemptedAt: Date;
}

export interface IPastQuestionAccess extends Document {
  user: mongoose.Types.ObjectId;
  pastQuestion: mongoose.Types.ObjectId;
  purchasedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  attempts: IPastQuestionAttempt[];
  bestScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const pastQuestionAttemptSchema = new Schema<IPastQuestionAttempt>({
  score: {
    type: Number,
    required: true,
  },
  timeToComplete: {
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
});

const pastQuestionAccessSchema = new Schema<IPastQuestionAccess>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pastQuestion: {
      type: Schema.Types.ObjectId,
      ref: 'PastQuestion',
      required: true,
      index: true,
    },
    purchasedAt: {
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
    attempts: {
      type: [pastQuestionAttemptSchema],
      default: [],
    },
    bestScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

pastQuestionAccessSchema.index({ user: 1, pastQuestion: 1 }, { unique: true });
pastQuestionAccessSchema.plugin(mongoosePaginate);

export default mongoose.model<IPastQuestionAccess>('PastQuestionAccess', pastQuestionAccessSchema);
