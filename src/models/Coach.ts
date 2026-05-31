import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoach extends Document {
  name: string;
  phone: string;
  trainingDays: string[];
  trainingTime: string;
  players: mongoose.Types.ObjectId[];
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
      required: true,
      trim: true,
    },
    trainingDays: {
      type: [String],
      default: [],
    },
    trainingTime: {
      type: String,
      required: true,
      trim: true,
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
  },
  { timestamps: true }
);

const Coach: Model<ICoach> =
  mongoose.models.Coach || mongoose.model<ICoach>('Coach', CoachSchema);

export default Coach;
