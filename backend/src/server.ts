import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { connectDatabase } from './config/database';

// Import routes
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import battleRoutes from './routes/battles';
import challengeRoutes from './routes/challenges';
import chatRoutes from './routes/chats';
import developerRoutes from './routes/developers';
import ideaRoutes from './routes/ideas';
import joinRequestRoutes from './routes/joinRequests';
import leaderboardRoutes from './routes/leaderboard';
import marketplaceRoutes from './routes/marketplace';
import messageRoutes from './routes/messages';
import projectRoutes from './routes/projects';
import studyGroupRoutes from './routes/studyGroups';
import uploadRoutes from './routes/upload';
import userRoutes from './routes/users';
import walletRoutes from './routes/wallet';

// Load environment variables
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io setup for real-time updates
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      'https://skillupx.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  // Join a project room for real-time updates
  socket.on('join-project', (projectId: string) => {
    socket.join(`project:${projectId}`);
    console.log(`👤 Socket ${socket.id} joined project:${projectId}`);
  });
  
  // Leave a project room
  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project:${projectId}`);
    console.log(`👤 Socket ${socket.id} left project:${projectId}`);
  });

  // Join user's personal room for notifications
  socket.on('join-user', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`👤 Socket ${socket.id} joined user room: user:${userId}`);
  });

  // Leave user's personal room
  socket.on('leave-user', (userId: string) => {
    socket.leave(`user:${userId}`);
    console.log(`👤 Socket ${socket.id} left user room: user:${userId}`);
  });

  // Join a chat room for real-time messaging
  socket.on('join-chat', (chatId: string) => {
    socket.join(`chat:${chatId}`);
    console.log(`💬 Socket ${socket.id} joined chat:${chatId}`);
  });

  // Leave a chat room
  socket.on('leave-chat', (chatId: string) => {
    socket.leave(`chat:${chatId}`);
    console.log(`💬 Socket ${socket.id} left chat:${chatId}`);
  });

  // Join a group room for real-time group messaging
  socket.on('join-group', (groupId: string) => {
    socket.join(`group:${groupId}`);
    console.log(`👥 Socket ${socket.id} joined group:${groupId}`);
  });

  // Leave a group room
  socket.on('leave-group', (groupId: string) => {
    socket.leave(`group:${groupId}`);
    console.log(`👥 Socket ${socket.id} left group:${groupId}`);
  });

  // Join user's personal room for notifications
  socket.on('join-user', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`👤 Socket ${socket.id} joined user:${userId}`);
  });

  // Leave user's personal room
  socket.on('leave-user', (userId: string) => {
    socket.leave(`user:${userId}`);
    console.log(`👤 Socket ${socket.id} left user:${userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://skillupx.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to database
connectDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔌 Socket.io enabled for real-time updates`);
});

export { io };
export default app;
