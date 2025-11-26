import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  TrendingUp,
  Medal,
  Crown,
  Star,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchGlobalLeaderboard, fetchWeeklyLeaderboard, fetchMonthlyLeaderboard } = useDataContext();

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'monthly'>('global');

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === 'global') {
        data = await fetchGlobalLeaderboard();
      } else if (activeTab === 'weekly') {
        data = await fetchWeeklyLeaderboard?.() || [];
      } else {
        data = await fetchMonthlyLeaderboard?.() || [];
      }
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-red-400 text-white';
    return 'bg-white border-2 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/codearena')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Leaderboard
              </h1>
              <p className="text-gray-600 text-sm">
                Top coders in the arena
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'global'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            This Month
          </button>
        </div>

        {/* Top 3 Podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8"
            >
              <div className={`${getRankColor(2)} rounded-xl p-6 text-center shadow-lg`}>
                <Medal className="w-12 h-12 mx-auto mb-3 text-white" />
                <div className="w-16 h-16 rounded-full bg-white mx-auto mb-3 flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <h3 className="font-bold text-lg mb-1">{leaderboard[1].userName}</h3>
                <p className="text-sm opacity-90">{leaderboard[1].totalScore} points</p>
                <p className="text-xs opacity-75 mt-2">{leaderboard[1].problemsSolved} solved</p>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`${getRankColor(1)} rounded-xl p-6 text-center shadow-2xl`}>
                <Crown className="w-16 h-16 mx-auto mb-3 text-white" />
                <div className="w-20 h-20 rounded-full bg-white mx-auto mb-3 flex items-center justify-center text-3xl font-bold">
                  1
                </div>
                <h3 className="font-bold text-xl mb-1">{leaderboard[0].userName}</h3>
                <p className="text-sm opacity-90">{leaderboard[0].totalScore} points</p>
                <p className="text-xs opacity-75 mt-2">{leaderboard[0].problemsSolved} solved</p>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <div className={`${getRankColor(3)} rounded-xl p-6 text-center shadow-lg`}>
                <Medal className="w-12 h-12 mx-auto mb-3 text-white" />
                <div className="w-16 h-16 rounded-full bg-white mx-auto mb-3 flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <h3 className="font-bold text-lg mb-1">{leaderboard[2].userName}</h3>
                <p className="text-sm opacity-90">{leaderboard[2].totalScore} points</p>
                <p className="text-xs opacity-75 mt-2">{leaderboard[2].problemsSolved} solved</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-xl font-bold text-gray-800">Rankings</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No rankings available yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((player, index) => (
                <motion.div
                  key={player.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    player.userId === user?.uid ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index < 3 ? getRankColor(index + 1) : 'bg-gray-100 text-gray-700'
                    }`}>
                      {index < 3 ? getRankIcon(index + 1) : index + 1}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        {player.userName}
                        {player.userId === user?.uid && (
                          <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full">You</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {player.problemsSolved} solved
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {player.battlesWon || 0} battles won
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-blue-600">{player.totalScore}</p>
                      <p className="text-xs text-gray-600">points</p>
                    </div>

                    {player.trend && (
                      <div className={`flex items-center gap-1 ${
                        player.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        <TrendingUp className={`w-4 h-4 ${player.trend === 'down' ? 'rotate-180' : ''}`} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
