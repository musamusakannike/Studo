import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: 'credit' | 'debit';
  purpose: 'wallet_topup' | 'course_purchase' | 'pastquestion_purchase' | 'tutor_application' | 'withdrawal' | 'tutor_earning';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  balanceBefore: number;
  balanceAfter: number;
  reference?: string;
  paystackReference?: string;
  relatedCourse?: mongoose.Types.ObjectId;
  relatedPastQuestion?: mongoose.Types.ObjectId;
  relatedWithdrawal?: mongoose.Types.ObjectId;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    purpose: {
      type: String,
      enum: ['wallet_topup', 'course_purchase', 'pastquestion_purchase', 'tutor_application', 'withdrawal', 'tutor_earning'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      unique: true,
      sparse: true,
    },
    paystackReference: {
      type: String,
    },
    relatedCourse: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    relatedPastQuestion: {
      type: Schema.Types.ObjectId,
      ref: 'PastQuestion',
    },
    relatedWithdrawal: {
      type: Schema.Types.ObjectId,
      ref: 'Withdrawal',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.plugin(mongoosePaginate);

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
