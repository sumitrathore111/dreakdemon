import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
    Calendar,
    ChevronRight,
    Coins,
    Crown,
    Loader2,
    Swords,
    Target,
    Trophy,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { db } from '../../service/Firebase';

interface BattleHistoryItem {
  id: string;
  status: 'waiting' | 'countdown' | 'active' | 'completed' | 'forfeited' | 'cancelled';
  winnerId?: string;
  winReason?: string;
  forfeitedBy?: string;
  prize: number;
  entryFee: number;
  difficulty: string;
  participants: {
    odId: string;
    odName: string;
    odProfilePic?: string;
    hasSubmitted?: boolean;
    submissionResult?: {
      passed: boolean;
      passedCount: number;
      totalCount: number;
      totalTime: number;
    };
  }[];
  challenge?: {
    title: string;
    difficulty: string;
  };
  createdAt: { toDate?: () => Date } | Date | number;
  endTime?: { toDate?: () => Date } | Date | number;
}

const BattleHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battles, setBattles] = useState<BattleHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'won' | 'lost'>('all');
  const [stats, setStats] = useState({
    totalBattles: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    const fetchBattleHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch ALL battles and filter client-side to avoid index issues
        const battlesRef = collection(db, 'CodeArena_Battles');
        const snapshot = await getDocs(battlesRef);
        
        const allBattles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BattleHistoryItem[];

        console.log('Total battles in database:', allBattles.length);
        console.log('Current user ID:', user.uid);

        // Filter battles where user participated
        const userBattles = allBattles.filter(battle => {
          const participants = battle.participants || [];
          const isParticipant = participants.some(p => {
            const odId = p.odId || (p as { userId?: string }).userId;
            return odId === user.uid;
          });
          return isParticipant;
        });

        console.log('User participated in:', userBattles.length, 'battles');
        
        // Filter to only show completed/forfeited battles for history
        const completedBattles = userBattles.filter(b => 
          b.status === 'completed' || b.status === 'forfeited'
        );

        // Sort by creation date (newest first)
        completedBattles.sort((a, b) => {
          const getTime = (ts: { toDate?: () => Date } | Date | number | undefined) => {
            if (!ts) return 0;
            if (typeof ts === 'object' && 'toDate' in ts && ts.toDate) {
              return ts.toDate().getTime();
            }
            if (ts instanceof Date) return ts.getTime();
            return typeof ts === 'number' ? ts : 0;
          };
          return getTime(b.createdAt) - getTime(a.createdAt);
        });

        console.log('Completed battles:', completedBattles.length);
        if (completedBattles.length > 0) {
          console.log('Sample battle:', completedBattles[0]);
        }

        setBattles(completedBattles);

        // Calculate stats
        let wins = 0;
        let losses = 0;
        let totalEarnings = 0;

        userBattles.forEach(battle => {
          const isWinner = battle.winnerId === user.uid;
          if (isWinner) {
            wins++;
            totalEarnings += battle.prize || 0;
          } else if (battle.winnerId && battle.winnerId !== user.uid) {
            losses++;
            totalEarnings -= battle.entryFee || 0;
          }
        });

        setStats({
          totalBattles: userBattles.length,
          wins,
          losses,
          winRate: userBattles.length > 0 ? Math.round((wins / userBattles.length) * 100) : 0,
          totalEarnings
        });

      } catch (error) {
        console.error('Error fetching battle history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBattleHistory();
  }, [user]);

  const getFilteredBattles = () => {
    if (filter === 'all') return battles;
    if (filter === 'won') return battles.filter(b => b.winnerId === user?.uid);
    if (filter === 'lost') return battles.filter(b => b.winnerId && b.winnerId !== user?.uid);
    return battles;
  };

  const formatDate = (timestamp: { toDate?: () => Date } | Date | number | null | undefined) => {
    if (!timestamp) return 'N/A';
    let date: Date;
    if (typeof timestamp === 'object' && 'toDate' in timestamp && timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp as number);
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getOpponent = (battle: BattleHistoryItem) => {
    const participant = battle.participants?.find(p => {
      const part = p as { odId?: string; userId?: string };
      return part.odId !== user?.uid && part.userId !== user?.uid;
    });
    return participant;
  };

  const getMyResult = (battle: BattleHistoryItem) => {
    const participant = battle.participants?.find(p => {
      const part = p as { odId?: string; userId?: string };
      return part.odId === user?.uid || part.userId === user?.uid;
    });
    return participant;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Swords className="w-6 h-6 text-blue-500" />
            Battle History
          </h2>
          <p className="text-gray-500 text-sm mt-1">Your past matches and performance</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/codearena/battle')}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Swords className="w-4 h-4" />
          New Battle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Target className="w-4 h-4" />
            Total Battles
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalBattles}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-green-200 p-4 bg-green-50/50">
          <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
            <Trophy className="w-4 h-4" />
            Wins
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.wins}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-red-200 p-4 bg-red-50/50">
          <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
            <XCircle className="w-4 h-4" />
            Losses
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.losses}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-blue-200 p-4 bg-blue-50/50">
          <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
            <Crown className="w-4 h-4" />
            Win Rate
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.winRate}%</p>
        </div>
        
        <div className={`bg-white rounded-xl border p-4 ${stats.totalEarnings >= 0 ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
            <Coins className="w-4 h-4" />
            Net Earnings
          </div>
          <p className={`text-2xl font-bold ${stats.totalEarnings >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
            {stats.totalEarnings >= 0 ? '+' : ''}{stats.totalEarnings}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1.5 w-fit">
        {[
          { id: 'all', label: 'All Battles' },
          { id: 'won', label: 'Victories' },
          { id: 'lost', label: 'Defeats' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as 'all' | 'won' | 'lost')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Battle List */}
      <div className="space-y-3">
        {getFilteredBattles().length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Swords className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No battles found</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? "You haven't participated in any battles yet." 
                : filter === 'won' 
                  ? "No victories yet. Keep practicing!" 
                  : "No defeats recorded. Great job!"}
            </p>
            <button
              onClick={() => navigate('/dashboard/codearena/battle')}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Your First Battle
            </button>
          </div>
        ) : (
          getFilteredBattles().map((battle, index) => {
            const isWinner = battle.winnerId === user?.uid;
            const opponent = getOpponent(battle);
            const myResult = getMyResult(battle);
            const wonByForfeit = battle.status === 'forfeited' && battle.forfeitedBy !== user?.uid;
            const lostByForfeit = battle.status === 'forfeited' && battle.forfeitedBy === user?.uid;

            return (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/dashboard/codearena/battle/results/${battle.id}`)}
                className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all group ${
                  isWinner 
                    ? 'border-green-200 hover:border-green-300' 
                    : 'border-red-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left - Result & Opponent */}
                  <div className="flex items-center gap-4">
                    {/* Result Badge */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isWinner 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-br from-red-400 to-orange-500'
                    }`}>
                      {isWinner ? (
                        <Trophy className="w-7 h-7 text-white" />
                      ) : (
                        <XCircle className="w-7 h-7 text-white" />
                      )}
                    </div>

                    {/* Battle Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg font-bold ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
                          {isWinner ? '🏆 Victory' : '❌ Defeat'}
                        </span>
                        {wonByForfeit && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                            Opponent Left
                          </span>
                        )}
                        {lostByForfeit && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            Forfeited
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 font-medium">
                        vs {opponent?.odName || 'Unknown'}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(battle.endTime || battle.createdAt)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                          battle.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          battle.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {battle.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right - Stats & Coins */}
                  <div className="flex items-center gap-6">
                    {/* Test Results */}
                    {myResult?.submissionResult && (
                      <div className="text-right hidden md:block">
                        <p className="text-sm text-gray-500">Tests Passed</p>
                        <p className={`font-bold ${myResult.submissionResult.passed ? 'text-green-600' : 'text-orange-600'}`}>
                          {myResult.submissionResult.passedCount}/{myResult.submissionResult.totalCount}
                        </p>
                      </div>
                    )}

                    {/* Coins */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Coins</p>
                      <p className={`font-bold text-lg ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
                        {isWinner ? '+' : '-'}{isWinner ? battle.prize : battle.entryFee}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Win Reason */}
                {battle.winReason && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Result: </span>
                      {battle.winReason}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default BattleHistory;
