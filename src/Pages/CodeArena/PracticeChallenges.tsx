import { motion } from 'framer-motion';
import {
    BookOpen,
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
import { fetchAllQuestions, getAllTopics, type Question } from '../../service/questionsService';

const PracticeChallenges = () => {
  const navigate = useNavigate();
  
  const [challenges, setChallenges] = useState<any[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const PROBLEMS_PER_PAGE = 20;

  const difficulties = [
    { id: 'all', label: 'All', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    { id: 'easy', label: 'Easy', color: 'bg-green-50 text-green-700 border-green-200' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { id: 'hard', label: 'Hard', color: 'bg-red-50 text-red-700 border-red-200' },
  ];

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
    { label: 'Total', value: challenges.length.toLocaleString(), icon: Code2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Easy', value: challenges.filter((c: any) => c.difficulty === 'easy').length, icon: Zap, color: 'text-green-600 bg-green-50' },
    { label: 'Medium', value: challenges.filter((c: any) => c.difficulty === 'medium').length, icon: Target, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Hard', value: challenges.filter((c: any) => c.difficulty === 'hard').length, icon: Star, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">⚡ Practice Challenges</h2>
              <p className="text-gray-500 text-sm">Solve coding challenges from 3000+ questions and earn coins</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all group"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
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
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {topic}
              </motion.button>
            ))}
            {availableTopics.length > 10 && (
              <span className="px-4 py-2 text-xs text-gray-500">+{availableTopics.length - 10} more</span>
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
            className="text-center bg-white rounded-xl border border-gray-200 p-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading 3000+ questions from GitHub...</p>
          </motion.div>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white rounded-xl border border-gray-200"
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 text-lg">No challenges found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {challenge.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">{challenge.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        challenge.difficulty === 'easy' ? 'bg-green-50 text-green-700 border border-green-200' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                    </motion.span>
                    
                    <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded">
                      {challenge.category}
                    </span>
                    
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                      <Coins className="w-3 h-3" />
                      {challenge.coins}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-6">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSolve(challenge)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all"
                  >
                    <span className="relative">Solve</span>
                    <ChevronRight className="w-4 h-4 relative" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
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
            className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
          >
            Previous
          </motion.button>
          
          <span className="px-4 py-3 text-gray-700 text-sm bg-white rounded-lg border border-gray-200">
            Page {page}
          </span>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => p + 1)}
            disabled={filteredChallenges.length < PROBLEMS_PER_PAGE}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
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
