// Service to fetch 3000 questions from GitHub repository
// This keeps our database light by fetching data directly from GitHub

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  examples: string;
  constraints: string;
  language: string;
  sampleCode: string;
  testCases: Array<{
    input: string;
    output: string;
  }>;
}

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Amitsharma7300/3000-question/main';
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
      'questions.json',
      'all-questions.json',
      'data.json',
      '3000-questions.json',
      'questions/all.json',
      'src/questions.json'
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
    const topicMatch = content.match(/topic:\s*(.+?)$/m) || content.match(/category:\s*(.+?)$/m);
    const descriptionMatch = content.match(/##\s*Description\s*\n([\s\S]*?)(?=##|$)/);
    const examplesMatch = content.match(/##\s*Examples?\s*\n([\s\S]*?)(?=##|$)/);
    const constraintsMatch = content.match(/##\s*Constraints?\s*\n([\s\S]*?)(?=##|$)/);

    return {
      id: fileName.replace('.md', '').replace(/\s+/g, '-').toLowerCase(),
      title: titleMatch?.[1] || 'Untitled Problem',
      description: descriptionMatch?.[1]?.trim() || '',
      difficulty: (difficultyMatch?.[1]?.toLowerCase() || 'medium') as 'easy' | 'medium' | 'hard',
      topic: topicMatch?.[1]?.trim() || 'General',
      examples: examplesMatch?.[1]?.trim() || '',
      constraints: constraintsMatch?.[1]?.trim() || '',
      language: 'javascript',
      sampleCode: '// Write your solution here\n',
      testCases: [],
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
 * Get questions filtered by topic
 */
export const getQuestionsByTopic = async (topic: string): Promise<Question[]> => {
  const questions = await fetchAllQuestions();
  return questions.filter(
    q => q.topic.toLowerCase().includes(topic.toLowerCase())
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
      q => q.topic.toLowerCase().includes(topic.toLowerCase())
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
  const topics = new Set(questions.map(q => q.topic));
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
    stats.topics[q.topic] = (stats.topics[q.topic] || 0) + 1;
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
      q.topic.toLowerCase().includes(term)
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
      id: '1',
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.',
      difficulty: 'easy',
      topic: 'Arrays',
      examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] == 9',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
      language: 'javascript',
      sampleCode: 'var twoSum = function(nums, target) {\n    // Your solution here\n};',
      testCases: [
        { input: '[2,7,11,15], 9', output: '[0,1]' },
        { input: '[3,2,4], 6', output: '[1,2]' },
      ]
    },
    {
      id: '2',
      title: 'Reverse String',
      description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
      difficulty: 'easy',
      topic: 'Strings',
      examples: 'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
      constraints: '1 <= s.length <= 10^5\ns[i] is a printable ascii character.',
      language: 'javascript',
      sampleCode: 'var reverseString = function(s) {\n    // Your solution here\n};',
      testCases: [
        { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      ]
    },
    {
      id: '3',
      title: 'Binary Search',
      description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.',
      difficulty: 'easy',
      topic: 'Searching',
      examples: 'Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4',
      constraints: '1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4',
      language: 'javascript',
      sampleCode: 'var search = function(nums, target) {\n    // Your solution here\n};',
      testCases: [
        { input: '[-1,0,3,5,9,12], 9', output: '4' },
        { input: '[-1,0,3,5,9,12], 13', output: '-1' },
      ]
    },
    {
      id: '4',
      title: 'Valid Parentheses',
      description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
      difficulty: 'easy',
      topic: 'Stacks',
      examples: 'Input: s = "()"\nOutput: true\n\nInput: s = "([])"\nOutput: true',
      constraints: '1 <= s.length <= 10^4\ns consists of parentheses only "()"{}[]',
      language: 'javascript',
      sampleCode: 'var isValid = function(s) {\n    // Your solution here\n};',
      testCases: [
        { input: '"()"', output: 'true' },
        { input: '"([)]"', output: 'false' },
      ]
    },
    {
      id: '5',
      title: 'Merge Sorted Arrays',
      description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n.',
      difficulty: 'medium',
      topic: 'Arrays',
      examples: 'Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\nOutput: [1,2,2,3,5,6]',
      constraints: 'nums1.length == m + n\nnums2.length == n',
      language: 'javascript',
      sampleCode: 'var merge = function(nums1, m, nums2, n) {\n    // Your solution here\n};',
      testCases: [
        { input: '[1,2,3,0,0,0], 3, [2,5,6], 3', output: '[1,2,2,3,5,6]' },
      ]
    },
    {
      id: '6',
      title: 'Maximum Subarray',
      description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
      difficulty: 'medium',
      topic: 'Dynamic Programming',
      examples: 'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: [4,-1,2,1] has the largest sum = 6.',
      constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
      language: 'javascript',
      sampleCode: 'var maxSubArray = function(nums) {\n    // Your solution here\n};',
      testCases: [
        { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
        { input: '[5,4,-1,7,8]', output: '23' },
      ]
    },
    {
      id: '7',
      title: 'Longest Substring Without Repeating Characters',
      description: 'Given a string s, find the length of the longest substring without repeating characters.',
      difficulty: 'medium',
      topic: 'Strings',
      examples: 'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.',
      constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
      language: 'javascript',
      sampleCode: 'var lengthOfLongestSubstring = function(s) {\n    // Your solution here\n};',
      testCases: [
        { input: '"abcabcbb"', output: '3' },
        { input: '"bbbbb"', output: '1' },
      ]
    },
    {
      id: '8',
      title: 'Median of Two Sorted Arrays',
      description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
      difficulty: 'hard',
      topic: 'Arrays',
      examples: 'Input: nums1 = [1,3], nums2 = [2]\nOutput: 2.00000',
      constraints: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000',
      language: 'javascript',
      sampleCode: 'var findMedianSortedArrays = function(nums1, nums2) {\n    // Your solution here\n};',
      testCases: [
        { input: '[1,3], [2]', output: '2' },
        { input: '[1,2], [3,4]', output: '2.5' },
      ]
    },
    {
      id: '9',
      title: 'Regular Expression Matching',
      description: 'Given an input string s and a pattern p, implement regular expression matching with support for "." and "*".',
      difficulty: 'hard',
      topic: 'Dynamic Programming',
      examples: 'Input: s = "aa", p = "a"\nOutput: false\n\nInput: s = "aa", p = ".*"',
      constraints: '1 <= s.length <= 20\n1 <= p.length <= 30',
      language: 'javascript',
      sampleCode: 'var isMatch = function(s, p) {\n    // Your solution here\n};',
      testCases: [
        { input: '"aa", "a"', output: 'false' },
        { input: '"aa", "a*"', output: 'true' },
      ]
    },
    {
      id: '10',
      title: 'Container With Most Water',
      description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).',
      difficulty: 'medium',
      topic: 'Arrays',
      examples: 'Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49',
      constraints: 'n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4',
      language: 'javascript',
      sampleCode: 'var maxArea = function(height) {\n    // Your solution here\n};',
      testCases: [
        { input: '[1,8,6,2,5,4,8,3,7]', output: '49' },
      ]
    }
  ];

  console.log('📝 Generated', sampleQuestions.length, 'sample questions for testing');
  cachedQuestions = sampleQuestions;
  cacheTimestamp = Date.now();
  return sampleQuestions;
};
