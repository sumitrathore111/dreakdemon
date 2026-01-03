import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Code2,
  Coins,
  Crown,
  Loader2,
  Play,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Component, useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { apiRequest } from '../../service/api';
import BattleMode from './BattleMode';
import Leaderboard from './Leaderboard';
import PracticeMode from './PracticeMode';
import WalletPanel from './WalletPanel';

// Error Boundary
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {this.state.error?.message || 'An error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#00ADB5] text-white rounded-lg hover:bg-[#00ADB5]/80 transition-colors"
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

type View = 'home' | 'practice' | 'battle' | 'leaderboard' | 'wallet';

function CodeArenaContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    problemsSolved: 0,
    battlesWon: 0,
    currentStreak: 0,
    rank: '-' as string | number
  });

  // Fetch user data
  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch wallet and stats in parallel
      const [walletRes, statsRes] = await Promise.all([
        apiRequest(`/wallet/${user?.id}`).catch(() => ({ coins: 0 })),
        apiRequest(`/battles/user-stats/${user?.id}`).catch(() => null)
      ]);

      setWalletBalance(walletRes.coins || 0);
      
      if (statsRes) {
        setStats({
          problemsSolved: statsRes.problemsSolved || 0,
          battlesWon: statsRes.battlesWon || 0,
          currentStreak: statsRes.currentStreak || 0,
          rank: statsRes.rank || '-'
        });
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle wallet balance update
  const handleWalletUpdate = () => {
    apiRequest(`/wallet/${user?.id}`)
      .then(res => setWalletBalance(res.coins || 0))
      .catch(() => {});
  };

  // Quick action cards
  const actionCards = [
    {
      id: 'practice',
      title: 'Practice',
      description: 'Solve coding challenges',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600'
    },
    {
      id: 'battle',
      title: '1v1 Battle',
      description: 'Compete for coins',
      icon: Swords,
      color: 'from-orange-500 to-red-600',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600'
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'See top players',
      icon: Trophy,
      color: 'from-yellow-500 to-amber-600',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'wallet',
      title: 'Wallet',
      description: 'View your coins',
      icon: Wallet,
      color: 'from-[#00ADB5] to-cyan-600',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      iconColor: 'text-[#00ADB5]'
    }
  ];

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'practice':
        return <PracticeMode onBack={() => setCurrentView('home')} />;
      case 'battle':
        return (
          <BattleMode
            onBack={() => setCurrentView('home')}
            walletBalance={walletBalance}
            onWalletUpdate={handleWalletUpdate}
          />
        );
      case 'leaderboard':
        return <Leaderboard onBack={() => setCurrentView('home')} />;
      case 'wallet':
        return <WalletPanel onBack={() => setCurrentView('home')} onBalanceUpdate={setWalletBalance} />;
      default:
        return null;
    }
  };

  // Home view
  if (currentView !== 'home') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {renderView()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ADB5] to-[#00d4ff] flex items-center justify-center">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              CodeArena
            </h1>
            <p className="text-gray-500 mt-1">Master coding through practice and competitive battles</p>
          </div>

          {/* Wallet balance */}
          <motion.button
            onClick={() => setCurrentView('wallet')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : walletBalance}
              </p>
            </div>
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Target}
            label="Problems Solved"
            value={stats.problemsSolved}
            color="text-green-600"
            bgColor="bg-green-100 dark:bg-green-900/30"
          />
          <StatCard
            icon={Trophy}
            label="Battles Won"
            value={stats.battlesWon}
            color="text-yellow-600"
            bgColor="bg-yellow-100 dark:bg-yellow-900/30"
          />
          <StatCard
            icon={Zap}
            label="Current Streak"
            value={stats.currentStreak}
            color="text-orange-600"
            bgColor="bg-orange-100 dark:bg-orange-900/30"
          />
          <StatCard
            icon={Crown}
            label="Global Rank"
            value={stats.rank}
            color="text-purple-600"
            bgColor="bg-purple-100 dark:bg-purple-900/30"
          />
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionCards.map((card, index) => (
            <motion.button
              key={card.id}
              onClick={() => setCurrentView(card.id as View)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-left group shadow-sm hover:shadow-lg transition-all"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.description}</p>
              
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-[#00ADB5] group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>

        {/* Quick start battle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#00ADB5] to-[#00d4ff] rounded-2xl p-6 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Swords className="w-7 h-7" />
                Ready for a Challenge?
              </h2>
              <p className="text-white/80">
                Jump into a 1v1 coding battle and win coins by solving problems faster than your opponent!
              </p>
            </div>
            <motion.button
              onClick={() => setCurrentView('battle')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#00ADB5] font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow whitespace-nowrap"
            >
              <Play className="w-5 h-5" />
              Start Battle
            </motion.button>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard
            icon={Code2}
            title="100+ Problems"
            description="From easy warm-ups to challenging algorithms"
          />
          <FeatureCard
            icon={Users}
            title="Real-time Battles"
            description="Compete against developers worldwide"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Skill Tracking"
            description="Track your progress and climb the ranks"
          />
        </div>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({ icon: Icon, label, value, color, bgColor }: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({ icon: Icon, title, description }: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#00ADB5]" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

// Main export with error boundary
export default function CodeArena() {
  return (
    <ErrorBoundary>
      <CodeArenaContent />
    </ErrorBoundary>
  );
}
