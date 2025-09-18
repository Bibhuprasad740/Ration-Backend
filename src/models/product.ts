import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProductCollection = 'vegetable' | 'ration';

export interface ProductDoc extends Document {
  name: string;
  imageUrl: string;
  productCollection: ProductCollection;
  addedToFinishedList: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    productCollection: { type: String, enum: ['vegetable', 'ration'], required: true },
    addedToFinishedList: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});


export const Product: Model<ProductDoc> =
  mongoose.models.Product || mongoose.model<ProductDoc>('Product', ProductSchema);

export function isValidCollectionName(value: string): value is ProductCollection {
  return value === 'vegetable' || value === 'ration';
}

export default Product;
