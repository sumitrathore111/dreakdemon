import mongoose, { Schema, Document } from 'mongoose';

export interface IJoinRequest extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedBy?: mongoose.Types.ObjectId;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JoinRequestSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  respondedAt: { type: Date }
}, {
  timestamps: true
});

// Index for efficient queries
JoinRequestSchema.index({ projectId: 1, userId: 1 }, { unique: true });
JoinRequestSchema.index({ userId: 1 });
JoinRequestSchema.index({ status: 1 });

export default mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);
