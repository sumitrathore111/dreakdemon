import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronRight,
    Code2,
    Coins,
    Crown,
    Loader2,
    Star,
    Swords,
    Target,
    TrendingUp,
    Trophy,
    Users,
    AlertTriangle
} from 'lucide-react';
import { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CodeArena Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              There was an error loading CodeArena. Please refresh the page or try again later.
            </p>
            <div className="bg-red-50 p-3 rounded-lg mb-4 text-left">
              <pre className="text-xs text-red-700 whitespace-pre-wrap">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import sub-components
import BattleLobby from './BattleLobby';
import BattleResults from './BattleResults';
import BattleRoom from './BattleRoom';
import ChallengeEditor from './ChallengeEditor';
import Leaderboard from './Leaderboard';
import LocalChallengeEditor from './LocalChallengeEditor';
import PracticeChallenges from './PracticeChallenges';
import SeedChallenges from './SeedChallenges';
import WalletPanel from './WalletPanel';

const CodeArenaContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getUserWallet, initializeWallet, subscribeToWallet, userprofile } = useDataContext();
  
  const [activeTab, setActiveTab] = useState('home');
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWallet, setShowWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setError('Failed to initialize wallet. Please check your connection and try again.');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    initWallet();
  }, [user, getUserWallet, initializeWallet, subscribeToWallet, userprofile]);

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
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading CodeArena...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading CodeArena</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <Code2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access CodeArena.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
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
  const { fetchActiveBattles, fetchGlobalLeaderboard } = useDataContext();
  const [liveBattles, setLiveBattles] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loadingBattles, setLoadingBattles] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    const loadLiveBattles = async () => {
      try {
        if (fetchActiveBattles) {
          const battles = await fetchActiveBattles();
          setLiveBattles(battles?.slice(0, 3) || []); // Show only top 3
        }
      } catch (error) {
        console.error('Error loading battles:', error);
        setLiveBattles([]);
      } finally {
        setLoadingBattles(false);
      }
    };

    const loadTopPlayers = async () => {
      try {
        if (fetchGlobalLeaderboard) {
          const rankings = await fetchGlobalLeaderboard();
          setTopPlayers(rankings?.slice(0, 3) || []); // Show only top 3
        }
      } catch (error) {
        console.error('Error loading top players:', error);
        setTopPlayers([]);
      } finally {
        setLoadingPlayers(false);
      }
    };

    loadLiveBattles();
    loadTopPlayers();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      loadLiveBattles();
      loadTopPlayers();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
          
          {loadingBattles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : liveBattles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active battles</p>
              <button
                onClick={() => navigate('/dashboard/codearena/battle')}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Start a battle
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {liveBattles.map((battle, i) => (
                <div key={battle.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {battle.participants?.slice(0, 2).map((participant: any, idx: number) => (
                        <div 
                          key={idx}
                          className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white ${
                            idx === 0 ? 'bg-blue-500' : 'bg-purple-500'
                          }`}
                        >
                          {participant.userName?.[0] || '?'}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {battle.participants?.[0]?.userName || 'Player'} vs {battle.participants?.[1]?.userName || 'Waiting...'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{battle.difficulty || 'Medium'}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    battle.status === 'waiting' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-orange-600 bg-orange-50'
                  }`}>
                    {battle.status === 'waiting' ? 'Waiting' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          )}
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
          
          {loadingPlayers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : topPlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Crown className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No rankings yet</p>
              <button
                onClick={() => navigate('/dashboard/codearena/practice')}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Start solving challenges
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {topPlayers.map((player) => {
                const rankColors = [
                  'text-amber-500 bg-amber-50',
                  'text-gray-400 bg-gray-100',
                  'text-orange-500 bg-orange-50'
                ];
                return (
                  <div key={player.odId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankColors[player.rank - 1] || 'text-gray-600 bg-gray-50'}`}>
                        {player.rank}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{player.odName}</p>
                        <p className="text-xs text-gray-500">{player.problemsSolved} solved</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-sm font-medium">{player.rating}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main CodeArena component with Error Boundary
const CodeArena = () => {
  return (
    <ErrorBoundary>
      <CodeArenaContent />
    </ErrorBoundary>
  );
};

export default CodeArena;
