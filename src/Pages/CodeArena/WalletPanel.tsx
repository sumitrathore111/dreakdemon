import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
    ArrowDownRight,
    ArrowUpRight,
    Coins,
    Gift,
    History,
    Star,
    Swords,
    Target,
    TrendingDown,
    TrendingUp,
    Trophy,
    Wallet as WalletIcon,
    X,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { db } from '../../service/Firebase';

interface WalletPanelProps {
  wallet: any;
  onClose: () => void;
}

const WalletPanel = ({ wallet, onClose }: WalletPanelProps) => {
  const { user } = useAuth();
  const { fetchUserTransactions, getUserProgress } = useDataContext();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [realStats, setRealStats] = useState({
    problemsSolved: 0,
    battlesWon: 0,
    currentStreak: 0
  });

  // Fetch real stats from Firebase
  useEffect(() => {
    const fetchRealStats = async () => {
      if (!user) return;
      
      try {
        // Get problems solved from user progress
        const userProgress = await getUserProgress?.(user.uid);
        const solvedCount = userProgress?.solvedChallenges?.length || wallet?.achievements?.problemsSolved || 0;
        
        // Get battles won and streak from Firebase
        let battlesWon = 0;
        let currentStreak = 0;
        
        try {
          const battlesRef = collection(db, 'CodeArena_Battles');
          const snapshot = await getDocs(battlesRef);
          const allBattles = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as any));
          
          // Filter battles where user participated
          const userBattles = allBattles.filter((battle: any) => {
            const participants = battle.participants || [];
            return participants.some((p: any) => {
              const odId = p.odId || p.userId;
              return odId === user.uid;
            });
          });
          
          // Count wins
          userBattles.forEach((battle: any) => {
            if (battle.winnerId === user.uid) {
              battlesWon++;
            }
          });
          
          // Calculate current streak from consecutive wins
          const completedBattles = userBattles
            .filter((b: any) => b.status === 'completed' || b.status === 'forfeited')
            .sort((a: any, b: any) => {
              const getTime = (ts: any) => {
                if (!ts) return 0;
                if (typeof ts === 'object' && ts.toDate) return ts.toDate().getTime();
                if (ts instanceof Date) return ts.getTime();
                return typeof ts === 'number' ? ts : 0;
              };
              return getTime(b.createdAt) - getTime(a.createdAt);
            });
          
          for (const battle of completedBattles) {
            if (battle.winnerId === user.uid) {
              currentStreak++;
            } else if (battle.winnerId) {
              break;
            }
          }
        } catch (e) {
          console.error('Error fetching battles for wallet:', e);
          battlesWon = wallet?.achievements?.battlesWon || 0;
          currentStreak = wallet?.streak?.current || 0;
        }
        
        setRealStats({
          problemsSolved: solvedCount,
          battlesWon: battlesWon,
          currentStreak: currentStreak
        });
      } catch (error) {
        console.error('Error fetching real stats:', error);
        setRealStats({
          problemsSolved: wallet?.achievements?.problemsSolved || 0,
          battlesWon: wallet?.achievements?.battlesWon || 0,
          currentStreak: wallet?.streak?.current || 0
        });
      }
    };
    
    fetchRealStats();
  }, [user, wallet, getUserProgress]);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) return;
      
      try {
        // Try to fetch from transactions collection
        let data = await fetchUserTransactions(user.uid);
        
        // If no transactions, try to build from battle history
        if (!data || data.length === 0) {
          try {
            const battlesRef = collection(db, 'CodeArena_Battles');
            const snapshot = await getDocs(battlesRef);
            const allBattles = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as any));
            
            // Filter completed battles where user participated
            const userBattles = allBattles.filter((battle: any) => {
              const participants = battle.participants || [];
              return participants.some((p: any) => {
                const odId = p.odId || p.userId;
                return odId === user.uid;
              }) && (battle.status === 'completed' || battle.status === 'forfeited');
            });
            
            // Convert battles to transaction format
            data = userBattles.map((battle: any) => {
              const isWinner = battle.winnerId === user.uid;
              return {
                id: battle.id,
                type: isWinner ? 'earn' : 'spend',
                category: 'battle',
                amount: isWinner ? (battle.prize || battle.entryFee * 2 || 0) : (battle.entryFee || 0),
                description: isWinner ? `Won battle - ${battle.challenge?.title || 'Coding Battle'}` : `Lost battle - ${battle.challenge?.title || 'Coding Battle'}`,
                createdAt: battle.endTime || battle.createdAt
              };
            }).sort((a: any, b: any) => {
              const getTime = (ts: any) => {
                if (!ts) return 0;
                if (typeof ts === 'object' && ts.toDate) return ts.toDate().getTime();
                if (ts instanceof Date) return ts.getTime();
                return typeof ts === 'number' ? ts : 0;
              };
              return getTime(b.createdAt) - getTime(a.createdAt);
            });
          } catch (e) {
            console.error('Error building transactions from battles:', e);
          }
        }
        
        setTransactions(data || []);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user, fetchUserTransactions]);

  const getTransactionIcon = (type: string, category: string) => {
    if (type === 'earn') {
      switch (category) {
        case 'challenge': return Target;
        case 'battle': return Swords;
        case 'tournament': return Trophy;
        default: return Gift;
      }
    } else {
      switch (category) {
        case 'hint': return Star;
        case 'entry_fee': return Swords;
        default: return Coins;
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-sm bg-gray-900 border-l border-gray-700/50 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <WalletIcon className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">My Wallet</h2>
              <p className="text-sm text-gray-400">Manage your coins & rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Balance</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">₿</span>
              </div>
              <span className="text-4xl font-bold text-white">
                {wallet?.coins?.toLocaleString() || 0}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Earned</span>
                </div>
                <p className="text-white font-bold">
                  {wallet?.totalEarned?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm">Spent</span>
                </div>
                <p className="text-white font-bold">
                  {wallet?.totalSpent?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'history', label: 'History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' ? (
            <div className="space-y-4">
              {/* Level & XP */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Level {wallet?.level || 1}</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {wallet?.experience || 0} / {(wallet?.level || 1) * 100} XP
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((wallet?.experience || 0) / ((wallet?.level || 1) * 100)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                  <Target className="w-5 h-5 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {realStats.problemsSolved}
                  </p>
                  <p className="text-sm text-gray-400">Problems Solved</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                  <Swords className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {realStats.battlesWon}
                  </p>
                  <p className="text-sm text-gray-400">Battles Won</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                  <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {wallet?.achievements?.tournamentsWon || 0}
                  </p>
                  <p className="text-sm text-gray-400">Tournaments</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                  <Zap className="w-5 h-5 text-orange-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {realStats.currentStreak}
                  </p>
                  <p className="text-sm text-gray-400">Win Streak</p>
                </div>
              </div>

              {/* Badges */}
              {wallet?.badges && wallet.badges.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-pink-400" />
                    Badges
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {wallet.badges.map((badge: any, i: number) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 bg-gray-700/50 rounded-lg text-sm text-white flex items-center gap-2"
                        title={badge.description}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                transactions.map((tx, i) => {
                  const Icon = getTransactionIcon(tx.type, tx.category);
                  const isEarn = tx.type === 'earn';
                  
                  return (
                    <motion.div
                      key={tx.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isEarn ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          <Icon className={`w-4 h-4 ${isEarn ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 font-bold ${
                        isEarn ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isEarn ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>{isEarn ? '+' : '-'}{tx.amount}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WalletPanel;
