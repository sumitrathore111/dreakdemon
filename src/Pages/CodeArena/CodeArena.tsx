import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, Trophy, Code2, Target, 
  Users, Star, ChevronRight,
  Crown, TrendingUp, Coins, Loader2
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';

// Import sub-components
import BattleLobby from './BattleLobby';
import BattleRoom from './BattleRoom';
import BattleResults from './BattleResults';
import PracticeChallenges from './PracticeChallenges';
import ChallengeEditor from './ChallengeEditor';
import LocalChallengeEditor from './LocalChallengeEditor';
import SeedChallenges from './SeedChallenges';
import Leaderboard from './Leaderboard';
import WalletPanel from './WalletPanel';

const CodeArena = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getUserWallet, initializeWallet, subscribeToWallet, userprofile } = useDataContext();
  
  const [activeTab, setActiveTab] = useState('home');
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWallet, setShowWallet] = useState(false);

  useEffect(() => {
    const initWallet = async () => {
      if (user) {
        try {
          const existingWallet = await getUserWallet(user.uid);
          if (!existingWallet) {
            await initializeWallet(user.uid, userprofile?.name || user.email?.split('@')[0] || 'User');
          }
          
          const unsubscribe = subscribeToWallet(user.uid, (walletData) => {
            setWallet(walletData);
            setLoading(false);
          });
          
          return () => unsubscribe();
        } catch (error) {
          console.error('Error initializing wallet:', error);
          setLoading(false);
        }
      }
    };
    
    initWallet();
  }, [user]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/battle')) setActiveTab('battle');
    else if (path.includes('/practice')) setActiveTab('practice');
    else if (path.includes('/leaderboard')) setActiveTab('leaderboard');
    else setActiveTab('home');
  }, [location]);

  const stats = [
    { label: 'Problems Solved', value: wallet?.achievements?.problemsSolved || 0, icon: Code2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Battles Won', value: wallet?.achievements?.battlesWon || 0, icon: Swords, color: 'text-blue-600 bg-blue-50' },
    { label: 'Current Streak', value: wallet?.streak?.current || 0, icon: Star, color: 'text-orange-600 bg-orange-50' },
    { label: 'Global Rank', value: wallet?.globalRank || '-', icon: Trophy, color: 'text-amber-600 bg-amber-50' },
  ];

  const quickActions = [
    {
      title: 'Quick Battle',
      description: 'Compete in a 1v1 coding duel',
      icon: Swords,
      color: 'bg-red-500',
      path: 'battle'
    },
    {
      title: 'Practice Mode',
      description: 'Solve problems from Codeforces',
      icon: Target,
      color: 'bg-blue-500',
      path: 'practice'
    },
    {
      title: 'Leaderboard',
      description: 'View global rankings',
      icon: Trophy,
      color: 'bg-amber-500',
      path: 'leaderboard'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">CodeArena</h1>
                <p className="text-xs text-gray-500">Battle. Code. Win.</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'home', label: 'Home', icon: Code2, path: '' },
                { id: 'battle', label: 'Battle', icon: Swords, path: 'battle' },
                { id: 'practice', label: 'Practice', icon: Target, path: 'practice' },
                { id: 'leaderboard', label: 'Ranks', icon: Trophy, path: 'leaderboard' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/dashboard/codearena/${tab.path}`)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Wallet */}
            <button
              onClick={() => setShowWallet(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all"
            >
              <Coins className="w-4 h-4 text-amber-600" />
              <span className="text-amber-700 font-semibold">{wallet?.coins?.toLocaleString() || 0}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={
            <HomeContent 
              stats={stats} 
              quickActions={quickActions} 
              navigate={navigate}
            />
          } />
          <Route path="/battle" element={<BattleLobby wallet={wallet} />} />
          <Route path="/battle/:battleId" element={<BattleRoom />} />
          <Route path="/battle/results/:battleId" element={<BattleResults />} />
          <Route path="/practice" element={<PracticeChallenges />} />
          <Route path="/practice/:challengeId" element={<ChallengeEditor />} />
          <Route path="/challenge/:challengeId" element={<LocalChallengeEditor />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/seed" element={<SeedChallenges />} />
        </Routes>
      </main>

      {/* Wallet Panel */}
      <AnimatePresence>
        {showWallet && (
          <WalletPanel 
            wallet={wallet} 
            onClose={() => setShowWallet(false)} 
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around">
          {[
            { id: 'home', label: 'Home', icon: Code2, path: '' },
            { id: 'battle', label: 'Battle', icon: Swords, path: 'battle' },
            { id: 'practice', label: 'Practice', icon: Target, path: 'practice' },
            { id: 'leaderboard', label: 'Ranks', icon: Trophy, path: 'leaderboard' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(`/dashboard/codearena/${tab.path}`)}
              className={`flex flex-col items-center gap-1 p-2 ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

// Home Content
const HomeContent = ({ stats, quickActions, navigate }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Hero */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h2>
        <p className="text-gray-600 mb-6">
          Ready to test your coding skills? Battle other developers or practice with Codeforces problems.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/dashboard/codearena/battle')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Swords className="w-4 h-4" />
            Find Match
          </button>
          <button
            onClick={() => navigate('/dashboard/codearena/practice')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Target className="w-4 h-4" />
            Practice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat: any, index: number) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {quickActions.map((action: any, index: number) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => navigate(`/dashboard/codearena/${action.path}`)}
            className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className={`inline-flex p-3 rounded-lg ${action.color} mb-4`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{action.description}</p>
            
            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
              <span>Get Started</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Activity Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Live Battles */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Live Battles
            </h3>
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white" />
                    <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Battle #{1000 + i}</p>
                    <p className="text-xs text-gray-500">Medium</p>
                  </div>
                </div>
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">In Progress</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Players */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              Top Players
            </h3>
            <button 
              onClick={() => navigate('/dashboard/codearena/leaderboard')}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {[
              { rank: 1, name: 'CodeMaster', rating: 2450, color: 'text-amber-500 bg-amber-50' },
              { rank: 2, name: 'AlgoNinja', rating: 2380, color: 'text-gray-400 bg-gray-100' },
              { rank: 3, name: 'ByteWarrior', rating: 2320, color: 'text-orange-500 bg-orange-50' },
            ].map((player) => (
              <div key={player.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${player.color}`}>
                    {player.rank}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{player.name}</p>
                    <p className="text-xs text-gray-500">Rank #{player.rank}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-sm font-medium">{player.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CodeArena;
