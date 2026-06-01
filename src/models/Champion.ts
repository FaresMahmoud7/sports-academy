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
      required: true,
      trim: true,
      default: 'أشبال (تحت 12 سنة)',
    },
    sportCategory: {
      type: String,
      required: true,
      trim: true,
      default: 'كاتا فردي',
    },
    achievements: {
      type: String,
      default: 'بطل الجمهورية والميدالية الذهبية 2026',
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
