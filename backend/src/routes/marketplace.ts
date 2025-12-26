import { Router, Response } from 'express';
import MarketplaceListing from '../models/MarketplaceListing';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all listings
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search, minPrice, maxPrice, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    
    let query: any = { status: 'active' };
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
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
    const listing = await MarketplaceListing.create({
      ...req.body,
      sellerId: req.user!.id
    });
    
    res.status(201).json({ listing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's listings (MUST be before /:id route)
router.get('/user/my-listings', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listings = await MarketplaceListing.find({ sellerId: req.user!.id }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending chat requests (MUST be before /chats and /:id route)
router.get('/chats/pending', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || req.user!.id;
    // Return empty pending requests for now
    res.json({ requests: [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user chats (MUST be before /:id route)
router.get('/chats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || req.user!.id;
    // Return empty chats for now - can be enhanced with a Chat model
    res.json({ chats: [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller projects
router.get('/seller/:sellerId/projects', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listings = await MarketplaceListing.find({ 
      sellerId: req.params.sellerId,
      status: 'active'
    }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get listing by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    
    // Increment views
    listing.views += 1;
    await listing.save();
    
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
    
    if (listing.sellerId !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
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

// Marketplace Chat endpoints
// Create or get a chat for a listing
router.post('/chats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId, sellerId, buyerId } = req.body;
    
    // Create a unique chat ID based on listing and users
    const chatId = `marketplace_${listingId}_${[sellerId, buyerId].sort().join('_')}`;
    
    res.json({ 
      chatId,
      listingId,
      participants: [sellerId, buyerId],
      createdAt: new Date()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get marketplace chats debug info
router.get('/chats/debug', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ 
      message: 'Marketplace chats debug endpoint',
      userId: req.user!.id,
      timestamp: new Date()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller sales
router.get('/seller/:sellerId/sales', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // For now return mock data - can be enhanced with actual purchase tracking
    const listings = await MarketplaceListing.find({ sellerId: req.params.sellerId });
    const totalSales = listings.reduce((sum, l) => sum + l.purchases, 0);
    const totalRevenue = listings.reduce((sum, l) => sum + (l.price * l.purchases), 0);
    
    res.json({ 
      sales: {
        totalSales,
        totalRevenue,
        listings: listings.map(l => ({
          listingId: l._id,
          title: l.title,
          purchases: l.purchases,
          revenue: l.price * l.purchases
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user purchases
router.get('/user/:userId/purchases', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // For now return empty array - can be enhanced with purchase model
    res.json({ purchases: [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user purchased a project
router.get('/projects/:projectId/purchased', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // For now return false - can be enhanced with purchase model
    res.json({ purchased: false });
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
    
    // Increment purchase count
    listing.purchases += 1;
    await listing.save();
    
    res.json({ 
      purchase: {
        listingId: listing._id,
        buyerId: req.user!.id,
        price: listing.price,
        purchasedAt: new Date()
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get project reviews
router.get('/projects/:projectId/reviews', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // For now return empty array - can be enhanced with review model
    res.json({ reviews: [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a review
router.post('/projects/:projectId/reviews', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    
    // For now return mock review - can be enhanced with review model
    res.json({ 
      review: {
        id: Date.now().toString(),
        projectId: req.params.projectId,
        userId: req.user!.id,
        rating,
        comment,
        createdAt: new Date()
      }
    });
  } catch (error: any) {
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

export default router;
