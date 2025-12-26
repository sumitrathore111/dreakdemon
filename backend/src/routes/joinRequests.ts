import { Response, Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { authenticate, AuthRequest } from '../middleware/auth';
import JoinRequest from '../models/JoinRequest';
import Project from '../models/Project';

// Helper to get socket.io instance from app
const getIO = (req: AuthRequest): SocketIOServer | null => {
  return req.app.get('io') as SocketIOServer | null;
};

const router = Router();

// Get all join requests (for debugging or admin)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await JoinRequest.find()
      .populate('projectId', 'title')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Debug route - get all requests with full details
router.get('/debug', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await JoinRequest.find()
      .populate('projectId')
      .populate('userId')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a join request
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, message } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check if user is already a member
    const isMember = project.members.some(m => m.userId.toString() === req.user?.id);
    if (isMember) {
      res.status(400).json({ error: 'Already a member of this project' });
      return;
    }

    // Check if request already exists
    const existingRequest = await JoinRequest.findOne({
      projectId,
      userId: req.user?.id
    });

    if (existingRequest) {
      res.status(400).json({ 
        error: 'Join request already exists',
        status: existingRequest.status 
      });
      return;
    }

    // Get the user's name from database if not available in req.user
    let userName = req.user?.name || '';
    const userEmail = req.user?.email || '';
    
    if (!userName || userName.trim() === '') {
      const User = require('../models/User').default;
      const user = await User.findById(req.user?.id);
      if (user) {
        userName = user.name || userEmail.split('@')[0] || 'Unknown User';
      } else {
        userName = userEmail.split('@')[0] || 'Unknown User';
      }
    }

    // Create join request
    const request = await JoinRequest.create({
      projectId,
      userId: req.user?.id,
      userName,
      userEmail,
      message
    });

    res.status(201).json({ request });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's join requests
router.get('/user/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await JoinRequest.find({ userId: req.params.userId })
      .populate('projectId', 'title description status')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get join requests for a project (for project owner/admin)
// Only returns pending requests - approved/rejected are filtered out
router.get('/project/:projectId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await JoinRequest.find({ 
      projectId: req.params.projectId,
      status: 'pending'  // Only show pending requests
    })
      .populate('userId', 'name email skills')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Respond to join request (approve/reject)
router.put('/:requestId/respond', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected"' });
      return;
    }

    const request = await JoinRequest.findById(req.params.requestId);
    if (!request) {
      res.status(404).json({ error: 'Join request not found' });
      return;
    }

    // Check if user is project owner or admin
    const project = await Project.findById(request.projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const isOwner = project.owner.toString() === req.user?.id;
    const isAdmin = project.members.some(m => 
      m.userId.toString() === req.user?.id && m.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to respond to join requests' });
      return;
    }

    // Update request
    request.status = status;
    request.respondedBy = req.user?.id as any;
    request.respondedAt = new Date();
    await request.save();

    // If approved, add user to project
    if (status === 'approved') {
      // Check if user is already a member to prevent duplicates
      const isAlreadyMember = project.members.some(m => m.userId.toString() === request.userId.toString());
      
      if (!isAlreadyMember) {
        // Get the user's name from the database if not stored in request
        let userName = request.userName;
        let userEmail = request.userEmail;
        
        if (!userName || userName.trim() === '') {
          const User = require('../models/User').default;
          const user = await User.findById(request.userId);
          if (user) {
            userName = user.name || user.email?.split('@')[0] || 'Unknown User';
            userEmail = user.email || userEmail;
          } else {
            userName = userEmail?.split('@')[0] || 'Unknown User';
          }
        }
        
        project.members.push({
          userId: request.userId,
          name: userName,
          email: userEmail,
          role: 'member',
          joinedAt: new Date()
        });
        await project.save();
        
        // Emit real-time event for new member
        const io = getIO(req);
        if (io) {
          io.to(`project:${project._id}`).emit('member-joined', {
            userId: request.userId,
            userName,
            userEmail,
            role: 'member'
          });
        }
      }
    }

    // Emit real-time event for join request status change
    const io = getIO(req);
    if (io) {
      io.to(`project:${project._id}`).emit('join-request-updated', {
        requestId: req.params.requestId,
        status,
        userId: request.userId
      });
    }

    res.json({ request, project: status === 'approved' ? project : undefined });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fix join request project ID (for data correction)
router.put('/:requestId/fix', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;

    const request = await JoinRequest.findByIdAndUpdate(
      req.params.requestId,
      { projectId },
      { new: true }
    );

    if (!request) {
      res.status(404).json({ error: 'Join request not found' });
      return;
    }

    res.json({ request });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete join request
router.delete('/:requestId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const request = await JoinRequest.findById(req.params.requestId);
    if (!request) {
      res.status(404).json({ error: 'Join request not found' });
      return;
    }

    // Only allow deletion by the user who made the request
    if (request.userId.toString() !== req.user?.id) {
      res.status(403).json({ error: 'Not authorized to delete this request' });
      return;
    }

    await JoinRequest.findByIdAndDelete(req.params.requestId);
    res.json({ message: 'Join request deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
