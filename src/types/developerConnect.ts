// Developer Connect Hub Types

export interface DeveloperProfile {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  college: string;
  year: 'First' | 'Second' | 'Third' | 'Fourth' | 'Other';
  
  // CodeArena Stats
  codeArenaStats: {
    problemsSolved: number;
    rating: number;
    rank: number;
    battlesWon: number;
    totalCoins: number;
  };
  
  // Skills & Expertise
  skills: string[]; // ['React', 'Node.js', 'Python', etc]
  languages: string[]; // ['JavaScript', 'Python', 'Java', etc]
  
  // Projects
  projectsCompleted: number;
  projectsLeading: number;
  
  // Reputation
  endorsements: SkillEndorsement[];
  averageRating: number;
  reviewCount: number;
  
  // Collaboration Status
  lookingFor: 'Teammates' | 'Mentoring' | 'Both' | 'Not looking';
  lookingForDetails?: string; // e.g., "Backend developer for 6-week project"
  availability: 'Full-time' | 'Part-time' | 'Weekends only' | 'Flexible';
  
  // Social
  github?: string;
  linkedin?: string;
  twitter?: string;
  portfolio?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillEndorsement {
  id: string;
  endorserId: string;
  endorserName: string;
  endorserAvatar: string;
  skill: string;
  message?: string;
  timestamp: Date;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  
  content: string;
  type: 'text' | 'idea' | 'request';
  
  // If type === 'idea' or 'request'
  metadata?: {
    projectTitle?: string;
    skillsNeeded?: string[];
    duration?: string;
  };
  
  read: boolean;
  timestamp: Date;
}

export interface MessageThread {
  id: string;
  participantIds: [string, string]; // [userId1, userId2]
  participantNames: [string, string];
  participantAvatars: [string, string];
  
  lastMessage?: DirectMessage;
  messageCount: number;
  unreadCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  
  topic: string; // 'DSA Interview Prep', 'Web Dev Learning', etc
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  maxMembers: number;
  
  members: GroupMember[];
  
  // Scheduling
  sessionSchedule?: {
    day: string; // 'Monday', 'Tuesday', etc
    time: string; // '10:00 AM'
    duration: number; // minutes
  };
  
  // Resources
  resources: Resource[];
  
  // Activity
  messages: GroupMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  name: string;
  avatar: string;
  joinedAt: Date;
  role: 'creator' | 'member';
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'link' | 'document' | 'video' | 'article';
  addedBy: string;
  addedAt: Date;
}

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

export interface DeveloperSearch {
  keyword?: string;
  skills?: string[];
  college?: string;
  year?: string;
  lookingFor?: string;
  availability?: string;
  minRating?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'endorsement' | 'group_invite' | 'group_update';
  title: string;
  message: string;
  relatedUserId?: string;
  relatedGroupId?: string;
  read: boolean;
  timestamp: Date;
}

export interface UserConnection {
  id: string;
  userId: string;
  connectedUserId: string;
  connectedUserName: string;
  connectedUserAvatar: string;
  status: 'requested' | 'connected' | 'blocked';
  connectedAt?: Date;
  requestedAt?: Date;
}
