import { motion } from 'framer-motion';
import {
    BookOpen,
    CheckCircle,
    ChevronRight,
    Code2,
    Coins,
    RefreshCw,
    Search,
    Star,
    Target,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { fetchAllQuestions, getAllTopics, type Question } from '../../service/questionsService';

const PracticeChallenges = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserProgress } = useDataContext();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [solvedChallengeIds, setSolvedChallengeIds] = useState<Set<string>>(new Set());

  const PROBLEMS_PER_PAGE = 20;

  const difficulties = [
    { id: 'all', label: 'All', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    { id: 'easy', label: 'Easy', color: 'bg-green-50 text-green-700 border-green-200' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { id: 'hard', label: 'Hard', color: 'bg-red-50 text-red-700 border-red-200' },
  ];

  // Fetch user's solved challenges
  useEffect(() => {
    const fetchSolvedChallenges = async () => {
      if (!user?.id) return;

      try {
        const progress = await getUserProgress(user.id);
        if (progress?.solvedChallenges) {
          const solvedIds = new Set<string>(
            progress.solvedChallenges.map((sc: any) => sc.challengeId?.toString() || sc.challengeId)
          );
          setSolvedChallengeIds(solvedIds);
        }
      } catch (error) {
        console.error('Error fetching solved challenges:', error);
      }
    };

    fetchSolvedChallenges();
  }, [user?.id, getUserProgress]);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // Fetch all 3000 questions from GitHub
        const questionsData = await fetchAllQuestions();
        console.log('Questions loaded:', questionsData.length);

        const topics = await getAllTopics();
        console.log('Topics:', topics.length);

        // Convert questions to challenge format
        const challengesData = questionsData.map((q: Question) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          topic: q.category,
          tags: [q.category],
          coinReward: q.coins,
          acceptanceRate: 75,
          category: q.category,
          isDaily: false,
          isPremium: false,
          testCases: q.test_cases,
          sampleCode: '',
          examples: '',
          constraints: q.constraints,
          solution_hint: q.solution_hint,
        }));

        console.log('Challenges prepared:', challengesData.length);
        setChallenges(challengesData);
        setFilteredChallenges(challengesData.slice(0, PROBLEMS_PER_PAGE));
        setAvailableTopics(topics);
        setLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    let filtered = [...challenges];

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(c => c.difficulty === selectedDifficulty);
    }

    if (selectedTopic !== 'all') {
      filtered = filtered.filter(c => c.topic === selectedTopic);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some((t: string) => t.toLowerCase().includes(query))
      );
    }

    console.log('Filtered challenges:', filtered.length, 'from', challenges.length);
    const start = (page - 1) * PROBLEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + PROBLEMS_PER_PAGE);
    console.log('Paginated challenges:', paginated.length);
    setFilteredChallenges(paginated);
  }, [challenges, selectedDifficulty, selectedTopic, searchQuery, page]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const questionsData = await fetchAllQuestions();

      const challengesData = questionsData.map((q: Question) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        topic: q.category,
        tags: [q.category],
        coinReward: q.coins,
        acceptanceRate: 75,
        category: q.category,
        isDaily: false,
        isPremium: false,
        testCases: q.test_cases,
        sampleCode: '',
        solution_hint: q.solution_hint,
      }));

      setChallenges(challengesData);
      setPage(1);
    } catch (error) {
      console.error('Error refreshing questions:', error);
    }
    setLoading(false);
  };

  const handleSolve = (challenge: any) => {
    navigate(`/dashboard/codearena/challenge/${challenge.id}`, {
      state: { challenge }
    });
  };

  const stats = [
    { label: 'Total', value: challenges.length.toLocaleString(), icon: Code2, color: 'text-[#00ADB5] bg-[#00ADB5]/10' },
    { label: 'Solved', value: solvedChallengeIds.size, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Easy', value: challenges.filter((c: any) => c.difficulty === 'easy').length, icon: Zap, color: 'text-green-600 bg-green-50' },
    { label: 'Medium', value: challenges.filter((c: any) => c.difficulty === 'medium').length, icon: Target, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Hard', value: challenges.filter((c: any) => c.difficulty === 'hard').length, icon: Star, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">⚡ Practice Challenges</h2>
              <p className="text-gray-500 dark:text-white text-sm">Solve coding challenges from 3000+ questions and earn coins</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-white font-medium rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all group"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.color} dark:bg-opacity-20 mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-white">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-[#00ADB5] transition-all"
          />
        </div>

        {/* Difficulty */}
        <div className="flex flex-wrap gap-3">
          {difficulties.map((diff) => (
            <motion.button
              key={diff.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedDifficulty(diff.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                selectedDifficulty === diff.id
                  ? diff.color
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {diff.label}
            </motion.button>
          ))}
        </div>

        {/* Topics */}
        {availableTopics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSelectedTopic('all'); setPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                selectedTopic === 'all'
                  ? 'bg-[#00ADB5] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Topics
            </motion.button>
            {availableTopics.slice(0, 10).map((topic) => (
              <motion.button
                key={topic}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedTopic(topic); setPage(1); }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedTopic === topic
                    ? 'bg-[#00ADB5] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {topic}
              </motion.button>
            ))}
            {availableTopics.length > 10 && (
              <span className="px-4 py-2 text-xs text-gray-500 dark:text-white">+{availableTopics.length - 10} more</span>
            )}
          </div>
        )}
      </motion.div>

      {/* Challenges List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-[#00ADB5] border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600 dark:text-white">Loading 3000+ questions from GitHub...</p>
          </motion.div>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 text-lg">No challenges found</p>
          <p className="text-gray-500 dark:text-white text-sm mt-2">Try adjusting your filters</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredChallenges.map((challenge, index) => {
            const isSolved = solvedChallengeIds.has(challenge.id?.toString() || challenge.id);

            return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className={`bg-white dark:bg-gray-900 border rounded-xl p-6 hover:shadow-lg transition-all group ${
                isSolved
                  ? 'border-green-300 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-[#00ADB5] dark:group-hover:text-[#00ADB5] transition-colors">
                      {challenge.title}
                    </h3>
                    {isSolved && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-200 dark:border-green-700">
                        <CheckCircle className="w-3 h-3" />
                        SOLVED
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-white mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors line-clamp-2">{challenge.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        challenge.difficulty === 'easy' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700' :
                        'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
                      }`}
                    >
                      {challenge.difficulty
                        ? challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)
                        : 'Unknown'
                      }
                    </motion.span>

                    <span className="text-gray-600 dark:text-white text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {challenge.category}
                    </span>

                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-medium">
                      <Coins className="w-3 h-3" />
                      {challenge.coinReward || challenge.coins || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-6">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSolve(challenge)}
                    className={`flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold rounded-lg transition-all ${
                      isSolved
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-[#00ADB5] hover:bg-[#00ADB5]/80'
                    }`}
                  >
                    <span className="relative">{isSolved ? 'Solve Again' : 'Solve'}</span>
                    <ChevronRight className="w-4 h-4 relative" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredChallenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-6 py-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
          >
            Previous
          </motion.button>

          <span className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            Page {page}
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => p + 1)}
            disabled={filteredChallenges.length < PROBLEMS_PER_PAGE}
            className="px-6 py-3 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
          >
            Next
          </motion.button>
        </motion.div>
      )}
      </div>
    </div>
  );
};

export default PracticeChallenges;
