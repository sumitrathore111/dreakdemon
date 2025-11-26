import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code,
  Trophy,
  Coins,
  ChevronLeft,
  Search,
  Loader2
} from 'lucide-react';
import { useDataContext } from '../../Context/UserDataContext';

export default function ChallengeBrowser() {
  const navigate = useNavigate();
  const { fetchAllChallenges } = useDataContext();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await fetchAllChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'Hard':
        return 'bg-red-500/20 text-red-400 border-red-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || challenge.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'All' || challenge.category === selectedCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(challenges.map(c => c.category)))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 text-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard/codearena')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Browse Challenges</h1>
                <p className="text-gray-600 text-sm">
                  {filteredChallenges.length} challenges available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search challenges..."
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDifficulty === difficulty
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No challenges found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/dashboard/codearena/challenge/${challenge.id}`)}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Coins className="w-4 h-4" />
                      <span className="text-sm font-bold">{challenge.coinReward}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-bold">{challenge.points}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">{challenge.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {challenge.description}
                </p>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-medium">
                    {challenge.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {challenge.totalSubmissions || 0} submissions
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
