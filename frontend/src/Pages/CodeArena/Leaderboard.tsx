import { motion } from 'framer-motion';
import { ChevronRight, Crown, Loader2, Medal, Trophy, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { apiRequest } from '../../service/api';
import type { LeaderboardEntry } from './types';

interface LeaderboardProps {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await apiRequest('/leaderboard');
      const entries: LeaderboardEntry[] = (response || []).map((entry: any, index: number) => ({
        odId: entry.odId || entry._id,
        odName: entry.odName || entry.name,
        odProfilePic: entry.odProfilePic || entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.odId}`,
        battleRating: entry.battleRating || entry.rating || 1000,
        battlesWon: entry.battlesWon || 0,
        battlesPlayed: entry.battlesPlayed || 0,
        rank: index + 1
      }));

      setLeaderboard(entries);

      // Find user's rank
      const userEntry = entries.find(e => e.odId === user?.id);
      if (userEntry) {
        setMyRank(userEntry);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 border-yellow-300 dark:border-yellow-700';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-300 dark:border-gray-600';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-300 dark:border-amber-700';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#00ADB5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Global Leaderboard
          </h2>
          <p className="text-gray-500">Top performers in CodeArena battles</p>
        </div>
      </div>

      {/* Your rank card */}
      {myRank && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#00ADB5]/10 to-[#00d4ff]/10 border border-[#00ADB5]/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#00ADB5] flex items-center justify-center text-white font-bold text-xl">
                #{myRank.rank}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Your Ranking</p>
                <p className="text-sm text-gray-500">Rating: {myRank.battleRating}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#00ADB5]">{myRank.battlesWon}</p>
              <p className="text-xs text-gray-500">Battles Won</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard list */}
      <div className="space-y-3">
        {leaderboard.slice(0, 50).map((entry, index) => (
          <motion.div
            key={entry.odId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`flex items-center gap-4 p-4 rounded-xl border ${getRankBg(entry.rank)} ${
              entry.odId === user?.id ? 'ring-2 ring-[#00ADB5]' : ''
            }`}
          >
            {/* Rank */}
            <div className="w-10 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar */}
            <img
              src={entry.odProfilePic}
              alt={entry.odName}
              className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {entry.odName}
                {entry.odId === user?.id && <span className="text-xs text-[#00ADB5] ml-2">(You)</span>}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {entry.battleRating}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {entry.battlesWon} wins
                </span>
              </div>
            </div>

            {/* Win rate */}
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {entry.battlesPlayed > 0 ? Math.round((entry.battlesWon / entry.battlesPlayed) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500">Win Rate</p>
            </div>
          </motion.div>
        ))}

        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No rankings yet. Be the first to battle!</p>
          </div>
        )}
      </div>
    </div>
  );
}
