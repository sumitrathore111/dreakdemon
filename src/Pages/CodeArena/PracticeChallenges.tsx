import { motion } from 'framer-motion';
import {
    BookOpen,
    ChevronRight,
    Code2,
    Coins, Loader2, RefreshCw,
    Search,
    Star,
    Target,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchAllChallenges,
    getAvailableCategories,
    initializeChallenges,
    type Challenge
} from '../../service/challenges';

const PracticeChallenges = () => {
  const navigate = useNavigate();
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const PROBLEMS_PER_PAGE = 20;

  const difficulties = [
    { id: 'all', label: 'All', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    { id: 'easy', label: 'Easy', color: 'bg-green-50 text-green-700 border-green-200' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { id: 'hard', label: 'Hard', color: 'bg-red-50 text-red-700 border-red-200' },
    { id: 'expert', label: 'Expert', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  useEffect(() => {
    const loadChallenges = async () => {
      setLoading(true);
      try {
        // Initialize default challenges if none exist
        await initializeChallenges();
        
        const [challengesData, categories] = await Promise.all([
          fetchAllChallenges(),
          getAvailableCategories()
        ]);
        
        setChallenges(challengesData);
        setFilteredChallenges(challengesData.slice(0, PROBLEMS_PER_PAGE));
        setAvailableCategories(categories);
        setLoading(false);
      } catch (error) {
        console.error('Error loading challenges:', error);
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  useEffect(() => {
    let filtered = [...challenges];

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(c => c.difficulty === selectedDifficulty);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    const start = (page - 1) * PROBLEMS_PER_PAGE;
    setFilteredChallenges(filtered.slice(start, start + PROBLEMS_PER_PAGE));
  }, [challenges, selectedDifficulty, selectedCategory, searchQuery, page]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const challengesData = await fetchAllChallenges();
      setChallenges(challengesData);
      setPage(1);
    } catch (error) {
      console.error('Error refreshing challenges:', error);
    }
    setLoading(false);
  };

  const handleSolve = (challenge: Challenge) => {
    navigate(`/dashboard/codearena/challenge/${challenge.id}`);
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-50 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-50 text-red-700 border-red-200';
      case 'expert': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const stats = [
    { label: 'Total', value: challenges.length.toLocaleString(), icon: Code2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Easy', value: challenges.filter(c => c.difficulty === 'easy').length, icon: Zap, color: 'text-green-600 bg-green-50' },
    { label: 'Medium', value: challenges.filter(c => c.difficulty === 'medium').length, icon: Target, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Hard+', value: challenges.filter(c => ['hard', 'expert'].includes(c.difficulty)).length, icon: Star, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Practice Challenges</h2>
          <p className="text-gray-500 text-sm">Solve coding challenges and earn coins</p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Difficulty */}
        <div className="flex flex-wrap gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              onClick={() => {
                setSelectedDifficulty(diff.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                selectedDifficulty === diff.id
                  ? diff.color + ' border-current'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {/* Categories */}
        {availableCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedCategory('all'); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Challenges List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading challenges...</p>
          </div>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No challenges found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add new challenges</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {challenge.title}
                    </h3>
                    {challenge.isDaily && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-medium">
                        Daily
                      </span>
                    )}
                    {challenge.isPremium && (
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium">
                        Premium
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2">{challenge.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getDifficultyStyle(challenge.difficulty)}`}>
                      {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                    </span>
                    
                    <span className="text-gray-400 text-xs">
                      {challenge.category}
                    </span>
                    
                    <span className="flex items-center gap-1 text-amber-600 text-xs">
                      <Coins className="w-3 h-3" />
                      {challenge.coinReward}
                    </span>

                    {challenge.acceptanceRate > 0 && (
                      <span className="text-gray-400 text-xs">
                        {challenge.acceptanceRate.toFixed(0)}% acceptance
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {challenge.tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                    {challenge.tags.length > 4 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                        +{challenge.tags.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleSolve(challenge)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Solve
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredChallenges.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-gray-500 text-sm">
            Page {page}
          </span>
          
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={filteredChallenges.length < PROBLEMS_PER_PAGE}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PracticeChallenges;
