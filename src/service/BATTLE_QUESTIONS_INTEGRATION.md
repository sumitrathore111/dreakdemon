# Battle Questions Service Integration Guide

## Overview
The `battleQuestionsService.ts` provides functions to fetch random questions for various battle modes, integrating with the `questionsService.ts` to pull 3000 questions from GitHub without storing them in the database.

## Installation

The service is already created at: `src/service/battleQuestionsService.ts`

No additional dependencies are required. It uses:
- `questionsService.ts` - Core question fetching and caching
- TypeScript interfaces for type safety
- Native Fetch API (built-in)

## Services Available

### 1. **1v1 Battle (Head-to-Head)**
```typescript
import { getBattle1v1Question } from './service/battleQuestionsService';

// Get a random question for 1v1 battle
const question = await getBattle1v1Question('medium', 'arrays');
// Returns: BattleQuestion with timeLimit and pointsPerCorrect
```

**Features:**
- Single question between two players
- Automatic time limit based on difficulty:
  - Easy: 25 seconds
  - Medium: 35 seconds
  - Hard: 45 seconds
- Points vary by difficulty:
  - Easy: 100 points
  - Medium: 200 points
  - Hard: 300 points

### 2. **Tournament/Group Battles**
```typescript
import { getBattleTournamentQuestions } from './service/battleQuestionsService';

// Get 3 random questions for tournament
const questions = await getBattleTournamentQuestions(3, 'hard', 'dynamic-programming');
// Returns: BattleQuestion[] with progressive point multipliers
```

**Features:**
- Multiple questions in sequence
- Point value increases for later questions
- Points = (index + 1) × base_points

### 3. **Survival Mode**
```typescript
import { getSurvivalModeQuestions } from './service/battleQuestionsService';

// Get questions from mixed difficulties
const questions = await getSurvivalModeQuestions(5, 'arrays');
// Returns: BattleQuestion[] with cycled difficulty progression
```

**Features:**
- Questions alternate between easy, medium, hard
- Increasing time limits and points
- Easy: 30s, 150pts | Medium: 40s, 300pts | Hard: 50s, 500pts

### 4. **Team Battles**
```typescript
import { getTeamBattleQuestions } from './service/battleQuestionsService';

// Get questions for both teams (2 questions each)
const { team1, team2 } = await getTeamBattleQuestions(2, 'strings');
// Returns: { team1: BattleQuestion[], team2: BattleQuestion[] }
```

**Features:**
- Two sets of random questions
- Equal difficulty distribution
- Parallel generation for both teams

### 5. **Quick Battle (Speed Coding)**
```typescript
import { getQuickBattleQuestions } from './service/battleQuestionsService';

// Get 3 easy questions for quick battle
const questions = await getQuickBattleQuestions(3, 'easy');
// Returns: BattleQuestion[] with 30-second time limit each
```

**Features:**
- Pre-set to easy difficulty
- 30 seconds per question
- Fixed 150 points per question
- Great for warm-up battles

### 6. **Ranked Battle (ELO-Based)**
```typescript
import { getRankedBattleQuestion } from './service/battleQuestionsService';

// Get question based on user rating
const userRating = 1450;
const question = await getRankedBattleQuestion(userRating, 'arrays');
// Returns: BattleQuestion with appropriate difficulty
```

**Difficulty Mapping:**
- Rating < 1200: Easy
- Rating 1200-2000: Medium
- Rating > 2000: Hard

### 7. **Leaderboard Battles (Fixed Round Questions)**
```typescript
import { getLeaderboardBattleQuestions } from './service/battleQuestionsService';

// Get same questions for all round 5 participants
const questions = await getLeaderboardBattleQuestions(5);
// Returns: BattleQuestion[] (determined by round number)
```

**Features:**
- Ensures fair play - same questions for all competitors in a round
- Difficulty cycles: Round 0=Easy, Round 1=Medium, Round 2=Hard, etc.
- 3 questions per round

## Integration Examples

### In BattleLobby.tsx - Create Battle with Random Question
```typescript
import { getBattle1v1Question } from '../../service/battleQuestionsService';

const handleStartBattle = async () => {
  try {
    // Get a random question based on selected difficulty
    const question = await getBattle1v1Question(selectedDifficulty);
    
    if (!question) {
      alert('Failed to load question. Please try again.');
      return;
    }

    // Create battle with the fetched question
    const battleRef = await addDoc(collection(db, 'CodeArena_Battles'), {
      createdBy: user?.uid,
      difficulty: selectedDifficulty,
      entryFee: selectedEntry.fee,
      prize: selectedEntry.prize,
      timeLimit: question.timeLimit,
      status: 'waiting',
      question: {
        id: question.id,
        title: question.title,
        difficulty: question.difficulty,
        topic: question.topic
      },
      createdAt: Timestamp.now()
    });

    setMyBattleId(battleRef.id);
    setIsSearching(true);
  } catch (error) {
    console.error('Error creating battle:', error);
    alert('Failed to create battle. Please try again.');
  }
};
```

### In BattleRoom.tsx - Load Battle Question
```typescript
import { getFilteredQuestions } from '../../service/questionsService';

useEffect(() => {
  const loadBattleQuestion = async () => {
    if (!battle?.question?.id) return;

    try {
      // Get the specific question from our service
      const questions = await getFilteredQuestions(battle.question.difficulty, battle.question.topic);
      const currentQuestion = questions.find(q => q.id === battle.question.id);
      
      if (currentQuestion) {
        setChallenge({
          id: currentQuestion.id,
          title: currentQuestion.title,
          problemStatement: currentQuestion.description,
          difficulty: currentQuestion.difficulty,
          category: currentQuestion.topic
        });
        setTestCases(currentQuestion.testCases);
      }
    } catch (error) {
      console.error('Error loading battle question:', error);
    }
  };

  loadBattleQuestion();
}, [battle?.question]);
```

### Calculate Battle Score After Submission
```typescript
import { calculateBattleScore } from '../../service/battleQuestionsService';

const handleSubmitCode = async () => {
  // ... submission logic ...
  
  if (submissionResult.passed) {
    // Calculate score based on time taken
    const timeTaken = Math.floor((Date.now() - battleStartTime) / 1000);
    const score = calculateBattleScore(battleQuestion, true, timeTaken);
    
    // Award score
    console.log(`Correct! You earned ${score} points`);
  } else {
    const score = calculateBattleScore(battleQuestion, false, 0);
    console.log(`Wrong answer. 0 points awarded`);
  }
};
```

## Data Structure

### BattleQuestion Interface
```typescript
interface BattleQuestion extends Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  examples: string;
  constraints: string;
  language: string;
  sampleCode: string;
  testCases: Array<{ input: string; output: string }>;
  
  // Battle-specific fields
  timeLimit?: number;        // in seconds
  pointsPerCorrect?: number; // base points
}
```

## Battle Score Calculation

```typescript
calculateBattleScore(question, isCorrect, timeTaken) => number
```

**Formula:**
- If incorrect: 0 points
- If correct:
  ```
  basePoints = question.pointsPerCorrect
  timeRatio = (timeLimit - timeTaken) / timeLimit
  timeBonus = timeRatio × (basePoints × 0.5)
  totalScore = basePoints + timeBonus
  ```

**Example:**
- Question: Hard (300 points, 45s time limit)
- Solved in: 30 seconds
- timeRatio = (45 - 30) / 45 = 0.333
- timeBonus = 0.333 × 150 = 50 points
- **Total: 350 points**

## Error Handling

```typescript
import { getBattle1v1Question } from '../../service/battleQuestionsService';

try {
  const question = await getBattle1v1Question('medium');
  
  if (!question) {
    console.error('No questions available for difficulty: medium');
    // Fallback to easy
    return await getBattle1v1Question('easy');
  }
  
  // Use question
} catch (error) {
  console.error('Error fetching battle question:', error);
  // Graceful fallback
}
```

## Performance Considerations

1. **Caching:** All questions are cached for 1 hour in `questionsService.ts`
2. **First Load:** May take 2-5 seconds to fetch 3000 questions from GitHub
3. **Subsequent Calls:** Instant (served from memory cache)
4. **Random Selection:** O(1) operation - efficient even with 3000 questions

## Database Load Impact

**No database queries are made!**
- Questions fetched directly from GitHub API
- Cached locally in memory
- Battle metadata stored in Firestore (minimal)
- User submissions stored in Firestore

## Future Enhancements

1. **Advanced Filtering:**
   - Filter by multiple topics
   - Filter by company (LeetCode tag)
   - Filter by difficulty range

2. **Personalization:**
   - Questions based on user weak topics
   - Questions similar to ones user struggled with
   - Recommended difficulty progression

3. **Analytics:**
   - Track which questions are most commonly used in battles
   - Average completion time by question
   - Win rate by difficulty

4. **Caching Strategy:**
   - Persistent storage (IndexedDB) for offline support
   - Selective caching based on user preferences

## Troubleshooting

### Questions not loading?
- Check browser console for GitHub API errors
- Verify internet connection
- Clear browser cache and reload

### Time limit issues?
- Ensure `timeLimit` is passed correctly to question
- Check that submitted answer is within time window
- Verify Firestore timestamps are correct

### Score calculation errors?
- Verify `isCorrect` boolean is accurate
- Check `timeTaken` is in seconds (not milliseconds)
- Ensure `question.timeLimit` and `question.pointsPerCorrect` are defined

## Testing

```typescript
// Test fetching questions
const testQuestions = async () => {
  const q1 = await getBattle1v1Question('easy');
  console.log('Easy 1v1 question:', q1);

  const q2 = await getBattleTournamentQuestions(3, 'medium');
  console.log('Tournament questions:', q2);

  const score = calculateBattleScore(q1, true, 20);
  console.log('Score for 20sec submission:', score);
};

testQuestions();
```

## Integration Checklist

- [ ] Import `battleQuestionsService` functions where needed
- [ ] Add battle question fetching to lobby/battle creation
- [ ] Connect to BattleRoom for question display
- [ ] Implement score calculation in results
- [ ] Add loading states while fetching questions
- [ ] Add error handling and fallbacks
- [ ] Test with different difficulties and topics
- [ ] Verify time limits work correctly
- [ ] Track battle statistics in Firestore
- [ ] Add analytics for question selection patterns

## Support

For questions or issues:
1. Check the `questionsService.ts` for base functionality
2. Review existing BattleRoom.tsx implementation
3. Check browser console for error messages
4. Verify GitHub API is accessible in your region
