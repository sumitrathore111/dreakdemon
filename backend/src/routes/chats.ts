import { Router, Response } from 'express';
import Chat from '../models/Chat';
import ChatMessage from '../models/ChatMessage';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Create or get existing chat between participants
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { participantIds, participantNames, participantAvatars } = req.body;
    
    if (!participantIds || participantIds.length < 2) {
      res.status(400).json({ error: 'At least 2 participant IDs are required' });
      return;
    }
    
    // Sort participant IDs to ensure consistent lookup
    const sortedIds = [...participantIds].sort();
    
    // Check if chat already exists
    let chat = await Chat.findOne({
      participantIds: { $all: sortedIds, $size: sortedIds.length }
    });
    
    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        participantIds: sortedIds,
        participantNames: participantNames || [],
        participantAvatars: participantAvatars || []
      });
    }
    
    res.json({
      id: chat._id.toString(),
      participantIds: chat.participantIds,
      participantNames: chat.participantNames,
      participantAvatars: chat.participantAvatars,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt
    });
  } catch (error: any) {
    console.error('Error creating/getting chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all chats for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({
      participantIds: req.user?.id
    }).sort({ lastMessageAt: -1, updatedAt: -1 });
    
    // Transform to include other participant info
    const transformedChats = chats.map(chat => {
      const otherIndex = chat.participantIds.findIndex(id => id !== req.user?.id);
      const userIndex = chat.participantIds.findIndex(id => id === req.user?.id);
      
      return {
        id: chat._id.toString(),
        participantId: chat.participantIds[otherIndex] || chat.participantIds[0],
        participantName: chat.participantNames?.[otherIndex] || 'Unknown User',
        participantAvatar: chat.participantAvatars?.[otherIndex] || '',
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt
      };
    });
    
    res.json(transformedChats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a chat
router.get('/:chatId/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await ChatMessage.find({ 
      chatId: req.params.chatId 
    }).sort({ createdAt: 1 });
    
    // Mark messages as read
    await ChatMessage.updateMany(
      { 
        chatId: req.params.chatId, 
        senderId: { $ne: req.user?.id },
        isRead: false 
      },
      { isRead: true }
    );
    
    const transformedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderAvatar: msg.senderAvatar,
      message: msg.message,
      text: msg.message, // Alias for compatibility
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      timestamp: msg.createdAt
    }));
    
    res.json(transformedMessages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to a chat
router.post('/:chatId/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { senderId, message, senderName, senderAvatar } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    
    const chatMessage = await ChatMessage.create({
      chatId: req.params.chatId,
      senderId: senderId || req.user?.id,
      senderName: senderName || req.user?.name,
      senderAvatar: senderAvatar || '',
      message,
      isRead: false
    });
    
    // Update last message in chat
    await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMessage: message,
      lastMessageAt: new Date()
    });
    
    res.status(201).json({
      id: chatMessage._id.toString(),
      senderId: chatMessage.senderId,
      senderName: chatMessage.senderName,
      message: chatMessage.message,
      text: chatMessage.message,
      createdAt: chatMessage.createdAt,
      timestamp: chatMessage.createdAt
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat by ID
router.get('/:chatId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }
    
    res.json({
      id: chat._id.toString(),
      participantIds: chat.participantIds,
      participantNames: chat.participantNames,
      participantAvatars: chat.participantAvatars,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
