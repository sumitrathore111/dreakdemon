import { Router, Response } from 'express';
import Challenge from '../models/Challenge';
import UserProgress from '../models/UserProgress';
import { authenticate, AuthRequest, adminOnly } from '../middleware/auth';

const router = Router();

// Get all challenges (with filters)
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { difficulty, category, search, limit = 50, page = 1 } = req.query;
    
    let query: any = {};
    
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    const challenges = await Challenge.find(query)
      .sort({ difficulty: 1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Challenge.countDocuments(query);
    
    res.json({ 
      challenges, 
      total, 
      page: Number(page), 
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SPECIFIC ROUTES MUST BE BEFORE /:challengeId =====

// Get user submissions
router.get('/submissions/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Get user progress which contains solved challenges
    const progress = await UserProgress.findOne({ userId });
    
    if (!progress) {
      res.json({ submissions: [] });
      return;
    }
    
    // Transform solved challenges into submissions format
    const submissions = progress.solvedChallenges.map((solved: any) => ({
      challengeId: solved.challengeId,
      status: 'Accepted',
      submittedAt: solved.solvedAt,
      points: solved.points
    }));
    
    res.json({ submissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user progress (solved challenges)
router.get('/progress/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    let progress = await UserProgress.findOne({ userId });
    
    // If no progress exists, create an empty one
    if (!progress) {
      progress = new UserProgress({
        userId,
        solvedChallenges: [],
        totalPoints: 0
      });
      await progress.save();
    }
    
    res.json({ progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get random challenge by difficulty
router.get('/random/:difficulty', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { difficulty } = req.params;
    
    const challenges = await Challenge.aggregate([
      { $match: { difficulty } },
      { $sample: { size: 1 } }
    ]);
    
    if (challenges.length === 0) {
      res.status(404).json({ error: 'No challenges found for this difficulty' });
      return;
    }
    
    res.json({ challenge: challenges[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get challenge categories
router.get('/meta/categories', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Challenge.distinct('category');
    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== GENERIC /:challengeId ROUTE - MUST BE AFTER SPECIFIC ROUTES =====

// Get challenge by ID
router.get('/:challengeId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }
    
    res.json({ challenge });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create challenge (admin only)
router.post('/', authenticate, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challengeData = req.body;
    
    if (!challengeData.title || !challengeData.description || !challengeData.difficulty) {
      res.status(400).json({ error: 'Title, description, and difficulty are required' });
      return;
    }
    
    const challenge = new Challenge(challengeData);
    await challenge.save();
    
    res.status(201).json({ 
      message: 'Challenge created successfully',
      challenge 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update challenge (admin only)
router.put('/:challengeId', authenticate, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.challengeId,
      { $set: req.body },
      { new: true }
    );
    
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }
    
    res.json({ 
      message: 'Challenge updated successfully',
      challenge 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete challenge (admin only)
router.delete('/:challengeId', authenticate, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.challengeId);
    
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }
    
    res.json({ message: 'Challenge deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk create challenges (admin only) - for seeding
router.post('/bulk', authenticate, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { challenges } = req.body;
    
    if (!challenges || !Array.isArray(challenges)) {
      res.status(400).json({ error: 'Challenges array is required' });
      return;
    }
    
    const result = await Challenge.insertMany(challenges);
    
    res.status(201).json({ 
      message: `${result.length} challenges created successfully`,
      count: result.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark challenge as solved
router.post('/progress/:userId/solve', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { challengeId, language, executionTime } = req.body;
    
    // Get challenge points
    const challenge = await Challenge.findById(challengeId);
    const points = challenge ? (challenge.difficulty === 'Easy' ? 10 : challenge.difficulty === 'Medium' ? 20 : 30) : 10;
    
    let progress = await UserProgress.findOne({ userId });
    
    if (!progress) {
      progress = new UserProgress({
        userId,
        solvedChallenges: [],
        totalPoints: 0
      });
    }
    
    // Check if already solved
    const alreadySolved = progress.solvedChallenges.some(
      (sc) => sc.challengeId.toString() === challengeId
    );
    
    if (!alreadySolved) {
      progress.solvedChallenges.push({
        challengeId,
        solvedAt: new Date(),
        language,
        executionTime
      });
      progress.totalPoints += points;
      await progress.save();
    }
    
    res.json({ progress, pointsEarned: alreadySolved ? 0 : points });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Seed battle challenges (admin only)
router.post('/seed-battles', authenticate, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { challenges } = req.body;
    
    if (!challenges || !Array.isArray(challenges)) {
      res.status(400).json({ error: 'Challenges array is required' });
      return;
    }
    
    // Add battle-specific flags to challenges
    const battleChallenges = challenges.map((c: any) => ({
      ...c,
      isBattleChallenge: true
    }));
    
    const result = await Challenge.insertMany(battleChallenges);
    
    res.status(201).json({ 
      message: `${result.length} battle challenges seeded successfully`,
      count: result.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
