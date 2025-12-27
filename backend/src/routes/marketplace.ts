import { Response, Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import MarketplaceChat from '../models/MarketplaceChat';
import MarketplaceListing from '../models/MarketplaceListing';
import MarketplaceMessage from '../models/MarketplaceMessage';
import MarketplacePurchase from '../models/MarketplacePurchase';
import MarketplaceReview from '../models/MarketplaceReview';

const router = Router();

// Get all listings (published only for public, all statuses for authenticated users)
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search, minPrice, maxPrice, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    
    // Only show published listings
    let query: any = { status: 'published' };
    
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { techStack: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    
    const listings = await MarketplaceListing.find(query)
      .sort(sort as string)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await MarketplaceListing.countDocuments(query);
    
    res.json({ listings, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create listing
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingData = {
      ...req.body,
      sellerId: req.body.sellerId || req.user!.id,
      sellerName: req.body.sellerName || req.user!.name || 'Anonymous',
      sellerAvatar: req.body.sellerAvatar || '',
      status: 'pending_verification', // Always start as pending
      isFree: req.body.price === 0 || req.body.isFree === true,
      views: 0,
      purchases: 0,
      rating: 0,
      reviewCount: 0,
      likes: []
    };
    
    const listing = await MarketplaceListing.create(listingData);
    
    res.status(201).json({ listing });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ALL listings for admin panel (like /ideas endpoint - just requires auth, not admin role)
router.get('/all', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    
    let query: any = {};
    if (status && status !== 'all') query.status = status;
    
    const listings = await MarketplaceListing.find(query)
      .sort({ createdAt: -1 });
    
    // Transform to ensure proper format
    const projects = listings.map((listing: any) => {
      const obj = listing.toObject();
      return {
        ...obj,
        id: obj._id?.toString() || obj.id
      };
    });
    
    res.json({ projects, total: projects.length });
  } catch (error: any) {
    console.error('Error getting all marketplace listings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve marketplace listing (like ideas approval - auth only, no admin role check)
router.post('/approve/:listingId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await MarketplaceListing.findByIdAndUpdate(
      req.params.listingId,
      { 
        $set: { 
          status: 'published',
          rejectionReason: ''
        } 
      },
      { new: true }
    );
    
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    
    res.json({ 
      message: 'Project approved successfully',
      listing 
    });
  } catch (error: any) {
    console.error('Error approving listing:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject marketplace listing (like ideas rejection - auth only, no admin role check)
router.post('/reject/:listingId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    
    const listing = await MarketplaceListing.findByIdAndUpdate(
      req.params.listingId,
      { 
        $set: { 
          status: 'rejected',
          rejectionReason: reason || 'No reason provided'
        } 
      },
      { new: true }
    );
    
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    
    res.json({ 
      message: 'Project rejected',
      listing 
    });
  } catch (error: any) {
    console.error('Error rejecting listing:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's own listings (MUST be before /:id route)
router.get('/user/my-listings', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listings = await MarketplaceListing.find({ sellerId: req.user!.id }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller projects (public)
router.get('/seller/:sellerId/projects', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listings = await MarketplaceListing.find({ 
      sellerId: req.params.sellerId,
      status: 'published'
    }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller sales
router.get('/seller/:sellerId/sales', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sales = await MarketplacePurchase.find({ sellerId: req.params.sellerId }).sort({ purchasedAt: -1 });
    res.json({ sales });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user purchases
router.get('/user/:userId/purchases', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const purchases = await MarketplacePurchase.find({ buyerId: req.params.userId }).sort({ purchasedAt: -1 });
    res.json({ purchases });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user purchased a project
router.get('/projects/:projectId/purchased', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || req.user!.id;
    const purchase = await MarketplacePurchase.findOne({ 
      projectId: req.params.projectId, 
      buyerId: userId 
    });
    res.json({ purchased: !!purchase });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a purchase
router.post('/projects/:projectId/purchase', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await MarketplaceListing.findById(req.params.projectId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Check if already purchased
    const existingPurchase = await MarketplacePurchase.findOne({
      projectId: req.params.projectId,
      buyerId: req.body.buyerId || req.user!.id
    });

    if (existingPurchase) {
      res.status(400).json({ error: 'Already purchased' });
      return;
    }
    
    // Create purchase record
    const purchase = await MarketplacePurchase.create({
      projectId: listing._id.toString(),
      projectTitle: listing.title,
      projectImages: listing.images,
      buyerId: req.body.buyerId || req.user!.id,
      buyerName: req.body.buyerName || req.user!.name || 'User',
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      price: listing.price,
      purchasedAt: new Date(),
      status: 'completed',
      accessLinks: listing.links
    });

    // Increment purchase count
    listing.purchases += 1;
    await listing.save();
    
    res.json({ purchase });
  } catch (error: any) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ error: error.message });
  }
});

// Increment project views
router.post('/projects/:projectId/views', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await MarketplaceListing.findById(req.params.projectId);
    if (listing) {
      listing.views += 1;
      await listing.save();
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get project reviews
router.get('/projects/:projectId/reviews', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await MarketplaceReview.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a review
router.post('/projects/:projectId/reviews', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating, comment, buyerId, buyerName, buyerAvatar } = req.body;
    
    // Create review
    const review = await MarketplaceReview.create({
      projectId: req.params.projectId,
      buyerId: buyerId || req.user!.id,
      buyerName: buyerName || req.user!.name || 'User',
      buyerAvatar: buyerAvatar || '',
      rating,
      comment
    });

    // Update listing rating
    const reviews = await MarketplaceReview.find({ projectId: req.params.projectId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await MarketplaceListing.findByIdAndUpdate(req.params.projectId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length
    });

    res.json({ review });
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHAT ENDPOINTS ====================

// Get pending chat requests for a seller
router.get('/chats/pending', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || req.user!.id;
    console.log('Fetching pending requests for seller:', userId);
    
    const requests = await MarketplaceChat.find({ 
      sellerId: userId, 
      status: 'pending' 
    }).sort({ createdAt: -1 });
    
    console.log('Found pending requests:', requests.length);
    
    // Convert to JSON to ensure Maps are converted to objects
    const requestsJson = requests.map(r => r.toJSON());
    res.json({ requests: requestsJson });
  } catch (error: any) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get seller chats (all chats where user is the seller)
router.get('/chats/seller/:sellerId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await MarketplaceChat.find({ 
      sellerId: req.params.sellerId
    }).sort({ lastMessageTime: -1 });
    
    // Convert to JSON to ensure Maps are converted to objects
    const chatsJson = chats.map(c => c.toJSON());
    res.json({ chats: chatsJson });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user chats (accepted only)
router.get('/chats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || req.user!.id;
    const chats = await MarketplaceChat.find({ 
      participants: userId,
      status: 'accepted'
    }).sort({ lastMessageTime: -1 });
    
    // Convert to JSON to ensure Maps are converted to objects
    const chatsJson = chats.map(c => c.toJSON());
    res.json({ chats: chatsJson });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create or get chat
router.post('/chats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      requesterId, requesterName, requesterAvatar,
      sellerId, sellerName, sellerAvatar,
      projectId, projectTitle 
    } = req.body;

    // Check if chat already exists
    let chat = await MarketplaceChat.findOne({
      projectId,
      requesterId,
      sellerId
    });

    if (chat) {
      res.json({ 
        chatId: chat._id.toString(),
        status: chat.status,
        isNew: false
      });
      return;
    }

    // Create new chat request
    chat = await MarketplaceChat.create({
      participants: [requesterId, sellerId],
      participantNames: { [requesterId]: requesterName, [sellerId]: sellerName },
      participantAvatars: { [requesterId]: requesterAvatar || '', [sellerId]: sellerAvatar || '' },
      projectId,
      projectTitle,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: { [requesterId]: 0, [sellerId]: 0 },
      status: 'pending',
      requesterId,
      sellerId
    });

    res.json({ 
      chatId: chat._id.toString(),
      status: 'pending',
      isNew: true
    });
  } catch (error: any) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint (MUST be before /chats/:chatId)
router.get('/chats/debug', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || req.user!.id;
    
    // Get all chats for this user for debugging
    const allChats = await MarketplaceChat.find({
      $or: [
        { sellerId: userId },
        { requesterId: userId },
        { participants: userId }
      ]
    });
    
    const pendingAseller = await MarketplaceChat.find({ sellerId: userId, status: 'pending' });
    const acceptedChats = await MarketplaceChat.find({ participants: userId, status: 'accepted' });
    
    res.json({ 
      message: 'Marketplace chats debug endpoint',
      userId,
      allChatsCount: allChats.length,
      pendingAsSeller: pendingAseller.length,
      acceptedChats: acceptedChats.length,
      allChats,
      timestamp: new Date()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat by ID
router.get('/chats/:chatId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await MarketplaceChat.findById(req.params.chatId);
    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }
    res.json({ chat: chat.toJSON() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept chat request
router.post('/chats/:chatId/accept', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await MarketplaceChat.findByIdAndUpdate(
      req.params.chatId,
      { status: 'accepted' },
      { new: true }
    );
    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }
    res.json({ chat });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reject chat request
router.post('/chats/:chatId/reject', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await MarketplaceChat.findByIdAndUpdate(
      req.params.chatId,
      { status: 'rejected' },
      { new: true }
    );
    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }
    res.json({ chat });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a chat
router.get('/chats/:chatId/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await MarketplaceMessage.find({ chatId: req.params.chatId }).sort({ timestamp: 1 });
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/chats/:chatId/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { senderId, senderName, content, recipientId } = req.body;

    const message = await MarketplaceMessage.create({
      chatId: req.params.chatId,
      senderId: senderId || req.user!.id,
      senderName: senderName || req.user!.name || 'User',
      message: content,
      timestamp: new Date(),
      read: false
    });

    // Update chat's last message
    await MarketplaceChat.findByIdAndUpdate(req.params.chatId, {
      lastMessage: content,
      lastMessageTime: new Date(),
      $inc: { [`unreadCount.${recipientId}`]: 1 }
    });

    res.json({ message });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.post('/chats/:chatId/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.body.userId || req.user!.id;
    
    await MarketplaceMessage.updateMany(
      { chatId: req.params.chatId, senderId: { $ne: userId }, read: false },
      { read: true }
    );

    await MarketplaceChat.findByIdAndUpdate(req.params.chatId, {
      [`unreadCount.${userId}`]: 0
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete/archive chat
router.delete('/chats/:chatId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await MarketplaceChat.findByIdAndDelete(req.params.chatId);
    await MarketplaceMessage.deleteMany({ chatId: req.params.chatId });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== LISTING CRUD ====================

// Get listing by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    
    res.json({ listing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update listing
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    
    if (listing.sellerId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    // Update isFree based on price
    if (req.body.price !== undefined) {
      req.body.isFree = req.body.price === 0;
    }
    
    Object.assign(listing, req.body);
    await listing.save();
    
    res.json({ listing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete listing
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    
    if (listing.sellerId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Like/Unlike listing
router.post('/:id/like', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    
    const userId = req.user!.id;
    const likeIndex = listing.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      listing.likes.splice(likeIndex, 1);
    } else {
      listing.likes.push(userId);
    }
    
    await listing.save();
    res.json({ listing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
