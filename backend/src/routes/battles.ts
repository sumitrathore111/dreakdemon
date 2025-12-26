import { Router, Response } from 'express';
import Battle from '../models/Battle';
import { authenticate, AuthRequest } from '../middleware/auth';
import axios from 'axios';

const router = Router();

// Get list of battles (with optional filters)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, difficulty } = req.query;
    
    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;
    
    const battles = await Battle.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Transform to frontend expected format
    const formattedBattles = battles.map(battle => {
      const creator = battle.participants[0];
      return {
        id: battle._id,
        creatorId: creator?.userId || battle.createdBy,
        creatorName: creator?.userName || 'Anonymous',
        creatorProfilePic: creator?.userAvatar,
        creatorRating: creator?.rating || 1000,
        difficulty: battle.difficulty,
        entryFee: battle.entryFee,
        prize: battle.prize,
        timeLimit: battle.timeLimit,
        status: battle.status,
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
    
    const prize = Math.floor(entryFee * 2 * 0.9);
    const timeLimit = difficulty === 'easy' ? 900 : difficulty === 'medium' ? 1200 : 1800;
    
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
      challenge: randomQuestion,
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
    
    const battle = await Battle.findOne({
      status: 'waiting',
      difficulty,
      entryFee: Number(entryFee),
      'participants.userId': { $ne: req.user!.id }
    });
    
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
    
    battle.participants.push({
      userId,
      userName,
      userAvatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      rating: rating || 1000,
      hasSubmitted: false
    });
    
    battle.status = 'active';
    battle.startedAt = new Date();
    await battle.save();
    
    res.json({ battle });
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
    
    // Execute code against test cases
    const testResults = await executeCode(code, language, battle.challenge.test_cases);
    const score = calculateScore(testResults);
    
    participant.hasSubmitted = true;
    participant.code = code;
    participant.score = score;
    participant.submissionTime = new Date();
    
    // Check if battle is complete
    if (battle.participants.every(p => p.hasSubmitted)) {
      battle.status = 'completed';
      battle.completedAt = new Date();
      
      // Determine winner
      const winner = battle.participants.reduce((prev, current) => 
        (current.score || 0) > (prev.score || 0) ? current : prev
      );
      battle.winner = winner.userId;
    }
    
    await battle.save();
    res.json({ battle, score, testResults });
  } catch (error: any) {
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
    res.json({ battle });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user battles
router.get('/user/my-battles', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const battles = await Battle.find({
      'participants.userId': req.user!.id
    }).sort({ createdAt: -1 });
    
    res.json({ battles });
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
    
    res.json({ battles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to execute code
async function executeCode(code: string, language: string, testCases: any[]): Promise<any[]> {
  const results: any[] = [];
  
  for (const testCase of testCases) {
    try {
      const response = await axios.post(process.env.CODE_EXECUTION_API_URL || 'https://emkc.org/api/v2/piston/execute', {
        language: language.toLowerCase(),
        version: '*',
        files: [{
          name: `main.${getFileExtension(language)}`,
          content: code
        }],
        stdin: testCase.input || ''
      });
      
      const output = response.data.run.output?.trim();
      const expected = testCase.expected?.trim();
      
      results.push({
        passed: output === expected,
        input: testCase.input,
        expected,
        output
      });
    } catch (error) {
      results.push({
        passed: false,
        error: 'Execution error'
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
  const passed = results.filter(r => r.passed).length;
  return Math.round((passed / results.length) * 100);
}

// Request rematch
router.post('/:battleId/rematch', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { battleId } = req.params;
    const { to } = req.body;
    const from = req.user!.id;
    
    const battle = await Battle.findById(battleId);
    if (!battle) {
      res.status(404).json({ error: 'Battle not found' });
      return;
    }
    
    // Add rematch request to battle
    battle.set('rematchRequest', {
      from,
      to,
      status: 'pending',
      createdAt: new Date()
    });
    
    await battle.save();
    
    res.json({ message: 'Rematch requested', battle });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
