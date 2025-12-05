import { useEffect, useState } from 'react';
import {
  getFilteredQuestions,
  getAllTopics,
  getQuestionsStatistics,
  searchQuestions,
  getRandomQuestion,
} from '../../service/questionsService';
import { Code2, Filter, Search, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  examples: string;
  constraints: string;
  language: string;
  sampleCode: string;
  testCases: Array<{
    input: string;
    output: string;
  }>;
}

export default function PracticeChallenges() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Load questions and topics on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allQuestions, allTopics, stats] = await Promise.all([
          getFilteredQuestions(),
          getAllTopics(),
          getQuestionsStatistics(),
        ]);

        setQuestions(allQuestions);
        setFilteredQuestions(allQuestions);
        setTopics(allTopics);
        setStatistics(stats);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    const applyFilters = async () => {
      let filtered = questions;

      // Filter by difficulty
      if (selectedDifficulty !== 'all') {
        filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
      }

      // Filter by topic
      if (selectedTopic !== 'all') {
        filtered = filtered.filter(q => q.topic === selectedTopic);
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const results = await searchQuestions(searchTerm);
        filtered = filtered.filter(q =>
          results.some(r => r.id === q.id)
        );
      }

      setFilteredQuestions(filtered);
    };

    applyFilters();
  }, [selectedDifficulty, selectedTopic, searchTerm, questions]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '⭐';
      case 'medium':
        return '⭐⭐';
      case 'hard':
        return '⭐⭐⭐';
      default:
        return '⭐';
    }
  };

  const handleRandomQuestion = async () => {
    const randomQ = await getRandomQuestion(
      selectedDifficulty === 'all' ? undefined : selectedDifficulty,
      selectedTopic === 'all' ? undefined : selectedTopic
    );
    if (randomQ) {
      setSelectedQuestion(randomQ);
      setUserCode('');
      setTestResults([]);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedQuestion || !userCode.trim()) {
      alert('Please write some code first');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate test results - TODO: Connect to actual code execution engine
      const results = (selectedQuestion.testCases || []).map((testCase, index) => ({
        testNumber: index + 1,
        input: testCase.input,
        expected: testCase.output,
        actual: 'Output pending execution',
        passed: Math.random() > 0.5, // Simulate pass/fail
        error: null,
      }));

      setTestResults(results);
      alert('Code submitted! Results displayed below.');
    } catch (error) {
      console.error('Error submitting code:', error);
      alert('Error submitting code');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading 3000+ questions from GitHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Practice Challenges</h1>
          </div>
          <p className="text-gray-600 text-lg">Master coding with 3000+ questions from GitHub | Build your problem-solving skills</p>

          {/* Statistics */}
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
                <div className="text-3xl font-bold">{statistics.total}</div>
                <div className="text-sm text-blue-100">Total Questions</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg">
                <div className="text-3xl font-bold">{statistics.byDifficulty.easy}</div>
                <div className="text-sm text-green-100">Easy</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white shadow-lg">
                <div className="text-3xl font-bold">{statistics.byDifficulty.medium}</div>
                <div className="text-sm text-yellow-100">Medium</div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white shadow-lg">
                <div className="text-3xl font-bold">{statistics.byDifficulty.hard}</div>
                <div className="text-sm text-red-100">Hard</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Random Question Button */}
            <button
              onClick={handleRandomQuestion}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <Zap className="w-5 h-5" />
              Random Question
            </button>

            {/* Difficulty Filter */}
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Difficulty</h3>
              </div>
              <div className="space-y-2">
                {['all', 'easy', 'medium', 'hard'].map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty as any)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${
                      selectedDifficulty === difficulty
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="capitalize">{difficulty === 'all' ? 'All' : difficulty}</span>
                      {difficulty !== 'all' && statistics && (
                        <span className="text-sm font-semibold">
                          {difficulty === 'easy' && `(${statistics.byDifficulty.easy})`}
                          {difficulty === 'medium' && `(${statistics.byDifficulty.medium})`}
                          {difficulty === 'hard' && `(${statistics.byDifficulty.hard})`}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Filter */}
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-4">Topics ({topics.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <button
                  onClick={() => setSelectedTopic('all')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                    selectedTopic === 'all'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Topics
                </button>
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all text-sm ${
                      selectedTopic === topic
                        ? 'bg-blue-500 text-white shadow-md font-medium'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Questions List */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Questions ({filteredQuestions.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredQuestions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-lg">No questions found matching your filters</p>
                ) : (
                  filteredQuestions.map((question, idx) => (
                    <div
                      key={question.id}
                      onClick={() => setSelectedQuestion(question)}
                      className={`p-4 rounded-lg cursor-pointer transition-all border-2 hover:shadow-md ${
                        selectedQuestion?.id === question.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm font-medium">#{idx + 1}</span>
                            <h4 className="font-semibold text-gray-900">{question.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{question.topic}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getDifficultyColor(question.difficulty)}`}>
                          {getDifficultyIcon(question.difficulty)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Question Details and Code Editor */}
            {selectedQuestion ? (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6 hover:shadow-lg transition-shadow">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedQuestion.title}</h2>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                      {selectedQuestion.difficulty.toUpperCase()} {getDifficultyIcon(selectedQuestion.difficulty)}
                    </span>
                    <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">{selectedQuestion.topic}</span>
                  </div>
                </div>

                {selectedQuestion.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedQuestion.description}</p>
                  </div>
                )}

                {selectedQuestion.examples && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Examples</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-200">
                      {selectedQuestion.examples}
                    </pre>
                  </div>
                )}

                {selectedQuestion.constraints && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Constraints</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-200">
                      {selectedQuestion.constraints}
                    </pre>
                  </div>
                )}

                {/* Code Editor */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Solution</h3>
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="// Write your solution here&#10;function solve() {&#10;  // Your code&#10;}"
                    className="w-full h-72 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitCode}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                  {submitting ? 'Submitting Code...' : '✓ Submit Solution'}
                </button>

                {/* Test Results */}
                {testResults.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Test Results
                    </h3>
                    <div className="space-y-3">
                      {testResults.map(result => (
                        <div
                          key={result.testNumber}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            result.passed
                              ? 'border-green-300 bg-green-50'
                              : 'border-red-300 bg-red-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            {result.passed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className="font-semibold">
                              Test Case #{result.testNumber} - {result.passed ? '✓ PASSED' : '✗ FAILED'}
                            </span>
                          </div>
                          <div className="text-sm space-y-2 font-mono">
                            <p><strong className="text-gray-700">Input:</strong> <span className="text-gray-600">{result.input}</span></p>
                            <p><strong className="text-gray-700">Expected:</strong> <span className="text-gray-600">{result.expected}</span></p>
                            <p><strong className="text-gray-700">Actual:</strong> <span className="text-gray-600">{result.actual}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Code2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Select a question to start solving</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
