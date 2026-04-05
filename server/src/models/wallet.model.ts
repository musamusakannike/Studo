import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  paystackCustomerCode?: string;
  dedicatedAccountId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountNumber: {
      type: String,
    },
    accountName: {
      type: String,
    },
    bankName: {
      type: String,
    },
    paystackCustomerCode: {
      type: String,
    },
    dedicatedAccountId: {
      type: Number,
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

export default mongoose.model<IWallet>('Wallet', walletSchema);
