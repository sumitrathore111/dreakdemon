import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Crown, Medal, TrendingUp, Star,
  Award, Clock, Calendar, Loader2
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const { fetchGlobalLeaderboard, fetchWeeklyLeaderboard, fetchMonthlyLeaderboard, getUserWallet } = useDataContext();
  
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);

  // Mock data for demonstration
  const mockRankings = [
    { rank: 1, odId: '1', odName: 'CodeMaster', rating: 2450, problemsSolved: 156, battlesWon: 45, level: 25, avatar: 'C' },
    { rank: 2, odId: '2', odName: 'AlgoNinja', rating: 2380, problemsSolved: 142, battlesWon: 38, level: 23, avatar: 'A' },
    { rank: 3, odId: '3', odName: 'ByteWarrior', rating: 2320, problemsSolved: 138, battlesWon: 35, level: 22, avatar: 'B' },
    { rank: 4, odId: '4', odName: 'DataDragon', rating: 2250, problemsSolved: 125, battlesWon: 32, level: 21, avatar: 'D' },
    { rank: 5, odId: '5', odName: 'LogicLord', rating: 2180, problemsSolved: 118, battlesWon: 28, level: 20, avatar: 'L' },
    { rank: 6, odId: '6', odName: 'SyntaxSage', rating: 2100, problemsSolved: 105, battlesWon: 25, level: 18, avatar: 'S' },
    { rank: 7, odId: '7', odName: 'BinaryBoss', rating: 2050, problemsSolved: 98, battlesWon: 22, level: 17, avatar: 'B' },
    { rank: 8, odId: '8', odName: 'RecursionKing', rating: 1980, problemsSolved: 92, battlesWon: 20, level: 16, avatar: 'R' },
    { rank: 9, odId: '9', odName: 'StackOverflow', rating: 1920, problemsSolved: 85, battlesWon: 18, level: 15, avatar: 'S' },
    { rank: 10, odId: '10', odName: 'HeapHero', rating: 1850, problemsSolved: 78, battlesWon: 15, level: 14, avatar: 'H' },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        let data: any[] = [];
        
        switch (activeTab) {
          case 'global':
            data = await fetchGlobalLeaderboard();
            break;
          case 'weekly':
            data = await fetchWeeklyLeaderboard();
            break;
          case 'monthly':
            data = await fetchMonthlyLeaderboard();
            break;
        }

        // Use mock data if no real data
        if (data.length === 0) {
          data = mockRankings;
        }

        setRankings(data);

        // Get user's wallet for their stats
        if (user) {
          const walletData = await getUserWallet(user.uid);
          setWallet(walletData);

          // Find user's rank
          const userRank = data.find((r: any) => r.odId === user.uid);
          if (userRank) {
            setMyRank(userRank);
          }
        }
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        setRankings(mockRankings);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, user]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
              <p className="text-gray-500 text-sm">Compete with the best coders</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'global', label: 'All Time', icon: Trophy },
              { id: 'weekly', label: 'Weekly', icon: Calendar },
              { id: 'monthly', label: 'Monthly', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Top Performers</h3>
        
        <div className="flex items-end justify-center gap-4 md:gap-8">
          {/* 2nd Place */}
          {rankings[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xl md:text-2xl font-bold text-gray-700 ring-4 ring-gray-200">
                  {rankings[1]?.avatar || rankings[1]?.odName?.[0] || '?'}
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
              </div>
              <p className="text-gray-900 font-semibold text-sm md:text-base text-center truncate max-w-[80px] md:max-w-[100px]">
                {rankings[1]?.odName}
              </p>
              <p className="text-gray-500 text-xs">Level {rankings[1]?.level}</p>
              <div className="mt-3 h-20 w-20 md:w-24 rounded-t-xl bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">{rankings[1]?.rating}</span>
                <span className="text-gray-500 text-xs">{rankings[1]?.problemsSolved} solved</span>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {rankings[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center -mt-4"
            >
              <div className="relative mb-3">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center text-2xl md:text-3xl font-bold text-white ring-4 ring-yellow-200 shadow-lg">
                  {rankings[0]?.avatar || rankings[0]?.odName?.[0] || '?'}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-gray-900 font-bold text-base md:text-lg text-center truncate max-w-[100px] md:max-w-[120px]">
                {rankings[0]?.odName}
              </p>
              <p className="text-gray-500 text-xs">Level {rankings[0]?.level}</p>
              <div className="mt-3 h-28 w-24 md:w-28 rounded-t-xl bg-gradient-to-b from-yellow-100 to-amber-200 flex flex-col items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">{rankings[0]?.rating}</span>
                <span className="text-gray-600 text-xs">{rankings[0]?.problemsSolved} solved</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {rankings[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-xl md:text-2xl font-bold text-white ring-4 ring-amber-200">
                  {rankings[2]?.avatar || rankings[2]?.odName?.[0] || '?'}
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
              </div>
              <p className="text-gray-900 font-semibold text-sm md:text-base text-center truncate max-w-[80px] md:max-w-[100px]">
                {rankings[2]?.odName}
              </p>
              <p className="text-gray-500 text-xs">Level {rankings[2]?.level}</p>
              <div className="mt-3 h-16 w-20 md:w-24 rounded-t-xl bg-gradient-to-b from-amber-100 to-orange-200 flex flex-col items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">{rankings[2]?.rating}</span>
                <span className="text-gray-500 text-xs">{rankings[2]?.problemsSolved} solved</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Your Rank Card */}
      {wallet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {wallet?.userName?.[0] || 'Y'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white">
                  {myRank?.rank || '?'}
                </div>
              </div>
              
              <div>
                <p className="text-gray-900 font-semibold text-lg">{wallet?.userName || 'You'}</p>
                <p className="text-sm text-gray-500">Your Current Rank</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-blue-600 font-bold text-xl">{wallet?.rating || 1000}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-emerald-600 font-bold text-xl">{wallet?.achievements?.problemsSolved || 0}</p>
                <p className="text-xs text-gray-500">Solved</p>
              </div>
              <div className="text-center">
                <p className="text-purple-600 font-bold text-xl">{wallet?.achievements?.battlesWon || 0}</p>
                <p className="text-xs text-gray-500">Wins</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rankings List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-center">Rating</div>
          <div className="col-span-2 text-center hidden sm:block">Solved</div>
          <div className="col-span-2 text-center hidden sm:block">Wins</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rankings.map((player, index) => (
              <motion.div
                key={player.odId || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`grid grid-cols-12 gap-2 px-4 py-4 items-center hover:bg-gray-50 transition-colors ${
                  player.odId === user?.uid ? 'bg-blue-50' : ''
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center justify-center">
                  {player.rank <= 3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      player.rank === 1 ? 'bg-yellow-100' :
                      player.rank === 2 ? 'bg-gray-100' :
                      'bg-amber-100'
                    }`}>
                      {getRankIcon(player.rank)}
                    </div>
                  ) : (
                    <span className="text-gray-500 font-medium">{player.rank}</span>
                  )}
                </div>

                {/* Player */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                    player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                    player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                    player.rank === 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                    'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    {player.avatar || player.odName?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-medium truncate flex items-center gap-2">
                      {player.odName}
                      {player.odId === user?.uid && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">You</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      Level {player.level}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600 font-bold">{player.rating}</span>
                  </div>
                </div>

                {/* Solved */}
                <div className="col-span-2 text-center hidden sm:block">
                  <span className="text-emerald-600 font-medium">{player.problemsSolved}</span>
                </div>

                {/* Wins */}
                <div className="col-span-2 text-center hidden sm:block">
                  <span className="text-purple-600 font-medium">{player.battlesWon}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Rewards Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Weekly Rewards
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { rank: '1st Place', coins: 5000, icon: Crown, bgColor: 'bg-yellow-50', iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500', borderColor: 'border-yellow-200' },
            { rank: '2nd Place', coins: 3000, icon: Medal, bgColor: 'bg-gray-50', iconBg: 'bg-gradient-to-br from-gray-300 to-gray-400', borderColor: 'border-gray-200' },
            { rank: '3rd Place', coins: 1500, icon: Medal, bgColor: 'bg-amber-50', iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500', borderColor: 'border-amber-200' },
          ].map((reward, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${reward.bgColor} ${reward.borderColor}`}>
              <div className={`p-3 rounded-xl ${reward.iconBg} shadow-sm`}>
                <reward.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">{reward.rank}</p>
                <p className="text-amber-600 font-bold text-lg">{reward.coins.toLocaleString()} coins</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
