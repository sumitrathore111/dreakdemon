import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
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
import { db } from '../../service/Firebase';

interface Wallet {
  coins: number;
  rating: number;
  // Add other wallet properties as needed
}

interface BattleLobbyProps {
  wallet: Wallet;
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
  createdAt: Timestamp;
}

const difficulties = [
  { id: 'easy', label: 'Easy', color: 'bg-green-500', rating: '800-1200', time: 10 },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-500', rating: '1200-1600', time: 15 },
  { id: 'hard', label: 'Hard', color: 'bg-red-500', rating: '1600-2000', time: 20 },
];

const entryOptions = [
  { fee: 50, prize: 90 },
  { fee: 100, prize: 180 },
  { fee: 200, prize: 360 },
  { fee: 500, prize: 900 },
];

const BattleLobby = ({ wallet }: BattleLobbyProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userprofile, deductCoins } = useDataContext();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium');
  const [selectedEntry, setSelectedEntry] = useState(entryOptions[1]);
  const [isSearching, setIsSearching] = useState(false);
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

  // Auto-matchmaking - automatically try to join battles
  useEffect(() => {
    if (!isSearching || !myBattleId) return;
    
    // Every 2 seconds, check if there's a battle we can join
    const autoMatchInterval = setInterval(async () => {
      const matchingBattle = waitingBattles.find(
        (b) => b.difficulty === selectedDifficulty && 
               b.entryFee === selectedEntry.fee &&
               b.creatorId !== user?.uid
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearching, myBattleId, waitingBattles, selectedDifficulty, selectedEntry.fee]);

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
    const difficultyConfig = difficulties.find(d => d.id === selectedDifficulty);
    
    const battleRef = await addDoc(collection(db, 'CodeArena_Battles'), {
      creatorId: user!.uid,
      creatorName: userprofile?.name || user!.email?.split('@')[0] || 'User',
      creatorProfilePic: userprofile?.profilePic || '',
      creatorRating: wallet?.rating || 1000,
      difficulty: selectedDifficulty,
      entryFee: selectedEntry.fee,
      prize: selectedEntry.prize,
      timeLimit: (difficultyConfig?.time || 15) * 60, // Convert to seconds
      status: 'waiting',
      participants: [{
        odId: user!.uid,
        odName: userprofile?.name || user!.email?.split('@')[0] || 'User',
        odProfilePic: userprofile?.profilePic || '',
        rating: wallet?.rating || 1000,
        hasSubmitted: false
      }],
      createdAt: serverTimestamp()
    });

    setMyBattleId(battleRef.id);
  };

  const joinBattle = async (battle: WaitingBattle) => {
    const battleRef = doc(db, 'CodeArena_Battles', battle.id);
    
    // Get a random problem based on difficulty
    const problem = await getRandomProblem(battle.difficulty);
    
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
      problem,
      matchedAt: serverTimestamp()
    });

    // Navigate to battle room
    navigate(`/dashboard/codearena/battle/${battle.id}`);
  };

  const getRandomProblem = async (difficulty: string) => {
    // Rating ranges for difficulties
    const ratingRanges: { [key: string]: { min: number; max: number } } = {
      easy: { min: 800, max: 1200 },
      medium: { min: 1200, max: 1600 },
      hard: { min: 1600, max: 2000 }
    };

    const range = ratingRanges[difficulty] || ratingRanges.medium;
    const rating = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    
    // Sample contest IDs (you can expand this)
    const contestIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const contestId = contestIds[Math.floor(Math.random() * contestIds.length)];
    const index = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];

    return {
      contestId,
      index,
      name: `Problem ${index}`,
      rating
    };
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

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Finding Opponent...
              </h3>
              <p className="text-gray-500 mb-4">
                Searching for a {selectedDifficulty} battle
              </p>

              <div className="flex items-center justify-center gap-2 text-2xl font-mono text-gray-700 mb-6">
                <Clock className="w-5 h-5" />
                {formatSearchTime(searchTime)}
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {waitingBattles.length} players waiting
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  Entry: {selectedEntry.fee}
                </span>
              </div>

              <button
                onClick={handleCancelSearch}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Difficulty</h3>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              onClick={() => setSelectedDifficulty(diff.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedDifficulty === diff.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${diff.color} mb-2`} />
              <p className="font-medium text-gray-900">{diff.label}</p>
              <p className="text-xs text-gray-500">{diff.rating}</p>
              <p className="text-xs text-gray-400 mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                {diff.time} min
              </p>
            </button>
          ))}
        </div>

        <h3 className="font-semibold text-gray-900 mb-4">Entry Fee & Prize</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {entryOptions.map((option) => (
            <button
              key={option.fee}
              onClick={() => setSelectedEntry(option)}
              disabled={wallet?.coins < option.fee}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedEntry.fee === option.fee
                  ? 'border-blue-500 bg-blue-50'
                  : wallet?.coins < option.fee
                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-1 text-amber-600 font-medium">
                <Coins className="w-4 h-4" />
                {option.fee}
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                <Trophy className="w-3 h-3" />
                Win {option.prize}
              </div>
            </button>
          ))}
        </div>

        {/* Find Match Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFindMatch}
          disabled={!wallet || wallet.coins < selectedEntry.fee || isSearching}
          className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
            wallet?.coins >= selectedEntry.fee
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Zap className="w-5 h-5" />
          Find Match
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        {wallet?.coins < selectedEntry.fee && (
          <p className="text-center text-red-500 text-sm mt-3">
            Insufficient coins. You need {selectedEntry.fee - wallet.coins} more coins.
          </p>
        )}
      </div>

      {/* Available Battles */}
      {waitingBattles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Open Battles
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {waitingBattles.length} available
            </span>
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
        </div>
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
