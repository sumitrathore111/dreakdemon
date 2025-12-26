import { Router, Response } from 'express';
import Message from '../models/Message';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Send message
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const message = await Message.create({
      senderId: req.user!.id,
      ...req.body
    });
    
    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user!.id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user!.id }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.user!.id, isRead: false },
      { isRead: true }
    );
    
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get group messages
router.get('/group/:groupId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await Message.find({ groupId: req.params.groupId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's conversations list
router.get('/conversations', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user!.id },
            { receiverId: req.user!.id }
          ],
          groupId: { $exists: false }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', req.user!.id] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$receiverId', req.user!.id] },
                  { $eq: ['$isRead', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    res.json({ conversations: messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create or get developer chat between two users
router.post('/developer-chat', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user1Id, user2Id } = req.body;
    
    // Check if chat already exists between these users
    const existingMessage = await Message.findOne({
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id }
      ]
    });
    
    // Return a chat ID based on the two user IDs (sorted for consistency)
    const chatId = [user1Id, user2Id].sort().join('_');
    
    res.json({ chatId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages by chat ID (for developer chat)
router.get('/chat/:chatId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const [user1Id, user2Id] = chatId.split('_');
    
    const messages = await Message.find({
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id }
      ]
    }).sort({ createdAt: 1 });
    
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversations with messages for a user
router.get('/conversations-with-messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.user!.id;
    
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: targetUserId },
            { receiverId: targetUserId }
          ],
          groupId: { $exists: false }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', targetUserId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          messages: { $push: '$$ROOT' }
        }
      }
    ]);
    
    res.json({ conversations: messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
