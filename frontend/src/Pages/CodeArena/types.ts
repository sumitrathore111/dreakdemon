// CodeArena Type Definitions

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  tags: string[];
  testCases: TestCase[];
  timeLimit: string;
  memoryLimit: string;
}

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface ExecutionResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
  time: number;
}

export interface Battle {
  id: string;
  status: 'waiting' | 'countdown' | 'active' | 'completed';
  difficulty: 'easy' | 'medium' | 'hard';
  entryFee: number;
  prize: number;
  timeLimit: number;
  challenge: Problem;
  participants: Participant[];
  startedAt?: Date;
  completedAt?: Date;
  winner?: string;
}

export interface Participant {
  odId: string;
  odName: string;
  odProfilePic: string;
  rating: number;
  hasSubmitted: boolean;
  score: number;
}

export interface WalletData {
  odId: string;
  coins: number;
  transactions: Transaction[];
  achievements: {
    problemsSolved: number;
    battlesWon: number;
    battlesPlayed: number;
  };
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  createdAt: Date;
}

export interface LeaderboardEntry {
  odId: string;
  odName: string;
  odProfilePic: string;
  battleRating: number;
  battlesWon: number;
  battlesPlayed: number;
  rank: number;
}

export type Language = 'python' | 'javascript' | 'cpp' | 'java' | 'c';

export const LANGUAGE_CONFIG: Record<Language, { name: string; extension: string; template: string }> = {
  python: {
    name: 'Python',
    extension: 'py',
    template: `# Read input and solve the problem
n = int(input())
nums = list(map(int, input().split()))

# Your solution here
result = 0

print(result)
`
  },
  javascript: {
    name: 'JavaScript',
    extension: 'js',
    template: `// Read input from stdin
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];

rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const n = parseInt(lines[0]);
  const nums = lines[1].split(' ').map(Number);
  
  // Your solution here
  let result = 0;
  
  console.log(result);
});
`
  },
  cpp: {
    name: 'C++',
    extension: 'cpp',
    template: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    cin >> n;
    
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    
    // Your solution here
    int result = 0;
    
    cout << result << endl;
    return 0;
}
`
  },
  java: {
    name: 'Java',
    extension: 'java',
    template: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        
        // Your solution here
        int result = 0;
        
        System.out.println(result);
    }
}
`
  },
  c: {
    name: 'C',
    extension: 'c',
    template: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    scanf("%d", &n);
    
    int* nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }
    
    // Your solution here
    int result = 0;
    
    printf("%d\\n", result);
    free(nums);
    return 0;
}
`
  }
};

export const DIFFICULTY_COLORS = {
  Easy: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-500' },
  Medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500' },
  Hard: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-500' }
};

export const ENTRY_FEES = [10, 25, 50, 100, 250];
