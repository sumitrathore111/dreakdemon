// Piston API - Free code execution service (NO API KEY REQUIRED!)
// Documentation: https://github.com/engineer-man/piston
// This is used for Practice mode to avoid Judge0 API quota limits

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

// Language mappings for Piston API - supports many languages
const languageMap: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  python3: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  ruby: { language: 'ruby', version: '3.0.1' },
  kotlin: { language: 'kotlin', version: '1.8.20' },
  csharp: { language: 'csharp', version: '6.12.0' },
  swift: { language: 'swift', version: '5.3.3' }
};

export async function executeCode(
  code: string,
  language: string,
  input: string = ''
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    const langConfig = languageMap[language.toLowerCase()];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: getFileName(language),
            content: code
          }
        ],
        stdin: input,
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    const executionTime = Date.now() - startTime;

    // Check for compilation errors
    if (result.compile && result.compile.code !== 0) {
      return {
        success: false,
        error: result.compile.stderr || result.compile.output || 'Compilation failed',
        executionTime
      };
    }

    // Check for runtime errors
    if (result.run.code !== 0 && result.run.signal) {
      return {
        success: false,
        error: result.run.stderr || result.run.output || 'Runtime error',
        executionTime
      };
    }

    // Success - return output
    return {
      success: true,
      output: (result.run.stdout || result.run.output || '').trim(),
      error: result.run.stderr ? result.run.stderr.trim() : undefined,
      executionTime
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime: Date.now() - startTime
    };
  }
}

function getFileName(language: string): string {
  switch (language.toLowerCase()) {
    case 'javascript':
      return 'solution.js';
    case 'python':
    case 'python3':
      return 'solution.py';
    case 'java':
      return 'Main.java';
    case 'cpp':
    case 'c':
      return 'solution.cpp';
    case 'typescript':
      return 'solution.ts';
    case 'go':
      return 'solution.go';
    case 'rust':
      return 'solution.rs';
    case 'ruby':
      return 'solution.rb';
    case 'kotlin':
      return 'solution.kt';
    case 'csharp':
      return 'Solution.cs';
    case 'swift':
      return 'solution.swift';
    default:
      return 'solution.txt';
  }
}

// Run test cases - returns format compatible with Judge0 interface
export async function runTestCasesPiston(
  code: string,
  language: string,
  testCases: Array<{ input: string; output: string }>
): Promise<{
  success: boolean;
  results: Array<{
    testCase: number;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    time: string | null;
    memory: number | null;
    error: string | null;
  }>;
  passedCount: number;
  totalCount: number;
  totalTime: number;
  totalMemory: number;
  compilationError?: string;
}> {
  if (!testCases || testCases.length === 0) {
    return {
      success: false,
      results: [],
      passedCount: 0,
      totalCount: 0,
      totalTime: 0,
      totalMemory: 0,
      compilationError: 'No test cases provided.'
    };
  }

  const results = [];
  let passedCount = 0;
  let totalTime = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = await executeCode(code, language, testCase.input);

    // Handle compilation errors
    if (result.error && (result.error.toLowerCase().includes('compile') || result.error.toLowerCase().includes('syntax') || result.error.toLowerCase().includes('error:'))) {
      return {
        success: false,
        results: [],
        passedCount: 0,
        totalCount: testCases.length,
        totalTime: 0,
        totalMemory: 0,
        compilationError: result.error
      };
    }

    const actualOutput = (result.output || '').trim();
    const expectedOutput = testCase.output.trim();
    const passed = result.success && normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);

    if (passed) passedCount++;
    if (result.executionTime) totalTime += result.executionTime;

    results.push({
      testCase: i + 1,
      passed,
      input: testCase.input,
      expectedOutput,
      actualOutput,
      time: result.executionTime ? `${(result.executionTime / 1000).toFixed(3)}` : null,
      memory: null,
      error: result.error || null
    });
  }

  return {
    success: passedCount === testCases.length,
    results,
    passedCount,
    totalCount: testCases.length,
    totalTime: totalTime / 1000,
    totalMemory: 0
  };
}

// Quick run - returns format compatible with Judge0 interface
export async function quickRunPiston(
  code: string,
  language: string,
  input: string = ''
): Promise<{
  output: string;
  error: string | null;
  time: string | null;
  memory: number | null;
  status: string;
}> {
  const result = await executeCode(code, language, input);
  
  return {
    output: result.output || '',
    error: result.error || null,
    time: result.executionTime ? `${(result.executionTime / 1000).toFixed(3)}` : null,
    memory: null,
    status: result.success ? 'Accepted' : (result.error ? 'Error' : 'Unknown')
  };
}

// Get supported languages list - same format as Judge0
export const getPistonSupportedLanguages = () => {
  return Object.keys(languageMap).filter(l => l !== 'python3').map(lang => ({
    id: lang,
    name: lang.charAt(0).toUpperCase() + lang.slice(1),
    languageId: lang
  }));
};

export async function runTestCases(
  code: string,
  language: string,
  testCases: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>
): Promise<Array<{
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  error?: string;
  executionTime?: number;
  isHidden?: boolean;
}>> {
  const results = [];

  for (const testCase of testCases) {
    const result = await executeCode(code, language, testCase.input);

    const actualOutput = result.output || '';
    const expectedOutput = testCase.expectedOutput.trim();
    const passed = result.success && normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);

    results.push({
      passed,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: result.output,
      error: result.error,
      executionTime: result.executionTime,
      isHidden: testCase.isHidden
    });

    // Stop on first failure for efficiency (optional)
    // if (!passed && !testCase.isHidden) break;
  }

  return results;
}

function normalizeOutput(output: string): string {
  // Remove extra whitespace, normalize line endings
  return output
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

// Check if Piston API is available
export async function checkPistonAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${PISTON_API_URL}/runtimes`);
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================
// BATTLE-SPECIFIC FUNCTIONS (Piston API)
// ============================================

// Battle submission result interface - compatible with Judge0 format
export interface PistonBattleSubmissionResult {
  userId: string;
  passed: boolean;
  passedCount: number;
  totalCount: number;
  totalTime: number;       // Total execution time in ms
  totalMemory: number;     // Total memory in KB
  submittedAt: number;     // Timestamp
  compilationError?: string;
}

// Submit battle code using Piston API (FREE - no quota limits!)
export const submitBattleCodePiston = async (
  userId: string,
  code: string,
  language: string,
  testCases: { input: string; output: string }[]
): Promise<PistonBattleSubmissionResult> => {
  const submittedAt = Date.now();
  
  if (!testCases || testCases.length === 0) {
    return {
      userId,
      passed: false,
      passedCount: 0,
      totalCount: 0,
      totalTime: 0,
      totalMemory: 0,
      submittedAt,
      compilationError: 'No test cases provided'
    };
  }

  let passedCount = 0;
  let totalTime = 0;

  for (const testCase of testCases) {
    const result = await executeCode(code, language, testCase.input);

    // Handle compilation errors - stop immediately
    if (result.error && (
      result.error.toLowerCase().includes('compile') || 
      result.error.toLowerCase().includes('syntax') ||
      result.error.toLowerCase().includes('error:')
    )) {
      return {
        userId,
        passed: false,
        passedCount: 0,
        totalCount: testCases.length,
        totalTime: 0,
        totalMemory: 0,
        submittedAt,
        compilationError: result.error
      };
    }

    const actualOutput = (result.output || '').trim();
    const expectedOutput = testCase.output.trim();
    const passed = result.success && normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);

    if (passed) passedCount++;
    if (result.executionTime) totalTime += result.executionTime;
  }

  return {
    userId,
    passed: passedCount === testCases.length,
    passedCount,
    totalCount: testCases.length,
    totalTime,
    totalMemory: 0,
    submittedAt
  };
};

// Determine battle winner based on submissions
export const determineBattleWinnerPiston = (
  submission1: PistonBattleSubmissionResult,
  submission2: PistonBattleSubmissionResult
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
