// Service to fetch 3000 questions from GitHub repository
// This keeps our database light by fetching data directly from GitHub

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
    input: Record<string, any>;
    expected_output: string;
  }>;
}

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Amitsharma7300/3000-question/main/data/questions';
let cachedQuestions: Question[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch all questions from GitHub
 * Uses caching to reduce API calls
 */
export const fetchAllQuestions = async (): Promise<Question[]> => {
  // Return cached questions if still valid
  if (cachedQuestions && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('✓ Returning cached questions:', cachedQuestions.length);
    return cachedQuestions;
  }

  try {
    console.log('📥 Fetching questions from GitHub...');
    
    // Try multiple possible file names
    const possibleFiles = [
      'all_questions.json',
      'loops_questions.json',
      'arrays_questions.json',
      'strings_questions.json',
      'dsa_questions.json',
      'sql_questions.json'
    ];

    for (const fileName of possibleFiles) {
      try {
        const url = `${GITHUB_RAW_URL}/${fileName}`;
        console.log(`Trying: ${url}`);
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log(`✓ Successfully fetched ${fileName}:`, data.length, 'questions');
            cachedQuestions = data;
            cacheTimestamp = Date.now();
            return data;
          }
        }
      } catch (e) {
        console.log(`✗ ${fileName} not found`);
      }
    }

    // If JSON files don't work, try fetching from a CSV or index file
    console.log('Trying alternative file format...');
    const alternativeQuestions = await fetchQuestionsFromFiles();
    if (alternativeQuestions.length > 0) {
      return alternativeQuestions;
    }
    
    // If no questions found from GitHub, use sample questions
    console.log('⚠️ No questions found from GitHub, generating sample questions...');
    return generateSampleQuestions();
  } catch (error) {
    console.error('❌ Error fetching questions from GitHub:', error);
    console.log('⚠️ Falling back to sample questions...');
    return generateSampleQuestions();
  }
};

/**
 * Fetch questions from individual files if JSON is not available
 */
const fetchQuestionsFromFiles = async (): Promise<Question[]> => {
  const questions: Question[] = [];
  
  try {
    // Fetch the README or index to get file listing
    const indexResponse = await fetch(`${GITHUB_RAW_URL}/README.md`);
    const indexText = await indexResponse.text();
    
    // Parse file names from README
    const fileMatches = indexText.match(/\[.*?\]\((.*?\.md)\)/g) || [];
    
    for (const match of fileMatches) {
      const fileName = match.match(/\((.*?)\)/)?.[1];
      if (fileName) {
        try {
          const fileResponse = await fetch(`${GITHUB_RAW_URL}/${fileName}`);
          const fileContent = await fileResponse.text();
          const parsedQuestion = parseMarkdownQuestion(fileContent, fileName);
          if (parsedQuestion) {
            questions.push(parsedQuestion);
          }
        } catch (error) {
          console.error(`Error fetching ${fileName}:`, error);
        }
      }
    }
    
    cachedQuestions = questions;
    cacheTimestamp = Date.now();
    return questions;
  } catch (error) {
    console.error('Error fetching questions from files:', error);
    return [];
  }
};

/**
 * Parse markdown question format
 */
const parseMarkdownQuestion = (content: string, fileName: string): Question | null => {
  try {
    // Extract frontmatter or metadata
    const titleMatch = content.match(/^#\s+(.+?)$/m);
    const difficultyMatch = content.match(/difficulty:\s*(easy|medium|hard)/i);
    const categoryMatch = content.match(/category:\s*(.+?)$/m) || content.match(/topic:\s*(.+?)$/m);
    const descriptionMatch = content.match(/##\s*Description\s*\n([\s\S]*?)(?=##|$)/);
    const coinsMatch = content.match(/coins:\s*(\d+)/i);
    const hintsMatch = content.match(/hint:\s*(.+?)$/m) || content.match(/solution_hint:\s*(.+?)$/mi);
    const constraintsMatch = content.match(/##\s*Constraints?\s*\n([\s\S]*?)(?=##|$)/);

    return {
      id: fileName.replace('.md', '').replace(/\s+/g, '-').toLowerCase(),
      title: titleMatch?.[1] || 'Untitled Problem',
      description: descriptionMatch?.[1]?.trim() || '',
      category: categoryMatch?.[1]?.trim()?.toLowerCase() || 'general',
      difficulty: (difficultyMatch?.[1]?.toLowerCase() || 'medium') as 'easy' | 'medium' | 'hard',
      coins: parseInt(coinsMatch?.[1] || '10') || 10,
      constraints: constraintsMatch?.[1]?.trim() || '',
      solution_hint: hintsMatch?.[1]?.trim() || '',
      test_cases: [],
    };
  } catch (error) {
    console.error('Error parsing markdown question:', error);
    return null;
  }
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
 * Can filter by difficulty and topic
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
 * Generate sample questions for testing/fallback
 */
const generateSampleQuestions = (): Question[] => {
  const sampleQuestions: Question[] = [];
  let questionId = 1;

  // Generate 50 sample questions (10 per category, mix of difficulties)
  const loopsQuestions = [
    { title: 'Print numbers 1 to N', description: 'Write a program to print numbers from 1 to N', difficulty: 'easy' as const },
    { title: 'Print even numbers', description: 'Print all even numbers from 1 to N', difficulty: 'easy' as const },
    { title: 'Sum of first N numbers', description: 'Calculate sum of first N natural numbers', difficulty: 'easy' as const },
    { title: 'Factorial calculation', description: 'Calculate factorial of N', difficulty: 'easy' as const },
    { title: 'Fibonacci Series', description: 'Generate first N Fibonacci numbers', difficulty: 'medium' as const },
    { title: 'Prime number checker', description: 'Check if N is a prime number', difficulty: 'medium' as const },
    { title: 'Armstrong number', description: 'Check if number is Armstrong number', difficulty: 'medium' as const },
    { title: 'Nested loop patterns', description: 'Print pyramid patterns using nested loops', difficulty: 'medium' as const },
    { title: 'Complex number series', description: 'Generate complex number patterns', difficulty: 'hard' as const },
    { title: 'Optimized iteration', description: 'Solve loop problems with optimizations', difficulty: 'hard' as const },
  ];

  const arrayQuestions = [
    { title: 'Array traversal', description: 'Traverse and print all array elements', difficulty: 'easy' as const },
    { title: 'Find maximum', description: 'Find maximum element in array', difficulty: 'easy' as const },
    { title: 'Find minimum', description: 'Find minimum element in array', difficulty: 'easy' as const },
    { title: 'Array sum', description: 'Calculate sum of all array elements', difficulty: 'easy' as const },
    { title: 'Two pointer approach', description: 'Find pair with given sum using two pointers', difficulty: 'medium' as const },
    { title: 'Merge sorted arrays', description: 'Merge two sorted arrays', difficulty: 'medium' as const },
    { title: 'Subarray problems', description: 'Find subarray with maximum sum', difficulty: 'medium' as const },
    { title: 'Rotation problems', description: 'Rotate array elements', difficulty: 'medium' as const },
    { title: 'Complex array ops', description: 'Advanced array manipulation', difficulty: 'hard' as const },
    { title: 'Array optimization', description: 'Optimize array operations', difficulty: 'hard' as const },
  ];

  const stringQuestions = [
    { title: 'String length', description: 'Find length of string without built-in functions', difficulty: 'easy' as const },
    { title: 'Reverse string', description: 'Reverse a string', difficulty: 'easy' as const },
    { title: 'Palindrome check', description: 'Check if string is palindrome', difficulty: 'easy' as const },
    { title: 'String repetition', description: 'Repeat string N times', difficulty: 'easy' as const },
    { title: 'Anagram check', description: 'Check if two strings are anagrams', difficulty: 'medium' as const },
    { title: 'Substring search', description: 'Find substring in string', difficulty: 'medium' as const },
    { title: 'String permutations', description: 'Generate all permutations of string', difficulty: 'medium' as const },
    { title: 'Pattern matching', description: 'Match pattern in string', difficulty: 'medium' as const },
    { title: 'Complex string ops', description: 'Advanced string manipulation', difficulty: 'hard' as const },
    { title: 'String encoding', description: 'Encode/decode strings', difficulty: 'hard' as const },
  ];

  const dsaQuestions = [
    { title: 'Binary search', description: 'Implement binary search algorithm', difficulty: 'easy' as const },
    { title: 'Linear search', description: 'Implement linear search', difficulty: 'easy' as const },
    { title: 'Bubble sort', description: 'Implement bubble sort algorithm', difficulty: 'easy' as const },
    { title: 'Stack operations', description: 'Implement basic stack operations', difficulty: 'easy' as const },
    { title: 'Queue operations', description: 'Implement queue data structure', difficulty: 'medium' as const },
    { title: 'Linked list traversal', description: 'Traverse linked list', difficulty: 'medium' as const },
    { title: 'Tree traversal', description: 'Implement tree traversal methods', difficulty: 'medium' as const },
    { title: 'Graph algorithms', description: 'Implement BFS and DFS', difficulty: 'medium' as const },
    { title: 'Dynamic programming', description: 'Solve DP problems', difficulty: 'hard' as const },
    { title: 'Advanced algorithms', description: 'Complex algorithm problems', difficulty: 'hard' as const },
  ];

  const sqlQuestions = [
    { title: 'SELECT queries', description: 'Write basic SELECT queries', difficulty: 'easy' as const },
    { title: 'WHERE clause', description: 'Filter data with WHERE', difficulty: 'easy' as const },
    { title: 'ORDER BY', description: 'Sort results with ORDER BY', difficulty: 'easy' as const },
    { title: 'Basic aggregation', description: 'Use COUNT, SUM, AVG functions', difficulty: 'easy' as const },
    { title: 'JOIN operations', description: 'Perform INNER, LEFT, RIGHT JOINs', difficulty: 'medium' as const },
    { title: 'GROUP BY queries', description: 'Group data with GROUP BY', difficulty: 'medium' as const },
    { title: 'Subqueries', description: 'Write nested queries', difficulty: 'medium' as const },
    { title: 'HAVING clause', description: 'Filter groups with HAVING', difficulty: 'medium' as const },
    { title: 'Complex queries', description: 'Write complex multi-join queries', difficulty: 'hard' as const },
    { title: 'Query optimization', description: 'Optimize SQL queries', difficulty: 'hard' as const },
  ];

  const allQuestions = [
    ...loopsQuestions.map(q => ({ ...q, category: 'loops' })),
    ...arrayQuestions.map(q => ({ ...q, category: 'arrays' })),
    ...stringQuestions.map(q => ({ ...q, category: 'strings' })),
    ...dsaQuestions.map(q => ({ ...q, category: 'dsa' })),
    ...sqlQuestions.map(q => ({ ...q, category: 'sql' })),
  ];

  allQuestions.forEach(q => {
    const coinsMap = { easy: 10, medium: 25, hard: 50 };
    const categoryPrefix = q.category.substring(0, 3).toUpperCase();
    const diffPrefix = q.difficulty.charAt(0).toUpperCase();
    
    sampleQuestions.push({
      id: `${categoryPrefix}_${diffPrefix}_${String(questionId).padStart(4, '0')}`,
      title: q.title,
      description: q.description,
      category: q.category,
      difficulty: q.difficulty,
      coins: coinsMap[q.difficulty],
      constraints: `Standard constraints for ${q.category} problems`,
      solution_hint: `Hint: Think about the core concept of ${q.category}`,
      test_cases: [
        { 
          input: { case: 1 }, 
          expected_output: 'Sample output 1' 
        },
      ]
    });
    questionId++;
  });

  console.log('📝 Generated', sampleQuestions.length, 'comprehensive sample questions for testing');
  cachedQuestions = sampleQuestions;
  cacheTimestamp = Date.now();
  return sampleQuestions;
};
