import axios from 'axios';
import { Response, Router } from 'express';
import { adminOnly, authenticate, AuthRequest } from '../middleware/auth';
import Challenge from '../models/Challenge';
import UserProgress from '../models/UserProgress';
import Wallet from '../models/Wallet';

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

// Submit challenge solution - Execute code and award/deduct coins
router.post('/:challengeId/submit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { challengeId } = req.params;
    const { code, language, source_code, language_id, testCases: requestTestCases, difficulty: requestDifficulty, title: requestTitle, coinReward: requestCoinReward } = req.body;
    const userId = req.user!.id;
    
    console.log('=== CHALLENGE SUBMIT ===');
    console.log('Challenge ID:', challengeId);
    console.log('Language:', language);
    console.log('Request test cases count:', requestTestCases?.length || 0);
    if (requestTestCases && requestTestCases.length > 0) {
      console.log('First test case:', JSON.stringify(requestTestCases[0]));
    }
    
    // Support both formats (direct or secureCodeExecution format)
    const actualCode = code || source_code;
    const actualLanguage = language || getLanguageFromId(language_id);
    
    if (!actualCode) {
      res.status(400).json({ error: 'Code is required', success: false });
      return;
    }
    
    // Try to find the challenge in database, but also support local challenges
    let challenge: any = null;
    let testCases: any[] = [];
    let challengeTitle = requestTitle || 'Practice Challenge';
    let coinReward = requestCoinReward || 10;
    let difficulty = requestDifficulty || 'Easy';
    
    // Try MongoDB first (if challengeId looks like an ObjectId)
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(challengeId)) {
      challenge = await Challenge.findById(challengeId);
    }
    
    if (challenge) {
      // Use challenge from database
      testCases = challenge.testCases || [];
      challengeTitle = challenge.title;
      coinReward = challenge.coinReward || (challenge.difficulty === 'Easy' ? 10 : challenge.difficulty === 'Medium' ? 20 : 30);
      difficulty = challenge.difficulty;
    } else if (requestTestCases && requestTestCases.length > 0) {
      // Use test cases from request (for local/questions.json challenges)
      testCases = requestTestCases.map((tc: any) => ({
        input: tc.input,
        expectedOutput: tc.expected_output || tc.expectedOutput || tc.output || ''
      }));
      
      // Calculate coin reward based on difficulty
      if (requestDifficulty) {
        coinReward = requestDifficulty.toLowerCase() === 'easy' ? 10 : 
                     requestDifficulty.toLowerCase() === 'medium' ? 20 : 30;
      }
    } else {
      // Try to load from questions.json file
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const questionsPath = path.join(__dirname, '../../../public/questions.json');
        const questionsData = await fs.readFile(questionsPath, 'utf-8');
        const questionsJson = JSON.parse(questionsData);
        
        // Handle different formats
        let questions: any[] = [];
        if (Array.isArray(questionsJson)) {
          questions = questionsJson;
        } else if (questionsJson.problems) {
          questions = questionsJson.problems;
        } else if (questionsJson.questions) {
          questions = questionsJson.questions;
        }
        
        const found = questions.find((q: any) => q.id === challengeId);
        if (found) {
          testCases = (found.test_cases || found.testCases || []).map((tc: any) => ({
            input: tc.input,
            expectedOutput: tc.expected_output || tc.expectedOutput || tc.output || ''
          }));
          challengeTitle = found.title;
          coinReward = found.coins || found.coinReward || 10;
          difficulty = found.difficulty;
        }
      } catch (err) {
        console.error('Error loading questions.json:', err);
      }
    }
    
    if (testCases.length === 0) {
      res.status(400).json({ error: 'No test cases available for this challenge', success: false });
      return;
    }
    
    // Check if user has already solved this challenge
    const existingProgress = await UserProgress.findOne({ userId });
    const alreadySolved = existingProgress?.solvedChallenges.some(
      (sc: any) => sc.challengeId.toString() === challengeId
    );
    
    // Execute code against test cases
    const testResults = await executeCodeAgainstTests(actualCode, actualLanguage, testCases);
    const passedCount = testResults.filter(r => r.passed).length;
    const totalCount = testResults.length;
    const allPassed = passedCount === totalCount;
    
    let coinsChanged = 0;
    let message = '';
    
    if (allPassed) {
      if (!alreadySolved) {
        // Award coins for first-time solve
        coinsChanged = coinReward;
        message = `Congratulations! All test cases passed. You earned ${coinReward} coins!`;
        
        // Update wallet
        await Wallet.findOneAndUpdate(
          { userId },
          {
            $inc: { coins: coinReward, 'achievements.problemsSolved': 1 },
            $push: {
              transactions: {
                type: 'credit',
                amount: coinReward,
                reason: `Solved: ${challengeTitle}`,
                createdAt: new Date()
              }
            }
          },
          { upsert: true }
        );
        
        // Calculate total execution time properly (ensure it's a valid number)
        const totalExecutionTime = testResults.reduce((sum: number, r: any) => {
          const timeValue = typeof r.time === 'string' ? parseFloat(r.time) : (r.time || 0);
          return sum + (isNaN(timeValue) ? 0 : timeValue);
        }, 0);
        
        // Update progress
        await UserProgress.findOneAndUpdate(
          { userId },
          {
            $push: {
              solvedChallenges: {
                challengeId: challengeId,
                solvedAt: new Date(),
                language: actualLanguage,
                executionTime: Math.round(totalExecutionTime * 1000) / 1000 // Round to 3 decimal places
              }
            },
            $inc: { totalPoints: coinReward }
          },
          { upsert: true }
        );
      } else {
        message = 'All test cases passed! (Already solved - no additional coins)';
      }
    } else {
      // Wrong answer - no coin penalty for practice
      message = `Wrong answer. ${passedCount}/${totalCount} test cases passed.`;
    }
    
    res.json({
      success: allPassed,
      passed: passedCount,
      total: totalCount,
      passedCount,
      totalCount,
      message,
      coinsChanged,
      testResults: testResults.map(r => ({
        passed: r.passed,
        input: r.input,
        expected: r.expected,
        output: r.output,
        error: r.error
      }))
    });
  } catch (error: any) {
    console.error('Challenge submission error:', error);
    res.status(500).json({ error: error.message, success: false });
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
  'go': { language: 'go', version: '1.16.2' },
  'rust': { language: 'rust', version: '1.68.2' },
  'ruby': { language: 'ruby', version: '3.0.1' },
  'typescript': { language: 'typescript', version: '5.0.3' },
};

// Helper function to execute code against test cases using Piston API
async function executeCodeAgainstTests(code: string, language: string, testCases: any[]): Promise<any[]> {
  const results: any[] = [];
  
  const langConfig = PISTON_LANG_MAP[language.toLowerCase()] || { language: 'python', version: '3.10.0' };
  
  console.log('=== PISTON EXECUTION START ===');
  console.log(`Language: ${language} -> ${langConfig.language} v${langConfig.version}`);
  console.log(`Test cases count: ${testCases.length}`);
  console.log('Code length:', code.length);
  console.log('Code preview:', code.substring(0, 200));
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n--- Test Case ${i + 1} ---`);
    console.log('Raw test case:', JSON.stringify(testCase));
    
    try {
      // Convert escaped newlines to actual newlines
      const stdin = (testCase.input || '').replace(/\\n/g, '\n');
      const expectedRaw = (testCase.expectedOutput || testCase.output || testCase.expected || '');
      
      console.log('Input (stdin):', JSON.stringify(stdin));
      console.log('Expected output:', JSON.stringify(expectedRaw));
      
      // Use Piston API for code execution
      const submitResponse = await axios.post(
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
      
      const result = submitResponse.data;
      const runResult = result.run || {};
      
      const output = (runResult.stdout || '').trim();
      const stderr = runResult.stderr || '';
      const expected = expectedRaw.trim();
      
      // Check for errors
      const hasError = !!stderr || runResult.code !== 0;
      
      // Normalize output for comparison
      const normalizeOutput = (s: string) => {
        return s.split('\n').map(line => line.trim()).join('\n').trim();
      };
      
      const normalizedOutput = normalizeOutput(output);
      const normalizedExpected = normalizeOutput(expected);
      const passed = !hasError && normalizedOutput === normalizedExpected;
      
      console.log('Actual output:', JSON.stringify(output));
      console.log('Expected:', JSON.stringify(expected));
      console.log('Passed:', passed);
      
      results.push({
        passed,
        input: testCase.input,
        expected,
        output: output || stderr || 'No output',
        stderr,
        status: passed ? 'Accepted' : (hasError ? 'Error' : 'Wrong Answer'),
        time: 0,
        memory: 0,
        error: hasError ? stderr : undefined
      });
    } catch (error: any) {
      console.error('Code execution error:', error.response?.data || error.message);
      results.push({
        passed: false,
        input: testCase.input,
        expected: testCase.expectedOutput || testCase.output || '',
        output: '',
        error: error.response?.data?.message || error.message || 'Execution error',
        time: 0
      });
    }
  }
  
  return results;
}

// Helper function to get file extension
function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    python: 'py',
    python3: 'py',
    javascript: 'js',
    java: 'java',
    cpp: 'cpp',
    'c++': 'cpp',
    c: 'c',
    go: 'go',
    rust: 'rs',
    ruby: 'rb',
    typescript: 'ts'
  };
  return extensions[language.toLowerCase()] || 'txt';
}

// Helper function to convert language_id to language name
function getLanguageFromId(languageId: number): string {
  const languages: Record<number, string> = {
    71: 'python',
    70: 'python',
    63: 'javascript',
    62: 'java',
    54: 'cpp',
    50: 'c',
    60: 'go',
    73: 'rust',
    72: 'ruby'
  };
  return languages[languageId] || 'python';
}

// ===== GENERIC /:challengeId ROUTE - MUST BE AFTER SPECIFIC ROUTES =====

// Get test cases for a challenge
router.get('/:challengeId/testcases', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found', testCases: [] });
      return;
    }
    
    // Return only visible test cases (not hidden ones)
    const visibleTestCases = (challenge.testCases || []).filter((tc: any) => !tc.isHidden);
    
    // Format for frontend
    const testCases = visibleTestCases.map((tc: any) => ({
      input: tc.input,
      output: tc.expectedOutput || tc.output || tc.expected,
      expectedOutput: tc.expectedOutput || tc.output || tc.expected
    }));
    
    res.json({ testCases });
  } catch (error: any) {
    res.status(500).json({ error: error.message, testCases: [] });
  }
});

// Get validation test cases (includes hidden ones - for submission validation only)
router.get('/:challengeId/validation-testcases', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found', testCases: [] });
      return;
    }
    
    // Return all test cases for validation
    const testCases = (challenge.testCases || []).map((tc: any) => ({
      input: tc.input,
      output: tc.expectedOutput || tc.output || tc.expected,
      expectedOutput: tc.expectedOutput || tc.output || tc.expected,
      isHidden: tc.isHidden || false
    }));
    
    res.json({ testCases });
  } catch (error: any) {
    res.status(500).json({ error: error.message, testCases: [] });
  }
});

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
