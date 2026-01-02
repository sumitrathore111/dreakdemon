import axios from 'axios';
import { Response, Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Battle from '../models/Battle';

const router = Router();

// Get list of battles (with optional filters)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, difficulty } = req.query;
    
    // Clean up stale waiting battles (older than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await Battle.deleteMany({
      status: 'waiting',
      createdAt: { $lt: fiveMinutesAgo }
    });
    
    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;
    
    // If filtering for waiting battles, only show fresh ones
    if (status === 'waiting') {
      query.createdAt = { $gte: fiveMinutesAgo };
    }
    
    const battles = await Battle.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Transform to frontend expected format - filter out battles without proper creator names
    const formattedBattles = battles
      .filter(battle => {
        const creator = battle.participants[0];
        // Only include battles where creator has a proper name
        return creator?.userName && creator.userName.trim() !== '';
      })
      .map(battle => {
      const creator = battle.participants[0];
      return {
        id: battle._id,
        creatorId: creator?.userId || battle.createdBy,
        creatorName: creator?.userName,
        creatorProfilePic: creator?.userAvatar,
        creatorRating: creator?.rating || 1000,
        difficulty: battle.difficulty,
        entryFee: battle.entryFee,
        prize: battle.prize,
        timeLimit: battle.timeLimit,
        status: battle.status,
        // Include all participants for live battles display
        participants: battle.participants.map((p: any) => ({
          odId: p.userId,
          odName: p.userName,
          odProfilePic: p.userAvatar,
          userId: p.userId,
          userName: p.userName,
          userAvatar: p.userAvatar,
          rating: p.rating || 1000,
          hasSubmitted: p.hasSubmitted || false
        })),
        challenge: battle.challenge ? {
          id: battle.challenge.id,
          title: battle.challenge.title,
          difficulty: battle.challenge.difficulty,
          category: battle.challenge.category
        } : null,
        createdAt: battle.createdAt
      };
    });
    
    res.json({ battles: formattedBattles });
  } catch (error: any) {
    console.error('Error fetching battles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new battle
router.post('/create', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { difficulty, entryFee, userName, userAvatar, rating } = req.body;
    const userId = req.user!.id;
    
    // Check if user has enough coins
    const Wallet = require('../models/Wallet').default;
    const mongoose = require('mongoose');
    const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!wallet || wallet.coins < entryFee) {
      res.status(400).json({ error: 'Insufficient coins to create battle' });
      return;
    }
    
    // Cancel any existing waiting battles from this user (prevent duplicates)
    await Battle.deleteMany({
      'participants.userId': userId,
      status: 'waiting'
    });
    
    // Also clean up stale battles (older than 5 minutes and still waiting)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await Battle.deleteMany({
      status: 'waiting',
      createdAt: { $lt: fiveMinutesAgo }
    });
    
    // Deduct entry fee from creator
    await Wallet.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        $inc: { coins: -entryFee },
        $push: {
          transactions: {
            type: 'debit',
            amount: entryFee,
            reason: `Battle entry fee (${difficulty})`,
            createdAt: new Date()
          }
        }
      }
    );
    console.log(`Entry fee of ${entryFee} coins deducted from player ${userId} (creating)`);
    
    // Get random question (you'll need to load questions.json)
    const fs = await import('fs/promises');
    const path = await import('path');
    const questionsPath = path.join(__dirname, '../../../public/questions.json');
    const questionsData = await fs.readFile(questionsPath, 'utf-8');
    const questionsJson = JSON.parse(questionsData);
    
    // Handle both array format and object with problems/questions property
    let questions: any[] = [];
    if (Array.isArray(questionsJson)) {
      questions = questionsJson;
    } else if (questionsJson.problems) {
      questions = questionsJson.problems;
    } else if (questionsJson.questions) {
      questions = questionsJson.questions;
    }
    
    const difficultyQuestions = questions.filter((q: any) => 
      q.difficulty && q.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
    if (difficultyQuestions.length === 0) {
      res.status(400).json({ error: `No ${difficulty} questions available` });
      return;
    }
    
    const randomQuestion = difficultyQuestions[Math.floor(Math.random() * difficultyQuestions.length)];
    
    console.log('Selected question:', randomQuestion.id, randomQuestion.title);
    console.log('Question testCases:', randomQuestion.testCases?.length || 0);
    console.log('Question test_cases:', randomQuestion.test_cases?.length || 0);
    
    const prize = Math.floor(entryFee * 2 * 0.9);
    const timeLimit = difficulty === 'easy' ? 900 : difficulty === 'medium' ? 1200 : 1800;
    
    // Ensure testCases are properly included in the challenge object
    const challengeData = {
      id: randomQuestion.id,
      title: randomQuestion.title,
      difficulty: randomQuestion.difficulty,
      category: randomQuestion.category || randomQuestion.tags?.[0] || 'general',
      coinReward: randomQuestion.coins || randomQuestion.coinReward || 10,
      description: randomQuestion.description,
      testCases: randomQuestion.testCases || randomQuestion.test_cases || [],
      test_cases: randomQuestion.test_cases || randomQuestion.testCases || []
    };
    
    console.log('Challenge testCases being saved:', challengeData.testCases.length);
    
    const battle = await Battle.create({
      status: 'waiting',
      difficulty,
      entryFee,
      prize,
      timeLimit,
      maxParticipants: 2,
      participants: [{
        userId,
        userName,
        userAvatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        rating: rating || 1000,
        hasSubmitted: false
      }],
      challenge: challengeData,
      createdBy: userId,
      version: 'v2.0-custom'
    });
    
    res.status(201).json({ battleId: battle._id, battle });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Find available battle
router.get('/find', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { difficulty, entryFee } = req.query;
    
    // Only find battles created within the last 5 minutes (not stale)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const battle = await Battle.findOne({
      status: 'waiting',
      difficulty,
      entryFee: Number(entryFee),
      'participants.userId': { $ne: req.user!.id },
      createdAt: { $gte: fiveMinutesAgo } // Only fresh battles
    }).sort({ createdAt: 1 }); // Oldest first (FIFO)
    
    res.json({ battle });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Join battle
router.post('/:battleId/join', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userName, userAvatar, rating } = req.body;
    const userId = req.user!.id;
    
    const battle = await Battle.findById(req.params.battleId);
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }
    
    if (battle.status !== 'waiting') {
      res.status(400).json({ error: 'Battle is not available' });
      return;
    }
    
    if (battle.participants.length >= battle.maxParticipants) {
      res.status(400).json({ error: 'Battle is full' });
      return;
    }
    
    // Check if user has enough coins and deduct entry fee
    const Wallet = require('../models/Wallet').default;
    const mongoose = require('mongoose');
    const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!wallet || wallet.coins < battle.entryFee) {
      res.status(400).json({ error: 'Insufficient coins to join battle' });
      return;
    }
    
    // Deduct entry fee from joining player
    await Wallet.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        $inc: { coins: -battle.entryFee },
        $push: {
          transactions: {
            type: 'debit',
            amount: battle.entryFee,
            reason: `Battle entry fee (${battle.difficulty})`,
            createdAt: new Date()
          }
        }
      }
    );
    console.log(`Entry fee of ${battle.entryFee} coins deducted from player ${userId} (joining)`);
    
    battle.participants.push({
      userId,
      userName,
      userAvatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      rating: rating || 1000,
      hasSubmitted: false
    });
    
    // Set to countdown first, then frontend will trigger start after countdown
    battle.status = 'countdown';
    await battle.save();
    
    res.json({ battle });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start battle (after countdown)
router.post('/:battleId/start', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const battle = await Battle.findById(req.params.battleId);
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }
    
    // Only start if currently in countdown status
    if (battle.status === 'countdown') {
      battle.status = 'active';
      battle.startedAt = new Date();
      await battle.save();
    }
    
    res.json({ battle, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get rematch requests for a user - MUST be before /:battleId route
router.get('/rematch-requests', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      res.json({ battles: [] });
      return;
    }
    
    // Find battles where a rematch was requested involving this user
    const battles = await Battle.find({
      'rematchRequest.to': userId,
      'rematchRequest.status': 'pending'
    });
    
    res.json({ battles: battles || [] });
  } catch (error: any) {
    console.error('Error fetching rematch requests:', error);
    res.json({ battles: [] });
  }
});

// Submit code
router.post('/:battleId/submit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, language } = req.body;
    const userId = req.user!.id;
    
    const battle = await Battle.findById(req.params.battleId);
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }
    
    const participant = battle.participants.find(p => p.userId === userId);
    if (!participant) {
      res.status(403).json({ error: 'Not a participant' });
      return;
    }
    
    // Check if already submitted
    if (participant.hasSubmitted) {
      res.status(400).json({ error: 'Already submitted', alreadySubmitted: true });
      return;
    }
    
    // Get test cases from either field (testCases is used in questions.json)
    const challengeData = battle.challenge as any;
    let testCases = challengeData.testCases || challengeData.test_cases || [];
    
    console.log('Battle challenge data:', JSON.stringify(challengeData, null, 2));
    console.log('Test cases found:', testCases.length);
    
    // If no test cases in battle, try to load from questions.json
    if (testCases.length === 0 && challengeData.id) {
      console.log('No test cases in battle, loading from questions.json...');
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const questionsPath = path.join(__dirname, '../../../public/questions.json');
        const questionsData = await fs.readFile(questionsPath, 'utf-8');
        const questionsJson = JSON.parse(questionsData);
        
        let questions: any[] = [];
        if (Array.isArray(questionsJson)) {
          questions = questionsJson;
        } else if (questionsJson.problems) {
          questions = questionsJson.problems;
        } else if (questionsJson.questions) {
          questions = questionsJson.questions;
        }
        
        const foundQuestion = questions.find((q: any) => q.id === challengeData.id);
        if (foundQuestion) {
          testCases = foundQuestion.testCases || foundQuestion.test_cases || [];
          console.log('Loaded test cases from questions.json:', testCases.length);
        }
      } catch (err) {
        console.error('Error loading questions.json for test cases:', err);
      }
    }
    
    if (testCases.length === 0) {
      res.status(400).json({ error: 'No test cases available', challenge: challengeData });
      return;
    }
    
    // Execute code against test cases
    const testResults = await executeCode(code, language, testCases);
    const score = calculateScore(testResults);
    
    participant.hasSubmitted = true;
    participant.code = code;
    participant.score = score;
    participant.submissionTime = new Date();
    
    // Check if battle is complete
    if (battle.participants.every(p => p.hasSubmitted)) {
      battle.status = 'completed';
      battle.completedAt = new Date();
      
      // Determine winner - higher score wins, tie goes to faster submission
      const winner = battle.participants.reduce((prev, current) => {
        const prevScore = prev.score || 0;
        const currentScore = current.score || 0;
        
        // Higher score wins
        if (currentScore > prevScore) return current;
        if (currentScore < prevScore) return prev;
        
        // Same score - faster submission wins
        const prevTime = prev.submissionTime ? new Date(prev.submissionTime).getTime() : Infinity;
        const currentTime = current.submissionTime ? new Date(current.submissionTime).getTime() : Infinity;
        return currentTime < prevTime ? current : prev;
      });
      
      // Check for true tie (same score, same time - very unlikely)
      const isTie = battle.participants.length === 2 && 
        battle.participants[0].score === battle.participants[1].score;
      
      battle.winner = winner.userId;
      (battle as any).winReason = isTie ? 'Faster submission' : 'Higher score';
      
      // Award prize to winner - only if not already awarded (prevent double awarding)
      if (!(battle as any).prizeAwarded) {
        try {
          const Wallet = require('../models/Wallet').default;
          const mongoose = require('mongoose');
          await Wallet.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(winner.userId) },
            {
              $inc: { coins: battle.prize },
              $push: {
                transactions: {
                  type: 'credit',
                  amount: battle.prize,
                  reason: isTie ? 'Battle won (faster submission)!' : 'Battle won!',
                  createdAt: new Date()
                }
              }
            },
            { upsert: true }
          );
          (battle as any).prizeAwarded = true;
          console.log(`Prize of ${battle.prize} coins awarded to winner ${winner.userId}`);
        } catch (walletError) {
          console.error('Error awarding prize:', walletError);
        }
      }
    }
    
    await battle.save();
    
    const passedCount = testResults.filter((r: any) => r.passed).length;
    
    // Calculate total time properly (ensure it's a valid number)
    const totalTime = testResults.reduce((sum: number, r: any) => {
      const timeValue = typeof r.time === 'number' ? r.time : 0;
      return sum + (isNaN(timeValue) ? 0 : timeValue);
    }, 0);
    
    res.json({ 
      passed: passedCount === testResults.length,
      passedCount,
      totalCount: testResults.length,
      totalTime: Math.round(totalTime * 1000) / 1000, // Round to 3 decimal places
      score,
      testResults 
    });
  } catch (error: any) {
    console.error('Submit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get battle by ID
router.get('/:battleId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const battle = await Battle.findById(req.params.battleId);
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }
    
    // Transform participants to frontend expected format
    const transformedBattle = {
      id: battle._id,
      status: battle.status,
      difficulty: battle.difficulty,
      entryFee: battle.entryFee,
      prize: battle.prize,
      timeLimit: battle.timeLimit,
      challenge: battle.challenge,
      startTime: battle.startedAt, // Frontend expects startTime
      startedAt: battle.startedAt,
      createdAt: battle.createdAt,
      winnerId: battle.winner,
      winner: battle.winner,
      forfeitedBy: (battle as any).forfeitedBy,
      rematchRequest: battle.rematchRequest, // Include rematch info for polling
      participants: battle.participants.map((p: any) => ({
        odId: p.userId,
        odName: p.userName,
        odProfilePic: p.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`,
        rating: p.rating || 1000,
        hasSubmitted: p.hasSubmitted || false,
        submissionResult: p.submissionResult,
        score: p.score || 0
      }))
    };
    
    res.json(transformedBattle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel/Delete a waiting battle (for when user leaves)
router.delete('/:battleId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const battle = await Battle.findById(req.params.battleId);
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }
    
    // Only allow deletion if user is the creator and battle is still waiting
    if (battle.createdBy !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to delete this battle' });
      return;
    }
    
    if (battle.status !== 'waiting') {
      res.status(400).json({ error: 'Cannot delete battle that has already started' });
      return;
    }
    
    // Refund entry fee to creator when cancelling
    try {
      const Wallet = require('../models/Wallet').default;
      const mongoose = require('mongoose');
      await Wallet.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(req.user!.id) },
        {
          $inc: { coins: battle.entryFee },
          $push: {
            transactions: {
              type: 'credit',
              amount: battle.entryFee,
              reason: 'Battle cancelled - refund',
              createdAt: new Date()
            }
          }
        }
      );
      console.log(`Refunded ${battle.entryFee} coins to ${req.user!.id} for cancelled battle`);
    } catch (walletError) {
      console.error('Error refunding entry fee:', walletError);
    }
    
    await Battle.findByIdAndDelete(req.params.battleId);
    res.json({ success: true, message: 'Battle cancelled' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel battle via beacon (for page unload) - accepts POST with token in body
router.post('/:battleId/cancel', async (req, res): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    // Verify token manually
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    const userId = decoded.id;
    
    const battle = await Battle.findById(req.params.battleId);
    if (!battle || battle.createdBy !== userId || battle.status !== 'waiting') {
      res.status(400).json({ error: 'Cannot cancel' });
      return;
    }
    
    // Refund entry fee to creator when cancelling via beacon
    try {
      const Wallet = require('../models/Wallet').default;
      const mongoose = require('mongoose');
      await Wallet.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        {
          $inc: { coins: battle.entryFee },
          $push: {
            transactions: {
              type: 'credit',
              amount: battle.entryFee,
              reason: 'Battle cancelled - refund',
              createdAt: new Date()
            }
          }
        }
      );
      console.log(`Refunded ${battle.entryFee} coins to ${userId} for cancelled battle (beacon)`);
    } catch (walletError) {
      console.error('Error refunding entry fee:', walletError);
    }
    
    await Battle.findByIdAndDelete(req.params.battleId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Forfeit a battle - user leaves during active battle
router.post('/:battleId/forfeit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const battle = await Battle.findById(req.params.battleId);
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }
    
    if (battle.status !== 'active' && battle.status !== 'countdown') {
      res.status(400).json({ error: 'Battle is not active' });
      return;
    }
    
    const userId = req.user!.id;
    
    // Find the opponent (winner)
    const opponent = battle.participants.find((p: any) => p.userId !== userId);
    if (!opponent) {
      res.status(400).json({ error: 'No opponent found' });
      return;
    }
    
    // Update battle status
    battle.status = 'forfeited';
    battle.winner = opponent.userId;
    battle.forfeitedBy = userId;
    (battle as any).winReason = 'Opponent left the battle or switched tabs';
    battle.completedAt = new Date();
    
    // Award prize to winner - only if not already awarded
    if (!(battle as any).prizeAwarded) {
      const Wallet = require('../models/Wallet').default;
      await Wallet.findOneAndUpdate(
        { userId: opponent.userId },
        {
          $inc: { coins: battle.prize || 0 },
          $push: {
            transactions: {
              amount: battle.prize || 0,
              type: 'credit',
              reason: 'Battle win (opponent forfeited)',
              createdAt: new Date()
            }
          }
        },
        { upsert: true }
      );
      (battle as any).prizeAwarded = true;
      console.log(`Prize of ${battle.prize} coins awarded to winner ${opponent.userId} (forfeit)`);
    }
    
    await battle.save();
    
    res.json({
      success: true,
      message: 'Battle forfeited',
      winner: opponent.userId
    });
  } catch (error: any) {
    console.error('Error forfeiting battle:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user battles
router.get('/user/my-battles', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const battles = await Battle.find({
      'participants.userId': req.user!.id
    }).sort({ createdAt: -1 });
    
    // Transform battles for frontend
    const transformedBattles = battles.map(battle => ({
      id: battle._id,
      status: battle.status,
      difficulty: battle.difficulty,
      entryFee: battle.entryFee,
      prize: battle.prize,
      timeLimit: battle.timeLimit,
      challenge: battle.challenge,
      startTime: battle.startedAt,
      startedAt: battle.startedAt,
      createdAt: battle.createdAt,
      completedAt: battle.completedAt,
      winnerId: battle.winner,
      winner: battle.winner,
      forfeitedBy: (battle as any).forfeitedBy,
      participants: battle.participants.map((p: any) => ({
        odId: p.userId,
        odName: p.userName,
        odProfilePic: p.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`,
        rating: p.rating || 1000,
        hasSubmitted: p.hasSubmitted || false,
        score: p.score || 0
      }))
    }));
    
    res.json({ battles: transformedBattles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get battles for a specific user
router.get('/user/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId || userId === 'undefined') {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    
    const battles = await Battle.find({
      'participants.userId': userId
    }).sort({ createdAt: -1 });
    
    // Transform battles for frontend
    const transformedBattles = battles.map(battle => ({
      id: battle._id,
      status: battle.status,
      difficulty: battle.difficulty,
      entryFee: battle.entryFee,
      prize: battle.prize,
      timeLimit: battle.timeLimit,
      challenge: battle.challenge,
      startTime: battle.startedAt,
      startedAt: battle.startedAt,
      createdAt: battle.createdAt,
      completedAt: battle.completedAt,
      winnerId: battle.winner,
      winner: battle.winner,
      forfeitedBy: (battle as any).forfeitedBy,
      participants: battle.participants.map((p: any) => ({
        odId: p.userId,
        odName: p.userName,
        odProfilePic: p.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`,
        rating: p.rating || 1000,
        hasSubmitted: p.hasSubmitted || false,
        score: p.score || 0
      }))
    }));
    
    res.json({ battles: transformedBattles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Piston API - Free code execution (NO API KEY REQUIRED!)
const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

// Language mappings for Piston API
const PISTON_LANG_MAP: Record<string, { language: string; version: string }> = {
  'python': { language: 'python', version: '3.10.0' },
  'python3': { language: 'python', version: '3.10.0' },
  'javascript': { language: 'javascript', version: '18.15.0' },
  'java': { language: 'java', version: '15.0.2' },
  'cpp': { language: 'c++', version: '10.2.0' },
  'c++': { language: 'c++', version: '10.2.0' },
  'c': { language: 'c', version: '10.2.0' },
};

/**
 * Normalize expected output from test case - handles all possible field names
 */
function normalizeExpectedOutput(testCase: any): string {
  const raw = testCase.expectedOutput || testCase.expected_output || testCase.expected || testCase.output || '';
  return String(raw).trim();
}

/**
 * Normalize output for comparison - handles whitespace variations consistently
 * 1. Normalizes line endings
 * 2. Trims each line and collapses multiple spaces
 * 3. Removes trailing empty lines
 */
function normalizeOutputForComparison(output: string): string {
  return output
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' '))
    .join('\n')
    .replace(/\n+$/, '')
    .trim();
}

// Helper function to execute code using Piston API
async function executeCode(code: string, language: string, testCases: any[]): Promise<any[]> {
  const results: any[] = [];
  const langConfig = PISTON_LANG_MAP[language.toLowerCase()] || { language: 'python', version: '3.10.0' };
  
  console.log('=== BATTLE PISTON EXECUTION START ===');
  console.log(`Language: ${language} -> ${langConfig.language} v${langConfig.version}`);
  console.log(`Test cases count: ${testCases.length}`);
  console.log('Code length:', code.length);
  console.log('Code preview:', code.substring(0, 200));
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n--- Battle Test Case ${i + 1} ---`);
    console.log('Raw test case:', JSON.stringify(testCase));
    
    try {
      // Convert escaped newlines to actual newlines
      const stdin = (testCase.input || '').replace(/\\n/g, '\n');
      // Use normalized expected output
      const expectedRaw = normalizeExpectedOutput(testCase);
      
      console.log('Input (stdin):', JSON.stringify(stdin));
      console.log('Expected output:', JSON.stringify(expectedRaw));
      
      // Use Piston API for code execution
      const response = await axios.post(
        `${PISTON_API_URL}/execute`,
        {
          language: langConfig.language,
          version: langConfig.version,
          files: [{ content: code }],
          stdin: stdin
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      const result = response.data;
      const runResult = result.run || {};
      
      // Get output
      let output = (runResult.stdout || '').trim();
      const stderr = runResult.stderr || '';
      const expected = expectedRaw.trim();
      
      // Check for errors
      const hasError = !!stderr || runResult.code !== 0;
      
      // Normalize output for comparison using helper function
      const normalizedOutput = normalizeOutputForComparison(output);
      const normalizedExpected = normalizeOutputForComparison(expected);
      
      // Check if passed
      const passed = !hasError && normalizedOutput === normalizedExpected;
      
      console.log(`Test result: expected="${expected}" got="${output}" passed=${passed}`);
      if (stderr) console.log(`Stderr: ${stderr}`);
      
      results.push({
        passed,
        input: testCase.input,
        expected,
        output: output || stderr || 'No output',
        time: 0,
        error: hasError ? stderr : undefined
      });
    } catch (error: any) {
      console.error('Code execution error:', error.response?.data || error.message);
      results.push({
        passed: false,
        input: testCase.input,
        expected: testCase.expectedOutput || testCase.expected_output || testCase.expected || testCase.output || '',
        output: '',
        error: error.response?.data?.message || error.message || 'Execution error',
        time: 0
      });
    }
  }
  
  return results;
}

function getFileExtension(language: string): string {
  const extensions: any = {
    python: 'py',
    javascript: 'js',
    java: 'java',
    cpp: 'cpp',
    c: 'c'
  };
  return extensions[language.toLowerCase()] || 'txt';
}

function calculateScore(results: any[]): number {
  if (!results || results.length === 0) return 0;
  const passed = results.filter(r => r.passed).length;
  const score = Math.round((passed / results.length) * 100);
  return isNaN(score) ? 0 : score;
}

// Request rematch - creates a new battle with rematch request
router.post('/:battleId/rematch', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { battleId } = req.params;
    const { to, toName, fromName, difficulty, entryFee, userName, userAvatar, rating } = req.body;
    const from = req.user!.id;
    
    const originalBattle = await Battle.findById(battleId);
    if (!originalBattle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }
    
    // Check if requester has enough coins
    const Wallet = require('../models/Wallet').default;
    const wallet = await Wallet.findOne({ userId: from });
    const actualEntryFee = entryFee || originalBattle.entryFee;
    
    if (!wallet || wallet.coins < actualEntryFee) {
      res.status(400).json({ error: 'Insufficient coins for rematch' });
      return;
    }
    
    // Get a new random question for the rematch
    const fs = await import('fs/promises');
    const path = await import('path');
    const questionsPath = path.join(__dirname, '../../../public/questions.json');
    const questionsData = await fs.readFile(questionsPath, 'utf-8');
    const questionsJson = JSON.parse(questionsData);
    
    let questions: any[] = [];
    if (Array.isArray(questionsJson)) {
      questions = questionsJson;
    } else if (questionsJson.problems) {
      questions = questionsJson.problems;
    } else if (questionsJson.questions) {
      questions = questionsJson.questions;
    }
    
    const actualDifficulty = difficulty || originalBattle.difficulty;
    const difficultyQuestions = questions.filter((q: any) => 
      q.difficulty && q.difficulty.toLowerCase() === actualDifficulty.toLowerCase()
    );
    
    if (difficultyQuestions.length === 0) {
      res.status(400).json({ error: `No ${actualDifficulty} questions available` });
      return;
    }
    
    const randomQuestion = difficultyQuestions[Math.floor(Math.random() * difficultyQuestions.length)];
    const prize = Math.floor(actualEntryFee * 2 * 0.9);
    const timeLimit = actualDifficulty === 'easy' ? 900 : actualDifficulty === 'medium' ? 1200 : 1800;
    
    // Create new battle with rematch request
    const rematchBattle = await Battle.create({
      status: 'waiting',
      difficulty: actualDifficulty,
      entryFee: actualEntryFee,
      prize,
      timeLimit,
      maxParticipants: 2,
      participants: [{
        userId: from,
        userName: userName || fromName || 'Player',
        userAvatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${from}`,
        rating: rating || 1000,
        hasSubmitted: false
      }],
      challenge: {
        id: randomQuestion.id,
        title: randomQuestion.title,
        difficulty: randomQuestion.difficulty,
        category: randomQuestion.category || randomQuestion.tags?.[0] || 'general',
        coinReward: randomQuestion.coins || randomQuestion.coinReward || 10,
        description: randomQuestion.description,
        testCases: randomQuestion.testCases || randomQuestion.test_cases || [],
        test_cases: randomQuestion.test_cases || randomQuestion.testCases || []
      },
      rematchRequest: {
        from,
        fromName: userName || fromName || 'Player',
        to,
        toName: toName || 'Opponent',
        status: 'pending',
        createdAt: new Date()
      },
      createdBy: from,
      version: 'v2.0-rematch'
    });
    
    res.json({ 
      message: 'Rematch requested', 
      battleId: rematchBattle._id,
      battle: rematchBattle 
    });
  } catch (error: any) {
    console.error('Error creating rematch:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept rematch request
router.post('/:battleId/accept-rematch', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { battleId } = req.params;
    const { userId, userName, userProfilePic, rating } = req.body;
    
    const battle = await Battle.findById(battleId);
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }
    
    if (battle.status !== 'waiting') {
      res.status(400).json({ error: 'Battle is no longer available' });
      return;
    }
    
    // Check if this user is the target of the rematch request
    const rematchRequest = battle.rematchRequest;
    if (!rematchRequest || rematchRequest.to !== userId) {
      res.status(403).json({ error: 'You are not the target of this rematch request' });
      return;
    }
    
    // Check if user has enough coins
    const Wallet = require('../models/Wallet').default;
    const wallet = await Wallet.findOne({ userId });
    
    if (!wallet || wallet.coins < battle.entryFee) {
      res.status(400).json({ error: 'Insufficient coins to accept rematch' });
      return;
    }
    
    // Deduct entry fee from both players
    await Wallet.findOneAndUpdate(
      { userId },
      {
        $inc: { coins: -battle.entryFee },
        $push: {
          transactions: {
            type: 'debit',
            amount: battle.entryFee,
            reason: `Battle entry fee (Rematch)`,
            createdAt: new Date()
          }
        }
      }
    );
    
    await Wallet.findOneAndUpdate(
      { userId: rematchRequest.from },
      {
        $inc: { coins: -battle.entryFee },
        $push: {
          transactions: {
            type: 'debit',
            amount: battle.entryFee,
            reason: `Battle entry fee (Rematch)`,
            createdAt: new Date()
          }
        }
      }
    );
    
    // Add second participant and update status
    battle.participants.push({
      userId,
      userName: userName || 'Player',
      userAvatar: userProfilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      rating: rating || 1000,
      hasSubmitted: false
    });
    
    battle.rematchRequest!.status = 'accepted';
    battle.status = 'countdown';
    await battle.save();
    
    res.json({ 
      success: true, 
      message: 'Rematch accepted',
      battle 
    });
  } catch (error: any) {
    console.error('Error accepting rematch:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user battle stats (optimized for fast loading)
router.get('/user-stats/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Use aggregation pipeline for fast stats calculation
    const stats = await Battle.aggregate([
      // Match battles where user is a participant
      { $match: { 'participants.userId': userId } },
      // Group and calculate stats
      {
        $group: {
          _id: null,
          totalBattles: { $sum: 1 },
          battlesWon: {
            $sum: { $cond: [{ $eq: ['$winner', userId] }, 1, 0] }
          },
          completedBattles: {
            $sum: { $cond: [{ $in: ['$status', ['completed', 'forfeited']] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || { totalBattles: 0, battlesWon: 0, completedBattles: 0 };
    
    // Calculate win streak from recent battles
    const recentBattles = await Battle.find({
      'participants.userId': userId,
      status: { $in: ['completed', 'forfeited'] }
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('winner createdAt');
    
    let currentStreak = 0;
    for (const battle of recentBattles) {
      if (battle.winner === userId) {
        currentStreak++;
      } else if (battle.winner) {
        break;
      }
    }
    
    res.json({
      battlesWon: result.battlesWon,
      totalBattles: result.totalBattles,
      completedBattles: result.completedBattles,
      currentStreak
    });
  } catch (error: any) {
    console.error('Error fetching user battle stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject rematch request
router.post('/:battleId/reject-rematch', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { battleId } = req.params;
    const { rejectedBy } = req.body;
    
    const battle = await Battle.findById(battleId);
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }
    
    if (battle.rematchRequest) {
      battle.rematchRequest.status = 'rejected';
    }
    battle.status = 'rejected';
    await battle.save();
    
    res.json({ 
      success: true, 
      message: 'Rematch rejected',
      rejectedBy 
    });
  } catch (error: any) {
    console.error('Error rejecting rematch:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
