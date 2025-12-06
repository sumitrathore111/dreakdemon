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
 * Generate 3000+ comprehensive sample questions for testing/fallback
 */
const generateSampleQuestions = (): Question[] => {
  const sampleQuestions: Question[] = [];
  let questionId = 1;

  // Generate questions for each category
  const categories = [
    {
      name: 'loops',
      prefix: 'LOOP',
      count: 450,
      samples: [
        'Print numbers 1 to N',
        'Print even numbers',
        'Sum of first N numbers',
        'Factorial calculation',
        'Fibonacci Series',
        'Prime number checker',
        'Armstrong number',
        'Nested loop patterns',
        'Complex number series',
        'Optimized iteration',
        'Pattern printing with loops',
        'Reverse digit printing',
        'Sum of digits',
        'Perfect number check',
        'GCD calculation using loops',
        'LCM calculation',
        'Multiplication table',
        'Nested pyramid patterns',
        'Hollow pyramid patterns',
        'Number triangle',
      ]
    },
    {
      name: 'arrays',
      prefix: 'ARR',
      count: 450,
      samples: [
        'Array traversal',
        'Find maximum',
        'Find minimum',
        'Array sum',
        'Two pointer approach',
        'Merge sorted arrays',
        'Subarray problems',
        'Rotation problems',
        'Complex array ops',
        'Array optimization',
        'Reverse array',
        'Array rotation left',
        'Array rotation right',
        'Find second largest',
        'Move zeros to end',
        'Duplicate elements',
        'Majority element',
        'Missing number',
        'First repeating element',
        'Rearrange positive and negative',
      ]
    },
    {
      name: 'strings',
      prefix: 'STR',
      count: 450,
      samples: [
        'String length',
        'Reverse string',
        'Palindrome check',
        'String repetition',
        'Anagram check',
        'Substring search',
        'String permutations',
        'Pattern matching',
        'Complex string ops',
        'String encoding',
        'Case conversion',
        'Character frequency',
        'Remove duplicates',
        'Longest substring',
        'String compression',
        'Word reversal',
        'Vowel counting',
        'String rotation',
        'Isomorphic strings',
        'Edit distance',
      ]
    },
    {
      name: 'dsa',
      prefix: 'DSA',
      count: 1050,
      samples: [
        'Binary search',
        'Linear search',
        'Bubble sort',
        'Stack operations',
        'Queue operations',
        'Linked list traversal',
        'Tree traversal',
        'Graph algorithms',
        'Dynamic programming',
        'Advanced algorithms',
        'Merge sort',
        'Quick sort',
        'Heap sort',
        'BFS traversal',
        'DFS traversal',
        'Binary tree height',
        'Tree level order',
        'Graph connectivity',
        'Dijkstra algorithm',
        'Knapsack problem',
        'LCS problem',
        'LIS problem',
        'Backtracking problems',
        'Divide and conquer',
        'Trie operations',
        'Segment trees',
        'Fenwick trees',
        'Union find',
        'Topological sort',
        'Strongly connected components',
      ]
    },
    {
      name: 'sql',
      prefix: 'SQL',
      count: 650,
      samples: [
        'SELECT queries',
        'WHERE clause',
        'ORDER BY',
        'Basic aggregation',
        'JOIN operations',
        'GROUP BY queries',
        'Subqueries',
        'HAVING clause',
        'Complex queries',
        'Query optimization',
        'DISTINCT keyword',
        'LIMIT and OFFSET',
        'LIKE operator',
        'IN operator',
        'BETWEEN operator',
        'NULL handling',
        'CASE expressions',
        'String functions',
        'Date functions',
        'Aggregate functions',
      ]
    },
  ];

  // Generate questions for each category
  for (const category of categories) {
    // Calculate how many easy, medium, hard questions
    const easyCount = Math.floor(category.count * 0.3);
    const mediumCount = Math.floor(category.count * 0.4);
    const hardCount = category.count - easyCount - mediumCount;

    // Generate easy questions
    for (let i = 0; i < easyCount; i++) {
      const sampleTitle = category.samples[i % category.samples.length];
      const variation = Math.floor(i / category.samples.length) + 1;
      
      sampleQuestions.push({
        id: `${category.prefix}_E_${String(i + 1).padStart(4, '0')}`,
        title: `${sampleTitle} - Variation ${variation}`,
        description: `Write a solution for: ${sampleTitle}. This is an easy level problem in the ${category.name} category.`,
        category: category.name,
        difficulty: 'easy',
        coins: 10,
        constraints: `Standard constraints for ${category.name} problems. Time complexity should be O(n) or better.`,
        solution_hint: `Hint: Think about using basic concepts and simple approaches for this ${category.name} problem.`,
        test_cases: [
          { 
            input: '5', 
            expected_output: '5\n4\n3\n2\n1' 
          },
          { 
            input: '10', 
            expected_output: '10\n9\n8\n7\n6\n5\n4\n3\n2\n1' 
          },
        ]
      });
    }

    // Generate medium questions
    for (let i = 0; i < mediumCount; i++) {
      const sampleTitle = category.samples[i % category.samples.length];
      const variation = Math.floor(i / category.samples.length) + 1;
      
      sampleQuestions.push({
        id: `${category.prefix}_M_${String(easyCount + i + 1).padStart(4, '0')}`,
        title: `${sampleTitle} - Advanced Variation ${variation}`,
        description: `Solve advanced: ${sampleTitle}. This is a medium level problem requiring intermediate understanding of ${category.name}.`,
        category: category.name,
        difficulty: 'medium',
        coins: 25,
        constraints: `Advanced constraints for ${category.name} problems. Consider edge cases and optimize for better complexity.`,
        solution_hint: `Hint: Consider using intermediate data structures or algorithms specific to ${category.name} for this problem.`,
        test_cases: [
          { 
            input: '5 3', 
            expected_output: '8' 
          },
          { 
            input: '10 7', 
            expected_output: '17' 
          },
          { 
            input: '100 50', 
            expected_output: '150' 
          },
        ]
      });
    }

    // Generate hard questions
    for (let i = 0; i < hardCount; i++) {
      const sampleTitle = category.samples[i % category.samples.length];
      const variation = Math.floor(i / category.samples.length) + 1;
      
      sampleQuestions.push({
        id: `${category.prefix}_H_${String(easyCount + mediumCount + i + 1).padStart(4, '0')}`,
        title: `${sampleTitle} - Expert Challenge ${variation}`,
        description: `Expert level challenge: ${sampleTitle}. This is a hard level problem requiring deep knowledge of advanced ${category.name} concepts.`,
        category: category.name,
        difficulty: 'hard',
        coins: 50,
        constraints: `Complex constraints for ${category.name} problems. Optimize for both time and space complexity. Handle all edge cases.`,
        solution_hint: `Hint: This requires advanced knowledge of ${category.name}. Consider multiple approaches and choose the most efficient one.`,
        test_cases: [
          { 
            input: '5', 
            expected_output: '120' 
          },
          { 
            input: '10', 
            expected_output: '3628800' 
          },
          { 
            input: '3', 
            expected_output: '6' 
          },
          { 
            input: '7', 
            expected_output: '5040' 
          },
        ]
      });
    }
  }

  console.log('📝 Generated', sampleQuestions.length, 'comprehensive programming questions');
  console.log('Breakdown:', {
    loops: sampleQuestions.filter(q => q.category === 'loops').length,
    arrays: sampleQuestions.filter(q => q.category === 'arrays').length,
    strings: sampleQuestions.filter(q => q.category === 'strings').length,
    dsa: sampleQuestions.filter(q => q.category === 'dsa').length,
    sql: sampleQuestions.filter(q => q.category === 'sql').length,
  });
  
  cachedQuestions = sampleQuestions;
  cacheTimestamp = Date.now();
  return sampleQuestions;
};
