// Judge0 API Service
// For code execution and evaluation

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY || '';

// Debug: Log if API key is set
if (!JUDGE0_API_KEY || JUDGE0_API_KEY === 'your-rapidapi-key') {
  console.warn('Judge0 API key not configured. Please set VITE_JUDGE0_API_KEY in .env file');
}

// Language IDs for Judge0
export const LANGUAGE_IDS: { [key: string]: number } = {
  'cpp': 54,        // C++ (GCC 9.2.0)
  'c': 50,          // C (GCC 9.2.0)
  'java': 62,       // Java (OpenJDK 13.0.1)
  'python': 71,     // Python (3.8.1)
  'python3': 71,    // Python 3
  'javascript': 63, // JavaScript (Node.js 12.14.0)
  'typescript': 74, // TypeScript (3.7.4)
  'go': 60,         // Go (1.13.5)
  'rust': 73,       // Rust (1.40.0)
  'ruby': 72,       // Ruby (2.7.0)
  'kotlin': 78,     // Kotlin (1.3.70)
  'swift': 83,      // Swift (5.2.3)
  'csharp': 51,     // C# (Mono 6.6.0.161)
};

export interface SubmissionResult {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

export interface TestCaseResult {
  testCase: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  time: string | null;
  memory: number | null;
  error: string | null;
}

export interface SubmissionResponse {
  success: boolean;
  results: TestCaseResult[];
  passedCount: number;
  totalCount: number;
  totalTime: number;
  totalMemory: number;
  compilationError?: string;
}

// Submit code to Judge0
export const submitCode = async (
  code: string,
  languageId: number,
  stdin: string = '',
  expectedOutput: string = ''
): Promise<SubmissionResult> => {
  // Check if API key is configured
  if (!JUDGE0_API_KEY) {
    throw new Error('Judge0 API key not configured. Please set VITE_JUDGE0_API_KEY in your .env file and restart the server.');
  }

  try {
    // Use unescape + encodeURIComponent for proper Unicode handling
    const encodeBase64 = (str: string) => {
      try {
        return btoa(unescape(encodeURIComponent(str)));
      } catch {
        return btoa(str);
      }
    };

    // Create submission
    const createResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code: encodeBase64(code),
        language_id: languageId,
        stdin: encodeBase64(stdin),
        expected_output: expectedOutput ? encodeBase64(expectedOutput) : undefined,
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Judge0 API error:', createResponse.status, errorText);
      throw new Error(`Judge0 API error: ${createResponse.status} - ${errorText}`);
    }

    const result = await createResponse.json();
    
    // Check for API error response
    if (result.error) {
      throw new Error(result.error);
    }

    // Decode base64 outputs safely
    const decodeBase64 = (str: string | null) => {
      if (!str) return null;
      try {
        return decodeURIComponent(escape(atob(str)));
      } catch {
        try {
          return atob(str);
        } catch {
          return str;
        }
      }
    };
    
    return {
      ...result,
      stdout: decodeBase64(result.stdout),
      stderr: decodeBase64(result.stderr),
      compile_output: decodeBase64(result.compile_output),
    };
  } catch (error) {
    console.error('Error submitting code:', error);
    throw error;
  }
};

// Submit code and run against multiple test cases
export const runTestCases = async (
  code: string,
  language: string,
  testCases: { input: string; output: string }[]
): Promise<SubmissionResponse> => {
  // Validate test cases
  if (!testCases || testCases.length === 0) {
    return {
      success: false,
      results: [],
      passedCount: 0,
      totalCount: 0,
      totalTime: 0,
      totalMemory: 0,
      compilationError: 'No test cases provided. Please refresh test cases or add custom input.'
    };
  }

  const languageId = LANGUAGE_IDS[language.toLowerCase()];
  
  if (!languageId) {
    return {
      success: false,
      results: [],
      passedCount: 0,
      totalCount: testCases.length,
      totalTime: 0,
      totalMemory: 0,
      compilationError: `Unsupported language: ${language}`
    };
  }

  const results: TestCaseResult[] = [];
  let totalTime = 0;
  let totalMemory = 0;
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    try {
      const result = await submitCode(
        code,
        languageId,
        testCase.input,
        testCase.output
      );

      // Check if compilation error
      if (result.status?.id === 6) {
        return {
          success: false,
          results: [],
          passedCount: 0,
          totalCount: testCases.length,
          totalTime: 0,
          totalMemory: 0,
          compilationError: result.compile_output || 'Compilation error'
        };
      }

      const actualOutput = result.stdout?.trim() || '';
      const expectedOutput = testCase.output.trim();
      const passed = actualOutput === expectedOutput;

      if (passed) passedCount++;
      if (result.time) totalTime += parseFloat(result.time);
      if (result.memory) totalMemory += result.memory;

      results.push({
        testCase: i + 1,
        passed,
        input: testCase.input,
        expectedOutput,
        actualOutput,
        time: result.time,
        memory: result.memory,
        error: result.stderr || result.message || null
      });
    } catch (error) {
      results.push({
        testCase: i + 1,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: '',
        time: null,
        memory: null,
        error: 'Execution failed'
      });
    }
  }

  return {
    success: passedCount === testCases.length,
    results,
    passedCount,
    totalCount: testCases.length,
    totalTime,
    totalMemory
  };
};

// Quick code run (single execution without test cases)
export const quickRun = async (
  code: string,
  language: string,
  input: string = ''
): Promise<{
  output: string;
  error: string | null;
  time: string | null;
  memory: number | null;
  status: string;
}> => {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];
  
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const result = await submitCode(code, languageId, input);

  return {
    output: result.stdout || '',
    error: result.stderr || result.compile_output || null,
    time: result.time,
    memory: result.memory,
    status: result.status.description
  };
};

// Battle submission - runs code and returns detailed metrics
export interface BattleSubmissionResult {
  userId: string;
  passed: boolean;
  passedCount: number;
  totalCount: number;
  totalTime: number;       // Total execution time in ms
  totalMemory: number;     // Total memory in KB
  submittedAt: number;     // Timestamp
  compilationError?: string;
}

export const submitBattleCode = async (
  userId: string,
  code: string,
  language: string,
  testCases: { input: string; output: string }[]
): Promise<BattleSubmissionResult> => {
  const submittedAt = Date.now();
  
  try {
    const result = await runTestCases(code, language, testCases);
    
    return {
      userId,
      passed: result.success,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      totalTime: result.totalTime * 1000, // Convert to ms
      totalMemory: result.totalMemory,
      submittedAt,
      compilationError: result.compilationError
    };
  } catch (error) {
    return {
      userId,
      passed: false,
      passedCount: 0,
      totalCount: testCases.length,
      totalTime: 0,
      totalMemory: 0,
      submittedAt,
      compilationError: 'Submission failed'
    };
  }
};

// Determine battle winner based on submissions
export const determineBattleWinner = (
  submission1: BattleSubmissionResult,
  submission2: BattleSubmissionResult
): {
  winnerId: string | null;
  reason: string;
  isDraw: boolean;
} => {
  // If one passed and other didn't
  if (submission1.passed && !submission2.passed) {
    return {
      winnerId: submission1.userId,
      reason: 'Solved the problem correctly',
      isDraw: false
    };
  }
  
  if (submission2.passed && !submission1.passed) {
    return {
      winnerId: submission2.userId,
      reason: 'Solved the problem correctly',
      isDraw: false
    };
  }

  // If both passed, compare metrics
  if (submission1.passed && submission2.passed) {
    // First priority: more test cases passed (shouldn't differ if both passed, but just in case)
    if (submission1.passedCount !== submission2.passedCount) {
      const winner = submission1.passedCount > submission2.passedCount ? submission1 : submission2;
      return {
        winnerId: winner.userId,
        reason: 'Passed more test cases',
        isDraw: false
      };
    }

    // Second priority: faster submission time
    if (submission1.submittedAt !== submission2.submittedAt) {
      const winner = submission1.submittedAt < submission2.submittedAt ? submission1 : submission2;
      const timeDiff = Math.abs(submission1.submittedAt - submission2.submittedAt) / 1000;
      return {
        winnerId: winner.userId,
        reason: `Submitted ${timeDiff.toFixed(1)}s faster`,
        isDraw: false
      };
    }

    // Third priority: faster execution
    if (submission1.totalTime !== submission2.totalTime) {
      const winner = submission1.totalTime < submission2.totalTime ? submission1 : submission2;
      return {
        winnerId: winner.userId,
        reason: 'Code executed faster',
        isDraw: false
      };
    }

    // Fourth priority: less memory usage
    if (submission1.totalMemory !== submission2.totalMemory) {
      const winner = submission1.totalMemory < submission2.totalMemory ? submission1 : submission2;
      return {
        winnerId: winner.userId,
        reason: 'Used less memory',
        isDraw: false
      };
    }

    // Complete draw
    return {
      winnerId: null,
      reason: 'Both solutions are equally efficient',
      isDraw: true
    };
  }

  // Both failed - compare who got more test cases
  if (submission1.passedCount !== submission2.passedCount) {
    const winner = submission1.passedCount > submission2.passedCount ? submission1 : submission2;
    return {
      winnerId: winner.userId,
      reason: 'Passed more test cases',
      isDraw: false
    };
  }

  // Both completely failed
  return {
    winnerId: null,
    reason: 'Neither player solved the problem',
    isDraw: true
  };
};

// Get supported languages list
export const getSupportedLanguages = () => {
  return Object.keys(LANGUAGE_IDS).map(lang => ({
    id: lang,
    name: lang.charAt(0).toUpperCase() + lang.slice(1),
    languageId: LANGUAGE_IDS[lang]
  }));
};
