// API helpers for CodeArena - Uses Piston API for code execution
import type { ExecutionResult, Language, Problem, TestCase } from './types';

const PISTON_API = 'https://emkc.org/api/v2/piston/execute';

const PISTON_VERSIONS: Record<Language, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  c: { language: 'c', version: '10.2.0' }
};

// Execute code against a single test case
export async function executeCode(
  code: string,
  language: Language,
  input: string
): Promise<{ output: string; error?: string; time: number }> {
  const config = PISTON_VERSIONS[language];
  const startTime = Date.now();

  try {
    const response = await fetch(PISTON_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ content: code }],
        stdin: input
      })
    });

    if (!response.ok) {
      throw new Error('Execution service unavailable');
    }

    const result = await response.json();
    const runResult = result.run || {};
    const time = Date.now() - startTime;

    if (runResult.stderr && !runResult.stdout) {
      return { output: '', error: runResult.stderr, time };
    }

    return {
      output: (runResult.stdout || runResult.output || '').trim(),
      error: runResult.stderr || undefined,
      time
    };
  } catch (error: any) {
    return {
      output: '',
      error: error.message || 'Execution failed',
      time: Date.now() - startTime
    };
  }
}

// Run code against all test cases
export async function runAllTestCases(
  code: string,
  language: Language,
  testCases: TestCase[]
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];

  for (const testCase of testCases) {
    const { output, error, time } = await executeCode(code, language, testCase.input);
    
    const normalizedOutput = normalizeOutput(output);
    const normalizedExpected = normalizeOutput(testCase.output);
    const passed = !error && normalizedOutput === normalizedExpected;

    results.push({
      passed,
      input: testCase.input,
      expected: testCase.output,
      actual: output || error || 'No output',
      error,
      time
    });
  }

  return results;
}

// Normalize output for comparison
function normalizeOutput(output: string): string {
  if (!output) return '';
  return output
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}

// Load problems from questions.json
let cachedProblems: Problem[] = [];

export async function loadProblems(): Promise<Problem[]> {
  if (cachedProblems.length > 0) return cachedProblems;

  try {
    const response = await fetch('/questions.json');
    const data = await response.json();
    
    // Handle both array and object format
    const problems = Array.isArray(data) 
      ? data 
      : data.problems || data.questions || [];
    
    cachedProblems = problems.map((p: any) => ({
      ...p,
      testCases: p.testCases || p.test_cases || []
    }));
    
    return cachedProblems;
  } catch (error) {
    console.error('Failed to load problems:', error);
    return [];
  }
}

// Get problems by difficulty
export async function getProblemsByDifficulty(difficulty?: string): Promise<Problem[]> {
  const problems = await loadProblems();
  if (!difficulty || difficulty === 'all') return problems;
  return problems.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
}

// Get a random problem by difficulty
export async function getRandomProblem(difficulty: string): Promise<Problem | null> {
  const problems = await getProblemsByDifficulty(difficulty);
  if (problems.length === 0) return null;
  return problems[Math.floor(Math.random() * problems.length)];
}

// Calculate score from test results
export function calculateScore(results: ExecutionResult[]): number {
  if (!results.length) return 0;
  const passed = results.filter(r => r.passed).length;
  return Math.round((passed / results.length) * 100);
}
