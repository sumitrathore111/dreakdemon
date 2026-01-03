import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  Coins,
  Loader2,
  Play,
  RefreshCw,
  Send,
  Swords,
  Trophy,
  X,
  Zap
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { apiRequest } from '../../service/api';
import { calculateScore, runAllTestCases } from './api';
import CodeEditor, { LanguageSelector } from './CodeEditor';
import type { Battle, ExecutionResult, Language } from './types';
import { DIFFICULTY_COLORS, ENTRY_FEES, LANGUAGE_CONFIG } from './types';

interface BattleModeProps {
  onBack: () => void;
  walletBalance: number;
  onWalletUpdate: () => void;
}

type BattleState = 'lobby' | 'searching' | 'countdown' | 'active' | 'completed';

export default function BattleMode({ onBack, walletBalance, onWalletUpdate }: BattleModeProps) {
  const { user } = useAuth();
  const [battleState, setBattleState] = useState<BattleState>('lobby');
  const [battle, setBattle] = useState<Battle | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedFee, setSelectedFee] = useState(ENTRY_FEES[0]);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  
  // Editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<Language>('python');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const battleIdRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Find or create battle
  const handleFindBattle = async () => {
    if (walletBalance < selectedFee) {
      setError('Insufficient coins');
      return;
    }

    setError(null);
    setBattleState('searching');

    try {
      // Try to find existing battle
      const findResponse = await apiRequest(`/battles/find?difficulty=${selectedDifficulty}&entryFee=${selectedFee}`);
      
      if (findResponse.battle) {
        // Join existing battle
        const joinResponse = await apiRequest(`/battles/${findResponse.battle._id}/join`, {
          method: 'POST',
          body: JSON.stringify({
            userName: user?.name || 'Anonymous',
            userAvatar: (user as any)?.avatar,
            rating: (user as any)?.battleRating || 1000
          })
        });
        
        battleIdRef.current = findResponse.battle._id;
        setBattle(formatBattle(joinResponse.battle));
        setBattleState('countdown');
        startCountdown(findResponse.battle._id);
      } else {
        // Create new battle
        const createResponse = await apiRequest('/battles/create', {
          method: 'POST',
          body: JSON.stringify({
            difficulty: selectedDifficulty,
            entryFee: selectedFee,
            userName: user?.name || 'Anonymous',
            userAvatar: (user as any)?.avatar,
            rating: (user as any)?.battleRating || 1000
          })
        });
        
        battleIdRef.current = createResponse.battleId;
        setBattle(formatBattle(createResponse.battle));
        startPollingForOpponent(createResponse.battleId);
      }
      
      onWalletUpdate();
    } catch (err: any) {
      console.error('Battle error:', err);
      setError(err.message || 'Failed to find battle');
      setBattleState('lobby');
    }
  };

  // Format battle data
  const formatBattle = (data: any): Battle => ({
    id: data._id || data.id,
    status: data.status,
    difficulty: data.difficulty,
    entryFee: data.entryFee,
    prize: data.prize,
    timeLimit: data.timeLimit,
    challenge: data.challenge,
    participants: data.participants?.map((p: any) => ({
      odId: p.odId || p.userId,
      odName: p.odName || p.userName,
      odProfilePic: p.odProfilePic || p.userAvatar,
      rating: p.rating || 1000,
      hasSubmitted: p.hasSubmitted || false,
      score: p.score || 0
    })) || [],
    startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
    completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    winner: data.winner
  });

  // Poll for opponent
  const startPollingForOpponent = (battleId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const response = await apiRequest(`/battles/${battleId}`);
        const updatedBattle = formatBattle(response);
        setBattle(updatedBattle);

        if (updatedBattle.status === 'countdown' || updatedBattle.participants.length >= 2) {
          if (pollRef.current) clearInterval(pollRef.current);
          setBattleState('countdown');
          startCountdown(battleId);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 2000);
  };

  // Countdown before battle
  const startCountdown = (battleId: string) => {
    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startBattle(battleId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start the actual battle
  const startBattle = async (battleId: string) => {
    try {
      await apiRequest(`/battles/${battleId}/start`, { method: 'POST' });
      
      const response = await apiRequest(`/battles/${battleId}`);
      const updatedBattle = formatBattle(response);
      setBattle(updatedBattle);
      
      setCode(LANGUAGE_CONFIG[language].template);
      setTimeLeft(updatedBattle.timeLimit);
      setBattleState('active');
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Poll for opponent status
      startBattlePolling(battleId);
    } catch (err) {
      console.error('Start battle error:', err);
    }
  };

  // Poll during battle
  const startBattlePolling = (battleId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const response = await apiRequest(`/battles/${battleId}`);
        const updatedBattle = formatBattle(response);
        setBattle(updatedBattle);

        // Check if opponent submitted
        const opponent = updatedBattle.participants.find(p => p.odId !== user?.id);
        if (opponent?.hasSubmitted && !opponentSubmitted) {
          setOpponentSubmitted(true);
        }

        // Check if battle completed
        if (updatedBattle.status === 'completed') {
          if (pollRef.current) clearInterval(pollRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          setBattleState('completed');
          onWalletUpdate();
        }
      } catch (err) {
        console.error('Battle poll error:', err);
      }
    }, 3000);
  };

  // Run code locally
  const handleRun = async () => {
    if (!battle?.challenge || isRunning) return;
    
    setIsRunning(true);
    setResults([]);

    try {
      const testResults = await runAllTestCases(code, language, battle.challenge.testCases.slice(0, 2));
      setResults(testResults);
    } catch (err) {
      console.error('Run error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code
  const handleSubmit = async () => {
    if (!battle || isSubmitting || hasSubmitted) return;
    
    setIsSubmitting(true);

    try {
      const response = await apiRequest(`/battles/${battle.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ code, language })
      });

      setMyScore(response.passedCount ? Math.round((response.passedCount / response.totalCount) * 100) : 0);
      setHasSubmitted(true);
      
      if (response.battleComplete) {
        if (pollRef.current) clearInterval(pollRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setBattleState('completed');
        onWalletUpdate();
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto submit when time runs out
  const handleAutoSubmit = useCallback(() => {
    if (!hasSubmitted && battle) {
      handleSubmit();
    }
  }, [hasSubmitted, battle]);

  // Cancel battle
  const handleCancel = async () => {
    if (battleIdRef.current) {
      try {
        await apiRequest(`/battles/${battleIdRef.current}`, { method: 'DELETE' });
      } catch (err) {
        // Ignore errors
      }
    }
    
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    setBattle(null);
    setBattleState('lobby');
    battleIdRef.current = null;
    onWalletUpdate();
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get opponent
  const opponent = battle?.participants.find(p => p.odId !== user?.id);
  const me = battle?.participants.find(p => p.odId === user?.id);
  const isWinner = battle?.winner === user?.id;

  // Lobby view
  if (battleState === 'lobby') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1v1 Battle Arena</h2>
            <p className="text-gray-500">Challenge other developers in real-time coding battles</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Difficulty selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00ADB5]" />
              Select Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedDifficulty === diff
                      ? `${DIFFICULTY_COLORS[diff.charAt(0).toUpperCase() + diff.slice(1) as 'Easy' | 'Medium' | 'Hard'].border} ${DIFFICULTY_COLORS[diff.charAt(0).toUpperCase() + diff.slice(1) as 'Easy' | 'Medium' | 'Hard'].bg}`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`font-semibold capitalize ${DIFFICULTY_COLORS[diff.charAt(0).toUpperCase() + diff.slice(1) as 'Easy' | 'Medium' | 'Hard'].text}`}>
                    {diff}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {diff === 'easy' ? '15 min' : diff === 'medium' ? '20 min' : '30 min'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Entry fee selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              Entry Fee
            </h3>
            <div className="flex flex-wrap gap-2">
              {ENTRY_FEES.map((fee) => (
                <button
                  key={fee}
                  onClick={() => setSelectedFee(fee)}
                  disabled={walletBalance < fee}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedFee === fee
                      ? 'bg-[#00ADB5] text-white'
                      : walletBalance < fee
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {fee} <Coins className="inline w-3 h-3 ml-1" />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Prize Pool: <span className="font-bold text-[#00ADB5]">{Math.floor(selectedFee * 2 * 0.9)}</span> coins (10% platform fee)
            </p>
          </div>
        </div>

        {/* Find battle button */}
        <motion.button
          onClick={handleFindBattle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-[#00ADB5] to-[#00d4ff] text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Swords className="w-6 h-6" />
          Find Battle
        </motion.button>

        {/* Your balance */}
        <div className="text-center text-gray-500">
          Your balance: <span className="font-bold text-[#00ADB5]">{walletBalance}</span> coins
        </div>
      </div>
    );
  }

  // Searching view
  if (battleState === 'searching') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 border-4 border-[#00ADB5] border-t-transparent rounded-full mb-6"
        />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Finding Opponent...</h2>
        <p className="text-gray-500 mb-6">Searching for {selectedDifficulty} battles</p>
        <button
          onClick={handleCancel}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Countdown view
  if (battleState === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          key={countdown}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="text-8xl font-bold text-[#00ADB5] mb-8"
        >
          {countdown}
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Battle Starting!</h2>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <img
              src={(user as any)?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
              className="w-16 h-16 rounded-full border-4 border-[#00ADB5] mx-auto mb-2"
              alt="You"
            />
            <p className="font-medium text-gray-900 dark:text-white">You</p>
          </div>
          <Swords className="w-8 h-8 text-[#00ADB5]" />
          <div className="text-center">
            <img
              src={opponent?.odProfilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=opponent`}
              className="w-16 h-16 rounded-full border-4 border-orange-500 mx-auto mb-2"
              alt="Opponent"
            />
            <p className="font-medium text-gray-900 dark:text-white">{opponent?.odName || 'Opponent'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Completed view
  if (battleState === 'completed' && battle) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
            isWinner ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          {isWinner ? (
            <Trophy className="w-12 h-12 text-yellow-500" />
          ) : (
            <X className="w-12 h-12 text-gray-400" />
          )}
        </motion.div>

        <h2 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-yellow-500' : 'text-gray-500'}`}>
          {isWinner ? 'Victory!' : 'Defeat'}
        </h2>
        
        <p className="text-gray-500 mb-6">
          {isWinner ? `You won ${battle.prize} coins!` : 'Better luck next time!'}
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 min-w-[300px]">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="font-medium text-gray-900 dark:text-white">{me?.odName || 'You'}</p>
              <p className="text-2xl font-bold text-[#00ADB5]">{me?.score || myScore || 0}%</p>
            </div>
            <div className="text-gray-400">VS</div>
            <div className="text-center">
              <p className="font-medium text-gray-900 dark:text-white">{opponent?.odName || 'Opponent'}</p>
              <p className="text-2xl font-bold text-orange-500">{opponent?.score || 0}%</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Back to Lobby
          </button>
          <button
            onClick={handleFindBattle}
            className="px-6 py-3 bg-[#00ADB5] text-white rounded-xl font-medium hover:bg-[#00ADB5]/90 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Active battle view
  if (battleState === 'active' && battle) {
    const problem = battle.challenge;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={me?.odProfilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                className="w-10 h-10 rounded-full border-2 border-[#00ADB5]"
                alt="You"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">You</p>
                {hasSubmitted && <span className="text-xs text-green-500">Submitted ✓</span>}
              </div>
            </div>
            <Swords className="w-5 h-5 text-gray-400" />
            <div className="flex items-center gap-2">
              <img
                src={opponent?.odProfilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=opponent`}
                className="w-10 h-10 rounded-full border-2 border-orange-500"
                alt="Opponent"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{opponent?.odName}</p>
                {opponentSubmitted && <span className="text-xs text-green-500">Submitted ✓</span>}
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${
            timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Problem */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 max-h-[500px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[problem.difficulty].bg} ${DIFFICULTY_COLORS[problem.difficulty].text}`}>
                {problem.difficulty}
              </span>
              <h3 className="font-bold text-gray-900 dark:text-white">{problem.title}</h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{problem.description}</p>
              
              <div>
                <strong className="text-gray-900 dark:text-white">Input Format:</strong>
                <p className="text-gray-600 dark:text-gray-300">{problem.inputFormat}</p>
              </div>
              
              <div>
                <strong className="text-gray-900 dark:text-white">Output Format:</strong>
                <p className="text-gray-600 dark:text-gray-300">{problem.outputFormat}</p>
              </div>

              <div>
                <strong className="text-gray-900 dark:text-white">Example:</strong>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-2 font-mono text-xs">
                  <div><span className="text-gray-500">Input:</span><pre className="text-gray-800 dark:text-gray-200">{problem.testCases[0]?.input}</pre></div>
                  <div><span className="text-gray-500">Output:</span><pre className="text-gray-800 dark:text-gray-200">{problem.testCases[0]?.output}</pre></div>
                </div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <LanguageSelector language={language} onChange={setLanguage} disabled={hasSubmitted} />
              <div className="flex gap-2">
                <button
                  onClick={handleRun}
                  disabled={isRunning || hasSubmitted}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || hasSubmitted}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00ADB5] text-white rounded-lg hover:bg-[#00ADB5]/90 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {hasSubmitted ? 'Submitted' : 'Submit'}
                </button>
              </div>
            </div>

            <CodeEditor code={code} language={language} onChange={setCode} readOnly={hasSubmitted} height="300px" />

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Results: {results.filter(r => r.passed).length}/{results.length} passed
                </div>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className={`p-2 rounded text-xs ${r.passed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <span className={r.passed ? 'text-green-600' : 'text-red-600'}>
                        Test {i + 1}: {r.passed ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasSubmitted && myScore !== null && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="text-green-700 dark:text-green-400 font-medium">Code submitted!</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{myScore}%</p>
                <p className="text-sm text-green-600 dark:text-green-500">Waiting for opponent...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
