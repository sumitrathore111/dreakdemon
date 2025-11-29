import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Play, Send, CheckCircle, XCircle, Coins, Lightbulb,
  ArrowLeft, Code2, Loader2, Trophy, Clock, Zap,
  ChevronDown, ExternalLink, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { 
  fetchProblemStatement, 
  fetchProblemTestCases,
  getCachedProblems,
  type ProblemWithStats 
} from '../../service/codeforces';
import { runTestCases, quickRun, getSupportedLanguages } from '../../service/judge0';

const ChallengeEditor = () => {
  const { challengeId } = useParams(); // Format: "contestId-index" e.g., "1800-A"
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addCoins } = useDataContext();

  // Problem state
  const [problem, setProblem] = useState<ProblemWithStats | null>(null);
  const [problemStatement, setProblemStatement] = useState<string>('');
  const [testCases, setTestCases] = useState<{ input: string; output: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statementLoading, setStatementLoading] = useState(true);

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

  const languages = getSupportedLanguages();

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

  // Fetch problem details
  useEffect(() => {
    const loadProblem = async () => {
      if (!challengeId) return;

      setLoading(true);
      setStatementLoading(true);

      try {
        const [contestId, index] = challengeId.split('-');
        
        // Get problem from cache
        const problems = await getCachedProblems();
        const foundProblem = problems.find(
          p => p.contestId === parseInt(contestId) && p.index === index
        );

        if (foundProblem) {
          setProblem(foundProblem);
        }

        // Fetch problem statement
        const statement = await fetchProblemStatement(parseInt(contestId), index);
        setProblemStatement(statement);

        // Fetch test cases
        const cases = await fetchProblemTestCases(parseInt(contestId), index);
        setTestCases(cases);

        setLoading(false);
        setStatementLoading(false);
      } catch (error) {
        console.error('Error loading problem:', error);
        setLoading(false);
        setStatementLoading(false);
      }
    };

    loadProblem();
  }, [challengeId]);

  // Set default code when language changes
  useEffect(() => {
    setCode(defaultCode[language] || defaultCode.python);
  }, [language]);

  // Quick run code
  const handleRun = async () => {
    setIsRunning(true);
    setQuickRunResult(null);
    setResults(null);

    try {
      const input = showCustomInput ? customInput : (testCases[0]?.input || '');
      const result = await quickRun(code, language, input);
      setQuickRunResult(result);
    } catch (error) {
      setQuickRunResult({
        output: '',
        error: 'Failed to run code. Make sure you have set up Judge0 API key.',
        time: null,
        memory: null,
        status: 'Error'
      });
    }

    setIsRunning(false);
  };

  // Submit code against all test cases
  const handleSubmit = async () => {
    if (testCases.length === 0) {
      // Try to refresh test cases
      if (challengeId) {
        const [contestId, index] = challengeId.split('-');
        const cases = await fetchProblemTestCases(parseInt(contestId), index);
        if (cases.length > 0) {
          setTestCases(cases);
        } else {
          alert('No test cases available for this problem. Please try again or use the Run button with custom input.');
          return;
        }
      } else {
        alert('No test cases available for this problem');
        return;
      }
    }

    setIsSubmitting(true);
    setResults(null);
    setQuickRunResult(null);

    try {
      const casesToUse = testCases.length > 0 ? testCases : [];
      
      if (casesToUse.length === 0) {
        setResults({
          success: false,
          results: [],
          passedCount: 0,
          totalCount: 0,
          totalTime: 0,
          totalMemory: 0,
          compilationError: 'No test cases available. Click "Refresh" in the Sample Test Cases section to load them.'
        });
        setIsSubmitting(false);
        return;
      }
      
      const result = await runTestCases(code, language, casesToUse);
      setResults(result);

      // If all tests passed, award coins
      if (result.success && problem && user) {
        await addCoins(user.uid, problem.coins, `Solved: ${problem.name}`);
        setSolved(true);
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      setResults({
        success: false,
        results: [],
        passedCount: 0,
        totalCount: testCases.length,
        totalTime: 0,
        totalMemory: 0,
        compilationError: error?.message || 'Submission failed. Check Judge0 API configuration.'
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
      <header className="bg-gray-800/90 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
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
              {problem?.name || 'Loading...'}
              {solved && <CheckCircle className="w-5 h-5 text-green-400" />}
            </h1>
            <div className="flex items-center gap-3 text-sm">
              {problem && (
                <>
                  <span className={`px-2 py-0.5 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </span>
                  <span className="text-gray-400">Rating: {problem.rating || 'N/A'}</span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Coins className="w-4 h-4" />
                    {problem.coins}
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="text-white capitalize">{language}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
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

          {/* View on Codeforces */}
          {problem && (
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">Codeforces</span>
            </a>
          )}
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
                {statementLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Problem Statement from Codeforces */}
                    <div 
                      className="prose prose-invert max-w-none problem-statement"
                      dangerouslySetInnerHTML={{ __html: problemStatement }}
                    />

                    {/* Sample Test Cases */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          Sample Test Cases ({testCases.length})
                        </h3>
                        <button
                          onClick={async () => {
                            if (challengeId) {
                              const [contestId, index] = challengeId.split('-');
                              setStatementLoading(true);
                              const cases = await fetchProblemTestCases(parseInt(contestId), index);
                              setTestCases(cases);
                              setStatementLoading(false);
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
                          <div key={idx} className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                            <div className="grid grid-cols-2 divide-x divide-gray-700">
                              <div className="p-3">
                                <p className="text-xs text-gray-400 mb-2">Input</p>
                                <pre className="text-sm text-white font-mono whitespace-pre-wrap">{tc.input}</pre>
                              </div>
                              <div className="p-3">
                                <p className="text-xs text-gray-400 mb-2">Output</p>
                                <pre className="text-sm text-white font-mono whitespace-pre-wrap">{tc.output}</pre>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 text-center">
                          <p className="text-gray-400 mb-2">No test cases loaded yet</p>
                          <p className="text-sm text-gray-500">Click Refresh to load test cases or use custom input</p>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {problem?.tags && problem.tags.length > 0 && (
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
                              {problem.tags.map((tag, idx) => (
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
                    
                    {quickRunResult.error && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                        <p className="text-xs text-red-400 mb-1">Error:</p>
                        <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap">
                          {quickRunResult.error}
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
                      
                      {results.success && problem && (
                        <div className="ml-auto flex items-center gap-2 text-yellow-400">
                          <Coins className="w-5 h-5" />
                          <span className="font-bold">+{problem.coins}</span>
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit
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
