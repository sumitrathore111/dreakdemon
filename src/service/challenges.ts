// Challenges Service
// Manages local challenges with proper test cases for Judge0 validation

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    Timestamp,
    where
} from 'firebase/firestore';
import { db } from './Firebase';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  points: number;
}

export interface ChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ChallengeHint {
  text: string;
  coinCost: number;
}

export interface StarterCode {
  javascript?: string;
  python?: string;
  java?: string;
  cpp?: string;
}

export interface Challenge {
  id?: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  points: number;
  coinReward: number;
  timeLimit: number;
  memoryLimit: number;
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: ChallengeExample[];
  testCases: TestCase[];
  hints?: ChallengeHint[];
  starterCode?: StarterCode;
  solution?: string;
  solutionExplanation?: string;
  tags: string[];
  isPremium: boolean;
  isDaily: boolean;
  totalSubmissions: number;
  successfulSubmissions: number;
  acceptanceRate: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Collection name
const CHALLENGES_COLLECTION = 'CodeArena_Challenges';

// Fetch all challenges
export const fetchAllChallenges = async (): Promise<Challenge[]> => {
  try {
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    const snapshot = await getDocs(challengesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Challenge[];
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }
};

// Fetch challenges by difficulty
export const fetchChallengesByDifficulty = async (
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  maxResults: number = 50
): Promise<Challenge[]> => {
  try {
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    const q = query(
      challengesRef,
      where('difficulty', '==', difficulty),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Challenge[];
  } catch (error) {
    console.error('Error fetching challenges by difficulty:', error);
    return [];
  }
};

// Fetch challenges by category
export const fetchChallengesByCategory = async (
  category: string,
  maxResults: number = 50
): Promise<Challenge[]> => {
  try {
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    const q = query(
      challengesRef,
      where('category', '==', category),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Challenge[];
  } catch (error) {
    console.error('Error fetching challenges by category:', error);
    return [];
  }
};

// Fetch single challenge by ID
export const fetchChallengeById = async (challengeId: string): Promise<Challenge | null> => {
  try {
    const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    const snapshot = await getDoc(challengeRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Challenge;
    }
    return null;
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return null;
  }
};

// Get random challenge for battle
export const getRandomBattleChallenge = async (
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Challenge | null> => {
  try {
    const challenges = await fetchChallengesByDifficulty(difficulty, 100);
    
    if (challenges.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * challenges.length);
    return challenges[randomIndex];
  } catch (error) {
    console.error('Error getting random battle challenge:', error);
    return null;
  }
};

// Get test cases for a challenge (visible only for practice)
export const getChallengeTestCases = async (
  challengeId: string,
  includeHidden: boolean = false
): Promise<{ input: string; output: string }[]> => {
  try {
    const challenge = await fetchChallengeById(challengeId);
    
    if (!challenge) {
      return [];
    }
    
    const testCases = challenge.testCases || [];
    
    if (includeHidden) {
      return testCases.map(tc => ({
        input: tc.input,
        output: tc.expectedOutput
      }));
    }
    
    // Only return visible test cases for display
    return testCases
      .filter(tc => !tc.isHidden)
      .map(tc => ({
        input: tc.input,
        output: tc.expectedOutput
      }));
  } catch (error) {
    console.error('Error getting test cases:', error);
    return [];
  }
};

// Get all test cases for submission validation (includes hidden)
export const getValidationTestCases = async (
  challengeId: string
): Promise<{ input: string; output: string }[]> => {
  return getChallengeTestCases(challengeId, true);
};

// Add a new challenge
export const addChallenge = async (challenge: Omit<Challenge, 'id'>): Promise<string | null> => {
  try {
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    const docRef = await addDoc(challengesRef, {
      ...challenge,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding challenge:', error);
    return null;
  }
};

// Get available categories
export const getAvailableCategories = async (): Promise<string[]> => {
  try {
    const challenges = await fetchAllChallenges();
    const categories = new Set<string>();
    
    challenges.forEach(c => {
      if (c.category) {
        categories.add(c.category);
      }
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

// Get available tags
export const getAvailableTags = async (): Promise<string[]> => {
  try {
    const challenges = await fetchAllChallenges();
    const tags = new Set<string>();
    
    challenges.forEach(c => {
      if (c.tags) {
        c.tags.forEach(tag => tags.add(tag));
      }
    });
    
    return Array.from(tags).sort();
  } catch (error) {
    console.error('Error getting tags:', error);
    return [];
  }
};

// Search challenges
export const searchChallenges = async (
  searchTerm: string,
  filters?: {
    difficulty?: string;
    category?: string;
    tags?: string[];
  }
): Promise<Challenge[]> => {
  try {
    let challenges = await fetchAllChallenges();
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      challenges = challenges.filter(c => 
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.tags.some(t => t.toLowerCase().includes(term))
      );
    }
    
    // Apply difficulty filter
    if (filters?.difficulty) {
      challenges = challenges.filter(c => c.difficulty === filters.difficulty);
    }
    
    // Apply category filter
    if (filters?.category) {
      challenges = challenges.filter(c => c.category === filters.category);
    }
    
    // Apply tags filter
    if (filters?.tags && filters.tags.length > 0) {
      challenges = challenges.filter(c => 
        filters.tags!.some(tag => c.tags.includes(tag))
      );
    }
    
    return challenges;
  } catch (error) {
    console.error('Error searching challenges:', error);
    return [];
  }
};

// Default challenges to use if Firebase is empty
export const defaultChallenges: Omit<Challenge, 'id'>[] = [
  {
    title: 'Two Sum',
    description: 'Find two numbers that add up to target',
    difficulty: 'easy',
    category: 'Arrays',
    points: 10,
    coinReward: 10,
    timeLimit: 15,
    memoryLimit: 256,
    problemStatement: `<div class="problem-statement">
      <div class="header">
        <div class="title">Two Sum</div>
        <div class="time-limit">Time limit: 2 seconds</div>
        <div class="memory-limit">Memory limit: 256 MB</div>
      </div>
      <div style="margin: 15px 0;">
        Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.
      </div>
      <div style="margin: 15px 0;">
        You may assume that each input would have exactly one solution, and you may not use the same element twice.
      </div>
      <div style="margin: 15px 0;">
        You can return the answer in any order.
      </div>
      <div class="section-title">Input</div>
      <div>
        First line contains n (size of array) and target.<br/>
        Second line contains n space-separated integers.
      </div>
      <div class="section-title">Output</div>
      <div>Two space-separated indices of the numbers that add up to target.</div>
      <div class="section-title">Constraints</div>
      <ul>
        <li>2 ≤ nums.length ≤ 10<sup>4</sup></li>
        <li>-10<sup>9</sup> ≤ nums[i] ≤ 10<sup>9</sup></li>
        <li>-10<sup>9</sup> ≤ target ≤ 10<sup>9</sup></li>
        <li>Only one valid answer exists.</li>
      </ul>
    </div>`,
    inputFormat: 'First line contains n (size of array) and target. Second line contains n space-separated integers.',
    outputFormat: 'Two space-separated indices of the numbers that add up to target.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: '4 9\n2 7 11 15',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: '3 6\n3 2 4',
        output: '1 2',
        explanation: 'nums[1] + nums[2] = 2 + 4 = 6'
      }
    ],
    testCases: [
      { input: '4 9\n2 7 11 15', expectedOutput: '0 1', isHidden: false, points: 25 },
      { input: '3 6\n3 2 4', expectedOutput: '1 2', isHidden: false, points: 25 },
      { input: '2 6\n3 3', expectedOutput: '0 1', isHidden: true, points: 25 },
      { input: '5 10\n1 2 3 4 6', expectedOutput: '3 4', isHidden: true, points: 25 },
    ],
    hints: [
      { text: 'Try using a hash map to store the complement of each number.', coinCost: 30 },
      { text: 'For each number, check if (target - num) exists in the hash map.', coinCost: 50 }
    ],
    starterCode: {
      python: `def two_sum(nums, target):
    # Your code here
    pass

# Read input
import sys
lines = sys.stdin.read().strip().split('\\n')
n, target = map(int, lines[0].split())
nums = list(map(int, lines[1].split()))
result = two_sum(nums, target)
print(' '.join(map(str, result)))`,
      javascript: `function twoSum(nums, target) {
  // Your code here
  
}

// Read input
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];

rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const [n, target] = lines[0].split(' ').map(Number);
  const nums = lines[1].split(' ').map(Number);
  const result = twoSum(nums, target);
  console.log(result.join(' '));
});`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}

int main() {
    int n, target;
    cin >> n >> target;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] first = sc.nextLine().split(" ");
        int n = Integer.parseInt(first[0]);
        int target = Integer.parseInt(first[1]);
        int[] nums = new int[n];
        String[] numsStr = sc.nextLine().split(" ");
        for (int i = 0; i < n; i++) {
            nums[i] = Integer.parseInt(numsStr[i]);
        }
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`
    },
    tags: ['array', 'hash-table'],
    isPremium: false,
    isDaily: false,
    totalSubmissions: 0,
    successfulSubmissions: 0,
    acceptanceRate: 0
  },
  {
    title: 'Valid Parentheses',
    description: 'Check if string of brackets is valid',
    difficulty: 'easy',
    category: 'Strings',
    points: 10,
    coinReward: 100,
    timeLimit: 10,
    memoryLimit: 256,
    problemStatement: `<div class="problem-statement">
      <div class="header">
        <div class="title">Valid Parentheses</div>
        <div class="time-limit">Time limit: 1 second</div>
        <div class="memory-limit">Memory limit: 256 MB</div>
      </div>
      <div style="margin: 15px 0;">
        Given a string <code>s</code> containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
      </div>
      <div style="margin: 15px 0;">
        An input string is valid if:
        <ol>
          <li>Open brackets must be closed by the same type of brackets.</li>
          <li>Open brackets must be closed in the correct order.</li>
          <li>Every close bracket has a corresponding open bracket of the same type.</li>
        </ol>
      </div>
      <div class="section-title">Input</div>
      <div>A single line containing the string s.</div>
      <div class="section-title">Output</div>
      <div>Print "true" if valid, "false" otherwise.</div>
    </div>`,
    inputFormat: 'A single line containing the string s.',
    outputFormat: 'Print "true" if valid, "false" otherwise.',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    examples: [
      { input: '()', output: 'true', explanation: 'Single pair of matching parentheses.' },
      { input: '()[]{}', output: 'true', explanation: 'All brackets are properly matched.' },
      { input: '(]', output: 'false', explanation: 'Mismatched bracket types.' }
    ],
    testCases: [
      { input: '()', expectedOutput: 'true', isHidden: false, points: 20 },
      { input: '()[]{}', expectedOutput: 'true', isHidden: false, points: 20 },
      { input: '(]', expectedOutput: 'false', isHidden: false, points: 20 },
      { input: '([)]', expectedOutput: 'false', isHidden: true, points: 20 },
      { input: '{[]}', expectedOutput: 'true', isHidden: true, points: 20 },
    ],
    hints: [
      { text: 'Use a stack data structure.', coinCost: 30 },
      { text: 'Push opening brackets, pop and match for closing brackets.', coinCost: 50 }
    ],
    starterCode: {
      python: `def is_valid(s):
    # Your code here
    pass

s = input().strip()
print('true' if is_valid(s) else 'false')`,
      javascript: `function isValid(s) {
  // Your code here
  
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(isValid(line) ? 'true' : 'false');
  rl.close();
});`,
      cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isValid(string s) {
    // Your code here
    return false;
}

int main() {
    string s;
    cin >> s;
    cout << (isValid(s) ? "true" : "false") << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Your code here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(isValid(s) ? "true" : "false");
    }
}`
    },
    tags: ['string', 'stack'],
    isPremium: false,
    isDaily: false,
    totalSubmissions: 0,
    successfulSubmissions: 0,
    acceptanceRate: 0
  },
  {
    title: 'FizzBuzz',
    description: 'Print FizzBuzz sequence from 1 to n',
    difficulty: 'easy',
    category: 'Basics',
    points: 5,
    coinReward: 50,
    timeLimit: 5,
    memoryLimit: 256,
    problemStatement: `<div class="problem-statement">
      <div class="header">
        <div class="title">FizzBuzz</div>
        <div class="time-limit">Time limit: 1 second</div>
        <div class="memory-limit">Memory limit: 256 MB</div>
      </div>
      <div style="margin: 15px 0;">
        Given an integer n, print numbers from 1 to n with the following rules:
        <ul>
          <li>If the number is divisible by 3, print "Fizz"</li>
          <li>If the number is divisible by 5, print "Buzz"</li>
          <li>If the number is divisible by both 3 and 5, print "FizzBuzz"</li>
          <li>Otherwise, print the number itself</li>
        </ul>
      </div>
      <div class="section-title">Input</div>
      <div>A single integer n (1 ≤ n ≤ 100)</div>
      <div class="section-title">Output</div>
      <div>n lines, each containing the appropriate output for that number.</div>
    </div>`,
    inputFormat: 'A single integer n (1 ≤ n ≤ 100)',
    outputFormat: 'n lines, each containing the appropriate output for that number.',
    constraints: ['1 <= n <= 100'],
    examples: [
      { 
        input: '5', 
        output: '1\n2\nFizz\n4\nBuzz', 
        explanation: '3 is divisible by 3 (Fizz), 5 is divisible by 5 (Buzz)' 
      },
      { 
        input: '15', 
        output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', 
        explanation: '15 is divisible by both 3 and 5 (FizzBuzz)' 
      }
    ],
    testCases: [
      { input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz', isHidden: false, points: 25 },
      { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isHidden: false, points: 25 },
      { input: '3', expectedOutput: '1\n2\nFizz', isHidden: true, points: 25 },
      { input: '30', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz', isHidden: true, points: 25 },
    ],
    starterCode: {
      python: `def fizzbuzz(n):
    # Your code here
    pass

n = int(input())
fizzbuzz(n)`,
      javascript: `function fizzBuzz(n) {
  // Your code here
  
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  fizzBuzz(parseInt(line));
  rl.close();
});`,
      cpp: `#include <iostream>
using namespace std;

void fizzBuzz(int n) {
    // Your code here
}

int main() {
    int n;
    cin >> n;
    fizzBuzz(n);
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void fizzBuzz(int n) {
        // Your code here
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        fizzBuzz(n);
    }
}`
    },
    tags: ['basics', 'conditionals'],
    isPremium: false,
    isDaily: false,
    totalSubmissions: 0,
    successfulSubmissions: 0,
    acceptanceRate: 0
  },
  {
    title: 'Reverse String',
    description: 'Reverse a given string',
    difficulty: 'easy',
    category: 'Strings',
    points: 5,
    coinReward: 50,
    timeLimit: 5,
    memoryLimit: 256,
    problemStatement: `<div class="problem-statement">
      <div class="header">
        <div class="title">Reverse String</div>
        <div class="time-limit">Time limit: 1 second</div>
        <div class="memory-limit">Memory limit: 256 MB</div>
      </div>
      <div style="margin: 15px 0;">
        Given a string s, reverse it and print the result.
      </div>
      <div class="section-title">Input</div>
      <div>A single line containing the string s.</div>
      <div class="section-title">Output</div>
      <div>The reversed string.</div>
    </div>`,
    inputFormat: 'A single line containing the string s.',
    outputFormat: 'The reversed string.',
    constraints: ['1 <= s.length <= 10^5'],
    examples: [
      { input: 'hello', output: 'olleh', explanation: 'hello reversed is olleh' },
      { input: 'world', output: 'dlrow', explanation: 'world reversed is dlrow' }
    ],
    testCases: [
      { input: 'hello', expectedOutput: 'olleh', isHidden: false, points: 25 },
      { input: 'world', expectedOutput: 'dlrow', isHidden: false, points: 25 },
      { input: 'a', expectedOutput: 'a', isHidden: true, points: 25 },
      { input: 'abcdefghij', expectedOutput: 'jihgfedcba', isHidden: true, points: 25 },
    ],
    starterCode: {
      python: `def reverse_string(s):
    # Your code here
    pass

s = input().strip()
print(reverse_string(s))`,
      javascript: `function reverseString(s) {
  // Your code here
  
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(reverseString(line));
  rl.close();
});`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string reverseString(string s) {
    // Your code here
    return "";
}

int main() {
    string s;
    getline(cin, s);
    cout << reverseString(s) << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static String reverseString(String s) {
        // Your code here
        return "";
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(reverseString(s));
    }
}`
    },
    tags: ['string', 'basics'],
    isPremium: false,
    isDaily: false,
    totalSubmissions: 0,
    successfulSubmissions: 0,
    acceptanceRate: 0
  },
  {
    title: 'Maximum Subarray',
    description: 'Find the contiguous subarray with largest sum',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    points: 25,
    coinReward: 25,
    timeLimit: 15,
    memoryLimit: 256,
    problemStatement: `<div class="problem-statement">
      <div class="header">
        <div class="title">Maximum Subarray</div>
        <div class="time-limit">Time limit: 2 seconds</div>
        <div class="memory-limit">Memory limit: 256 MB</div>
      </div>
      <div style="margin: 15px 0;">
        Given an integer array nums, find the subarray with the largest sum, and return its sum.
      </div>
      <div style="margin: 15px 0;">
        A subarray is a contiguous non-empty sequence of elements within an array.
      </div>
      <div class="section-title">Input</div>
      <div>First line contains n (size of array). Second line contains n space-separated integers.</div>
      <div class="section-title">Output</div>
      <div>A single integer - the maximum subarray sum.</div>
    </div>`,
    inputFormat: 'First line contains n (size of array). Second line contains n space-separated integers.',
    outputFormat: 'A single integer - the maximum subarray sum.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    examples: [
      {
        input: '9\n-2 1 -3 4 -1 2 1 -5 4',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: '1\n1',
        output: '1',
        explanation: 'Single element array.'
      }
    ],
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false, points: 25 },
      { input: '1\n1', expectedOutput: '1', isHidden: false, points: 25 },
      { input: '5\n5 4 -1 7 8', expectedOutput: '23', isHidden: true, points: 25 },
      { input: '3\n-1 -2 -3', expectedOutput: '-1', isHidden: true, points: 25 },
    ],
    hints: [
      { text: 'Think about Kadane\'s algorithm.', coinCost: 50 },
      { text: 'At each position, decide whether to extend the previous subarray or start a new one.', coinCost: 75 }
    ],
    starterCode: {
      python: `def max_sub_array(nums):
    # Your code here
    pass

import sys
lines = sys.stdin.read().strip().split('\\n')
n = int(lines[0])
nums = list(map(int, lines[1].split()))
print(max_sub_array(nums))`,
      javascript: `function maxSubArray(nums) {
  // Your code here
  
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];

rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const n = parseInt(lines[0]);
  const nums = lines[1].split(' ').map(Number);
  console.log(maxSubArray(nums));
});`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Your code here
    return 0;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    cout << maxSubArray(nums) << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine());
        int[] nums = new int[n];
        String[] numsStr = sc.nextLine().split(" ");
        for (int i = 0; i < n; i++) {
            nums[i] = Integer.parseInt(numsStr[i]);
        }
        System.out.println(maxSubArray(nums));
    }
}`
    },
    tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
    isPremium: false,
    isDaily: false,
    totalSubmissions: 0,
    successfulSubmissions: 0,
    acceptanceRate: 0
  },
  {
    title: 'Palindrome Number',
    description: 'Check if a number is a palindrome',
    difficulty: 'easy',
    category: 'Math',
    points: 10,
    coinReward: 100,
    timeLimit: 5,
    memoryLimit: 256,
    problemStatement: `<div class="problem-statement">
      <div class="header">
        <div class="title">Palindrome Number</div>
        <div class="time-limit">Time limit: 1 second</div>
        <div class="memory-limit">Memory limit: 256 MB</div>
      </div>
      <div style="margin: 15px 0;">
        Given an integer x, return true if x is a palindrome, and false otherwise.
      </div>
      <div style="margin: 15px 0;">
        An integer is a palindrome when it reads the same backward as forward.
      </div>
      <div class="section-title">Input</div>
      <div>A single integer x.</div>
      <div class="section-title">Output</div>
      <div>Print "true" if x is a palindrome, "false" otherwise.</div>
    </div>`,
    inputFormat: 'A single integer x.',
    outputFormat: 'Print "true" if x is a palindrome, "false" otherwise.',
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    examples: [
      { input: '121', output: 'true', explanation: '121 reads as 121 from left to right and from right to left.' },
      { input: '-121', output: 'false', explanation: 'From left to right, it reads -121. From right to left, it becomes 121-.' },
      { input: '10', output: 'false', explanation: 'Reads 01 from right to left. Therefore it is not a palindrome.' }
    ],
    testCases: [
      { input: '121', expectedOutput: 'true', isHidden: false, points: 25 },
      { input: '-121', expectedOutput: 'false', isHidden: false, points: 25 },
      { input: '10', expectedOutput: 'false', isHidden: true, points: 25 },
      { input: '12321', expectedOutput: 'true', isHidden: true, points: 25 },
    ],
    starterCode: {
      python: `def is_palindrome(x):
    # Your code here
    pass

x = int(input())
print('true' if is_palindrome(x) else 'false')`,
      javascript: `function isPalindrome(x) {
  // Your code here
  
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(isPalindrome(parseInt(line)) ? 'true' : 'false');
  rl.close();
});`,
      cpp: `#include <iostream>
using namespace std;

bool isPalindrome(int x) {
    // Your code here
    return false;
}

int main() {
    int x;
    cin >> x;
    cout << (isPalindrome(x) ? "true" : "false") << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static boolean isPalindrome(int x) {
        // Your code here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        System.out.println(isPalindrome(x) ? "true" : "false");
    }
}`
    },
    tags: ['math'],
    isPremium: false,
    isDaily: false,
    totalSubmissions: 0,
    successfulSubmissions: 0,
    acceptanceRate: 0
  }
];

// Initialize Firebase with default challenges if empty
export const initializeChallenges = async (): Promise<void> => {
  try {
    const challenges = await fetchAllChallenges();
    
    if (challenges.length === 0) {
      console.log('No challenges found, seeding default challenges...');
      
      for (const challenge of defaultChallenges) {
        await addChallenge(challenge);
        console.log(`Added challenge: ${challenge.title}`);
      }
      
      console.log('Default challenges seeded successfully!');
    } else {
      console.log(`Found ${challenges.length} existing challenges`);
    }
  } catch (error) {
    console.error('Error initializing challenges:', error);
  }
};
