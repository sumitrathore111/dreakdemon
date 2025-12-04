// Secure code execution service with backend proxy

import { doc, getDoc, increment, updateDoc, writeBatch } from 'firebase/firestore';
import { codeSubmissionLimiter, validateCodeSubmission } from '../middleware/inputValidator';
import { auth, db } from './Firebase';

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
  private readonly BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // Execute code securely through backend proxy
  async executeCode(code: string, language: string, input?: string): Promise<ExecutionResult> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required');
    }

    // Rate limiting check
    if (!codeSubmissionLimiter.isAllowed(user.uid)) {
      throw new Error('Too many submissions. Please wait before trying again.');
    }

    // Validate and sanitize input
    const validatedSubmission = validateCodeSubmission({ code, language });

    try {
      const response = await fetch(`${this.BACKEND_URL}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          source_code: validatedSubmission.code,
          language_id: this.getLanguageId(language),
          stdin: input || '',
          userid: user.uid
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
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required');
    }

    // Rate limiting
    if (!codeSubmissionLimiter.isAllowed(user.uid)) {
      throw new Error('Too many submissions. Please wait before trying again.');
    }

    const validatedSubmission = validateCodeSubmission({ code, language, challengeId });

    try {
      const response = await fetch(`${this.BACKEND_URL}/api/challenge/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          challengeId,
          source_code: validatedSubmission.code,
          language_id: this.getLanguageId(language),
          userId: user.uid
        })
      });

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Server validates and awards coins
      if (result.success && result.coinsAwarded > 0) {
        await this.updateUserCoins(user.uid, result.coinsAwarded);
      }

      return result.success;
    } catch (error) {
      console.error('Challenge submission error:', error);
      throw new Error('Failed to submit solution. Please try again.');
    }
  }

  // Submit battle solution with server-side validation
  async submitBattleSolution(battleId: string, code: string, language: string): Promise<ExecutionResult> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required');
    }

    // Rate limiting
    if (!codeSubmissionLimiter.isAllowed(user.uid)) {
      throw new Error('Too many submissions. Please wait before trying again.');
    }

    const validatedSubmission = validateCodeSubmission({ code, language, battleId });

    try {
      const response = await fetch(`${this.BACKEND_URL}/api/battle/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          battleId,
          source_code: validatedSubmission.code,
          language_id: this.getLanguageId(language),
          userId: user.uid
        })
      });

      if (!response.ok) {
        throw new Error(`Battle submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Check if battle is complete and update coins if needed
      if (result.battleComplete && result.winnerData) {
        await this.processBattleResult(battleId, result.winnerData);
      }

      return result.executionResult;
    } catch (error) {
      console.error('Battle submission error:', error);
      throw new Error('Failed to submit battle solution. Please try again.');
    }
  }

  // Securely process battle results with atomic transactions
  private async processBattleResult(battleId: string, battleResult: BattleResult): Promise<void> {
    const { winnerId, winnerCoins, loserCoins } = battleResult;

    if (!winnerId) return; // Draw or invalid result

    const batch = writeBatch(db);

    try {
      // Update winner coins
      const winnerRef = doc(db, 'users', winnerId);
      batch.update(winnerRef, {
        coins: increment(winnerCoins),
        battlesWon: increment(1)
      });

      // Update loser coins (subtract entry fee)
      const battleDoc = await getDoc(doc(db, 'battles', battleId));
      if (battleDoc.exists()) {
        const battleData = battleDoc.data();
        const loserId = battleData.participants.find((id: string) => id !== winnerId);
        
        if (loserId) {
          const loserRef = doc(db, 'users', loserId);
          batch.update(loserRef, {
            coins: increment(-battleData.entryFee),
            battlesLost: increment(1)
          });
        }
      }

      // Update battle status
      const battleRef = doc(db, 'battles', battleId);
      batch.update(battleRef, {
        status: 'completed',
        winnerId,
        completedAt: new Date(),
        result: battleResult
      });

      // Commit all changes atomically
      await batch.commit();

      // Log the transaction for audit
      await this.logBattleTransaction(battleId, winnerId, winnerCoins, loserCoins);

    } catch (error) {
      console.error('Battle result processing error:', error);
      throw new Error('Failed to process battle result');
    }
  }

  // Secure coin update with validation
  private async updateUserCoins(userId: string, amount: number): Promise<void> {
    if (amount <= 0 || amount > 1000) {
      throw new Error('Invalid coin amount');
    }

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        coins: increment(amount),
        lastCoinUpdate: new Date()
      });

      // Log the transaction
      await this.logCoinTransaction(userId, amount, 'challenge_reward');
    } catch (error) {
      console.error('Coin update error:', error);
      throw new Error('Failed to update coins');
    }
  }

  // Audit logging for transactions
  private async logBattleTransaction(battleId: string, winnerId: string, winnerCoins: number, loserCoins: number): Promise<void> {
    try {
      const logRef = doc(db, 'auditLogs', `battle_${battleId}_${Date.now()}`);
      await updateDoc(logRef, {
        type: 'battle_result',
        battleId,
        winnerId,
        winnerCoins,
        loserCoins,
        timestamp: new Date(),
        ip: 'client-side' // In real backend, get actual IP
      });
    } catch (error) {
      console.error('Failed to log battle transaction:', error);
    }
  }

  private async logCoinTransaction(userId: string, amount: number, reason: string): Promise<void> {
    try {
      const logRef = doc(db, 'auditLogs', `coin_${userId}_${Date.now()}`);
      await updateDoc(logRef, {
        type: 'coin_transaction',
        userId,
        amount,
        reason,
        timestamp: new Date(),
        ip: 'client-side' // In real backend, get actual IP
      });
    } catch (error) {
      console.error('Failed to log coin transaction:', error);
    }
  }

  // Map language names to Piston language IDs
  private getLanguageId(language: string): number {
    const languageMap: { [key: string]: number } = {
      'javascript': 63, // Node.js
      'python': 71,     // Python 3
      'cpp': 54,        // C++ 17
      'java': 62,       // Java 13
      'c': 50,          // C (GCC 9.2.0)
      'go': 60,         // Go 1.13.5
      'rust': 73        // Rust 1.40.0
    };

    const id = languageMap[language.toLowerCase()];
    if (!id) {
      throw new Error(`Unsupported language: ${language}`);
    }

    return id;
  }

  // Get supported languages list
  getSupportedLanguages() {
    const languages = [
      { id: 'python', name: 'Python', languageId: 71 },
      { id: 'javascript', name: 'JavaScript', languageId: 63 },
      { id: 'cpp', name: 'C++', languageId: 54 },
      { id: 'java', name: 'Java', languageId: 62 },
      { id: 'c', name: 'C', languageId: 50 },
      { id: 'go', name: 'Go', languageId: 60 },
      { id: 'rust', name: 'Rust', languageId: 73 }
    ];
    return languages;
  }

  // Verify user has sufficient coins for battle entry
  async verifyBattleEntry(userId: string, entryFee: number): Promise<boolean> {
    try {
      const walletDoc = await getDoc(doc(db, 'CodeArena_Wallets', userId));
      if (!walletDoc.exists()) {
        return false;
      }

      const walletData = walletDoc.data();
      return (walletData.coins || 0) >= entryFee;
    } catch (error) {
      console.error('Battle entry verification error:', error);
      return false;
    }
  }

  // Get secure user stats
  async getUserStats(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const walletDoc = await getDoc(doc(db, 'CodeArena_Wallets', userId));
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      const walletData = walletDoc.exists() ? walletDoc.data() : {};
      
      return {
        coins: walletData.coins || 0,
        battlesWon: userData.battlesWon || 0,
        battlesLost: userData.battlesLost || 0,
        challengesSolved: userData.challengesSolved || 0,
        rating: walletData.rating || userData.rating || 1000
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return null;
    }
  }
}

export const secureCodeExecutionService = new SecureCodeExecutionService();