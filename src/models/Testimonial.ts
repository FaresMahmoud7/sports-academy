import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  profileImageUrl: string;
  reviewText: string;
  rating: number;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profileImageUrl: {
      type: String,
      trim: true,
      default: '/logo.jpg',
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  { timestamps: true }
);

const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

export default Testimonial;
