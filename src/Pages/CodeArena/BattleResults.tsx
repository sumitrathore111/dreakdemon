import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Medal, Coins, Clock, Target, 
  TrendingUp, TrendingDown, Home,
  RotateCcw, CheckCircle,
  Star, Crown
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../service/Firebase';

// Simple confetti effect
const triggerConfetti = () => {
  const colors = ['#00ADB5', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];
  const confettiCount = 100;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -10px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      pointer-events: none;
      z-index: 9999;
      animation: confetti-fall ${2 + Math.random() * 2}s ease-out forwards;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
};

// Add keyframes for confetti animation
if (typeof document !== 'undefined' && !document.getElementById('confetti-styles')) {
  const style = document.createElement('style');
  style.id = 'confetti-styles';
  style.textContent = `
    @keyframes confetti-fall {
      to {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

const BattleResults = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userprofile } = useDataContext();
  
  const [battle, setBattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [myData, setMyData] = useState<any>(null);
  const [opponentData, setOpponentData] = useState<any>(null);
  const [ratingChange, setRatingChange] = useState(0);

  useEffect(() => {
    const fetchBattleResults = async () => {
      if (!battleId) return;

      try {
        const battleDoc = await getDoc(doc(db, 'CodeArena_Battles', battleId));
        
        if (!battleDoc.exists()) {
          navigate('/dashboard/codearena');
          return;
        }

        const battleData = { id: battleDoc.id, ...battleDoc.data() } as any;
        setBattle(battleData);

        // Find my data and opponent data
        const me = battleData.participants?.find((p: any) => p.userId === user?.uid);
        const opp = battleData.participants?.find((p: any) => p.userId !== user?.uid);
        
        setMyData(me);
        setOpponentData(opp);

        // Check if winner
        const won = battleData.winnerId === user?.uid;
        setIsWinner(won);

        // Calculate rating change (simplified ELO)
        if (won) {
          setRatingChange(Math.floor(25 + Math.random() * 10));
        } else {
          setRatingChange(-Math.floor(15 + Math.random() * 10));
        }

        setLoading(false);

        // Trigger confetti if winner
        if (won) {
          setTimeout(() => {
            triggerConfetti();
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching battle results:', error);
        setLoading(false);
      }
    };

    fetchBattleResults();
  }, [battleId, user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Result Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          {isWinner ? (
            <>
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30"
              >
                <Trophy className="w-16 h-16 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-yellow-400 mb-2">Victory!</h1>
              <p className="text-xl text-gray-300">Congratulations! You won the battle!</p>
            </>
          ) : (
            <>
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                <Medal className="w-16 h-16 text-gray-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-400 mb-2">Defeat</h1>
              <p className="text-xl text-gray-300">Good effort! Keep practicing!</p>
            </>
          )}
        </motion.div>

        {/* Players Comparison */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 mb-6"
        >
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Player 1 (You) */}
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                isWinner 
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 ring-4 ring-yellow-500/30' 
                  : 'bg-gradient-to-br from-cyan-400 to-blue-500'
              }`}>
                {userprofile?.name?.[0] || 'Y'}
              </div>
              <p className="text-white font-semibold">{userprofile?.name || 'You'}</p>
              <p className="text-sm text-gray-400">Level {myData?.level || 1}</p>
              {isWinner && (
                <div className="flex items-center justify-center gap-1 mt-2 text-yellow-400">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Winner</span>
                </div>
              )}
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">VS</div>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                !isWinner 
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 ring-4 ring-yellow-500/30' 
                  : 'bg-gradient-to-br from-red-400 to-orange-500'
              }`}>
                {opponentData?.odName?.[0] || 'O'}
              </div>
              <p className="text-white font-semibold">{opponentData?.odName || 'Opponent'}</p>
              <p className="text-sm text-gray-400">Level {opponentData?.level || 1}</p>
              {!isWinner && (
                <div className="flex items-center justify-center gap-1 mt-2 text-yellow-400">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Winner</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Comparison */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Battle Stats
          </h3>

          <div className="space-y-4">
            {/* Tests Passed */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{myData?.score || 0}/{myData?.totalTests || 0}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Tests Passed</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{opponentData?.score || 0}/{opponentData?.totalTests || 0}</p>
              </div>
            </div>

            {/* Time Taken */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{formatTime(myData?.timeTaken || 0)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Time Taken</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{formatTime(opponentData?.timeTaken || 0)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rewards Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-4 mb-6"
        >
          {/* Coins */}
          <div className={`p-6 rounded-2xl border ${
            isWinner 
              ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30' 
              : 'bg-gray-800/50 border-gray-700/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Coins Earned</p>
                <p className={`text-3xl font-bold ${isWinner ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {isWinner ? `+${battle?.prizePool || 0}` : '+0'}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isWinner ? 'bg-yellow-500/20' : 'bg-gray-700/50'
              }`}>
                <Coins className={`w-7 h-7 ${isWinner ? 'text-yellow-400' : 'text-gray-500'}`} />
              </div>
            </div>
          </div>

          {/* Rating Change */}
          <div className={`p-6 rounded-2xl border ${
            ratingChange > 0 
              ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30' 
              : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Rating Change</p>
                <p className={`text-3xl font-bold ${ratingChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {ratingChange > 0 ? '+' : ''}{ratingChange}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                ratingChange > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {ratingChange > 0 ? (
                  <TrendingUp className="w-7 h-7 text-green-400" />
                ) : (
                  <TrendingDown className="w-7 h-7 text-red-400" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Experience Gained</span>
            </div>
            <span className="text-purple-400 font-bold">+{isWinner ? 50 : 20} XP</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${isWinner ? 70 : 45}%` }}
              transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">350/500 XP to Level Up</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/codearena/battle')}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Battle Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/codearena')}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-700/50 text-white font-semibold rounded-xl border border-gray-600 hover:bg-gray-700 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Arena
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default BattleResults;
