import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketplaceListing extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  status: 'active' | 'sold' | 'inactive';
  projectType: 'full-stack' | 'frontend' | 'backend' | 'mobile' | 'other';
  techStack: string[];
  demoUrl?: string;
  repoUrl?: string;
  hasSourceCode: boolean;
  hasDocumentation: boolean;
  license: string;
  views: number;
  likes: string[];
  purchases: number;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceListingSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  tags: [{ type: String }],
  images: [{ type: String }],
  sellerId: { type: String, required: true },
  sellerName: { type: String, required: true },
  sellerAvatar: { type: String },
  status: { 
    type: String, 
    enum: ['active', 'sold', 'inactive'], 
    default: 'active' 
  },
  projectType: { 
    type: String, 
    enum: ['full-stack', 'frontend', 'backend', 'mobile', 'other'],
    required: true
  },
  techStack: [{ type: String }],
  demoUrl: { type: String },
  repoUrl: { type: String },
  hasSourceCode: { type: Boolean, default: true },
  hasDocumentation: { type: Boolean, default: false },
  license: { type: String, default: 'MIT' },
  views: { type: Number, default: 0 },
  likes: [{ type: String }],
  purchases: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IMarketplaceListing>('MarketplaceListing', MarketplaceListingSchema);
