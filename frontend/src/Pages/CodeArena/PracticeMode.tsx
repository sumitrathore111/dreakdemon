import { motion } from 'framer-motion';
import {
  ChevronRight,
  Clock,
  Code2,
  Filter,
  Loader2,
  Play,
  Search,
  Tag,
  Trophy,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { calculateScore, loadProblems, runAllTestCases } from './api';
import CodeEditor, { LanguageSelector } from './CodeEditor';
import type { ExecutionResult, Language, Problem } from './types';
import { DIFFICULTY_COLORS, LANGUAGE_CONFIG } from './types';

interface PracticeModeProps {
  onBack: () => void;
}

export default function PracticeMode({ onBack }: PracticeModeProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  
  // Editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<Language>('python');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadProblems().then((data) => {
      setProblems(data);
      setFilteredProblems(data);
      setLoading(false);
    });
  }, []);

  // Filter problems
  useEffect(() => {
    let filtered = problems;
    
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(p => p.difficulty.toLowerCase() === difficultyFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    
    setFilteredProblems(filtered);
  }, [problems, difficultyFilter, searchQuery]);

  // Select problem
  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setCode(LANGUAGE_CONFIG[language].template);
    setResults([]);
    setShowResults(false);
  };

  // Change language
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setCode(LANGUAGE_CONFIG[newLang].template);
  };

  // Run code
  const handleRun = async () => {
    if (!selectedProblem || isRunning) return;
    
    setIsRunning(true);
    setShowResults(true);
    setResults([]);

    try {
      const testResults = await runAllTestCases(code, language, selectedProblem.testCases);
      setResults(testResults);
    } catch (error) {
      console.error('Execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#00ADB5]" />
      </div>
    );
  }

  // Problem list view
  if (!selectedProblem) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Practice Challenges</h2>
              <p className="text-gray-500 dark:text-gray-400">{filteredProblems.length} problems available</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            />
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Problems grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProblems.map((problem) => (
            <motion.button
              key={problem.id}
              onClick={() => handleSelectProblem(problem)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-left hover:border-[#00ADB5] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-mono text-gray-400">{problem.id}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[problem.difficulty].bg} ${DIFFICULTY_COLORS[problem.difficulty].text}`}>
                  {problem.difficulty}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{problem.title}</h3>
              <div className="flex flex-wrap gap-1">
                {problem.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No problems found matching your criteria</p>
          </div>
        )}
      </div>
    );
  }

  // Problem solving view
  const score = calculateScore(results);
  const allPassed = results.length > 0 && results.every(r => r.passed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedProblem(null)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">{selectedProblem.id}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[selectedProblem.difficulty].bg} ${DIFFICULTY_COLORS[selectedProblem.difficulty].text}`}>
                {selectedProblem.difficulty}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProblem.title}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <LanguageSelector language={language} onChange={handleLanguageChange} disabled={isRunning} />
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-[#00ADB5] text-white rounded-lg hover:bg-[#00ADB5]/90 disabled:opacity-50 transition-colors"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Problem description */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 max-h-[600px] overflow-y-auto">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">{selectedProblem.description}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Input Format</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{selectedProblem.inputFormat}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Output Format</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{selectedProblem.outputFormat}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Constraints</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
              {selectedProblem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Example</h3>
            {selectedProblem.testCases.slice(0, 1).map((tc, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-2 text-sm font-mono">
                <div>
                  <span className="text-gray-500">Input:</span>
                  <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{tc.input}</pre>
                </div>
                <div>
                  <span className="text-gray-500">Output:</span>
                  <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{tc.output}</pre>
                </div>
                {tc.explanation && (
                  <div className="text-gray-500 text-xs">{tc.explanation}</div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            {selectedProblem.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Code editor */}
        <div className="space-y-4">
          <CodeEditor code={code} language={language} onChange={setCode} height="350px" />

          {/* Results */}
          {showResults && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isRunning ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#00ADB5]" />
                  ) : allPassed ? (
                    <Trophy className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {isRunning ? 'Running tests...' : allPassed ? 'All Tests Passed!' : `Score: ${score}%`}
                  </span>
                </div>
                {!isRunning && (
                  <span className="text-sm text-gray-500">
                    {results.filter(r => r.passed).length}/{results.length} passed
                  </span>
                )}
              </div>

              {!isRunning && results.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.map((result, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-sm ${
                        result.passed
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${result.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                          Test Case {i + 1} {result.passed ? '✓' : '✗'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {result.time}ms
                        </span>
                      </div>
                      {!result.passed && (
                        <div className="mt-2 space-y-1 font-mono text-xs">
                          <div><span className="text-gray-500">Expected:</span> {result.expected}</div>
                          <div><span className="text-gray-500">Got:</span> {result.actual}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
