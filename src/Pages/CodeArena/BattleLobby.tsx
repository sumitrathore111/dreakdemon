import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronRight,
    Clock,
    Coins,
    Search,
    Shield,
    Swords,
    Trophy,
    Users,
    X,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { joinOrCreateBattle } from '../../service/battleService';
import { db } from '../../service/Firebase';
import { secureCodeExecutionService } from '../../service/secureCodeExecution';

interface Wallet {
  coins: number;
  rating?: number;
}

interface BattleLobbyProps {
  wallet: Wallet;
}

interface WaitingBattle {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorProfilePic?: string;
  creatorRating?: number;
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
        const data = doc.data();
        // Extract creator info from participants array if available
        const creatorParticipant = data.participants?.[0];
        const creatorUserId = data.createdBy || data.creatorId || creatorParticipant?.odId || '';
        
        // Don't show user's own battles - prevent fighting yourself
        if (creatorUserId === user?.uid) {
          return;
        }
        
        battles.push({ 
          id: doc.id, 
          creatorId: creatorUserId,
          creatorName: creatorParticipant?.odName || data.creatorName || 'Unknown User',
          creatorProfilePic: creatorParticipant?.odProfilePic || data.creatorProfilePic || '',
          creatorRating: creatorParticipant?.rating || data.creatorRating || 1000,
          difficulty: data.difficulty,
          entryFee: data.entryFee,
          prize: data.prize,
          timeLimit: data.timeLimit,
          status: data.status,
          challenge: data.challenge,
          createdAt: data.createdAt
        });
      });
      setWaitingBattles(battles);
    });

    return () => unsubscribe();
  }, [user]);

  // Auto-matchmaking - automatically try to join battles
  useEffect(() => {
    if (!isSearching || !myBattleId || !user) return;
    
    // Every 2 seconds, check if there's a battle we can join
    const autoMatchInterval = setInterval(async () => {
      const matchingBattle = waitingBattles.find(
        (b) => b.difficulty === selectedDifficulty && 
               b.entryFee === selectedEntry.fee &&
               b.creatorId !== user.uid
      );

      if (matchingBattle) {
        clearInterval(autoMatchInterval);
        
        // Cancel our own battle first
        try {
          const myBattleRef = doc(db, 'CodeArena_Battles', myBattleId);
          await updateDoc(myBattleRef, { status: 'cancelled' });
        } catch {
          console.log('Our battle was already taken');
        }
        
        // Join the found battle
        await joinBattle(matchingBattle);
      }
    }, 2000);

    return () => clearInterval(autoMatchInterval);
  }, [isSearching, myBattleId, waitingBattles, selectedDifficulty, selectedEntry.fee, user]);

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
      // First check for existing battles to join immediately
      const matchingBattle = waitingBattles.find(
        (b) => b.difficulty === selectedDifficulty && 
               b.entryFee === selectedEntry.fee &&
               b.creatorId !== user.uid
      );

      // Deduct entry fee
      await deductCoins(user.uid, selectedEntry.fee, 'Battle entry fee');

      if (matchingBattle) {
        // Join existing battle immediately
        await joinBattle(matchingBattle);
      } else {
        // Create new battle and wait for opponent
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
        userAvatar: userprofile?.profilePic || '',
        rating: wallet?.rating || 1000
      };
      
      const battleId = await joinOrCreateBattle(battleRequest);
      setMyBattleId(battleId);
      
    } catch (error: unknown) {
      console.error('Error creating battle:', error);
      alert(error instanceof Error ? error.message : 'Failed to create battle');
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
            odId: battle.creatorId || '',
            odName: battle.creatorName || 'Unknown User',
            odProfilePic: battle.creatorProfilePic || '',
            rating: battle.creatorRating || 1000,
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
      
    } catch (error: unknown) {
      console.error('Error joining battle:', error);
      alert(error instanceof Error ? error.message : 'Failed to join battle');
    }
  };

  const handleCancelSearch = async () => {
    if (myBattleId) {
      try {
        // Refund entry fee
        await deductCoins(user!.uid, -selectedEntry.fee, 'Battle cancelled - refund');
        
        // Delete the battle document so it doesn't show to other users
        const battleRef = doc(db, 'CodeArena_Battles', myBattleId);
        await deleteDoc(battleRef);
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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Swords className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Battle Arena</h2>
            <p className="text-gray-500 dark:text-white text-xs">Compete against other coders in real-time</p>
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
          <Coins className="w-4 h-4 text-amber-600" />
          <span className="text-amber-700 dark:text-amber-400 font-semibold text-sm">
            Balance: {wallet?.coins?.toLocaleString() || 0} coins
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-[#00ADB5]/30 dark:border-[#00ADB5]/40 border-t-blue-600"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="w-8 h-8 text-[#00ADB5]" />
                </div>
              </div>

              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00ADB5] to-purple-600 bg-clip-text text-transparent mb-2">
                🔍 Finding Opponent...
              </h3>
              <p className="text-gray-600 dark:text-white mb-6 text-lg">
                Searching for a <span className="font-bold text-[#00ADB5]">{selectedDifficulty}</span> battle 🎯
              </p>

              <div className="flex items-center justify-center gap-3 text-3xl font-mono bg-gradient-to-r from-[#00ADB5] to-purple-600 bg-clip-text text-transparent mb-6 font-bold">
                <Clock className="w-6 h-6 text-[#00ADB5]" />
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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Select Difficulty</h3>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {difficulties.map((diff) => (
            <motion.button
              key={diff.id}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedDifficulty(diff.id)}
              className={`p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                selectedDifficulty === diff.id
                  ? 'border-[#00ADB5] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-md'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700'
              }`}
            >
              {selectedDifficulty === diff.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl"></div>
              )}
              <div className={`w-3 h-3 rounded-full ${diff.color} mb-2 mx-auto shadow-sm`} />
              <p className="font-medium text-gray-900 dark:text-white text-sm">{diff.label}</p>
              <p className="text-xs text-gray-500 dark:text-white">{diff.rating}</p>
              <p className="text-xs text-gray-400 dark:text-white mt-0.5">
                <Clock className="w-3 h-3 inline mr-0.5" />
                {diff.time}m
              </p>
            </motion.button>
          ))}
        </div>

        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
          <span className="text-lg">💰</span> Entry Fee & Prize
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {entryOptions.map((option) => (
            <motion.button
              key={option.fee}
              whileHover={{ scale: wallet?.coins >= option.fee ? 1.03 : 1 }}
              whileTap={{ scale: wallet?.coins >= option.fee ? 0.97 : 1 }}
              onClick={() => setSelectedEntry(option)}
              disabled={wallet?.coins < option.fee}
              className={`p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                selectedEntry.fee === option.fee
                  ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 shadow-md'
                  : wallet?.coins < option.fee
                  ? 'border-gray-200 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700'
              }`}
            >
              {selectedEntry.fee === option.fee && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-xl"></div>
              )}
              <div className="flex items-center justify-center gap-1 text-amber-600 font-medium text-sm">
                <Coins className="w-3.5 h-3.5" />
                {option.fee}
              </div>
              <div className="flex items-center justify-center gap-1 text-green-600 text-xs mt-0.5">
                <Trophy className="w-3 h-3" />
                Win {option.prize}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Find Match Button */}
        <motion.button
          whileHover={{ scale: !isCreating ? 1.02 : 1 }}
          whileTap={{ scale: !isCreating ? 0.98 : 1 }}
          onClick={handleFindMatch}
          disabled={!wallet || wallet.coins < selectedEntry.fee || isSearching || isCreating}
          className={`w-full py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
            wallet?.coins >= selectedEntry.fee && !isCreating
              ? 'bg-gradient-to-r from-[#00ADB5] via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700'
              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          {isCreating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Creating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Find Match
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-green-600 dark:text-green-400">
          <Shield className="w-3 h-3" />
          <span>Secure Battle System</span>
        </div>

        {wallet?.coins < selectedEntry.fee && (
          <p className="text-center text-red-500 text-xs mt-2">
            Need {selectedEntry.fee - wallet.coins} more coins
          </p>
        )}
      </div>

      {/* Available Battles */}
      {waitingBattles.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-xl border border-green-200 dark:border-green-700 shadow p-4 relative overflow-hidden"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            Open Battles
            <motion.span 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold"
            >
              {waitingBattles.length} live
            </motion.span>
          </h3>

          <div className="space-y-2">
            {waitingBattles.map((battle) => (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={battle.creatorProfilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${battle.creatorId}`}
                    alt={battle.creatorName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{battle.creatorName}</p>
                    <p className="text-xs text-gray-500 dark:text-white">
                      {battle.creatorRating} • {battle.difficulty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-600 font-medium text-sm">
                      <Coins className="w-3 h-3" />
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      wallet?.coins >= battle.entryFee
                        ? 'bg-[#00ADB5] text-white hover:bg-[#00ADB5]/80'
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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">How Battles Work</h3>
        
        <div className="grid md:grid-cols-3 gap-3">
          {[
            {
              icon: Coins,
              title: 'Pay Entry Fee',
              description: 'Contribute coins to prize pool'
            },
            {
              icon: Swords,
              title: 'Solve Problem',
              description: 'Race to solve faster'
            },
            {
              icon: Trophy,
              title: 'Winner Takes All',
              description: 'Win the prize pool'
            }
          ].map((step, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="p-1.5 bg-[#00ADB5]/20 dark:bg-[#00ADB5]/20 rounded-lg">
                <step.icon className="w-4 h-4 text-[#00ADB5]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">{step.title}</h4>
                <p className="text-xs text-gray-500 dark:text-white">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleLobby;
