import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGalleryItem extends Document {
  imageUrl: string;
  caption?: string;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
      default: '/logo.jpg',
    },
    caption: {
      type: String,
      trim: true,
      default: 'أبطال الأكاديمية أثناء التدريبات الجماعية',
    },
  },
  { timestamps: true }
);

const GalleryItem: Model<IGalleryItem> =
  mongoose.models.GalleryItem || mongoose.model<IGalleryItem>('GalleryItem', GalleryItemSchema);

export default GalleryItem;
