import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyGroup extends Document {
  name: string;
  description: string;
  category: string;
  tags: string[];
  createdBy: string;
  members: Array<{
    userId: string;
    userName: string;
    userAvatar: string;
    role: 'admin' | 'member';
    joinedAt: Date;
  }>;
  maxMembers: number;
  isPrivate: boolean;
  avatar?: string;
  resources: Array<{
    title: string;
    url: string;
    type: string;
    uploadedBy: string;
    uploadedAt: Date;
  }>;
  schedule: Array<{
    title: string;
    description: string;
    date: Date;
    duration: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const StudyGroupSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  createdBy: { type: String, required: true },
  members: [{
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  maxMembers: { type: Number, default: 50 },
  isPrivate: { type: Boolean, default: false },
  avatar: { type: String },
  resources: [{
    title: { type: String },
    url: { type: String },
    type: { type: String },
    uploadedBy: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  schedule: [{
    title: { type: String },
    description: { type: String },
    date: { type: Date },
    duration: { type: Number }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IStudyGroup>('StudyGroup', StudyGroupSchema);
