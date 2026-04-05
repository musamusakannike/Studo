import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  role: 'user' | 'tutor' | 'admin';
  authProvider: 'local' | 'google' | 'apple';
  profileImage?: string;
  isVerified: boolean;
  expoPushToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  tutorApplicationStatus?: 'pending' | 'approved' | 'rejected';
  tutorApplicationDetails?: {
    bio?: string;
    expertise?: string[];
    qualifications?: string;
    appliedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'tutor', 'admin'],
      default: 'user',
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'apple'],
      default: 'local',
    },
    profileImage: {
      type: String,
    },
    expoPushToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    tutorApplicationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
    },
    tutorApplicationDetails: {
      bio: String,
      expertise: [String],
      qualifications: String,
      appliedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongoosePaginate);

export default mongoose.model<IUser>('User', userSchema);
