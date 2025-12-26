import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  location: string;
  institute: string;
  bio: string;
  portfolio: string;
  resume_objective: string;
  skills: string[];
  languages: string[];
  achievements: string[];
  target_company: string[];
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    year: string;
    desc: string;
  }>;
  links: Array<{
    platform: string;
    url: string;
  }>;
  projects: Array<{
    project_id: string;
    role: string;
    project_status: 'Complete' | 'Running' | 'Not Started';
  }>;
  yearOfStudy: number;
  profileCompletion: number;
  isProfileComplete: boolean;
  role: 'student' | 'admin';
  marathon_score: number;
  marathon_rank: number;
  streakCount: number;
  challenges_solved: number;
  last_active_date: Date;
  githubUsername: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, default: '9999999999' },
  location: { type: String, default: 'Location' },
  institute: { type: String, default: 'University Name' },
  bio: { type: String, default: 'About yourself' },
  portfolio: { type: String, default: '' },
  resume_objective: { type: String, default: '' },
  skills: [{ type: String }],
  languages: [{ type: String }],
  achievements: [{ type: String }],
  target_company: [{ type: String }],
  education: [{
    degree: { type: String },
    school: { type: String },
    year: { type: String }
  }],
  experience: [{
    title: { type: String },
    company: { type: String },
    year: { type: String },
    desc: { type: String }
  }],
  links: [{
    platform: { type: String },
    url: { type: String }
  }],
  projects: [{
    project_id: { type: String },
    role: { type: String },
    project_status: { type: String, enum: ['Complete', 'Running', 'Not Started'] }
  }],
  yearOfStudy: { type: Number, default: 0 },
  profileCompletion: { type: Number, default: 0 },
  isProfileComplete: { type: Boolean, default: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  marathon_score: { type: Number, default: 0 },
  marathon_rank: { type: Number, default: 0 },
  streakCount: { type: Number, default: 0 },
  challenges_solved: { type: Number, default: 0 },
  last_active_date: { type: Date },
  githubUsername: { type: String, default: '' },
  avatar: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
