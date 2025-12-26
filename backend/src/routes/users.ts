import { Router, Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';
import { authenticate, AuthRequest } from '../middleware/auth';
import { updateProfileValidation } from '../middleware/validation';

const router = Router();

// Get user's completed tasks count (MUST be before /:userId route)
router.get('/:userId/completed-tasks', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await Task.countDocuments({
      completedBy: req.params.userId,
      status: 'completed'
    });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's join requests (MUST be before /:userId route)
router.get('/:userId/join-requests', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Import JoinRequest model dynamically to avoid circular dependency
    const JoinRequest = require('../models/JoinRequest').default;
    const requests = await JoinRequest.find({ userId: req.params.userId })
      .populate('projectId', 'title description status')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile by ID
router.get('/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:userId', authenticate, updateProfileValidation, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is updating their own profile
    if (req.user?.id !== req.params.userId && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to update this profile' });
      return;
    }
    
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only or limited info)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    
    let query: any = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const users = await User.find(query)
      .select('name email institute skills profileCompletion')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
