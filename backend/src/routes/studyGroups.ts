import { Router, Response } from 'express';
import StudyGroup from '../models/StudyGroup';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all study groups
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    
    let query: any = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Only show public groups or groups user is a member of
    const groups = await StudyGroup.find({
      $and: [
        query,
        {
          $or: [
            { isPrivate: false },
            { 'members.userId': req.user!.id }
          ]
        }
      ]
    });
    
    res.json({ groups });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create study group
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.create({
      ...req.body,
      createdBy: req.user!.id,
      members: [{
        userId: req.user!.id,
        userName: req.body.creatorName,
        userAvatar: req.body.creatorAvatar,
        role: 'admin',
        joinedAt: new Date()
      }]
    });
    
    res.status(201).json({ group });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get group by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Check access for private groups
    if (group.isPrivate && !group.members.some(m => m.userId === req.user!.id)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    res.json({ group });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Join group
router.post('/:id/join', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userName, userAvatar } = req.body;
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    if (group.members.some(m => m.userId === req.user!.id)) {
      res.status(400).json({ error: 'Already a member' });
      return;
    }
    
    if (group.members.length >= group.maxMembers) {
      res.status(400).json({ error: 'Group is full' });
      return;
    }
    
    group.members.push({
      userId: req.user!.id,
      userName,
      userAvatar,
      role: 'member',
      joinedAt: new Date()
    });
    
    await group.save();
    res.json({ group });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Leave group
router.post('/:id/leave', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    group.members = group.members.filter(m => m.userId !== req.user!.id);
    
    // Delete group if no members left
    if (group.members.length === 0) {
      await group.deleteOne();
      res.json({ message: 'Group deleted' });
      return;
    }
    
    await group.save();
    res.json({ group });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add resource
router.post('/:id/resources', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    if (!group.members.some(m => m.userId === req.user!.id)) {
      res.status(403).json({ error: 'Not a member' });
      return;
    }
    
    group.resources.push({
      ...req.body,
      uploadedBy: req.user!.id,
      uploadedAt: new Date()
    });
    
    await group.save();
    res.json({ group });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete study group (admin only)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Check if user is the creator or an admin
    const member = group.members.find(m => m.userId === req.user!.id);
    if (!member || (member.role !== 'admin' && group.createdBy !== req.user!.id)) {
      res.status(403).json({ error: 'Only group admins can delete the group' });
      return;
    }
    
    await group.deleteOne();
    res.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
