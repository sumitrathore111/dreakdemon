// Service to fetch 1000 well-structured questions from multiple sources
// Database-light: Primary = GitHub, Secondary = public/questions.json, Tertiary = bundled import
// Includes filtering, searching, and randomization

// Import local questions as fallback
import questionsData from '../../questions.json';

export interface Question {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  coins: number;
  constraints: string;
  solution_hint: string;
  test_cases: Array<{
    input: string;
    expected_output: string;
  }>;
}

// GitHub raw content URL for our questions repository
const GITHUB_QUESTIONS_URL = 'https://github.com/moohhiit/NextStep/blob/main/questions.json';
// Local public folder fallback
const LOCAL_QUESTIONS_URL = '/questions.json';

let cachedQuestions: Question[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch all questions from multiple sources with fallback chain:
 * 1. GitHub repository (if available)
 * 2. Local public/questions.json (static asset)
 * 3. Bundled questions.json import
 * Uses caching to reduce API calls
 */
export const fetchAllQuestions = async (): Promise<Question[]> => {
  // Return cached questions if still valid
  if (cachedQuestions && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('✓ Using cached questions:', cachedQuestions.length);
    return cachedQuestions;
  }

  // Try GitHub first
  try {
    console.log('📥 Attempting to fetch from GitHub...');
    const response = await fetch(GITHUB_QUESTIONS_URL);
    
    if (response.ok) {
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        console.log(`✓ Loaded ${data.length} questions from GitHub`);
        cachedQuestions = data;
        cacheTimestamp = Date.now();
        return data;
      }
    }
  } catch (githubError) {
    console.warn('⚠️ GitHub fetch failed, trying local...');
  }

  // Try local public folder
  try {
    console.log('📥 Attempting to fetch from local /questions.json...');
    const response = await fetch(LOCAL_QUESTIONS_URL);
    
    if (response.ok) {
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        console.log(`✓ Loaded ${data.length} questions from local file`);
        cachedQuestions = data;
        cacheTimestamp = Date.now();
        return data;
      }
    }
  } catch (localError) {
    console.warn('⚠️ Local file fetch failed, using bundled data...');
  }

  // Use bundled questions as final fallback
  try {
    const localQuestions = questionsData as Question[];
    
    if (Array.isArray(localQuestions) && localQuestions.length > 0) {
      console.log(`✓ Loaded ${localQuestions.length} questions from bundled data`);
      cachedQuestions = localQuestions;
      cacheTimestamp = Date.now();
      return localQuestions;
    }
  } catch (bundleError) {
    console.error('❌ Failed to load bundled questions:', bundleError);
  }

  console.error('❌ All question sources failed');
  return [];
};

/**
 * Get questions filtered by difficulty
 */
export const getQuestionsByDifficulty = async (
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Question[]> => {
  const questions = await fetchAllQuestions();
  return questions.filter(q => q.difficulty === difficulty);
};

/**
 * Get questions filtered by category
 */
export const getQuestionsByTopic = async (topic: string): Promise<Question[]> => {
  const questions = await fetchAllQuestions();
  return questions.filter(
    q => q.category.toLowerCase().includes(topic.toLowerCase())
  );
};

/**
 * Get questions filtered by difficulty and topic
 */
export const getFilteredQuestions = async (
  difficulty?: 'easy' | 'medium' | 'hard',
  topic?: string
): Promise<Question[]> => {
  let questions = await fetchAllQuestions();

  if (difficulty) {
    questions = questions.filter(q => q.difficulty === difficulty);
  }

  if (topic) {
    questions = questions.filter(
      q => q.category.toLowerCase().includes(topic.toLowerCase())
    );
  }

  return questions;
};

/**
 * Get a random question for battles
 */
export const getRandomQuestion = async (
  difficulty?: 'easy' | 'medium' | 'hard',
  topic?: string
): Promise<Question | null> => {
  const questions = await getFilteredQuestions(difficulty, topic);
  
  if (questions.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
};

/**
 * Get multiple random questions for battle tournament
 */
export const getRandomQuestions = async (
  count: number,
  difficulty?: 'easy' | 'medium' | 'hard',
  topic?: string
): Promise<Question[]> => {
  const questions = await getFilteredQuestions(difficulty, topic);
  const selected: Question[] = [];

  if (questions.length <= count) {
    return questions;
  }

  const indices = new Set<number>();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * questions.length));
  }

  for (const index of indices) {
    selected.push(questions[index]);
  }

  return selected;
};

/**
 * Get all unique topics
 */
export const getAllTopics = async (): Promise<string[]> => {
  const questions = await fetchAllQuestions();
  const topics = new Set(questions.map(q => q.category));
  return Array.from(topics).sort();
};

/**
 * Get statistics about questions
 */
export const getQuestionsStatistics = async () => {
  const questions = await fetchAllQuestions();
  
  const stats = {
    total: questions.length,
    byDifficulty: {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    },
    topics: {} as Record<string, number>,
  };

  questions.forEach(q => {
    stats.topics[q.category] = (stats.topics[q.category] || 0) + 1;
  });

  return stats;
};

/**
 * Search questions by title or description
 */
export const searchQuestions = async (searchTerm: string): Promise<Question[]> => {
  const questions = await fetchAllQuestions();
  const term = searchTerm.toLowerCase();
  
  return questions.filter(
    q => 
      q.title.toLowerCase().includes(term) ||
      q.description.toLowerCase().includes(term) ||
      q.category.toLowerCase().includes(term)
  );
};

/**
 * Get single question by ID
 */
export const getQuestionById = async (id: string): Promise<Question | null> => {
  const questions = await fetchAllQuestions();
  return questions.find(q => q.id === id) || null;
};

/**
 * Clear cache (useful for testing or manual refresh)
 */
export const clearQuestionsCache = () => {
  cachedQuestions = null;
  cacheTimestamp = 0;
};

/**
 * Get statistics for dashboard
 */
export const getQuestionsOverview = async () => {
  try {
    const stats = await getQuestionsStatistics();
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error getting questions overview:', error);
    return {
      success: false,
      error: 'Failed to fetch questions overview'
    };
  }
};
