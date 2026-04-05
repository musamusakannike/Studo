import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import slugify from 'slugify';

export interface ICourseContent {
  type: 'text' | 'link' | 'image' | 'audio' | 'latex' | 'video' | 'youtubeURL' | 'PDF' | 'code';
  value: string;
  order: number;
}

export interface IQuizQuestion {
  questionText: string;
  options: string[];
  correctOption: number;
  image?: string;
  latex?: string;
  solutionExplanation?: string;
}

export interface IQuiz {
  passMark: number;
  timeLimit: number;
  questions: IQuizQuestion[];
}

export interface ILesson {
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  contents: ICourseContent[];
  quiz?: IQuiz;
}

export interface ICourseRating {
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ICourse extends Document {
  tutor: mongoose.Types.ObjectId;
  title: string;
  courseCode: string;
  slug: string;
  description: string;
  level: '100' | '200' | '300' | '400' | '500';
  price: number;
  bannerImages: string[];
  lessons: ILesson[];
  requireSequentialCompletion: boolean;
  ratings: ICourseRating[];
  averageRating: number;
  totalStudents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseContentSchema = new Schema<ICourseContent>({
  type: {
    type: String,
    enum: ['text', 'link', 'image', 'audio', 'latex', 'video', 'youtubeURL', 'PDF', 'code'],
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const quizQuestionSchema = new Schema<IQuizQuestion>({
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

const quizSchema = new Schema<IQuiz>({
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
    type: [quizQuestionSchema],
    required: true,
    validate: {
      validator: (v: IQuizQuestion[]) => v.length > 0,
      message: 'At least one question is required',
    },
  },
});

const lessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  contents: {
    type: [courseContentSchema],
    required: true,
  },
  quiz: quizSchema,
});

const courseRatingSchema = new Schema<ICourseRating>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const courseSchema = new Schema<ICourse>(
  {
    tutor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      uppercase: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    level: {
      type: String,
      enum: ['100', '200', '300', '400', '500'],
      required: [true, 'Course level is required'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: 0,
    },
    bannerImages: {
      type: [String],
      default: [],
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
    requireSequentialCompletion: {
      type: Boolean,
      default: false,
    },
    ratings: {
      type: [courseRatingSchema],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalStudents: {
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

courseSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isModified('courseCode')) {
    this.slug = slugify(`${this.title}-${this.courseCode}`, { lower: true, strict: true });
  }
  
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
  
  next();
});

courseSchema.plugin(mongoosePaginate);

export default mongoose.model<ICourse>('Course', courseSchema);
