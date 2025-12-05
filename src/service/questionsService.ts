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
    return await fetchQuestionsFromFiles();
  } catch (error) {
    console.error('❌ Error fetching questions from GitHub:', error);
    console.log('⚠️ Generating sample questions for testing...');
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
  const sampleQuestions: Question[] = [
    {
      id: 'ARR_E_0001',
      title: 'Print array elements',
      description: 'Write a program to print all elements of an array.',
      category: 'arrays',
      difficulty: 'easy',
      coins: 10,
      constraints: '1 <= n <= 100',
      solution_hint: 'Use a simple loop to iterate through array elements',
      test_cases: [
        { input: { arr: [1, 2, 3] }, expected_output: '1 2 3' },
      ]
    },
    {
      id: 'ARR_E_0002',
      title: 'Find maximum element',
      description: 'Find the maximum element in an array.',
      category: 'arrays',
      difficulty: 'easy',
      coins: 10,
      constraints: '1 <= n <= 100, -10^4 <= arr[i] <= 10^4',
      solution_hint: 'Compare each element with the current maximum',
      test_cases: [
        { input: { arr: [3, 7, 2, 9, 1] }, expected_output: '9' },
      ]
    },
    {
      id: 'STR_E_0001',
      title: 'String length',
      description: 'Find the length of a string without using built-in length function.',
      category: 'strings',
      difficulty: 'easy',
      coins: 10,
      constraints: '1 <= string length <= 1000',
      solution_hint: 'Count characters until end of string',
      test_cases: [
        { input: { str: 'hello' }, expected_output: '5' },
      ]
    },
    {
      id: 'LOOP_E_0001',
      title: 'Print numbers 1 to N',
      description: 'Write a program to print numbers from 1 to N.',
      category: 'loops',
      difficulty: 'easy',
      coins: 10,
      constraints: '1 <= N <= 100',
      solution_hint: 'Use a simple for loop from 1 to N',
      test_cases: [
        { input: { n: 5 }, expected_output: '1 2 3 4 5' },
      ]
    },
    {
      id: 'DSA_M_0001',
      title: 'Binary Search',
      description: 'Implement binary search to find an element in a sorted array.',
      category: 'dsa',
      difficulty: 'medium',
      coins: 25,
      constraints: '1 <= n <= 10^4, sorted array',
      solution_hint: 'Divide the search space in half each time',
      test_cases: [
        { input: { arr: [1, 3, 5, 7, 9], target: 5 }, expected_output: '2' },
      ]
    },
    {
      id: 'DSA_M_0002',
      title: 'Merge Sorted Arrays',
      description: 'Merge two sorted arrays into a single sorted array.',
      category: 'dsa',
      difficulty: 'medium',
      coins: 25,
      constraints: '1 <= n, m <= 10^4',
      solution_hint: 'Use two pointers to traverse both arrays',
      test_cases: [
        { input: { arr1: [1, 3, 5], arr2: [2, 4, 6] }, expected_output: '[1, 2, 3, 4, 5, 6]' },
      ]
    },
    {
      id: 'DSA_M_0003',
      title: 'Longest Common Substring',
      description: 'Find the longest common substring between two strings.',
      category: 'dsa',
      difficulty: 'medium',
      coins: 25,
      constraints: '1 <= str length <= 1000',
      solution_hint: 'Use dynamic programming with 2D array',
      test_cases: [
        { input: { str1: 'abcd', str2: 'acbd' }, expected_output: '2' },
      ]
    },
    {
      id: 'LOOP_M_0001',
      title: 'Fibonacci Series',
      description: 'Generate the first N numbers of the Fibonacci series.',
      category: 'loops',
      difficulty: 'medium',
      coins: 25,
      constraints: '1 <= N <= 50',
      solution_hint: 'Each number is the sum of the previous two',
      test_cases: [
        { input: { n: 5 }, expected_output: '[0, 1, 1, 2, 3]' },
      ]
    },
    {
      id: 'DSA_H_0001',
      title: 'Longest Increasing Subsequence',
      description: 'Find the length of the longest increasing subsequence in an array.',
      category: 'dsa',
      difficulty: 'hard',
      coins: 50,
      constraints: '1 <= n <= 1000, -10^4 <= arr[i] <= 10^4',
      solution_hint: 'Use dynamic programming approach',
      test_cases: [
        { input: { arr: [10, 9, 2, 5, 3, 7, 101, 18] }, expected_output: '4' },
      ]
    },
    {
      id: 'SQL_E_0001',
      title: 'SELECT all records',
      description: 'Write a SQL query to select all records from a table.',
      category: 'sql',
      difficulty: 'easy',
      coins: 10,
      constraints: 'Standard SQL syntax',
      solution_hint: 'Use SELECT * FROM table_name',
      test_cases: [
        { input: { table: 'users' }, expected_output: 'All user records' },
      ]
    }
  ];

  console.log('📝 Generated', sampleQuestions.length, 'sample questions for testing');
  cachedQuestions = sampleQuestions;
  cacheTimestamp = Date.now();
  return sampleQuestions;
};
