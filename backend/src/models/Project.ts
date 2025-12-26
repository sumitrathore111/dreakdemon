import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectMember {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface IProjectFile {
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

export interface IProjectIssue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;  // Store as string (username) like Firebase
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Completion/Verification fields
  completedBy?: string;
  completedByName?: string;
  completedAt?: Date;
  pendingVerification?: boolean;
  verified?: boolean;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: Date;
  verificationFeedback?: string;
}

export interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  visibility: 'public' | 'private';
  owner: mongoose.Types.ObjectId;
  members: IProjectMember[];
  techStack: string[];
  tags: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  files: IProjectFile[];
  issues: IProjectIssue[];
  ideaId?: mongoose.Types.ObjectId;
  maxMembers: number;
  startDate?: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
});

const ProjectFileSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
});

const ProjectIssueSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  assignedTo: { type: String },  // Store as string (username) like Firebase
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Completion/Verification fields
  completedBy: { type: String },
  completedByName: { type: String },
  completedAt: { type: Date },
  pendingVerification: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  verifiedBy: { type: String },
  verifiedByName: { type: String },
  verifiedAt: { type: Date },
  verificationFeedback: { type: String }
});

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['planning', 'active', 'paused', 'completed', 'archived'],
    default: 'planning'
  },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [ProjectMemberSchema],
  techStack: [{ type: String }],
  tags: [{ type: String }],
  repositoryUrl: { type: String },
  liveUrl: { type: String },
  files: [ProjectFileSchema],
  issues: [ProjectIssueSchema],
  ideaId: { type: Schema.Types.ObjectId, ref: 'Idea' },
  maxMembers: { type: Number, default: 5 },
  startDate: { type: Date },
  expectedEndDate: { type: Date },
  actualEndDate: { type: Date }
}, {
  timestamps: true
});

// Indexes
ProjectSchema.index({ owner: 1, status: 1 });
ProjectSchema.index({ 'members.userId': 1 });
ProjectSchema.index({ visibility: 1, status: 1 });
ProjectSchema.index({ category: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
