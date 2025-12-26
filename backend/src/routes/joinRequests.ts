import { Router, Response } from 'express';
import JoinRequest from '../models/JoinRequest';
import Project from '../models/Project';
import { authenticate, AuthRequest } from '../middleware/auth';

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

    // Create join request
    const request = await JoinRequest.create({
      projectId,
      userId: req.user?.id,
      userName: req.user?.name || '',
      userEmail: req.user?.email || '',
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
router.get('/project/:projectId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await JoinRequest.find({ projectId: req.params.projectId })
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
      project.members.push({
        userId: request.userId,
        name: request.userName,
        email: request.userEmail,
        role: 'member',
        joinedAt: new Date()
      });
      await project.save();
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
