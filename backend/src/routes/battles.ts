import axios from 'axios';
import { Response, Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Battle from '../models/Battle';

const router = Router();

// DEBUG: Test Piston API directly with a known problem
router.get('/debug-piston', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Test with "Find Missing Number" problem - A003
    const testInput = "3\n3 0 1"; // Expected output: "2"
    const testCode = `
n = int(input())
nums = list(map(int, input().split()))
total = n * (n + 1) // 2
print(total - sum(nums))
`;

    console.log('=== DEBUG PISTON TEST ===');
    console.log('Input:', JSON.stringify(testInput));
    console.log('Code:', testCode);

    const response = await axios.post(
      'https://emkc.org/api/v2/piston/execute',
      {
        language: 'python',
        version: '3.10.0',
        files: [{ content: testCode }],
        stdin: testInput
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    console.log('Piston Response:', JSON.stringify(response.data, null, 2));

    const runResult = response.data.run || {};
    const output = (runResult.stdout || runResult.output || '').trim();
    const stderr = runResult.stderr || '';

    res.json({
      success: true,
      input: testInput,
      expectedOutput: "2",
      actualOutput: output,
      passed: output === "2",
      pistonResponse: response.data,
      stderr: stderr
    });
  } catch (error: any) {
    console.error('Debug Piston Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Get recent completed battles (for activity feed - no auth required)
router.get('/recent', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const battles = await Battle.find({ status: 'completed' })
      .sort({ completedAt: -1, updatedAt: -1 })
      .limit(limit);

    const formattedBattles = battles.map(battle => {
      const winner = battle.participants.find((p: any) => p.status === 'completed');
      return {
        _id: battle._id,
        status: battle.status,
        winnerName: winner?.userName || 'A player',
        prize: battle.prize,
        completedAt: battle.completedAt || battle.updatedAt
      };
    });

    res.json(formattedBattles);
  } catch (error: any) {
    console.error('Error fetching recent battles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get list of battles (with optional filters)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, difficulty } = req.query;

    // Clean up stale waiting battles (older than 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    await Battle.deleteMany({
      status: 'waiting',
      createdAt: { $lt: fifteenMinutesAgo }
    });

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;

    // If filtering for waiting battles, only show fresh ones
    if (status === 'waiting') {
      query.createdAt = { $gte: fifteenMinutesAgo };
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

    // Also clean up stale battles (older than 15 minutes and still waiting)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    await Battle.deleteMany({
      status: 'waiting',
      createdAt: { $lt: fifteenMinutesAgo }
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

    // Try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '../../../public/questions.json'),
      path.join(__dirname, '../../public/questions.json'),
      path.join(process.cwd(), 'public/questions.json'),
      path.join(process.cwd(), 'backend/public/questions.json')
    ];

    let questionsData: string | null = null;
    for (const questionsPath of possiblePaths) {
      try {
        questionsData = await fs.readFile(questionsPath, 'utf-8');
        console.log('Loaded questions from:', questionsPath);
        break;
      } catch (pathErr) {
        // Try next path
      }
    }

    if (!questionsData) {
      res.status(500).json({ error: 'Could not load questions database' });
      return;
    }

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

    // Only find battles created within the last 15 minutes (not stale)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const battle = await Battle.findOne({
      status: 'waiting',
      difficulty,
      entryFee: Number(entryFee),
      'participants.userId': { $ne: req.user!.id },
      createdAt: { $gte: fifteenMinutesAgo } // Only fresh battles
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

    console.log('=== SUBMIT ENDPOINT DEBUG ===');
    console.log('Battle ID:', req.params.battleId);
    console.log('Challenge ID:', challengeData.id);
    console.log('Challenge Title:', challengeData.title);
    console.log('testCases array length:', challengeData.testCases?.length || 0);
    console.log('test_cases array length:', challengeData.test_cases?.length || 0);
    console.log('Final test cases count:', testCases.length);
    console.log('Test cases data:', JSON.stringify(testCases, null, 2));

    // If no test cases in battle, try to load from questions.json
    if (testCases.length === 0 && challengeData.id) {
      console.log('No test cases in battle, loading from questions.json...');
      try {
        const fs = await import('fs/promises');
        const path = await import('path');

        // Try multiple possible paths
        const possiblePaths = [
          path.join(__dirname, '../../../public/questions.json'),
          path.join(__dirname, '../../public/questions.json'),
          path.join(process.cwd(), 'public/questions.json'),
          path.join(process.cwd(), 'backend/public/questions.json')
        ];

        let questionsData: string | null = null;
        for (const questionsPath of possiblePaths) {
          try {
            console.log('Trying path:', questionsPath);
            questionsData = await fs.readFile(questionsPath, 'utf-8');
            console.log('Successfully loaded from:', questionsPath);
            break;
          } catch (pathErr) {
            // Try next path
          }
        }

        if (!questionsData) {
          console.error('Could not find questions.json in any expected location');
        } else {
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

    // Calculate passed count and total time
    const passedCount = testResults.filter((r: any) => r.passed).length;
    const totalCount = testResults.length;
    const totalTime = testResults.reduce((sum: number, r: any) => {
      const timeValue = typeof r.time === 'number' ? r.time : parseFloat(r.time) || 0;
      return sum + (isNaN(timeValue) ? 0 : timeValue);
    }, 0);

    console.log(`[Battle] User ${userId}: ${passedCount}/${totalCount} passed, time: ${totalTime}ms`);

    participant.hasSubmitted = true;
    participant.code = code;
    participant.score = score;
    participant.submissionTime = new Date();
    participant.passedCount = passedCount;
    participant.totalCount = totalCount;
    participant.totalTime = Math.round(totalTime);

    // Mark participants as modified to ensure Mongoose saves subdocument changes
    battle.markModified('participants');

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

      // Find the loser
      const loser = battle.participants.find(p => p.userId !== winner.userId);

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

          // Update ELO ratings for both players
          if (loser) {
            const winnerRating = winner.rating || 1000;
            const loserRating = loser.rating || 1000;
            const ratingResult = await updateBattleRatings(winner.userId, loser.userId, winnerRating, loserRating);

            // Store rating changes in battle for display
            (battle as any).ratingChanges = {
              winner: { oldRating: winnerRating, newRating: ratingResult.winnerNewRating },
              loser: { oldRating: loserRating, newRating: ratingResult.loserNewRating }
            };
          }
        } catch (walletError) {
          console.error('Error awarding prize:', walletError);
        }
      }
    }

    await battle.save();

    res.json({
      passed: passedCount === totalCount,
      passedCount,
      totalCount,
      totalTime,
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
    const { battleId } = req.params;

    // Validate battleId format before querying
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(battleId)) {
      console.log(`Invalid battle ID format: ${battleId}`);
      res.status(400).json({ error: 'Invalid battle ID format' });
      return;
    }

    const battle = await Battle.findById(battleId);
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
        score: p.score || 0,
        // Build submissionResult from stored participant fields
        submissionResult: p.hasSubmitted ? {
          passedCount: p.passedCount || 0,
          totalCount: p.totalCount || 0,
          totalTime: p.totalTime || 0,
          passed: (p.passedCount || 0) === (p.totalCount || 0) && (p.totalCount || 0) > 0
        } : null
      }))
    };

    res.json(transformedBattle);
  } catch (error: any) {
    console.error(`Error fetching battle ${req.params.battleId}:`, error.message);
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
  // questions.json uses "output" field with real newlines (char code 10)
  const raw = testCase.expectedOutput || testCase.expected_output || testCase.expected || testCase.output || '';
  // Convert escaped newlines to actual newlines (same as practice mode)
  return String(raw).replace(/\\n/g, '\n').trim();
}

/**
 * Normalize output for comparison - handles whitespace variations consistently
 * This is critical for comparing Piston output with expected output
 */
function normalizeOutputForComparison(output: string): string {
  if (!output) return '';

  return output
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Split into lines
    .split('\n')
    // Trim each line and collapse multiple spaces
    .map(line => line.trim().replace(/\s+/g, ' '))
    // Remove empty lines
    .filter(line => line.length > 0)
    // Join back
    .join('\n')
    .trim();
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to execute code with retry logic for rate limiting
async function executePistonWithRetry(
  code: string,
  langConfig: { language: string; version: string },
  stdin: string,
  maxRetries: number = 3
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
          timeout: 20000 // Increased timeout for production
        }
      );
      return response;
    } catch (error: any) {
      const status = error.response?.status;
      console.log(`[Piston] Attempt ${attempt}/${maxRetries} failed. Status: ${status}`);

      // If rate limited (429) or server error (5xx), retry with backoff
      if ((status === 429 || status >= 500) && attempt < maxRetries) {
        const backoffTime = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
        console.log(`[Piston] Rate limited or server error. Waiting ${backoffTime}ms before retry...`);
        await delay(backoffTime);
        continue;
      }
      throw error;
    }
  }
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
    console.log(`\n--- Battle Test Case ${i + 1}/${testCases.length} ---`);
    console.log('Raw test case:', JSON.stringify(testCase));

    try {
      // Convert escaped newlines to actual newlines (same as practice mode)
      const stdin = (testCase.input || '').replace(/\\n/g, '\n');
      // Use normalized expected output
      const expectedRaw = normalizeExpectedOutput(testCase);

      console.log('Input (stdin):', JSON.stringify(stdin));
      console.log('Expected output:', JSON.stringify(expectedRaw));

      // Add small delay between test cases to avoid rate limiting (except first one)
      if (i > 0) {
        console.log('[Piston] Waiting 300ms before next test case...');
        await delay(300);
      }

      // Measure execution time ourselves
      const startTime = Date.now();

      // Use Piston API for code execution with retry logic
      const response = await executePistonWithRetry(code, langConfig, stdin);

      const executionTime = Date.now() - startTime;

      const result = response.data;
      const runResult = result.run || {};

      console.log('[Battle] Piston run result:', JSON.stringify(runResult));
      console.log('[Battle] Execution time:', executionTime, 'ms');

      // Get output - Piston uses stdout primarily, but fall back to output
      let output = (runResult.stdout || runResult.output || '').trim();
      const stderr = runResult.stderr || '';
      const expected = expectedRaw.trim();

      // Check for CRITICAL errors only (compilation errors, crashes)
      // Don't fail just because there's stderr output - some languages output warnings
      const hasCriticalError = runResult.code !== 0 && !output && stderr;

      // Normalize output for comparison using helper function
      const normalizedOutput = normalizeOutputForComparison(output);
      const normalizedExpected = normalizeOutputForComparison(expected);

      // Check if passed: output matches expected (even if there's non-critical stderr)
      const passed = !hasCriticalError && normalizedOutput === normalizedExpected;

      console.log(`Test result: normalized_expected="${normalizedExpected}" normalized_got="${normalizedOutput}" passed=${passed}`);
      console.log(`Raw: expected="${expected}" got="${output}"`);
      if (stderr) console.log(`Stderr: ${stderr}`);

      results.push({
        passed,
        input: testCase.input,
        expected,
        output: output || stderr || 'No output',
        time: executionTime,
        error: hasCriticalError ? stderr : undefined
      });
    } catch (error: any) {
      console.error(`[Battle] Test case ${i + 1} execution error:`, error.response?.data || error.message);
      results.push({
        passed: false,
        input: testCase.input,
        expected: testCase.expectedOutput || testCase.expected_output || testCase.expected || testCase.output || '',
        output: '',
        error: error.response?.data?.message || error.message || 'Execution error (rate limit or timeout)',
        time: 0
      });
    }
  }

  console.log(`=== BATTLE EXECUTION COMPLETE: ${results.filter(r => r.passed).length}/${results.length} passed ===`);
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

/**
 * Calculate ELO rating change
 * K-factor determines how much ratings change (higher = more volatile)
 * Standard chess uses K=32 for beginners, K=16 for established players
 */
function calculateEloChange(winnerRating: number, loserRating: number, kFactor: number = 32): { winnerGain: number; loserLoss: number } {
  // Expected score for winner (probability of winning based on ratings)
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;

  // Actual result: winner = 1, loser = 0
  const winnerGain = Math.round(kFactor * (1 - expectedWinner));
  const loserLoss = Math.round(kFactor * (0 - expectedLoser));

  return { winnerGain, loserLoss: Math.abs(loserLoss) };
}

/**
 * Update user ratings after battle completion
 */
async function updateBattleRatings(winnerId: string, loserId: string, winnerOldRating: number, loserOldRating: number): Promise<{ winnerNewRating: number; loserNewRating: number }> {
  const User = require('../models/User').default;
  const mongoose = require('mongoose');

  const { winnerGain, loserLoss } = calculateEloChange(winnerOldRating, loserOldRating);

  const winnerNewRating = winnerOldRating + winnerGain;
  const loserNewRating = Math.max(100, loserOldRating - loserLoss); // Minimum rating of 100

  console.log(`ELO Update: Winner ${winnerId} ${winnerOldRating} -> ${winnerNewRating} (+${winnerGain})`);
  console.log(`ELO Update: Loser ${loserId} ${loserOldRating} -> ${loserNewRating} (-${loserLoss})`);

  try {
    // Update winner's rating
    await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(winnerId),
      {
        $set: { battleRating: winnerNewRating },
        $inc: { battlesWon: 1 }
      }
    );

    // Update loser's rating
    await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(loserId),
      {
        $set: { battleRating: loserNewRating },
        $inc: { battlesLost: 1 }
      }
    );

    return { winnerNewRating, loserNewRating };
  } catch (error) {
    console.error('Error updating battle ratings:', error);
    return { winnerNewRating: winnerOldRating, loserNewRating: loserOldRating };
  }
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

    // Try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '../../../public/questions.json'),
      path.join(__dirname, '../../public/questions.json'),
      path.join(process.cwd(), 'public/questions.json'),
      path.join(process.cwd(), 'backend/public/questions.json')
    ];

    let questionsData: string | null = null;
    for (const questionsPath of possiblePaths) {
      try {
        questionsData = await fs.readFile(questionsPath, 'utf-8');
        break;
      } catch (pathErr) {
        // Try next path
      }
    }

    if (!questionsData) {
      res.status(500).json({ error: 'Could not load questions database' });
      return;
    }

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

    // Deduct entry fee from requester NOW (consistent with regular battle creation)
    await Wallet.findOneAndUpdate(
      { userId: from },
      {
        $inc: { coins: -actualEntryFee },
        $push: {
          transactions: {
            type: 'debit',
            amount: actualEntryFee,
            reason: `Battle entry fee (Rematch request)`,
            createdAt: new Date()
          }
        }
      }
    );
    console.log(`Entry fee of ${actualEntryFee} coins deducted from player ${from} (rematch request)`);

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
