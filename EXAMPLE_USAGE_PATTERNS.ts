// Example Usage Patterns for Questions Services
// Copy these examples into your components to use the battle questions service

// ============================================
// EXAMPLE 1: Practice Mode - Load and Filter
// ============================================

import { useState, useEffect } from 'react';
import { fetchAllQuestions, getFilteredQuestions, searchQuestions } from './service/questionsService';

function PracticeModeExample() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      const questions = await fetchAllQuestions();
      setAllQuestions(questions);
    };
    loadQuestions();
  }, []);

  // Apply filters
  useEffect(() => {
    const applyFilters = async () => {
      let results = allQuestions;

      // Filter by difficulty
      if (selectedDifficulty && selectedDifficulty !== 'all') {
        results = results.filter(q => q.difficulty === selectedDifficulty);
      }

      // Filter by topic
      if (selectedTopic) {
        results = results.filter(q => q.topic === selectedTopic);
      }

      // Apply search
      if (searchTerm) {
        results = results.filter(q =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredQuestions(results);
    };

    applyFilters();
  }, [allQuestions, selectedDifficulty, selectedTopic, searchTerm]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search questions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
        <option value="all">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <div>
        {filteredQuestions.map(q => (
          <div key={q.id}>
            <h3>{q.title}</h3>
            <p>{q.description}</p>
            <p>Difficulty: {q.difficulty} | Topic: {q.topic}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 2: 1v1 Battle - Create Battle Room
// ============================================

import { getBattle1v1Question } from './service/battleQuestionsService';
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from './service/Firebase';

async function createBattle1v1(userId, userRating, difficulty, entryFee, prize) {
  try {
    // Get a random question based on difficulty
    const question = await getBattle1v1Question(difficulty);

    if (!question) {
      throw new Error('Could not load question');
    }

    // Create battle in Firestore
    const battleRef = doc(collection(db, 'CodeArena_Battles'));
    await setDoc(battleRef, {
      id: battleRef.id,
      createdBy: userId,
      status: 'waiting',
      difficulty: difficulty,
      entryFee: entryFee,
      prize: prize,
      timeLimit: question.timeLimit,
      question: {
        id: question.id,
        title: question.title,
        difficulty: question.difficulty,
        topic: question.topic,
        timeLimit: question.timeLimit,
        pointsPerCorrect: question.pointsPerCorrect,
      },
      participants: [
        {
          odId: userId,
          rating: userRating,
          hasSubmitted: false,
        }
      ],
      createdAt: Timestamp.now(),
    });

    return battleRef.id;
  } catch (error) {
    console.error('Error creating battle:', error);
    return null;
  }
}

// ============================================
// EXAMPLE 3: Tournament - Multiple Questions
// ============================================

import { getBattleTournamentQuestions } from './service/battleQuestionsService';

async function createTournamentBattle(userId, difficulty = 'medium', topic = null) {
  try {
    // Get 3 questions for tournament
    const questions = await getBattleTournamentQuestions(3, difficulty, topic);

    // Store in battle document
    const battleRef = doc(collection(db, 'CodeArena_Battles'));
    await setDoc(battleRef, {
      id: battleRef.id,
      type: 'tournament',
      questions: questions.map(q => ({
        id: q.id,
        title: q.title,
        topic: q.topic,
        difficulty: q.difficulty,
        timeLimit: q.timeLimit,
        pointsPerCorrect: q.pointsPerCorrect,
      })),
      totalTimeLimit: questions.reduce((sum, q) => sum + (q.timeLimit || 0), 0),
      totalPoints: questions.reduce((sum, q) => sum + (q.pointsPerCorrect || 0), 0),
      participants: [{ odId: userId, currentQuestion: 0, score: 0 }],
      createdAt: Timestamp.now(),
    });

    return battleRef.id;
  } catch (error) {
    console.error('Error creating tournament:', error);
    return null;
  }
}

// ============================================
// EXAMPLE 4: Survival Mode - Mixed Difficulty
// ============================================

import { getSurvivalModeQuestions } from './service/battleQuestionsService';

async function createSurvivalBattle(userId, topic = null) {
  try {
    // Get questions with mixed difficulties
    const questions = await getSurvivalModeQuestions(5, topic);

    const battleRef = doc(collection(db, 'CodeArena_Battles'));
    await setDoc(battleRef, {
      id: battleRef.id,
      type: 'survival',
      mode: 'increasing-difficulty',
      questions: questions.map((q, idx) => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty,
        order: idx,
        timeLimit: q.timeLimit,
        pointsPerCorrect: q.pointsPerCorrect,
      })),
      totalQuestions: questions.length,
      participants: [{ odId: userId, currentQuestion: 0, score: 0, lives: 3 }],
      createdAt: Timestamp.now(),
    });

    return battleRef.id;
  } catch (error) {
    console.error('Error creating survival battle:', error);
    return null;
  }
}

// ============================================
// EXAMPLE 5: Quick Battle - Speed Coding
// ============================================

import { getQuickBattleQuestions } from './service/battleQuestionsService';

async function createQuickBattle(userId) {
  try {
    // Get 3 easy questions with 30-second limit each
    const questions = await getQuickBattleQuestions(3, 'easy');

    const battleRef = doc(collection(db, 'CodeArena_Battles'));
    await setDoc(battleRef, {
      id: battleRef.id,
      type: 'quick-battle',
      mode: 'speed-coding',
      questions: questions.map(q => ({
        id: q.id,
        title: q.title,
        timeLimit: q.timeLimit, // 30 seconds
        pointsPerCorrect: q.pointsPerCorrect,
      })),
      participants: [{ odId: userId, score: 0, questionsAttempted: 0 }],
      createdAt: Timestamp.now(),
    });

    return battleRef.id;
  } catch (error) {
    console.error('Error creating quick battle:', error);
    return null;
  }
}

// ============================================
// EXAMPLE 6: Ranked Battle - ELO-Based
// ============================================

import { getRankedBattleQuestion } from './service/battleQuestionsService';

async function createRankedBattle(userId, userRating) {
  try {
    // Question difficulty determined by user rating
    const question = await getRankedBattleQuestion(userRating);

    if (!question) {
      throw new Error('Could not load ranked question');
    }

    const battleRef = doc(collection(db, 'CodeArena_Battles'));
    await setDoc(battleRef, {
      id: battleRef.id,
      type: 'ranked',
      question: {
        id: question.id,
        title: question.title,
        difficulty: question.difficulty,
        timeLimit: question.timeLimit,
      },
      minRating: Math.max(800, userRating - 200),
      maxRating: userRating + 200,
      participants: [{ odId: userId, rating: userRating }],
      createdAt: Timestamp.now(),
    });

    return battleRef.id;
  } catch (error) {
    console.error('Error creating ranked battle:', error);
    return null;
  }
}

// ============================================
// EXAMPLE 7: Calculate Battle Score
// ============================================

import { calculateBattleScore } from './service/battleQuestionsService';

function handleQuestionSubmission(question, isCorrect, timeTaken) {
  const score = calculateBattleScore(question, isCorrect, timeTaken);

  console.log(`Result: ${isCorrect ? 'Correct!' : 'Wrong!'}`);
  console.log(`Time taken: ${timeTaken}s / ${question.timeLimit}s`);
  console.log(`Points earned: ${score}`);

  // Update battle results
  updateBattleResults(score);
}

// Example:
// Question: Medium difficulty (200 points, 35s limit)
// Correct: Yes
// Time: 20 seconds
// Expected Score: 200 + (15/35 × 100) = 200 + 42 = 242 points

// ============================================
// EXAMPLE 8: Team Battle - Parallel Questions
// ============================================

import { getTeamBattleQuestions } from './service/battleQuestionsService';

async function createTeamBattle(team1Users, team2Users, difficulty = 'medium') {
  try {
    // Get questions for both teams
    const { team1, team2 } = await getTeamBattleQuestions(3, null);

    const battleRef = doc(collection(db, 'CodeArena_Battles'));
    await setDoc(battleRef, {
      id: battleRef.id,
      type: 'team-battle',
      team1: {
        questions: team1,
        members: team1Users,
        score: 0,
      },
      team2: {
        questions: team2,
        members: team2Users,
        score: 0,
      },
      questionsPerTeam: 3,
      createdAt: Timestamp.now(),
    });

    return battleRef.id;
  } catch (error) {
    console.error('Error creating team battle:', error);
    return null;
  }
}

// ============================================
// EXAMPLE 9: Get Statistics
// ============================================

import { getQuestionsStatistics } from './service/questionsService';

async function displayStatistics() {
  const stats = await getQuestionsStatistics();

  console.log(`Total questions: ${stats.total}`);
  console.log(`Easy: ${stats.byDifficulty.easy}`);
  console.log(`Medium: ${stats.byDifficulty.medium}`);
  console.log(`Hard: ${stats.byDifficulty.hard}`);
  console.log(`Topics: ${Object.keys(stats.byTopic).join(', ')}`);
}

// ============================================
// EXAMPLE 10: Handle Submission With Results
// ============================================

async function handleCodeSubmission(battleQuestion, code, language, testCases) {
  try {
    // Execute code against test cases
    const results = await executeCode(code, language, testCases);

    // Check if all tests passed
    const allPassed = results.every(r => r.passed);

    // Calculate score
    const timeTaken = Math.floor((Date.now() - battleStartTime) / 1000);
    const score = calculateBattleScore(battleQuestion, allPassed, timeTaken);

    // Display results
    return {
      passed: allPassed,
      passedCount: results.filter(r => r.passed).length,
      totalCount: results.length,
      score: score,
      details: results,
    };
  } catch (error) {
    console.error('Error executing code:', error);
    return {
      passed: false,
      error: error.message,
    };
  }
}

// ============================================
// USAGE SUMMARY
// ============================================

/*
IMPORT PATTERNS:

1. For Practice:
   import { fetchAllQuestions, getFilteredQuestions } from './service/questionsService';

2. For Battles:
   import { getBattle1v1Question, calculateBattleScore } from './service/battleQuestionsService';

3. For All Questions Services:
   import * from './service/questionsService';

4. For All Battle Services:
   import * from './service/battleQuestionsService';

KEY FUNCTIONS:

Questions Service:
✓ fetchAllQuestions() - Get all 3000 questions
✓ getFilteredQuestions(difficulty?, topic?) - Filter questions
✓ getRandomQuestion(difficulty?, topic?) - Single random
✓ getRandomQuestions(count, difficulty?, topic?) - Multiple random
✓ searchQuestions(term) - Search questions
✓ getQuestionsStatistics() - Get statistics
✓ getAllTopics() - Get unique topics

Battle Service:
✓ getBattle1v1Question(difficulty?, topic?) - 1v1
✓ getBattleTournamentQuestions(count?, difficulty?, topic?) - Tournament
✓ getSurvivalModeQuestions(count?, topic?) - Survival
✓ getTeamBattleQuestions(questionsPerTeam?, topic?) - Team
✓ getQuickBattleQuestions(count?, difficulty?) - Quick
✓ getRankedBattleQuestion(rating, topic?) - Ranked
✓ getLeaderboardBattleQuestions(roundNumber) - Leaderboard
✓ calculateBattleScore(question, isCorrect, timeTaken) - Score

PERFORMANCE:
• First load: 2-5 seconds
• Subsequent: < 100ms (cached)
• No database queries for questions
• 1-hour cache duration
• Instant random selection
*/
