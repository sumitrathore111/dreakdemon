import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Coins,
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useDataContext } from '../../Context/UserDataContext';
import { runTestCases } from '../../service/codeExecution';

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  coinReward: number;
  category: string;
  timeLimit: number; // in minutes
  testCases: TestCase[];
  sampleTestCases: TestCase[];
  constraints?: string[];
  hints?: string[];
  starterCode?: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
}

interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  error?: string;
  executionTime?: number;
}

const ChallengeSolver: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { fetchChallengeById, submitSolution } = useDataContext();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'python' | 'java' | 'cpp'>('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'solutions'>('description');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedHint, setSelectedHint] = useState<number | null>(null);

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  // Timer for tracking solving time
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const loadChallenge = async () => {
    if (!challengeId) return;

    try {
      setLoading(true);
      const data = await fetchChallengeById(challengeId);
      setChallenge(data);
      
      // Set starter code
      if (data.starterCode) {
        setCode(data.starterCode[language] || '');
      }
      
      // Start timer
      setTimerActive(true);
    } catch (error) {
      console.error('Error loading challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang: 'javascript' | 'python' | 'java' | 'cpp') => {
    setLanguage(newLang);
    if (challenge?.starterCode) {
      setCode(challenge.starterCode[newLang] || '');
    }
  };

  const runCode = async () => {
    if (!challenge) return;

    setIsRunning(true);
    setShowResults(false);
    setTestResults([]);

    const loadingToast = toast.loading('Running your code...');

    try {
      // Run code against sample test cases using Piston API
      const results = await runTestCases(code, language, challenge.sampleTestCases);

      setTestResults(results);
      setShowResults(true);

      const passedCount = results.filter(r => r.passed).length;
      toast.dismiss(loadingToast);
      
      if (passedCount === results.length) {
        toast.success(`All ${results.length} test cases passed! 🎉`);
      } else {
        toast.error(`${passedCount}/${results.length} test cases passed`);
      }
    } catch (error) {
      console.error('Error running code:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to execute code. Please try again.');
      setTestResults([{
        passed: false,
        input: '',
        expectedOutput: '',
        error: 'Failed to execute code. Please try again.',
        executionTime: 0
      }]);
      setShowResults(true);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!challenge || !challengeId) return;

    setIsSubmitting(true);
    setShowResults(false);

    const loadingToast = toast.loading('Submitting your solution...');

    try {
      // Run against all test cases (including hidden ones) using Piston API
      const allResults = await runTestCases(code, language, challenge.testCases);

      const passedCount = allResults.filter(r => r.passed).length;
      const totalCount = allResults.length;
      const allPassed = passedCount === totalCount;

      // Submit to database
      await submitSolution({
        challengeId,
        code,
        language,
        status: allPassed ? 'Accepted' : 'Wrong Answer',
        passedTestCases: passedCount,
        totalTestCases: totalCount,
        executionTime: Math.max(...allResults.map(r => r.executionTime || 0)),
        timeSpent: timeElapsed
      });

      setTestResults(allResults);
      setShowResults(true);
      
      toast.dismiss(loadingToast);

      if (allPassed) {
        setTimerActive(false);
        toast.success(`🎉 Accepted! You earned ${challenge.coinReward} coins!`, {
          duration: 5000,
        });
        setTimeout(() => {
          navigate('/dashboard/codearena');
        }, 3000);
      } else {
        toast.error(`Wrong Answer: ${passedCount}/${totalCount} tests passed`);
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast.dismiss(loadingToast);
      toast.error('Submission failed. Please try again.');
      setTestResults([{
        passed: false,
        input: '',
        expectedOutput: '',
        error: 'Submission failed. Please try again.',
        executionTime: 0
      }]);
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Challenge Not Found</h2>
          <button
            onClick={() => navigate('/dashboard/codearena')}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to CodeArena
          </button>
        </div>
      </div>
    );
  }

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const allTestsPassed = passedTests === totalTests && totalTests > 0;

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard/codearena')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-white">{challenge.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-sm font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-sm text-white/80">{challenge.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-yellow-300">
                <Coins className="w-5 h-5" />
                <span className="font-semibold">{challenge.coinReward} coins</span>
              </div>
              
              <div className="flex items-center gap-2 text-white">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">{challenge.points} points</span>
              </div>

              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-5 h-5" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-4">
        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-120px)]">
          {/* Left Panel - Problem Description */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 px-6 py-3 bg-gray-50">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-2 font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`pb-2 font-medium transition-colors ${
                  activeTab === 'submissions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Submissions
              </button>
              <button
                onClick={() => setActiveTab('solutions')}
                className={`pb-2 font-medium transition-colors ${
                  activeTab === 'solutions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Solutions
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Problem Description</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {challenge.description}
                    </p>
                  </div>

                  {challenge.constraints && challenge.constraints.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                      <ul className="space-y-2">
                        {challenge.constraints.map((constraint, index) => (
                          <li key={index} className="text-gray-300 flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Sample Test Cases</h3>
                    <div className="space-y-4">
                      {challenge.sampleTestCases.map((testCase, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-4">
                          <div className="mb-2">
                            <span className="text-sm text-gray-400">Input:</span>
                            <pre className="mt-1 text-green-400 font-mono text-sm bg-gray-900 p-2 rounded">
                              {testCase.input}
                            </pre>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Output:</span>
                            <pre className="mt-1 text-blue-400 font-mono text-sm bg-gray-900 p-2 rounded">
                              {testCase.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {challenge.hints && challenge.hints.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Hints</h3>
                      <div className="space-y-2">
                        {challenge.hints.map((hint, index) => (
                          <div key={index}>
                            <button
                              onClick={() => setSelectedHint(selectedHint === index ? null : index)}
                              className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <span className="text-yellow-400">💡 Hint {index + 1}</span>
                            </button>
                            {selectedHint === index && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 p-4 bg-gray-800 rounded-lg text-gray-300"
                              >
                                {hint}
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="text-gray-400 text-center py-12">
                  Your submission history will appear here
                </div>
              )}

              {activeTab === 'solutions' && (
                <div className="text-gray-400 text-center py-12">
                  Community solutions will appear here after you solve the problem
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col">
            {/* Language Selector */}
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
              <div className="flex gap-2">
                {(['javascript', 'python', 'java', 'cpp'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      language === lang
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {isRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Run
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                }}
                loading={<div className="flex items-center justify-center h-full bg-gray-950"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}
              />
            </div>

            {/* Results Panel */}
            {showResults && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                className="border-t border-gray-800 bg-gray-800 max-h-[300px] overflow-y-auto"
              >
                <div className="p-4">
                  {allTestsPassed ? (
                    <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <div>
                          <h3 className="font-semibold text-green-400">Accepted!</h3>
                          <p className="text-sm text-gray-300 mt-1">
                            You've earned {challenge.coinReward} coins and {challenge.points} points!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-6 h-6 text-red-400" />
                        <div>
                          <h3 className="font-semibold text-red-400">
                            Wrong Answer ({passedTests}/{totalTests} passed)
                          </h3>
                          <p className="text-sm text-gray-300 mt-1">
                            Review the failed test cases below
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`rounded-lg p-3 ${
                          result.passed
                            ? 'bg-green-900/20 border border-green-600'
                            : 'bg-red-900/20 border border-red-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">Test Case {index + 1}</span>
                          <span className={`flex items-center gap-1 text-sm ${
                            result.passed ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {result.passed ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Passed
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Failed
                              </>
                            )}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-400">Input:</span>
                            <pre className="mt-1 bg-gray-900 p-2 rounded text-xs font-mono">
                              {result.input}
                            </pre>
                          </div>
                          
                          {!result.passed && (
                            <>
                              <div>
                                <span className="text-gray-400">Expected:</span>
                                <pre className="mt-1 bg-gray-900 p-2 rounded text-xs font-mono text-green-400">
                                  {result.expectedOutput}
                                </pre>
                              </div>
                              
                              <div>
                                <span className="text-gray-400">Your Output:</span>
                                <pre className="mt-1 bg-gray-900 p-2 rounded text-xs font-mono text-red-400">
                                  {result.actualOutput || result.error}
                                </pre>
                              </div>
                            </>
                          )}

                          {result.executionTime && (
                            <div className="text-gray-400 text-xs">
                              Execution time: {result.executionTime.toFixed(2)}ms
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeSolver;
