// Secure code execution service - now uses custom backend only
// All Firebase authentication removed

import { apiRequest } from './api';
import { codeSubmissionLimiter, validateCodeSubmission } from '../middleware/inputValidator';

interface ExecutionResult {
  output: string;
  status: string;
  time: string;
  memory: string;
  stderr: string | null;
  compile_output: string | null;
}

interface BattleResult {
  winnerId: string | null;
  winnerCoins: number;
  loserCoins: number;
  executionResults: {
    [playerId: string]: ExecutionResult;
  };
}

class SecureCodeExecutionService {
  private readonly BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Execute code securely through backend proxy
  async executeCode(code: string, language: string, input?: string): Promise<ExecutionResult> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Authentication required');
    }

    // Validate and sanitize input
    const validatedSubmission = validateCodeSubmission({ code, language });

    try {
      const response = await fetch(`${this.BACKEND_URL}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          source_code: validatedSubmission.code,
          language_id: this.getLanguageId(language),
          stdin: input || ''
        })
      });

      if (!response.ok) {
        throw new Error(`Execution failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Code execution error:', error);
      throw new Error('Failed to execute code. Please try again.');
    }
  }

  // Submit code for challenge with server-side validation
  async submitChallenge(challengeId: string, code: string, language: string): Promise<boolean> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Authentication required');
    }

    const validatedSubmission = validateCodeSubmission({ code, language, challengeId });

    try {
      const response = await apiRequest('/api/challenge/submit', {
        method: 'POST',
        body: JSON.stringify({
          challengeId,
          source_code: validatedSubmission.code,
          language_id: this.getLanguageId(language)
        })
      });

      return response.success || false;
    } catch (error) {
      console.error('Challenge submission error:', error);
      throw new Error('Failed to submit solution. Please try again.');
    }
  }

  // Submit battle solution with server-side validation
  async submitBattleSolution(battleId: string, code: string, language: string): Promise<ExecutionResult> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Authentication required');
    }

    const validatedSubmission = validateCodeSubmission({ code, language, battleId });

    try {
      const response = await apiRequest(`/battles/${battleId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          code: validatedSubmission.code,
          language: language
        })
      });

      return response;
    } catch (error) {
      console.error('Battle submission error:', error);
      throw new Error('Failed to submit battle solution. Please try again.');
    }
  }

  private getLanguageId(language: string): number {
    const languageMap: { [key: string]: number } = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
      c: 50,
      csharp: 51,
      ruby: 72,
      go: 60,
      rust: 73,
      php: 68,
      swift: 83,
      kotlin: 78
    };
    return languageMap[language.toLowerCase()] || 63;
  }

  // Verify user can enter battle (check coins, etc.)
  async verifyBattleEntry(userId: string, entryFee: number): Promise<boolean> {
    try {
      const response = await apiRequest(`/battles/verify-entry?userId=${userId}&fee=${entryFee}`);
      return response.canEnter || false;
    } catch (error) {
      console.error('Battle entry verification error:', error);
      return false;
    }
  }
}

export const secureCodeExecutionService = new SecureCodeExecutionService();
export default secureCodeExecutionService;
