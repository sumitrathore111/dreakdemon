import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, Users, Clock, Trophy, 
  Search, X, Coins,
  Zap, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../service/Firebase';
import { joinOrCreateBattle, getBattleStats } from '../../service/battleService';
import { secureCodeExecutionService } from '../../service/secureCodeExecution';

interface BattleLobbyProps {
  wallet: any;
}

interface WaitingBattle {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorProfilePic: string;
  creatorRating: number;
  difficulty: 'easy' | 'medium' | 'hard';
  entryFee: number;
  prize: number;
  timeLimit: number;
  status: 'waiting' | 'matched' | 'active';
  challenge?: {
    id: string;
    title: string;
    difficulty: string;
    category: string;
  };
  createdAt: Timestamp;
}

const difficulties = [
  { id: 'easy', label: 'Easy', color: 'bg-green-500', rating: '800-1200', time: 15 },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-500', rating: '1200-1600', time: 20 },
  { id: 'hard', label: 'Hard', color: 'bg-red-500', rating: '1600-2000', time: 30 },
];

const entryOptions = [
  { fee: 5, prize: 9 },
  { fee: 10, prize: 18 },
  { fee: 20, prize: 36 },
  { fee: 50, prize: 90 },
];

const BattleLobby = ({ wallet }: BattleLobbyProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userprofile, deductCoins } = useDataContext();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium');
  const [selectedEntry, setSelectedEntry] = useState(entryOptions[1]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [waitingBattles, setWaitingBattles] = useState<WaitingBattle[]>([]);
  const [myBattleId, setMyBattleId] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState(0);

  // Subscribe to waiting battles
  useEffect(() => {
    const q = query(
      collection(db, 'CodeArena_Battles'),
      where('status', '==', 'waiting')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const battles: WaitingBattle[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<WaitingBattle, 'id'>;
        if (data.creatorId !== user?.uid) {
          battles.push({ id: doc.id, ...data });
        }
      });
      setWaitingBattles(battles);
    });

    return () => unsubscribe();
  }, [user]);

  // Watch for match when searching
  useEffect(() => {
    if (!myBattleId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'CodeArena_Battles', myBattleId),
      (snapshot) => {
        if (!snapshot.exists()) return;
        
        const data = snapshot.data();
        if (data.status === 'countdown' || data.status === 'active') {
          // Match found! Navigate to battle room
          navigate(`/dashboard/codearena/battle/${myBattleId}`);
        }
      }
    );

    return () => unsubscribe();
  }, [myBattleId, navigate]);

  // Search timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const handleFindMatch = async () => {
    if (!user || !wallet || wallet.coins < selectedEntry.fee) return;

    setIsSearching(true);
    setSearchTime(0);

    try {
      // Deduct entry fee
      await deductCoins(user.uid, selectedEntry.fee, 'Battle entry fee');

      // Check for existing battles to join
      const matchingBattle = waitingBattles.find(
        (b) => b.difficulty === selectedDifficulty && b.entryFee === selectedEntry.fee
      );

      if (matchingBattle) {
        // Join existing battle
        await joinBattle(matchingBattle);
      } else {
        // Create new battle and wait
        await createBattle();
      }
    } catch (error) {
      console.error('Error finding match:', error);
      setIsSearching(false);
    }
  };

  const createBattle = async () => {
    try {
      setIsCreating(true);
      
      // Ensure wallet exists before verification
      if (!wallet) {
        alert('Wallet not initialized. Please refresh the page.');
        return;
      }
      
      // Verify user has sufficient coins
      const hasEnoughCoins = await secureCodeExecutionService.verifyBattleEntry(user!.uid, selectedEntry.fee);
      
      if (!hasEnoughCoins) {
        alert(`Insufficient coins for battle entry fee! You have ${wallet.coins || 0} coins but need ${selectedEntry.fee} coins.`);
        return;
      }
      
      const battleRequest = {
        difficulty: selectedDifficulty as 'easy' | 'medium' | 'hard',
        entryFee: selectedEntry.fee,
        userId: user!.uid,
        userName: userprofile?.name || user!.email?.split('@')[0] || 'User',
        userAvatar: userprofile?.profilePic,
        rating: wallet?.rating || 1000
      };
      
      const battleId = await joinOrCreateBattle(battleRequest);
      setMyBattleId(battleId);
      
    } catch (error: any) {
      console.error('Error creating battle:', error);
      alert(error.message || 'Failed to create battle');
    } finally {
      setIsCreating(false);
    }
  };

  const joinBattle = async (battle: WaitingBattle) => {
    try {
      // Ensure wallet exists before verification
      if (!wallet) {
        alert('Wallet not initialized. Please refresh the page.');
        return;
      }
      
      // Verify user has sufficient coins
      const hasEnoughCoins = await secureCodeExecutionService.verifyBattleEntry(user!.uid, battle.entryFee);
      
      if (!hasEnoughCoins) {
        alert(`Insufficient coins for battle entry fee! You have ${wallet.coins || 0} coins but need ${battle.entryFee} coins.`);
        return;
      }
      
      const battleRef = doc(db, 'CodeArena_Battles', battle.id);
      
      await updateDoc(battleRef, {
        status: 'countdown',
        participants: [
          {
            odId: battle.creatorId,
            odName: battle.creatorName,
            odProfilePic: battle.creatorProfilePic,
            rating: battle.creatorRating,
            hasSubmitted: false
          },
          {
            odId: user!.uid,
            odName: userprofile?.name || user!.email?.split('@')[0] || 'User',
            odProfilePic: userprofile?.profilePic || '',
            rating: wallet?.rating || 1000,
            hasSubmitted: false
          }
        ],
        matchedAt: Timestamp.now()
      });

      // Navigate to battle room
      navigate(`/dashboard/codearena/battle/${battle.id}`);
      
    } catch (error: any) {
      console.error('Error joining battle:', error);
      alert(error.message || 'Failed to join battle');
    }
  };

  const handleCancelSearch = async () => {
    if (myBattleId) {
      try {
        // Refund entry fee
        await deductCoins(user!.uid, -selectedEntry.fee, 'Battle cancelled - refund');
        
        // Delete the battle document
        const battleRef = doc(db, 'CodeArena_Battles', myBattleId);
        await updateDoc(battleRef, { status: 'cancelled' });
      } catch (error) {
        console.error('Error cancelling battle:', error);
      }
    }
    
    setIsSearching(false);
    setMyBattleId(null);
    setSearchTime(0);
  };

  const formatSearchTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <Swords className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Battle Arena</h2>
            <p className="text-gray-500 text-sm">Compete against other coders in real-time</p>
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
          <Coins className="w-5 h-5 text-amber-600" />
          <span className="text-amber-700 font-semibold">
            Your Balance: {wallet?.coins?.toLocaleString() || 0} coins
          </span>
        </div>
      </div>

      {/* Searching Modal */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🔍 Finding Opponent...
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Searching for a <span className="font-bold text-blue-600">{selectedDifficulty}</span> battle 🎯
              </p>

              <div className="flex items-center justify-center gap-3 text-3xl font-mono bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 font-bold">
                <Clock className="w-6 h-6 text-blue-500" />
                {formatSearchTime(searchTime)}
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-8">
                <motion.span 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full"
                >
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-700">{waitingBattles.length} players waiting</span>
                </motion.span>
                <span className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-amber-700">Entry: {selectedEntry.fee}</span>
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelSearch}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
              >
                <X className="w-5 h-5" />
                Cancel Battle 🚫
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Difficulty</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          {difficulties.map((diff) => (
            <motion.button
              key={diff.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDifficulty(diff.id)}
              className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                selectedDifficulty === diff.id
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg bg-gradient-to-br from-white to-gray-50'
              }`}
            >
              {selectedDifficulty === diff.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-2xl"></div>
              )}
              <div className={`w-4 h-4 rounded-full ${diff.color} mb-3 mx-auto shadow-md`} />
              <p className="font-medium text-gray-900">{diff.label}</p>
              <p className="text-xs text-gray-500">{diff.rating}</p>
              <p className="text-xs text-gray-400 mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                {diff.time} min
              </p>
            </motion.button>
          ))}
        </div>

        <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">💰</span> Entry Fee & Prize
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {entryOptions.map((option) => (
            <motion.button
              key={option.fee}
              whileHover={{ scale: wallet?.coins >= option.fee ? 1.05 : 1 }}
              whileTap={{ scale: wallet?.coins >= option.fee ? 0.95 : 1 }}
              onClick={() => setSelectedEntry(option)}
              disabled={wallet?.coins < option.fee}
              className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                selectedEntry.fee === option.fee
                  ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg'
                  : wallet?.coins < option.fee
                  ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-amber-300 hover:shadow-lg bg-gradient-to-br from-white to-gray-50'
              }`}
            >
              {selectedEntry.fee === option.fee && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-2xl"></div>
              )}
              <div className="flex items-center gap-1 text-amber-600 font-medium">
                <Coins className="w-4 h-4" />
                {option.fee}
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                <Trophy className="w-3 h-3" />
                Win {option.prize}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Find Match Button */}
        <motion.button
          whileHover={{ scale: !isCreating ? 1.02 : 1, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
          whileTap={{ scale: !isCreating ? 0.98 : 1 }}
          onClick={handleFindMatch}
          disabled={!wallet || wallet.coins < selectedEntry.fee || isSearching || isCreating}
          className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden shadow-lg ${
            wallet?.coins >= selectedEntry.fee && !isCreating
              ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700'
              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          {isCreating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Creating Secure Battle...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Find Secure Match
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600">
          <Shield className="w-4 h-4" />
          <span>Secure Battle System - Random Database Challenges</span>
        </div>

        {wallet?.coins < selectedEntry.fee && (
          <p className="text-center text-red-500 text-sm mt-3">
            Insufficient coins. You need {selectedEntry.fee - wallet.coins} more coins.
          </p>
        )}
      </div>

      {/* Available Battles */}
      {waitingBattles.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-green-50 rounded-2xl border border-green-200 shadow-lg p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-100 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
          <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            🎮 Open Battles
            <motion.span 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-semibold shadow-md"
            >
              {waitingBattles.length} live
            </motion.span>
          </h3>

          <div className="space-y-3">
            {waitingBattles.map((battle) => (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={battle.creatorProfilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${battle.creatorId}`}
                    alt={battle.creatorName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{battle.creatorName}</p>
                    <p className="text-sm text-gray-500">
                      Rating: {battle.creatorRating} • {battle.difficulty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-600 font-medium">
                      <Coins className="w-4 h-4" />
                      {battle.entryFee}
                    </div>
                    <div className="text-xs text-green-600">
                      Win {battle.prize}
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (wallet?.coins >= battle.entryFee) {
                        await deductCoins(user!.uid, battle.entryFee, 'Battle entry fee');
                        await joinBattle(battle);
                      }
                    }}
                    disabled={wallet?.coins < battle.entryFee}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      wallet?.coins >= battle.entryFee
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Join
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* How It Works */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">How Battles Work</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Coins,
              title: 'Pay Entry Fee',
              description: 'Both players contribute coins to the prize pool'
            },
            {
              icon: Swords,
              title: 'Solve the Problem',
              description: 'Race to solve the same coding problem faster'
            },
            {
              icon: Trophy,
              title: 'Winner Takes All',
              description: 'First to solve correctly wins the prize pool'
            }
          ].map((step, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <step.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{step.title}</h4>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleLobby;
