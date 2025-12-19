import Editor from '@monaco-editor/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle,
    ChevronDown,
    Clock,
    Code2,
    Coins, Lightbulb,
    Loader2,
    Play,
    RefreshCw,
    Send,
    Shield,
    Trophy,
    XCircle,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { SecurityError, ValidationError } from '../../middleware/inputValidator';
import {
    fetchChallengeById,
    getChallengeTestCases,
    type Challenge
} from '../../service/challenges';
import { secureCodeExecutionService } from '../../service/secureCodeExecution';

const ChallengeEditor = () => {
  const { challengeId } = useParams(); // Format: "contestId-index" e.g., "1800-A"
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { } = useDataContext();

  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [testCases, setTestCases] = useState<{ input: string; output: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState('python');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [quickRunResult, setQuickRunResult] = useState<any>(null);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);

  const languages = secureCodeExecutionService.getSupportedLanguages();

  const defaultCode: { [key: string]: string } = {
    python: `# Write your solution here
def solve():
    # Read input
    n = int(input())
    
    # Your code here
    result = n
    
    # Print output
    print(result)

solve()`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Read input
    int n;
    cin >> n;
    
    // Your code here
    int result = n;
    
    // Print output
    cout << result << endl;
    
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read input
        int n = sc.nextInt();
        
        // Your code here
        int result = n;
        
        // Print output
        System.out.println(result);
    }
}`,
    javascript: `// Read input from stdin
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
});

rl.on('close', () => {
    // Parse input
    const n = parseInt(lines[0]);
    
    // Your code here
    const result = n;
    
    // Print output
    console.log(result);
});`,
  };

  // Fetch challenge details
  useEffect(() => {
    const loadChallenge = async () => {
      if (!challengeId) return;

      setLoading(true);

      try {
        // First, check if challenge data was passed via navigation state
        const challengeData = (location.state as any)?.challenge;
        
        if (challengeData) {
          setChallenge(challengeData as Challenge);
          // Parse test cases from the challenge object
          if (challengeData.testCases) {
            setTestCases(Array.isArray(challengeData.testCases) ? challengeData.testCases : []);
          }
        } else {
          // Fallback: Get challenge from database
          const firestoreChallenge = await fetchChallengeById(challengeId);
          
          if (firestoreChallenge) {
            setChallenge(firestoreChallenge);
            // Fetch test cases (visible ones only for practice)
            const cases = await getChallengeTestCases(challengeId, false);
            setTestCases(cases);
          } else {
            // If not found in Firestore, show error
            setChallenge(null);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading challenge:', error);
        setChallenge(null);
        setLoading(false);
      }
    };

    loadChallenge();
  }, [challengeId, location]);

  // Set default code when language changes
  useEffect(() => {
    setCode(defaultCode[language] || defaultCode.python);
  }, [language]);

  // Quick run code with security validation
  const handleRun = async () => {
    setIsRunning(true);
    setQuickRunResult(null);
    setResults(null);

    try {
      const input = showCustomInput ? customInput : (testCases[0]?.input || '');
      const result = await secureCodeExecutionService.executeCode(code, language, input);
      setQuickRunResult(result);
    } catch (error) {
      let errorMessage = 'Failed to run code. Please try again.';
      
      if (error instanceof SecurityError) {
        errorMessage = `Security Error: ${error.message}`;
      } else if (error instanceof ValidationError) {
        errorMessage = `Validation Error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setQuickRunResult({
        output: '',
        stderr: errorMessage,
        time: '0',
        memory: '0',
        status: 'Error'
      });
    }

    setIsRunning(false);
  };

  // Submit code against all test cases with security validation
  const handleSubmit = async () => {
    if (!challengeId) {
      alert('Invalid challenge ID');
      return;
    }

    if (testCases.length === 0) {
      // Try to refresh test cases (functionality disabled for deployment)
      // const [contestId, index] = challengeId.split('-');
      // const cases = await fetchProblemTestCases(parseInt(contestId), index);
      // if (cases.length > 0) {
      //   setTestCases(cases);
      // } else {
        alert('No test cases available for this problem. Please try again or use the Run button with custom input.');
        return;
      // }
    }

    setIsSubmitting(true);
    setResults(null);
    setQuickRunResult(null);

    try {
      const success = await secureCodeExecutionService.submitChallenge(challengeId, code, language);
      
      if (success && challenge && user) {
        // Coins are awarded server-side, just update UI
        setSolved(true);
        setResults({
          success: true,
          passedCount: testCases.length,
          totalCount: testCases.length,
          totalTime: 0,
          totalMemory: 0,
          results: testCases.map((_, idx) => ({ testCase: idx + 1, passed: true }))
        });
      } else {
        setResults({
          success: false,
          passedCount: 0,
          totalCount: testCases.length,
          totalTime: 0,
          totalMemory: 0,
          results: testCases.map((_, idx) => ({ testCase: idx + 1, passed: false }))
        });
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      
      let errorMessage = 'Submission failed. Please try again.';
      if (error instanceof SecurityError) {
        errorMessage = `Security Error: ${error.message}`;
      } else if (error instanceof ValidationError) {
        errorMessage = `Validation Error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResults({
        success: false,
        results: [],
        passedCount: 0,
        totalCount: testCases.length,
        totalTime: 0,
        totalMemory: 0,
        compilationError: errorMessage
      });
    }

    setIsSubmitting(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'expert': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden -mx-4 -mt-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 via-gray-900 to-black border-b border-gray-700 px-4 py-3 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-20 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full -translate-y-10 translate-x-20"></div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/codearena/practice')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              {challenge?.title || 'Loading...'}
              {solved && <CheckCircle className="w-5 h-5 text-green-400" />}
            </h1>
            <div className="flex items-center gap-3 text-sm">
              {challenge && (
                <>
                  <span className={`px-2 py-0.5 rounded-full border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty
                      ? challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)
                      : 'Unknown'
                    }
                  </span>
                  <span className="text-gray-400">Category: {challenge.category || 'N/A'}</span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Coins className="w-4 h-4" />
                    {challenge.coinReward}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-lg transition-all shadow-lg border border-gray-600 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"></div>
              <Code2 className="w-4 h-4 text-cyan-400 relative" />
              <span className="text-white capitalize font-semibold relative">{language}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 relative" />
            </button>

            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  {languages.filter(l => ['python', 'cpp', 'java', 'javascript'].includes(l.id)).map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                        language === lang.id ? 'text-cyan-400 bg-gray-700/50' : 'text-white'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Database Challenge */}
          {challenge && (
            <div className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
              <Code2 className="w-4 h-4" />
              <span className="text-sm">Database Challenge</span>
            </div>
          )}

          {/* Security Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 text-green-400 bg-green-500/10 rounded-lg border border-green-500/20">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Secure Mode</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'description'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'submissions'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Submissions
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'description' ? (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Challenge Statement */}
                    <div 
                      className="prose prose-invert max-w-none problem-statement"
                      dangerouslySetInnerHTML={{ __html: challenge?.problemStatement || '' }}
                    />

                    {/* Examples */}
                    {challenge?.examples && challenge.examples.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white">Examples</h3>
                        {challenge.examples.map((example, idx) => (
                          <div key={idx} className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                            <div className="grid grid-cols-2 divide-x divide-gray-700">
                              <div className="p-3">
                                <p className="text-xs text-gray-400 mb-2">Input</p>
                                <pre className="text-sm text-white font-mono whitespace-pre-wrap">{example.input}</pre>
                              </div>
                              <div className="p-3">
                                <p className="text-xs text-gray-400 mb-2">Output</p>
                                <pre className="text-sm text-white font-mono whitespace-pre-wrap">{example.output}</pre>
                              </div>
                            </div>
                            {example.explanation && (
                              <div className="px-3 pb-3">
                                <p className="text-xs text-gray-400 mb-1">Explanation</p>
                                <p className="text-sm text-gray-300">{example.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Test Cases */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          Sample Test Cases ({testCases.length})
                        </h3>
                        <button
                          onClick={async () => {
                            if (challengeId) {
                              setLoading(true);
                              const cases = await getChallengeTestCases(challengeId, false);
                              setTestCases(cases);
                              setLoading(false);
                            }
                          }}
                          className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Refresh
                        </button>
                      </div>
                      
                      {testCases.length > 0 ? (
                        testCases.map((tc, idx) => (
                          <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                          >
                            <div className="grid grid-cols-2 divide-x divide-gray-700">
                              <div className="p-4 bg-gradient-to-br from-blue-900/20 to-transparent">
                                <p className="text-xs text-[#00ADB5] mb-2 font-semibold flex items-center gap-1">
                                  📝 Input
                                </p>
                                <pre className="text-sm text-white font-mono whitespace-pre-wrap bg-gray-900/50 p-2 rounded">{tc.input}</pre>
                              </div>
                              <div className="p-4 bg-gradient-to-br from-green-900/20 to-transparent">
                                <p className="text-xs text-green-400 mb-2 font-semibold flex items-center gap-1">
                                  ✅ Output
                                </p>
                                <pre className="text-sm text-white font-mono whitespace-pre-wrap bg-gray-900/50 p-2 rounded">{tc.output}</pre>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 text-center">
                          <p className="text-gray-400 mb-2">No test cases loaded yet</p>
                          <p className="text-sm text-gray-500">Click Refresh to load test cases or use custom input</p>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {challenge?.tags && challenge.tags.length > 0 && (
                      <div className="mt-6">
                        <button
                          onClick={() => setShowHint(!showHint)}
                          className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <Lightbulb className="w-4 h-4" />
                          <span className="text-sm">{showHint ? 'Hide Hints' : 'Show Hints (Tags)'}</span>
                        </button>
                        
                        <AnimatePresence>
                          {showHint && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 flex flex-wrap gap-2"
                            >
                              {challenge.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Your submission history will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor & Results */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 10,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                padding: { top: 10 }
              }}
            />
          </div>

          {/* Custom Input Toggle */}
          <div className="border-t border-gray-700 px-4 py-2 flex items-center gap-4 bg-gray-800/50">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showCustomInput}
                onChange={(e) => setShowCustomInput(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded accent-cyan-500"
              />
              Custom Input
            </label>
            
            {showCustomInput && (
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom input..."
                className="flex-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white resize-none h-8"
              />
            )}
          </div>

          {/* Results Panel */}
          <div className="h-48 border-t border-gray-700 bg-gray-800/50 overflow-y-auto">
            {(results || quickRunResult) ? (
              <div className="p-4">
                {/* Quick Run Result */}
                {quickRunResult && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        quickRunResult.error ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {quickRunResult.status}
                      </span>
                      {quickRunResult.time && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {quickRunResult.time}s
                        </span>
                      )}
                      {quickRunResult.memory && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {(quickRunResult.memory / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                    
                    {quickRunResult.output && (
                      <div className="bg-gray-900 rounded p-3">
                        <p className="text-xs text-gray-400 mb-1">Output:</p>
                        <pre className="text-sm text-white font-mono whitespace-pre-wrap">
                          {quickRunResult.output}
                        </pre>
                      </div>
                    )}
                    
                    {quickRunResult.stderr && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                        <p className="text-xs text-red-400 mb-1">Error:</p>
                        <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap">
                          {quickRunResult.stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Submission Results */}
                {results && (
                  <div className="space-y-3">
                    {/* Summary */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      results.success 
                        ? 'bg-green-900/20 border border-green-500/30' 
                        : 'bg-red-900/20 border border-red-500/30'
                    }`}>
                      {results.success ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <div>
                        <p className={`font-semibold ${results.success ? 'text-green-400' : 'text-red-400'}`}>
                          {results.success ? 'All Tests Passed!' : 'Some Tests Failed'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {results.passedCount} / {results.totalCount} test cases passed
                        </p>
                      </div>
                      
                      {results.success && challenge && (
                        <div className="ml-auto flex items-center gap-2 text-yellow-400">
                          <Coins className="w-5 h-5" />
                          <span className="font-bold">+{challenge.coinReward}</span>
                        </div>
                      )}
                    </div>

                    {/* Compilation Error */}
                    {results.compilationError && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                        <p className="text-xs text-red-400 mb-1">Compilation Error:</p>
                        <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap">
                          {results.compilationError}
                        </pre>
                      </div>
                    )}

                    {/* Individual Test Results */}
                    {results.results && results.results.length > 0 && (
                      <div className="space-y-2">
                        {results.results.map((r: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-2 rounded border ${
                              r.passed 
                                ? 'bg-green-900/10 border-green-500/20' 
                                : 'bg-red-900/10 border-red-500/20'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {r.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                              <span className="text-sm text-white">Test Case {r.testCase}</span>
                              {r.time && (
                                <span className="text-xs text-gray-400">{r.time}s</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="text-sm">Run or submit your code to see results</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-700 p-4 flex items-center justify-between bg-gray-800">
            <button
              onClick={() => setCode(defaultCode[language] || '')}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Code
            </button>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ADB5] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg relative overflow-hidden"
              >
                {isRunning && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20"></div>
                )}
                {isRunning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full relative"
                  />
                ) : (
                  <Play className="w-4 h-4 relative" />
                )}
                <span className="relative">Run</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg relative overflow-hidden"
              >
                {isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20"></div>
                )}
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full relative"
                  />
                ) : (
                  <Send className="w-4 h-4 relative" />
                )}
                <span className="relative">⚡ Submit</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for Codeforces problem statement */}
      <style>{`
        .problem-statement {
          color: #e5e7eb;
        }
        .problem-statement .header {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .problem-statement .time-limit,
        .problem-statement .memory-limit {
          color: #9ca3af;
          font-size: 0.875rem;
        }
        .problem-statement pre {
          background: #1f2937;
          padding: 0.75rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .problem-statement .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: #60a5fa;
        }
        .problem-statement .input-specification,
        .problem-statement .output-specification,
        .problem-statement .note {
          margin-top: 1rem;
        }
        .problem-statement .sample-tests {
          margin-top: 1.5rem;
        }
        .problem-statement .input,
        .problem-statement .output {
          background: #1f2937;
          padding: 0.5rem;
          border-radius: 0.25rem;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default ChallengeEditor;
