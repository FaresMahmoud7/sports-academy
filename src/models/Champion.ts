import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChampion extends Document {
  name: string;
  photoUrl: string;
  ageCategory: string;
  sportCategory: string;
  achievements: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
  };
}

const ChampionSchema = new Schema<IChampion>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      required: true,
      trim: true,
      default: '/logo.jpg',
    },
    ageCategory: {
      type: String,
      trim: true,
      default: '',
    },
    sportCategory: {
      type: String,
      trim: true,
      default: '',
    },
    achievements: {
      type: String,
      default: '',
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const Champion: Model<IChampion> =
  mongoose.models.Champion || mongoose.model<IChampion>('Champion', ChampionSchema);

export default Champion;
