import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import {
  Code, Trophy, Zap, Coins, Swords, Users, Target,
  TrendingUp, Award, Clock, Play, ChevronRight,
  Flame, Star, Crown
} from 'lucide-react';
import { motion } from 'framer-motion';
import ChallengeSolver from './ChallengeSolver';
import ChallengeBrowser from './ChallengeBrowser';
import Wallet from './Wallet';
import Battles from './Battles';
import CreateBattle from './CreateBattle';
import Tournaments from './Tournaments';
import Leaderboard from './Leaderboard';

function CodeArenaDashboard() {
  const { user } = useAuth();
  const {
    fetchDailyChallenge,
    fetchAllChallenges,
    fetchActiveBattles,
    fetchActiveTournaments,
    getUserWallet,
    subscribeToWallet,
    initializeWallet,
    fetchGlobalLeaderboard,
    getUserProgress
  } = useDataContext();
  
  const navigate = useNavigate();
  
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [recentChallenges, setRecentChallenges] = useState<any[]>([]);
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      
      // Subscribe to real-time wallet updates
      const unsubscribe = subscribeToWallet(user.uid, (walletData) => {
        if (walletData) {
          setWallet(walletData);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Initialize wallet if needed
      const walletData = await getUserWallet(user!.uid);
      if (!walletData) {
        await initializeWallet(user!.uid, user!.displayName || user!.email?.split('@')[0] || 'User');
        const newWallet = await getUserWallet(user!.uid);
        setWallet(newWallet);
      } else {
        setWallet(walletData);
      }

      // Load data in parallel
      const [daily, challenges, battles, tourns, leaderData, progress] = await Promise.all([
        fetchDailyChallenge().catch(() => null),
        fetchAllChallenges().catch(() => []),
        fetchActiveBattles().catch(() => []),
        fetchActiveTournaments().catch(() => []),
        fetchGlobalLeaderboard().catch(() => []),
        getUserProgress(user!.uid).catch(() => null)
      ]);

      setDailyChallenge(daily);
      setRecentChallenges(challenges.slice(0, 6));
      setActiveBattles(battles.slice(0, 4));
      setTournaments(tourns.slice(0, 3));
      setLeaderboard(leaderData.slice(0, 5));
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-800 text-lg font-semibold">Loading CodeArena...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 text-lg font-semibold">Please log in to access CodeArena</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-black text-gray-800 mb-2 flex items-center gap-3">
                <Trophy className="w-12 h-12 text-yellow-500" />
                CodeArena
              </h1>
              <p className="text-cyan-600 text-lg">Compete, Learn, Earn Rewards</p>
            </div>
            
            {/* Wallet Display */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 shadow-xl cursor-pointer"
              onClick={() => navigate('/dashboard/codearena/wallet')}
            >
              <div className="flex items-center gap-4">
                <Coins className="w-8 h-8 text-white" />
                <div>
                  <p className="text-xs text-yellow-100">Your Balance</p>
                  <p className="text-3xl font-black text-white">{wallet?.coins || 0}</p>
                  <p className="text-xs text-yellow-100">coins</p>
                </div>
                <div className="ml-4">
                  <div className="text-xs text-yellow-100">Level {wallet?.level || 1}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Flame className="w-4 h-4 text-orange-300" />
                    <span className="text-sm font-bold text-white">{wallet?.streak?.current || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 border-2 border-cyan-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-cyan-500" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-black text-gray-800">{userProgress?.solvedChallenges?.length || 0}</p>
              <p className="text-sm text-gray-600">Problems Solved</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 border-2 border-red-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <Swords className="w-8 h-8 text-red-500" />
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-black text-gray-800">{wallet?.achievements?.battlesWon || 0}</p>
              <p className="text-sm text-gray-600">Battles Won</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 border-2 border-yellow-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <Crown className="w-8 h-8 text-yellow-500" />
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-black text-gray-800">{wallet?.achievements?.tournamentsWon || 0}</p>
              <p className="text-sm text-gray-600">Tournaments Won</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-purple-500" />
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-black text-gray-800">{wallet?.badges?.length || 0}</p>
              <p className="text-sm text-gray-600">Badges Earned</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Daily Challenge */}
        {dailyChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl p-8 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 opacity-10">
              <Zap className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-300" />
                    <span className="text-yellow-300 font-bold text-sm">DAILY CHALLENGE</span>
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">{dailyChallenge.title}</h2>
                  <p className="text-blue-100 mb-4">{dailyChallenge.description}</p>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getDifficultyColor(dailyChallenge.difficulty)}`}>
                      {dailyChallenge.difficulty?.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2 text-white">
                      <Coins className="w-5 h-5 text-yellow-300" />
                      <span className="font-bold">+{dailyChallenge.coinReward} coins</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/dashboard/codearena/challenge/${dailyChallenge.id}`)}
                  className="px-8 py-4 bg-white text-purple-600 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl flex items-center gap-2"
                >
                  <Play className="w-6 h-6" />
                  Solve Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Challenges */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <Code className="w-6 h-6 text-cyan-500" />
                Practice Challenges
              </h2>
              <button
                onClick={() => navigate('/dashboard/codearena/challenges')}
                className="text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {recentChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg cursor-pointer hover:border-cyan-300 transition-all"
                  onClick={() => navigate(`/dashboard/codearena/challenge/${challenge.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Coins className="w-4 h-4" />
                      <span className="text-sm font-bold">{challenge.coinReward}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{challenge.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{challenge.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">
                      {challenge.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {challenge.totalSubmissions || 0} submissions
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Active Battles */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                  <Swords className="w-6 h-6 text-red-500" />
                  Live Battles
                </h2>
                <button
                  onClick={() => navigate('/dashboard/codearena/battles')}
                  className="text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBattles.length === 0 ? (
                  <div className="col-span-2 bg-white rounded-xl p-12 text-center border-2 border-gray-200 shadow-lg">
                    <Swords className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No active battles right now</p>
                    <button
                      onClick={() => navigate('/dashboard/codearena/battles/create')}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600"
                    >
                      Create Battle
                    </button>
                  </div>
                ) : (
                  activeBattles.map((battle) => (
                    <motion.div
                      key={battle.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-red-500/30 cursor-pointer"
                      onClick={() => navigate(`/dashboard/codearena/battle/${battle.id}`)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                          {battle.status}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-300">
                          <Trophy className="w-4 h-4" />
                          <span className="text-sm font-bold">{battle.prizePool}</span>
                        </div>
                      </div>
                      <h3 className="text-white font-bold mb-2">1v1 Battle</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-300" />
                          <span className="text-sm text-gray-300">
                            {battle.currentParticipants}/{battle.maxParticipants}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Clock className="w-4 h-4" />
                          {battle.duration}m
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Leaderboard */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Leaderboard
                </h3>
                <button
                  onClick={() => navigate('/dashboard/codearena/leaderboard')}
                  className="text-cyan-600 hover:text-cyan-700 text-sm font-semibold"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div key={player.userId} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold text-sm">{player.userName}</p>
                      <p className="text-gray-500 text-xs">{player.problemsSolved} solved</p>
                    </div>
                    <div className="text-cyan-600 font-bold">
                      {player.totalScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tournaments */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-500" />
                  Tournaments
                </h3>
                <button
                  onClick={() => navigate('/dashboard/codearena/tournaments')}
                  className="text-cyan-600 hover:text-cyan-700 text-sm font-semibold"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {tournaments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No upcoming tournaments</p>
                ) : (
                  tournaments.map((tournament) => (
                    <motion.div
                      key={tournament.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-200 cursor-pointer"
                      onClick={() => navigate(`/dashboard/codearena/tournament/${tournament.id}`)}
                    >
                      <h4 className="text-gray-800 font-bold mb-2">{tournament.title}</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{tournament.currentParticipants} joined</span>
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Trophy className="w-3 h-3" />
                          <span className="font-bold">{tournament.prizePool.first}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          tournament.status === 'registration' ? 'bg-green-500 text-white' :
                          tournament.status === 'upcoming' ? 'bg-blue-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}>
                          {tournament.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/codearena/challenges')}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 text-left"
          >
            <Code className="w-12 h-12 text-white mb-3" />
            <h3 className="text-xl font-black text-white mb-2">Browse Challenges</h3>
            <p className="text-blue-100 text-sm">Solve problems and earn coins</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/codearena/battles')}
            className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-left"
          >
            <Swords className="w-12 h-12 text-white mb-3" />
            <h3 className="text-xl font-black text-white mb-2">Join Battle</h3>
            <p className="text-orange-100 text-sm">Compete in real-time duels</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/codearena/tournaments')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-left"
          >
            <Trophy className="w-12 h-12 text-white mb-3" />
            <h3 className="text-xl font-black text-white mb-2">Enter Tournament</h3>
            <p className="text-purple-100 text-sm">Win big prizes and glory</p>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function CodeArena() {
  return (
    <Routes>
      <Route index element={<CodeArenaDashboard />} />
      <Route path="challenge/:challengeId" element={<ChallengeSolver />} />
      <Route path="challenges" element={<ChallengeBrowser />} />
      <Route path="wallet" element={<Wallet />} />
      <Route path="battles" element={<Battles />} />
      <Route path="battles/create" element={<CreateBattle />} />
      <Route path="tournaments" element={<Tournaments />} />
      <Route path="leaderboard" element={<Leaderboard />} />
    </Routes>
  );
}
