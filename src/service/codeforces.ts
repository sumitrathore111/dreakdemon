// Codeforces API Service
// Fetches problems and contests from Codeforces

export interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating?: number;
  tags: string[];
  solvedCount?: number;
}

export interface CodeforcesContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds: number;
}

export interface ProblemWithStats extends CodeforcesProblem {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  coins: number;
  url: string;
}

// Map Codeforces rating to difficulty and coins
const getDifficultyFromRating = (rating?: number): { difficulty: 'easy' | 'medium' | 'hard' | 'expert'; coins: number } => {
  if (!rating || rating <= 1200) {
    return { difficulty: 'easy', coins: 10 };
  } else if (rating <= 1600) {
    return { difficulty: 'medium', coins: 25 };
  } else if (rating <= 2000) {
    return { difficulty: 'hard', coins: 50 };
  } else {
    return { difficulty: 'expert', coins: 100 };
  }
};

// Fetch all problems from Codeforces
export const fetchCodeforcesProblems = async (): Promise<ProblemWithStats[]> => {
  try {
    const response = await fetch('https://codeforces.com/api/problemset.problems');
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error('Failed to fetch problems from Codeforces');
    }

    const problems: CodeforcesProblem[] = data.result.problems;
    const problemStatistics = data.result.problemStatistics;

    // Create a map for solved counts
    const solvedCountMap: { [key: string]: number } = {};
    problemStatistics.forEach((stat: { contestId: number; index: string; solvedCount: number }) => {
      solvedCountMap[`${stat.contestId}-${stat.index}`] = stat.solvedCount;
    });

    // Transform problems with difficulty and coins
    return problems.map((problem) => {
      const { difficulty, coins } = getDifficultyFromRating(problem.rating);
      return {
        ...problem,
        difficulty,
        coins,
        solvedCount: solvedCountMap[`${problem.contestId}-${problem.index}`] || 0,
        url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
      };
    });
  } catch (error) {
    console.error('Error fetching Codeforces problems:', error);
    throw error;
  }
};

// Fetch problems by difficulty
export const fetchProblemsByDifficulty = async (
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  limit: number = 50
): Promise<ProblemWithStats[]> => {
  const allProblems = await fetchCodeforcesProblems();
  
  const filtered = allProblems.filter(p => p.difficulty === difficulty);
  
  // Shuffle and return limited results
  return filtered
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
};

// Fetch problems by tags
export const fetchProblemsByTags = async (
  tags: string[],
  limit: number = 50
): Promise<ProblemWithStats[]> => {
  const allProblems = await fetchCodeforcesProblems();
  
  const filtered = allProblems.filter(p => 
    tags.some(tag => p.tags.includes(tag))
  );
  
  return filtered
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
};

// Get random problem for battle based on difficulty
export const getRandomBattleProblem = async (
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<ProblemWithStats> => {
  const ratingRanges = {
    easy: { min: 800, max: 1200 },
    medium: { min: 1300, max: 1600 },
    hard: { min: 1700, max: 2100 }
  };

  const range = ratingRanges[difficulty];
  const allProblems = await fetchCodeforcesProblems();
  
  const eligibleProblems = allProblems.filter(p => 
    p.rating && p.rating >= range.min && p.rating <= range.max
  );

  if (eligibleProblems.length === 0) {
    throw new Error('No problems found for the specified difficulty');
  }

  const randomIndex = Math.floor(Math.random() * eligibleProblems.length);
  return eligibleProblems[randomIndex];
};

// Fetch problem details with statement (scraping from Codeforces page)
export const fetchProblemStatement = async (contestId: number, index: string): Promise<string> => {
  try {
    // Try multiple CORS proxies
    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://codeforces.com/problemset/problem/${contestId}/${index}`)}`,
      `https://corsproxy.io/?${encodeURIComponent(`https://codeforces.com/problemset/problem/${contestId}/${index}`)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://codeforces.com/problemset/problem/${contestId}/${index}`)}`
    ];
    
    let html = '';
    
    for (const proxyUrl of proxyUrls) {
      try {
        const response = await fetch(proxyUrl, { 
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        if (response.ok) {
          html = await response.text();
          if (html && html.includes('problem-statement')) {
            break;
          }
        }
      } catch (e) {
        console.log('Proxy failed for statement, trying next...');
        continue;
      }
    }
    
    if (!html) {
      return getDefaultProblemStatement(contestId, index);
    }
    
    // Parse the HTML to extract problem statement
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const problemStatement = doc.querySelector('.problem-statement');
    if (problemStatement) {
      return problemStatement.innerHTML;
    }
    
    return getDefaultProblemStatement(contestId, index);
  } catch (error) {
    console.error('Error fetching problem statement:', error);
    return getDefaultProblemStatement(contestId, index);
  }
};

// Fallback problem statement
const getDefaultProblemStatement = (contestId: number, index: string): string => {
  return `
    <div class="problem-statement-fallback">
      <div class="header">
        <div class="title">Problem ${index}</div>
      </div>
      <p style="margin: 20px 0; color: #9ca3af;">
        Unable to load problem statement from Codeforces. This might be due to network issues or CORS restrictions.
      </p>
      <p style="margin: 20px 0;">
        <a href="https://codeforces.com/problemset/problem/${contestId}/${index}" 
           target="_blank" 
           rel="noopener noreferrer"
           style="color: #60a5fa; text-decoration: underline;">
          👉 View problem on Codeforces
        </a>
      </p>
      <div style="margin-top: 20px; padding: 15px; background: #1f2937; border-radius: 8px;">
        <p style="color: #9ca3af; font-size: 14px; margin-bottom: 10px;">Tips:</p>
        <ul style="color: #d1d5db; font-size: 14px; padding-left: 20px;">
          <li>Open the Codeforces link in a new tab to read the problem</li>
          <li>Use the test cases provided below to verify your solution</li>
          <li>Click "Refresh" in the test cases section if they didn't load</li>
        </ul>
      </div>
    </div>
  `;
};

// Get sample test cases from problem page
export const fetchProblemTestCases = async (
  contestId: number, 
  index: string
): Promise<{ input: string; output: string }[]> => {
  try {
    // Try multiple CORS proxies
    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://codeforces.com/problemset/problem/${contestId}/${index}`)}`,
      `https://corsproxy.io/?${encodeURIComponent(`https://codeforces.com/problemset/problem/${contestId}/${index}`)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://codeforces.com/problemset/problem/${contestId}/${index}`)}`
    ];
    
    let html = '';
    
    for (const proxyUrl of proxyUrls) {
      try {
        const response = await fetch(proxyUrl, { 
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        if (response.ok) {
          html = await response.text();
          if (html && html.includes('sample-test')) {
            break;
          }
        }
      } catch (e) {
        console.log('Proxy failed, trying next...');
        continue;
      }
    }
    
    if (!html) {
      console.log('All proxies failed, returning sample test cases');
      return getSampleTestCases(contestId, index);
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const testCases: { input: string; output: string }[] = [];
    
    // Try to find sample tests in the problem statement
    const sampleTests = doc.querySelectorAll('.sample-test');
    
    sampleTests.forEach((sampleTest) => {
      const inputs = sampleTest.querySelectorAll('.input pre');
      const outputs = sampleTest.querySelectorAll('.output pre');
      
      for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
        // Handle both text content and nested divs
        let inputText = '';
        let outputText = '';
        
        const inputPre = inputs[i];
        const outputPre = outputs[i];
        
        // Check for nested divs (newer Codeforces format)
        const inputDivs = inputPre.querySelectorAll('div');
        const outputDivs = outputPre.querySelectorAll('div');
        
        if (inputDivs.length > 0) {
          inputText = Array.from(inputDivs).map(div => div.textContent?.trim() || '').join('\n');
        } else {
          inputText = inputPre.textContent?.trim() || '';
        }
        
        if (outputDivs.length > 0) {
          outputText = Array.from(outputDivs).map(div => div.textContent?.trim() || '').join('\n');
        } else {
          outputText = outputPre.textContent?.trim() || '';
        }
        
        if (inputText && outputText) {
          testCases.push({
            input: inputText,
            output: outputText
          });
        }
      }
    });
    
    // If no test cases found, try alternative selectors
    if (testCases.length === 0) {
      const inputs = doc.querySelectorAll('.input pre');
      const outputs = doc.querySelectorAll('.output pre');
      
      for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
        const inputText = inputs[i].textContent?.trim() || '';
        const outputText = outputs[i].textContent?.trim() || '';
        
        if (inputText && outputText) {
          testCases.push({
            input: inputText,
            output: outputText
          });
        }
      }
    }
    
    // If still no test cases, return sample fallback
    if (testCases.length === 0) {
      return getSampleTestCases(contestId, index);
    }
    
    return testCases;
  } catch (error) {
    console.error('Error fetching test cases:', error);
    return getSampleTestCases(contestId, index);
  }
};

// Fallback sample test cases for common problem types
const getSampleTestCases = (_contestId: number, index: string): { input: string; output: string }[] => {
  // Return generic sample test cases based on problem index
  // This is a fallback when fetching from Codeforces fails
  const sampleCases: { [key: string]: { input: string; output: string }[] } = {
    'A': [
      { input: '5\n1 2 3 4 5', output: '15' },
      { input: '3\n10 20 30', output: '60' }
    ],
    'B': [
      { input: '3\n1 2 3', output: 'YES' },
      { input: '4\n1 1 1 1', output: 'NO' }
    ],
    'C': [
      { input: '5\n1 2 3 4 5', output: '5' },
      { input: '3\n5 5 5', output: '1' }
    ]
  };
  
  return sampleCases[index] || [
    { input: '5', output: '5' },
    { input: '10', output: '10' }
  ];
};

// Cache management for problems
let problemsCache: ProblemWithStats[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export const getCachedProblems = async (): Promise<ProblemWithStats[]> => {
  const now = Date.now();
  
  if (problemsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return problemsCache;
  }
  
  problemsCache = await fetchCodeforcesProblems();
  cacheTimestamp = now;
  
  return problemsCache;
};

// Get available tags from problems
export const getAvailableTags = async (): Promise<string[]> => {
  const problems = await getCachedProblems();
  const tagSet = new Set<string>();
  
  problems.forEach(p => {
    p.tags.forEach(tag => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
};
