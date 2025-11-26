// Piston API - Free code execution service
// Documentation: https://github.com/engineer-man/piston

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

// Language mappings for Piston API
const languageMap: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' }
};

export async function executeCode(
  code: string,
  language: 'javascript' | 'python' | 'java' | 'cpp',
  input: string = ''
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    const langConfig = languageMap[language];
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
  switch (language) {
    case 'javascript':
      return 'solution.js';
    case 'python':
      return 'solution.py';
    case 'java':
      return 'Solution.java';
    case 'cpp':
      return 'solution.cpp';
    default:
      return 'solution.txt';
  }
}

export async function runTestCases(
  code: string,
  language: 'javascript' | 'python' | 'java' | 'cpp',
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
