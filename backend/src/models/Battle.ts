import mongoose, { Schema, Document } from 'mongoose';

export interface IBattle extends Document {
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  difficulty: 'easy' | 'medium' | 'hard';
  entryFee: number;
  prize: number;
  timeLimit: number;
  maxParticipants: number;
  participants: Array<{
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    hasSubmitted: boolean;
    score?: number;
    submissionTime?: Date;
    code?: string;
  }>;
  challenge: {
    id: string;
    title: string;
    difficulty: string;
    category: string;
    coinReward: number;
    description: string;
    testCases: any[];
    test_cases: any[];
  };
  winner?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

const BattleSchema: Schema = new Schema({
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'completed', 'cancelled'], 
    default: 'waiting' 
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    required: true 
  },
  entryFee: { type: Number, required: true },
  prize: { type: Number, required: true },
  timeLimit: { type: Number, required: true },
  maxParticipants: { type: Number, default: 2 },
  participants: [{
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, default: 1000 },
    hasSubmitted: { type: Boolean, default: false },
    score: { type: Number },
    submissionTime: { type: Date },
    code: { type: String }
  }],
  challenge: {
    id: { type: String, required: true },
    title: { type: String, required: true },
    difficulty: { type: String },
    category: { type: String },
    coinReward: { type: Number },
    description: { type: String },
    testCases: [{ type: Schema.Types.Mixed }],
    test_cases: [{ type: Schema.Types.Mixed }]
  },
  winner: { type: String },
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdBy: { type: String, required: true },
  version: { type: String, default: 'v2.0' }
}, {
  timestamps: true
});

export default mongoose.model<IBattle>('Battle', BattleSchema);
