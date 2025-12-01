import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Clock, Send, Trophy, Code2,
  CheckCircle, XCircle, Loader2,
  ChevronDown, Shield
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../service/Firebase';
import { secureCodeExecutionService } from '../../service/secureCodeExecution';
import { SecurityError, ValidationError } from '../../middleware/inputValidator';
import { getSupportedLanguages } from '../../service/judge0';

interface BattleSubmissionResult {
  success: boolean;
  passed?: boolean;
  output?: string;
  status: string;
  time?: string;
  memory?: string;
  error?: string;
  executionTime?: number;
  passedCount?: number;
  totalCount?: number;
  totalTime?: number;
}
import { fetchChallengeById, getChallengeTestCases, type Challenge } from '../../service/challenges';

interface Participant {
  odId: string;
  odName: string;
  odProfilePic: string;
  rating: number;
  hasSubmitted: boolean;
  submissionResult?: {
    success: boolean;
    executionTime: number;
    status: string;
  };
}

interface Battle {
  id: string;
  status: 'waiting' | 'countdown' | 'active' | 'completed';
  participants: Participant[];
  challenge: {
    id: string;
    title: string;
    difficulty: string;
    category: string;
    coinReward: number;
  };
  difficulty: string;
  entryFee: number;
  prize: number;
  timeLimit: number; // in seconds
  startTime?: Timestamp;
  endTime?: Timestamp;
  winnerId?: string;
  winReason?: string;
}

const BattleRoom = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { } = useDataContext();
  
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [testCases, setTestCases] = useState<{ input: string; output: string }[]>([]);
  
  // Editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [myResult, setMyResult] = useState<BattleSubmissionResult | null>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const languages = getSupportedLanguages();

  const defaultCode: { [key: string]: string } = {
    python: `# Battle Mode - Write your solution fast!
def solve():
    n = int(input())
    # Your code here
    print(result)

solve()`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin >> n;
    // Your code here
    cout << result << endl;
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Your code here
        System.out.println(result);
    }
}`,
    javascript: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const n = parseInt(lines[0]);
    // Your code here
    console.log(result);
});`,
  };

  // Subscribe to battle updates
  useEffect(() => {
    if (!battleId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'CodeArena_Battles', battleId),
      async (snapshot) => {
        if (!snapshot.exists()) {
          navigate('/dashboard/codearena');
          return;
        }

        const battleData = { id: snapshot.id, ...snapshot.data() } as Battle;
        setBattle(battleData);

        // Load challenge details
        if (battleData.challenge && !challenge) {
          const challengeData = await fetchChallengeById(battleData.challenge.id);
          if (challengeData) {
            setChallenge(challengeData);
            // Get test cases for validation (includes hidden ones for battles)
            const cases = await getChallengeTestCases(battleData.challenge.id, true);
            setTestCases(cases);
          }
        }

        // Check if battle is completed
        if (battleData.status === 'completed' && battleData.winnerId) {
          navigate(`/dashboard/codearena/battle/results/${battleId}`);
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [battleId, challenge]);

  // Countdown timer
  useEffect(() => {
    if (battle?.status === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else if (countdown === 0) {
        // Show "GO!" for 1 second, then start the battle
        const timer = setTimeout(async () => {
          if (battleId) {
            const battleRef = doc(db, 'CodeArena_Battles', battleId);
            await updateDoc(battleRef, {
              status: 'active',
              startTime: new Date()
            });
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [battle?.status, countdown, battleId]);

  // Reset countdown when battle status changes to countdown
  useEffect(() => {
    if (battle?.status === 'countdown') {
      setCountdown(3); // Start from 3
    }
  }, [battle?.status]);

  // Battle timer
  useEffect(() => {
    if (battle?.status === 'active' && battle.startTime) {
      const startTime = battle.startTime.toDate().getTime();
      const duration = battle.timeLimit * 1000;
      
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = Math.max(0, duration - elapsed);
        setTimeLeft(Math.ceil(remaining / 1000));
        
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
        }
      }, 1000);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [battle?.status, battle?.startTime]);

  // Set default code
  useEffect(() => {
    setCode(defaultCode[language] || defaultCode.python);
  }, [language]);

  const handleTimeUp = async () => {
    // If user hasn't submitted, auto-submit
    if (!hasSubmitted && battle) {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user || !battle || isSubmitting || hasSubmitted || !battleId) return;

    setIsSubmitting(true);

    try {
      // Submit code using secure service
      const result = await secureCodeExecutionService.submitBattleSolution(
        battleId,
        code,
        language
      );

      // Convert to expected format
      const submissionResult = {
        success: result.status === 'Accepted',
        executionTime: parseFloat(result.time || '0'),
        status: result.status || 'Unknown'
      };

      setMyResult(submissionResult);
      setHasSubmitted(true);

      // Update battle in Firestore with client submission (server validates)
      const battleRef = doc(db, 'CodeArena_Battles', battleId);
      
      const updatedParticipants = battle.participants.map(p => {
        if (p.odId === user.uid) {
          return {
            ...p,
            hasSubmitted: true,
            submissionResult
          };
        }
        return p;
      });

      await updateDoc(battleRef, {
        participants: updatedParticipants,
        lastUpdate: Timestamp.now()
      });

      // Server-side handles battle completion and coin distribution

    } catch (error: any) {
      console.error('Battle submission error:', error);
      
      let errorMessage = 'Submission failed. Please try again.';
      if (error instanceof SecurityError) {
        errorMessage = `Security Error: ${error.message}`;
      } else if (error instanceof ValidationError) {
        errorMessage = `Validation Error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(errorMessage);
      
      // Set error result
      setMyResult({
        success: false,
        executionTime: 0,
        status: 'Error'
      });
    }

    setIsSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOpponent = () => {
    return battle?.participants.find(p => p.odId !== user?.uid);
  };

  const getMe = () => {
    return battle?.participants.find(p => p.odId === user?.uid);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading battle...</p>
        </div>
      </div>
    );
  }

  // Countdown overlay
  if (battle?.status === 'countdown' && countdown >= 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Background animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          key={countdown}
          initial={{ scale: 0.3, opacity: 0, rotateY: -180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          className="text-center z-10"
        >
          {/* Players info */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                <span className="text-white font-bold text-lg">
                  {battle.participants[0]?.odName.charAt(0)}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{battle.participants[0]?.odName}</p>
            </div>
            
            <div className="text-cyan-400 text-4xl font-bold">VS</div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-2">
                <span className="text-white font-bold text-lg">
                  {battle.participants[1]?.odName.charAt(0)}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{battle.participants[1]?.odName}</p>
            </div>
          </div>

          <p className="text-gray-400 text-xl mb-6">Battle starts in</p>
          
          <motion.div
            animate={{ 
              scale: countdown === 0 ? [1, 1.3, 1] : [1, 1.2, 1],
              color: countdown <= 1 ? "#ef4444" : "#06b6d4"
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-9xl font-black mb-6"
            style={{
              textShadow: "0 0 50px currentColor",
              filter: "drop-shadow(0 0 20px currentColor)"
            }}
          >
            {countdown === 0 ? 'GO!' : countdown}
          </motion.div>
          
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-gray-400 text-lg"
          >
            {countdown === 0 ? '🚀 Battle begins now!' : '⚡ Get ready to code!'}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const opponent = getOpponent();
  const me = getMe();

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden -mx-4 -mt-6">
      {/* Battle Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Me */}
          <div className="flex items-center gap-3">
            <img
              src={me?.odProfilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
              alt="You"
              className="w-10 h-10 rounded-full border-2 border-cyan-400"
            />
            <div>
              <p className="text-white font-medium">{me?.odName || 'You'}</p>
              <p className="text-xs text-gray-400">Rating: {me?.rating || 1000}</p>
            </div>
            {me?.hasSubmitted && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>

          {/* Center - Timer & Problem */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${timeLeft <= 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {battle?.challenge?.title || 'Loading challenge...'}
            </p>
          </div>

          {/* Right - Opponent */}
          <div className="flex items-center gap-3">
            {opponent?.hasSubmitted && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <div className="text-right">
              <p className="text-white font-medium">{opponent?.odName || 'Opponent'}</p>
              <p className="text-xs text-gray-400">Rating: {opponent?.rating || 1000}</p>
            </div>
            <img
              src={opponent?.odProfilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent?.odId}`}
              alt="Opponent"
              className="w-10 h-10 rounded-full border-2 border-red-400"
            />
          </div>
        </div>

        {/* Prize Pool */}
        <div className="flex justify-center mt-2 gap-4">
          <div className="flex items-center gap-2 px-4 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold">{battle?.prize || 0} coins</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 text-green-400 bg-green-500/10 rounded-full border border-green-500/20">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Secure Battle</span>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Problem */}
        <div className="w-1/3 border-r border-gray-700 flex flex-col overflow-hidden">
          <div className="p-3 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              {challenge?.title || 'Loading Challenge...'}
            </h3>
            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
              {battle?.difficulty}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: challenge?.problemStatement || '<p class="text-gray-400">Loading challenge...</p>' }}
            />
            
            {/* Sample Test Cases */}
            {testCases.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-white font-medium">Sample Cases</h4>
                {testCases.slice(0, 2).map((tc, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-3 text-sm">
                    <div className="mb-2">
                      <span className="text-gray-400 text-xs">Input:</span>
                      <pre className="text-cyan-400 font-mono mt-1">{tc.input}</pre>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Output:</span>
                      <pre className="text-green-400 font-mono mt-1">{tc.output}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Editors */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* My Editor */}
          <div className="flex-1 flex flex-col border-b border-gray-700 overflow-hidden">
            <div className="p-2 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">Your Code</span>
                {hasSubmitted && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Submitted
                  </span>
                )}
              </div>
              
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  disabled={hasSubmitted}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50"
                >
                  <span className="text-white capitalize">{language}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                
                <AnimatePresence>
                  {showLanguageMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-full mt-1 w-36 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                      {languages.filter(l => ['python', 'cpp', 'java', 'javascript'].includes(l.id)).map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => {
                            setLanguage(lang.id);
                            setShowLanguageMenu(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700 ${
                            language === lang.id ? 'text-cyan-400' : 'text-white'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(value) => !hasSubmitted && setCode(value || '')}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  tabSize: 4,
                  readOnly: hasSubmitted,
                  padding: { top: 8 }
                }}
              />
            </div>
          </div>

          {/* Results / Opponent Status */}
          <div className="h-32 bg-gray-800/50 p-4 overflow-y-auto">
            {myResult ? (
              <div className={`p-3 rounded-lg ${
                myResult.passed 
                  ? 'bg-green-900/20 border border-green-500/30' 
                  : 'bg-red-900/20 border border-red-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  {myResult.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`font-medium ${myResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {myResult.passed ? 'All Tests Passed!' : 'Some Tests Failed'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {myResult.passedCount} / {myResult.totalCount} test cases • 
                  Time: {(myResult.totalTime || 0).toFixed(0)}ms
                </p>
                
                {opponent?.hasSubmitted ? (
                  <p className="text-sm text-cyan-400 mt-2">
                    Waiting for results...
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">
                    Waiting for opponent to submit...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-sm">Submit your code to see results</p>
                {opponent?.hasSubmitted && (
                  <p className="text-xs text-yellow-400 mt-2">
                    ⚠️ Opponent has already submitted!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Time Limit: {battle?.timeLimit ? Math.floor(battle.timeLimit / 60) : 15} min</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isSubmitting || hasSubmitted}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            hasSubmitted
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
          } disabled:opacity-70`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : hasSubmitted ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Submitted
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Solution
            </>
          )}
        </motion.button>
      </div>

      {/* Problem Statement Styles */}
      <style>{`
        .prose pre {
          background: #1f2937;
          padding: 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
        .prose p {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default BattleRoom;
