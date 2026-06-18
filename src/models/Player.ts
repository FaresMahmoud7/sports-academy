import mongoose, { Schema, Document, Model } from 'mongoose';
import { BELTS, BeltType, calculateAgeAndCategory } from '@/lib/constants';

export interface IPlayer extends Document {
  name: string;
  birthYear: number;
  age: number;
  belt: BeltType;
  danDegree?: number; // 1 to 10
  parentPhone: string;
  registered: boolean;
  coachId: mongoose.Types.ObjectId | null;
  category: string;
  notes?: string;
  trainingDays: string[];
  trainingType?: string;
  fileNumber?: string;
  nationalId?: string;
  beltDate?: string;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    birthYear: {
      type: Number,
      required: true,
    },
    age: {
      type: Number,
    },
    belt: {
      type: String,
      enum: BELTS,
      required: true,
      default: 'White',
    },
    danDegree: {
      type: Number,
      min: 1,
      max: 10,
    },
    parentPhone: {
      type: String,
      required: true,
      trim: true,
    },
    registered: {
      type: Boolean,
      default: false,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: 'Coach',
      default: null,
    },
    category: {
      type: String,
    },
    notes: {
      type: String,
      default: '',
    },
    trainingDays: {
      type: [String],
      default: [],
    },
    trainingType: {
      type: String,
      enum: ['كاتا', 'كوميتيه', 'فتنس', 'اختبارات', 'Kata', 'Kumite', 'Fitness', 'Exams', 'غير محدد', ''],
      default: '',
    },
    fileNumber: {
      type: String,
      trim: true,
      default: '',
    },
    nationalId: {
      type: String,
      trim: true,
      default: '',
    },
    beltDate: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Pre-save middleware to assign age and category
PlayerSchema.pre('save', async function () {
  const self = this as any;
  if (self.isModified('birthYear')) {
    const { age, category } = calculateAgeAndCategory(self.birthYear);
    self.age = age;
    self.category = category;
  }
});

// Pre-update middleware (in case of findOneAndUpdate/update)
PlayerSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'] as any, async function () {
  const update = (this as any).getUpdate() as any;
  if (update && update.birthYear !== undefined) {
    const { age, category } = calculateAgeAndCategory(update.birthYear);
    update.age = age;
    update.category = category;
  }
});

const Player: Model<IPlayer> =
  mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);

export default Player;
