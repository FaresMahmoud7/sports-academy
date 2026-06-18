import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoach extends Document {
  name: string;
  phone: string;
  trainingDays: string[];
  trainingTime: string;
  players: mongoose.Types.ObjectId[];
  photoUrl?: string;
  position?: string;
  experience?: string;
  biography?: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

const CoachSchema = new Schema<ICoach>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    trainingDays: {
      type: [String],
      default: [],
    },
    trainingTime: {
      type: String,
      default: '',
      trim: true,
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    photoUrl: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: '',
    },
    biography: {
      type: String,
      default: '',
    },
    facebookUrl: {
      type: String,
      default: '',
    },
    instagramUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Coach: Model<ICoach> =
  mongoose.models.Coach || mongoose.model<ICoach>('Coach', CoachSchema);

export default Coach;
