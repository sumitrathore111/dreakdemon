import { Response, Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import GroupMessage from '../models/GroupMessage';
import StudyGroup from '../models/StudyGroup';

const router = Router();

// Helper function to transform group for response
const transformGroup = (group: any) => ({
  id: group._id.toString(),
  name: group.name,
  description: group.description,
  category: group.category,
  topic: group.topic,
  level: group.level,
  tags: group.tags,
  createdBy: group.createdBy,
  creatorId: group.createdBy,
  creatorName: group.creatorName || group.members?.[0]?.userName || 'Unknown',
  creatorAvatar: group.creatorAvatar || group.members?.[0]?.userAvatar || '',
  members: group.members?.map((m: any) => ({
    userId: m.userId,
    name: m.userName,
    avatar: m.userAvatar,
    role: m.role,
    joinedAt: m.joinedAt
  })) || [],
  maxMembers: group.maxMembers,
  isPrivate: group.isPrivate,
  avatar: group.avatar,
  resources: group.resources,
  schedule: group.schedule,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt
});

// Get all study groups
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    
    let query: any = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
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
    }).sort({ createdAt: -1 });
    
    const transformedGroups = groups.map(transformGroup);
    
    res.json({ groups: transformedGroups });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create study group
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, topic, level, maxMembers, creatorName, creatorAvatar } = req.body;
    
    const group = await StudyGroup.create({
      name,
      description,
      category: topic, // Use topic as category
      topic,
      level: level || 'Beginner',
      maxMembers: maxMembers || 10,
      createdBy: req.user!.id,
      creatorName: creatorName || req.user!.name,
      creatorAvatar: creatorAvatar || '',
      members: [{
        userId: req.user!.id,
        userName: creatorName || req.user!.name,
        userAvatar: creatorAvatar || '',
        role: 'admin',
        joinedAt: new Date()
      }]
    });
    
    res.status(201).json({ group: transformGroup(group) });
  } catch (error: any) {
    console.error('Error creating study group:', error);
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
    
    res.json({ group: transformGroup(group) });
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
      userName: userName || req.user!.name,
      userAvatar: userAvatar || '',
      role: 'member',
      joinedAt: new Date()
    });
    
    await group.save();
    res.json({ group: transformGroup(group) });
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
    res.json({ group: transformGroup(group) });
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
    res.json({ group: transformGroup(group) });
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

// Get group messages
router.get('/:id/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Check if user is a member
    if (!group.members.some(m => m.userId === req.user!.id)) {
      res.status(403).json({ error: 'Only members can view messages' });
      return;
    }
    
    const messages = await GroupMessage.find({ groupId: req.params.id })
      .sort({ createdAt: 1 })
      .limit(100);
    
    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      groupId: msg.groupId,
      senderId: msg.senderId,
      name: msg.senderName,
      avatar: msg.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderName?.replace(/\s+/g, '') || 'User'}`,
      message: msg.message,
      timestamp: msg.createdAt
    }));
    
    res.json({ messages: formattedMessages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to group
router.post('/:id/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, senderName, senderAvatar } = req.body;
    
    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }
    
    // Check if user is a member
    if (!group.members.some(m => m.userId === req.user!.id)) {
      res.status(403).json({ error: 'Only members can send messages' });
      return;
    }
    
    const newMessage = await GroupMessage.create({
      groupId: req.params.id,
      senderId: req.user!.id,
      senderName: senderName || req.user!.name || 'User',
      senderAvatar: senderAvatar || '',
      message: message.trim()
    });
    
    const formattedMessage = {
      id: newMessage._id.toString(),
      groupId: newMessage.groupId,
      senderId: newMessage.senderId,
      name: newMessage.senderName,
      avatar: newMessage.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMessage.senderName?.replace(/\s+/g, '') || 'User'}`,
      message: newMessage.message,
      timestamp: newMessage.createdAt
    };
    
    res.status(201).json({ message: formattedMessage });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
