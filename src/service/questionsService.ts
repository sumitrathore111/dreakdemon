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
    input: string;
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
 * Get category-specific realistic questions with proper test cases
 */
const getCategoryQuestions = (category: string) => {
  const questionBank: Record<string, any> = {
    loops: {
      easy: [
        {
          title: 'Print Numbers 1 to N',
          description: 'Write a program to print all numbers from 1 to N, each on a new line.',
          constraints: '1 ≤ N ≤ 100',
          hint: 'Use a simple loop starting from 1 to N',
          test_cases: [
            { input: '5', expected_output: '1\n2\n3\n4\n5' },
            { input: '3', expected_output: '1\n2\n3' }
          ]
        },
        {
          title: 'Print Numbers from N to 1 (Reverse)',
          description: 'Write a program to print all numbers from N down to 1 in reverse order.',
          constraints: '1 ≤ N ≤ 100',
          hint: 'Use a loop starting from N down to 1',
          test_cases: [
            { input: '5', expected_output: '5\n4\n3\n2\n1' },
            { input: '10', expected_output: '10\n9\n8\n7\n6\n5\n4\n3\n2\n1' }
          ]
        },
        {
          title: 'Print Even Numbers',
          description: 'Print all even numbers from 1 to N.',
          constraints: '1 ≤ N ≤ 100',
          hint: 'Check if a number is divisible by 2',
          test_cases: [
            { input: '10', expected_output: '2\n4\n6\n8\n10' },
            { input: '5', expected_output: '2\n4' }
          ]
        },
        {
          title: 'Sum of N Numbers',
          description: 'Calculate the sum of first N natural numbers.',
          constraints: '1 ≤ N ≤ 1000',
          hint: 'Add all numbers from 1 to N in a loop',
          test_cases: [
            { input: '5', expected_output: '15' },
            { input: '10', expected_output: '55' }
          ]
        },
      ],
      medium: [
        {
          title: 'Print Multiplication Table',
          description: 'Print the multiplication table of N up to 10.',
          constraints: '1 ≤ N ≤ 100',
          hint: 'Use nested loops to print table format',
          test_cases: [
            { input: '2', expected_output: '2 4 6 8 10 12 14 16 18 20' },
            { input: '3', expected_output: '3 6 9 12 15 18 21 24 27 30' }
          ]
        },
        {
          title: 'Fibonacci Series',
          description: 'Print the first N Fibonacci numbers.',
          constraints: '1 ≤ N ≤ 50',
          hint: 'Use two variables to track previous and current numbers',
          test_cases: [
            { input: '5', expected_output: '0 1 1 2 3' },
            { input: '6', expected_output: '0 1 1 2 3 5' }
          ]
        },
        {
          title: 'Factorial of N',
          description: 'Calculate the factorial of N.',
          constraints: '0 ≤ N ≤ 20',
          hint: 'Multiply all numbers from 1 to N',
          test_cases: [
            { input: '5', expected_output: '120' },
            { input: '6', expected_output: '720' }
          ]
        },
      ],
      hard: [
        {
          title: 'Prime Numbers Up to N',
          description: 'Find all prime numbers up to N.',
          constraints: '1 ≤ N ≤ 1000',
          hint: 'Use Sieve of Eratosthenes for efficiency',
          test_cases: [
            { input: '10', expected_output: '2 3 5 7' },
            { input: '20', expected_output: '2 3 5 7 11 13 17 19' }
          ]
        },
        {
          title: 'Reverse a Number',
          description: 'Reverse the digits of a given number N.',
          constraints: '1 ≤ N ≤ 1000000',
          hint: 'Extract digits using modulo and division',
          test_cases: [
            { input: '12345', expected_output: '54321' },
            { input: '1000', expected_output: '0001' }
          ]
        },
        {
          title: 'Armstrong Number Checker',
          description: 'Check if a number is an Armstrong number (narcissistic number).',
          constraints: '1 ≤ N ≤ 1000000',
          hint: 'Sum of digits raised to power of number of digits',
          test_cases: [
            { input: '153', expected_output: 'true' },
            { input: '154', expected_output: 'false' }
          ]
        },
      ]
    },
    arrays: {
      easy: [
        {
          title: 'Array Sum',
          description: 'Find the sum of all elements in an array.',
          constraints: '1 ≤ size ≤ 100, -1000 ≤ elements ≤ 1000',
          hint: 'Initialize sum to 0 and add each element',
          test_cases: [
            { input: '5\n1 2 3 4 5', expected_output: '15' },
            { input: '3\n10 20 30', expected_output: '60' }
          ]
        },
        {
          title: 'Array Maximum',
          description: 'Find the maximum element in an array.',
          constraints: '1 ≤ size ≤ 100',
          hint: 'Compare each element with max variable',
          test_cases: [
            { input: '5\n3 1 4 1 5', expected_output: '5' },
            { input: '3\n10 5 8', expected_output: '10' }
          ]
        },
        {
          title: 'Array Reversal',
          description: 'Reverse an array.',
          constraints: '1 ≤ size ≤ 100',
          hint: 'Use two pointers or create new reversed array',
          test_cases: [
            { input: '5\n1 2 3 4 5', expected_output: '5 4 3 2 1' },
            { input: '3\na b c', expected_output: 'c b a' }
          ]
        },
      ],
      medium: [
        {
          title: 'Array Rotation',
          description: 'Rotate array elements by k positions.',
          constraints: '1 ≤ size ≤ 1000, 0 ≤ k ≤ 1000',
          hint: 'Use modulo to handle k > size',
          test_cases: [
            { input: '5 2\n1 2 3 4 5', expected_output: '4 5 1 2 3' },
            { input: '4 1\n1 2 3 4', expected_output: '4 1 2 3' }
          ]
        },
        {
          title: 'Merge Two Arrays',
          description: 'Merge two sorted arrays into one sorted array.',
          constraints: '1 ≤ size1, size2 ≤ 1000',
          hint: 'Use two pointers technique',
          test_cases: [
            { input: '3 3\n1 3 5\n2 4 6', expected_output: '1 2 3 4 5 6' },
            { input: '2 2\n1 5\n2 3', expected_output: '1 2 3 5' }
          ]
        },
        {
          title: 'Remove Duplicates',
          description: 'Remove duplicate elements from an array.',
          constraints: '1 ≤ size ≤ 1000',
          hint: 'Use a set or frequency map',
          test_cases: [
            { input: '5\n1 2 2 3 1', expected_output: '1 2 3' },
            { input: '4\n5 5 5 5', expected_output: '5' }
          ]
        },
      ],
      hard: [
        {
          title: 'Longest Subarray',
          description: 'Find the longest contiguous subarray with sum equal to target.',
          constraints: '1 ≤ size ≤ 10000',
          hint: 'Use prefix sum and hashmap',
          test_cases: [
            { input: '5 5\n1 2 3 1 4', expected_output: '3' },
            { input: '4 2\n1 1 1 1', expected_output: '2' }
          ]
        },
        {
          title: 'Median of Array',
          description: 'Find the median of an unsorted array.',
          constraints: '1 ≤ size ≤ 10000',
          hint: 'Sort or use heap/quickselect',
          test_cases: [
            { input: '5\n3 1 4 1 5', expected_output: '3' },
            { input: '4\n1 2 3 4', expected_output: '2.5' }
          ]
        },
        {
          title: 'Max Product Subarray',
          description: 'Find maximum product of a contiguous subarray.',
          constraints: '1 ≤ size ≤ 1000, -100 ≤ elements ≤ 100',
          hint: 'Track both max and min (for negatives)',
          test_cases: [
            { input: '4\n2 3 -2 4', expected_output: '6' },
            { input: '3\n-2 3 -4', expected_output: '24' }
          ]
        },
      ]
    },
    strings: {
      easy: [
        {
          title: 'String Length',
          description: 'Find the length of a string.',
          constraints: '0 ≤ length ≤ 1000',
          hint: 'Count characters or use length function',
          test_cases: [
            { input: 'hello', expected_output: '5' },
            { input: 'code', expected_output: '4' }
          ]
        },
        {
          title: 'Reverse String',
          description: 'Reverse a given string.',
          constraints: '0 ≤ length ≤ 1000',
          hint: 'Iterate from end to start',
          test_cases: [
            { input: 'hello', expected_output: 'olleh' },
            { input: 'racecar', expected_output: 'racecar' }
          ]
        },
        {
          title: 'Palindrome Check',
          description: 'Check if a string is a palindrome.',
          constraints: '1 ≤ length ≤ 1000',
          hint: 'Compare string with its reverse',
          test_cases: [
            { input: 'racecar', expected_output: 'true' },
            { input: 'hello', expected_output: 'false' }
          ]
        },
      ],
      medium: [
        {
          title: 'Anagram Checker',
          description: 'Check if two strings are anagrams.',
          constraints: '1 ≤ length ≤ 1000',
          hint: 'Sort characters or count frequency',
          test_cases: [
            { input: 'listen\nsilent', expected_output: 'true' },
            { input: 'hello\nworld', expected_output: 'false' }
          ]
        },
        {
          title: 'Word Frequency',
          description: 'Count frequency of each word in a string.',
          constraints: '1 ≤ length ≤ 1000',
          hint: 'Use a frequency map/dictionary',
          test_cases: [
            { input: 'hello world hello', expected_output: 'hello 2 world 1' },
            { input: 'a b c a', expected_output: 'a 2 b 1 c 1' }
          ]
        },
        {
          title: 'Substring Search',
          description: 'Find all occurrences of a substring in a string.',
          constraints: '1 ≤ length ≤ 1000',
          hint: 'Use string matching or KMP algorithm',
          test_cases: [
            { input: 'helloello\nell', expected_output: '1 5' },
            { input: 'aaaa\naa', expected_output: '0 1 2' }
          ]
        },
      ],
      hard: [
        {
          title: 'Longest Palindrome',
          description: 'Find the longest palindromic substring.',
          constraints: '1 ≤ length ≤ 1000',
          hint: 'Use expand around center or DP',
          test_cases: [
            { input: 'babad', expected_output: 'bab' },
            { input: 'banana', expected_output: 'anana' }
          ]
        },
        {
          title: 'Edit Distance',
          description: 'Find minimum edits to convert string1 to string2.',
          constraints: '1 ≤ length ≤ 500',
          hint: 'Use dynamic programming',
          test_cases: [
            { input: 'horse\nros', expected_output: '3' },
            { input: 'abc\nabc', expected_output: '0' }
          ]
        },
        {
          title: 'Pattern Matching',
          description: 'Implement pattern matching with wildcards.',
          constraints: '1 ≤ length ≤ 500',
          hint: 'Use dynamic programming or recursion',
          test_cases: [
            { input: 'aa\na', expected_output: 'false' },
            { input: 'aa\n*', expected_output: 'true' }
          ]
        },
      ]
    },
    dsa: {
      easy: [
        {
          title: 'Binary Search',
          description: 'Implement binary search on a sorted array.',
          constraints: '1 ≤ size ≤ 1000, sorted array',
          hint: 'Divide search space in half each iteration',
          test_cases: [
            { input: '5 3\n1 3 5 7 9', expected_output: '1' },
            { input: '5 7\n1 3 5 7 9', expected_output: '3' }
          ]
        },
        {
          title: 'Linear Search',
          description: 'Find the first occurrence of an element.',
          constraints: '1 ≤ size ≤ 1000',
          hint: 'Iterate through array checking each element',
          test_cases: [
            { input: '5 3\n1 3 5 3 9', expected_output: '1' },
            { input: '5 2\n1 3 5 7 9', expected_output: '-1' }
          ]
        },
        {
          title: 'Bubble Sort',
          description: 'Sort an array using bubble sort.',
          constraints: '1 ≤ size ≤ 100',
          hint: 'Compare adjacent elements and swap',
          test_cases: [
            { input: '5\n5 2 8 1 9', expected_output: '1 2 5 8 9' },
            { input: '3\n3 1 2', expected_output: '1 2 3' }
          ]
        },
      ],
      medium: [
        {
          title: 'Binary Tree Level Order',
          description: 'Print binary tree in level order (BFS).',
          constraints: '1 ≤ nodes ≤ 1000',
          hint: 'Use a queue for BFS traversal',
          test_cases: [
            { input: '7\n1 2 3 4 5 6 7', expected_output: '1\n2 3\n4 5 6 7' },
            { input: '3\n1 2 3', expected_output: '1\n2 3' }
          ]
        },
        {
          title: 'DFS Traversal',
          description: 'Perform depth-first search on a graph.',
          constraints: '1 ≤ nodes ≤ 1000',
          hint: 'Use recursion or explicit stack',
          test_cases: [
            { input: '4\n0 1\n0 2\n1 3\n2 3', expected_output: '0 1 3 2' },
            { input: '3\n0 1\n1 2', expected_output: '0 1 2' }
          ]
        },
        {
          title: 'Merge Sort',
          description: 'Sort an array using merge sort.',
          constraints: '1 ≤ size ≤ 1000',
          hint: 'Divide array and merge sorted subarrays',
          test_cases: [
            { input: '5\n5 2 8 1 9', expected_output: '1 2 5 8 9' },
            { input: '4\n4 3 2 1', expected_output: '1 2 3 4' }
          ]
        },
      ],
      hard: [
        {
          title: 'Dijkstra Algorithm',
          description: 'Find shortest path using Dijkstra algorithm.',
          constraints: '1 ≤ nodes ≤ 1000',
          hint: 'Use min-heap priority queue',
          test_cases: [
            { input: '4 5\n0 1 4\n0 2 1\n1 3 1\n2 1 2\n2 3 5', expected_output: '0 3 1 4' },
            { input: '3 3\n0 1 1\n0 2 4\n1 2 2', expected_output: '0 1 3' }
          ]
        },
        {
          title: 'LCS Problem',
          description: 'Find longest common subsequence of two strings.',
          constraints: '1 ≤ length ≤ 500',
          hint: 'Use dynamic programming',
          test_cases: [
            { input: 'AGGTAB\nGXTXAYB', expected_output: '5' },
            { input: 'abc\nabc', expected_output: '3' }
          ]
        },
        {
          title: 'Knapsack Problem',
          description: 'Solve 0/1 knapsack problem with given capacity.',
          constraints: '1 ≤ n ≤ 1000, capacity ≤ 10000',
          hint: 'Use dynamic programming',
          test_cases: [
            { input: '3 50\n10 20 30\n60 100 120', expected_output: '220' },
            { input: '4 5\n2 3 4 5\n3 4 5 6', expected_output: '10' }
          ]
        },
      ]
    },
    sql: {
      easy: [
        {
          title: 'SELECT All Columns',
          description: 'Write a query to select all columns from a table.',
          constraints: 'Standard SQL',
          hint: 'Use SELECT * FROM table_name',
          test_cases: [
            { input: 'SELECT * FROM users', expected_output: 'Query executed successfully' },
            { input: 'SELECT * FROM products', expected_output: 'Query executed successfully' }
          ]
        },
        {
          title: 'WHERE Clause',
          description: 'Write a query with WHERE clause to filter records.',
          constraints: 'Standard SQL',
          hint: 'Use WHERE condition',
          test_cases: [
            { input: 'SELECT * FROM users WHERE age > 18', expected_output: 'Filtered results' },
            { input: 'SELECT * FROM products WHERE price < 100', expected_output: 'Filtered results' }
          ]
        },
        {
          title: 'ORDER BY Clause',
          description: 'Write a query to order results.',
          constraints: 'Standard SQL',
          hint: 'Use ORDER BY column ASC/DESC',
          test_cases: [
            { input: 'SELECT * FROM users ORDER BY age DESC', expected_output: 'Sorted results' },
            { input: 'SELECT * FROM products ORDER BY price ASC', expected_output: 'Sorted results' }
          ]
        },
      ],
      medium: [
        {
          title: 'JOIN Operation',
          description: 'Write a query using INNER JOIN.',
          constraints: 'Standard SQL',
          hint: 'Use INNER JOIN ON condition',
          test_cases: [
            { input: 'SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id', expected_output: 'Joined results' },
            { input: 'SELECT * FROM products INNER JOIN categories ON products.cat_id = categories.id', expected_output: 'Joined results' }
          ]
        },
        {
          title: 'GROUP BY Query',
          description: 'Write a query using GROUP BY with aggregation.',
          constraints: 'Standard SQL',
          hint: 'Use GROUP BY with SUM/COUNT/AVG',
          test_cases: [
            { input: 'SELECT department, COUNT(*) FROM employees GROUP BY department', expected_output: 'Grouped results' },
            { input: 'SELECT category, SUM(price) FROM products GROUP BY category', expected_output: 'Grouped results' }
          ]
        },
        {
          title: 'Subquery',
          description: 'Write a query using subquery.',
          constraints: 'Standard SQL',
          hint: 'Use WHERE column IN (SELECT ...)',
          test_cases: [
            { input: 'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)', expected_output: 'Subquery results' },
            { input: 'SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products)', expected_output: 'Subquery results' }
          ]
        },
      ],
      hard: [
        {
          title: 'Complex JOIN',
          description: 'Write a complex query with multiple JOINs.',
          constraints: 'Standard SQL',
          hint: 'Use multiple INNER/LEFT JOINs',
          test_cases: [
            { input: 'SELECT * FROM users u JOIN orders o ON u.id = o.user_id JOIN items i ON o.id = i.order_id', expected_output: 'Complex joined results' },
            { input: 'SELECT * FROM departments d LEFT JOIN employees e ON d.id = e.dept_id', expected_output: 'Complex joined results' }
          ]
        },
        {
          title: 'Window Functions',
          description: 'Write a query using window functions.',
          constraints: 'Standard SQL',
          hint: 'Use ROW_NUMBER() OVER (PARTITION BY ...)',
          test_cases: [
            { input: 'SELECT *, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary) FROM employees', expected_output: 'Window function results' },
            { input: 'SELECT *, RANK() OVER (ORDER BY score DESC) FROM scores', expected_output: 'Window function results' }
          ]
        },
        {
          title: 'CTE Query',
          description: 'Write a query using Common Table Expressions.',
          constraints: 'Standard SQL',
          hint: 'Use WITH cte_name AS (...)',
          test_cases: [
            { input: 'WITH cte AS (SELECT * FROM users WHERE active = 1) SELECT * FROM cte WHERE age > 18', expected_output: 'CTE results' },
            { input: 'WITH RECURSIVE cte AS (SELECT 1 AS n UNION ALL SELECT n+1 FROM cte WHERE n < 10) SELECT * FROM cte', expected_output: 'Recursive CTE results' }
          ]
        },
      ]
    }
  };

  return questionBank[category] || { easy: [], medium: [], hard: [] };
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

  // Generate questions for each category with realistic problems and clear learning progression
  for (const category of categories) {
    // Calculate how many easy, medium, hard questions (30% - 40% - 30% distribution)
    const easyCount = Math.floor(category.count * 0.3);
    const mediumCount = Math.floor(category.count * 0.4);
    const hardCount = category.count - easyCount - mediumCount;

    // Define category-specific questions
    const categoryQuestions = getCategoryQuestions(category.name);

    // Helper to generate test case variations
    const generateTestCaseVariation = (baseTestCases: any[], index: number) => {
      const multipliers = [1, 1.5, 2, 2.5, 3, 4, 5];
      const multiplier = multipliers[index % multipliers.length];
      
      return baseTestCases.map(tc => {
        try {
          // Try to parse as number and scale
          const num = parseInt(tc.input);
          if (!isNaN(num) && num > 0) {
            return {
              input: String(Math.floor(num * multiplier)),
              expected_output: tc.expected_output
            };
          }
        } catch (e) {
          // If not a number, keep original
        }
        return tc;
      });
    };

    // Generate EASY questions - Foundation building
    for (let i = 0; i < easyCount; i++) {
      const baseTemplateIndex = i % categoryQuestions.easy.length;
      const baseTemplate = categoryQuestions.easy[baseTemplateIndex];
      const variationIndex = Math.floor(i / categoryQuestions.easy.length);
      
      const testCases = variationIndex === 0 
        ? baseTemplate.test_cases 
        : generateTestCaseVariation(baseTemplate.test_cases, variationIndex);
      
      sampleQuestions.push({
        id: `${category.prefix}_E_${String(i + 1).padStart(4, '0')}`,
        title: `${baseTemplate.title}${variationIndex > 0 ? ` #${variationIndex + 1}` : ''}`,
        description: `${baseTemplate.description}${variationIndex > 0 ? `\n\n✓ Problem Variant ${variationIndex + 1}` : '\n\n✓ Start here - Basic level'}`,
        category: category.name,
        difficulty: 'easy',
        coins: 10,
        constraints: baseTemplate.constraints,
        solution_hint: baseTemplate.hint,
        test_cases: testCases
      });
    }

    // Generate MEDIUM questions - Intermediate building
    for (let i = 0; i < mediumCount; i++) {
      const baseTemplateIndex = i % categoryQuestions.medium.length;
      const baseTemplate = categoryQuestions.medium[baseTemplateIndex];
      const variationIndex = Math.floor(i / categoryQuestions.medium.length);
      
      const testCases = variationIndex === 0 
        ? baseTemplate.test_cases 
        : generateTestCaseVariation(baseTemplate.test_cases, variationIndex);
      
      sampleQuestions.push({
        id: `${category.prefix}_M_${String(easyCount + i + 1).padStart(4, '0')}`,
        title: `${baseTemplate.title}${variationIndex > 0 ? ` #${variationIndex + 1}` : ''}`,
        description: `${baseTemplate.description}${variationIndex > 0 ? `\n\n✓ Problem Variant ${variationIndex + 1}` : '\n\n✓ Intermediate level - Apply concepts'}`,
        category: category.name,
        difficulty: 'medium',
        coins: 25,
        constraints: baseTemplate.constraints,
        solution_hint: baseTemplate.hint,
        test_cases: testCases
      });
    }

    // Generate HARD questions - Advanced combining
    for (let i = 0; i < hardCount; i++) {
      const baseTemplateIndex = i % categoryQuestions.hard.length;
      const baseTemplate = categoryQuestions.hard[baseTemplateIndex];
      const variationIndex = Math.floor(i / categoryQuestions.hard.length);
      
      const testCases = variationIndex === 0 
        ? baseTemplate.test_cases 
        : generateTestCaseVariation(baseTemplate.test_cases, variationIndex);
      
      sampleQuestions.push({
        id: `${category.prefix}_H_${String(easyCount + mediumCount + i + 1).padStart(4, '0')}`,
        title: `${baseTemplate.title}${variationIndex > 0 ? ` #${variationIndex + 1}` : ''}`,
        description: `${baseTemplate.description}${variationIndex > 0 ? `\n\n✓ Problem Variant ${variationIndex + 1}` : '\n\n✓ Hard level - Master the concept'}`,
        category: category.name,
        difficulty: 'hard',
        coins: 50,
        constraints: baseTemplate.constraints,
        solution_hint: baseTemplate.hint,
        test_cases: testCases
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
