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
      validate: {
        validator: function (this: any, val: number) {
          // If belt is Black Belt, danDegree should be present (though optional, it must be between 1-10)
          return !val || this.belt === 'Black Belt';
        },
        message: 'Dan degree is only applicable for Black Belt rank.',
      },
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
