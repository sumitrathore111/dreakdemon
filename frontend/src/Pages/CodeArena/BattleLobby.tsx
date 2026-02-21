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
import { apiRequest } from '../../service/api';
import { joinOrCreateBattle } from '../../service/battleService';

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
  createdAt: Date;
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
  const { userprofile } = useDataContext();

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium');
  const [selectedEntry, setSelectedEntry] = useState(entryOptions[1]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [waitingBattles, setWaitingBattles] = useState<WaitingBattle[]>([]);
  const [myBattleId, setMyBattleId] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState(0);

  // Poll for waiting battles
  useEffect(() => {
    if (!user) return;

    const fetchWaitingBattles = async () => {
      try {
        const response = await apiRequest(`/battles?status=waiting&difficulty=${selectedDifficulty}`);
        const battles = response.battles || [];
        const filteredBattles = battles.filter((b: WaitingBattle) => b.creatorId !== user.id);
        setWaitingBattles(filteredBattles);
      } catch (error) {
        console.error("Error fetching waiting battles:", error);
      }
    };

    fetchWaitingBattles();
    const interval = setInterval(fetchWaitingBattles, 5000); // Poll every 5 seconds for faster matching

    return () => clearInterval(interval);
  }, [user, selectedDifficulty]);

  // Poll for my battle status when searching - FAST polling for real-time feel
  // Also implements auto-match: continuously checks for available battles to join
  useEffect(() => {
    if (!myBattleId || !isSearching || !user) return;

    const pollBattleStatus = async () => {
      try {
        const battle = await apiRequest(`/battles/${myBattleId}`);
        // Check if opponent joined (status becomes 'active' or participants.length > 1)
        if (battle && (
          battle.status === 'countdown' ||
          battle.status === 'active' ||
          (battle.participants && battle.participants.length >= 2)
        )) {
          console.log('Opponent found! Navigating to battle...');
          navigate(`/dashboard/codearena/battle/${myBattleId}`);
          return;
        }

        // Auto-match: Check if there are other battles we can join instead of waiting
        const response = await apiRequest(`/battles?status=waiting&difficulty=${selectedDifficulty}`);
        const availableBattles = (response.battles || []).filter(
          (b: WaitingBattle) => b.creatorId !== user.id &&
                               b.id !== myBattleId &&
                               b.entryFee === selectedEntry.fee
        );

        if (availableBattles.length > 0) {
          // Found another battle! Cancel our battle and join theirs
          const targetBattle = availableBattles[0];
          console.log('Auto-match: Found existing battle, joining...', targetBattle.id);

          // Cancel our waiting battle (refund already handled)
          try {
            await apiRequest(`/battles/${myBattleId}`, { method: 'DELETE' });
          } catch (e) {
            console.log('Could not delete own battle, may already be matched');
          }

          // Join the other battle
          await apiRequest(`/battles/${targetBattle.id}/join`, {
            method: 'POST',
            body: JSON.stringify({
              userId: user.id,
              userName: userprofile?.name || user.email?.split('@')[0] || 'User',
              userAvatar: userprofile?.profilePic || '',
              rating: wallet?.rating || 1000
            })
          });

          navigate(`/dashboard/codearena/battle/${targetBattle.id}`);
        }
      } catch (error) {
        console.error('Error polling battle status:', error);
        // Handle error, maybe stop polling if battle not found
      }
    };

    // Poll immediately, then every 2 seconds for responsive matchmaking
    pollBattleStatus();
    const interval = setInterval(pollBattleStatus, 2000); // Poll every 2 seconds for fast response

    return () => clearInterval(interval);
  }, [myBattleId, isSearching, navigate, user, selectedDifficulty, selectedEntry.fee, userprofile, wallet]);

  // Cancel battle when user leaves the page or closes browser
  // NOTE: Tab switching and window blur handlers removed to allow testing with multiple accounts
  useEffect(() => {
    if (!myBattleId || !isSearching) return;

    const cancelBattle = async () => {
      try {
        // Use sendBeacon for reliable delivery on page unload
        const token = localStorage.getItem('authToken');
        navigator.sendBeacon(
          `https://nextstepbackend-qhxw.onrender.com/api/battles/${myBattleId}/cancel`,
          JSON.stringify({ token })
        );
      } catch (error) {
        console.error('Error cancelling battle:', error);
      }
    };

    // Handle tab close/refresh only
    window.addEventListener('beforeunload', cancelBattle);

    // Handle navigation within app
    return () => {
      window.removeEventListener('beforeunload', cancelBattle);
      // Cancel battle if navigating away while searching
      if (myBattleId && isSearching) {
        apiRequest(`/battles/${myBattleId}`, { method: 'DELETE' }).catch(() => {});
      }
    };
  }, [myBattleId, isSearching]);

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
    console.log('handleFindMatch called', { user, wallet, selectedEntry });

    if (!user) {
      alert('Please log in to find a match');
      return;
    }

    if (!wallet) {
      alert('Wallet not loaded. Please wait or refresh the page.');
      return;
    }

    if ((wallet.coins || 0) < selectedEntry.fee) {
      alert(`Insufficient coins! You have ${wallet.coins || 0} coins but need ${selectedEntry.fee} coins.`);
      return;
    }

    setIsSearching(true);
    setSearchTime(0);

    try {
      // First check for existing battles to join immediately
      const matchingBattle = waitingBattles.find(
        (b) => b.difficulty === selectedDifficulty &&
               b.entryFee === selectedEntry.fee &&
               b.creatorId !== user.id
      );

      if (matchingBattle) {
        // Join existing battle - backend handles coin deduction
        await joinBattle(matchingBattle);
      } else {
        // Create new battle - backend handles coin deduction
        await createBattle();
      }
    } catch (error) {
      console.error('Error finding match:', error);
      alert('Failed to find match. Please try again.');
      setIsSearching(false);
    }
  };

  const createBattle = async () => {
    try {
      setIsCreating(true);

      // Ensure wallet exists before verification
      if (!wallet) {
        alert('Wallet not initialized. Please refresh the page.');
        setIsSearching(false);
        return;
      }

      // Simple coin check
      if ((wallet.coins || 0) < selectedEntry.fee) {
        alert(`Insufficient coins! You have ${wallet.coins || 0} coins but need ${selectedEntry.fee} coins.`);
        setIsSearching(false);
        return;
      }

      const battleRequest = {
        difficulty: selectedDifficulty as 'easy' | 'medium' | 'hard',
        entryFee: selectedEntry.fee,
        userId: user!.id,
        userName: userprofile?.name || user!.email?.split('@')[0] || 'User',
        userAvatar: userprofile?.profilePic || '',
        rating: wallet?.rating || 1000
      };

      console.log('Creating battle with request:', battleRequest);
      const battleId = await joinOrCreateBattle(battleRequest);
      console.log('Battle created with ID:', battleId);
      // Backend handles coin deduction

      setMyBattleId(battleId);

    } catch (error: unknown) {
      console.error('Error creating battle:', error);
      alert(error instanceof Error ? error.message : 'Failed to create battle');
      setIsSearching(false);
    } finally {
      setIsCreating(false);
    }
  };

  const joinBattle = async (battle: WaitingBattle) => {
    try {
      // Ensure wallet exists before verification
      if (!wallet) {
        alert('Wallet not initialized. Please refresh the page.');
        setIsSearching(false);
        return;
      }

      // Simple coin check
      if ((wallet.coins || 0) < battle.entryFee) {
        alert(`Insufficient coins! You have ${wallet.coins || 0} coins but need ${battle.entryFee} coins.`);
        setIsSearching(false);
        return;
      }

      console.log('Joining battle:', battle.id);
      await apiRequest(`/battles/${battle.id}/join`, {
        method: 'POST',
        body: JSON.stringify({
          userId: user!.id,
          userName: userprofile?.name || user!.email?.split('@')[0] || 'User',
          userAvatar: userprofile?.profilePic || '',
          rating: wallet?.rating || 1000
        })
      });
      // Backend handles coin deduction

      // Navigate to battle room
      navigate(`/dashboard/codearena/battle/${battle.id}`);

    } catch (error: unknown) {
      console.error('Error joining battle:', error);
      alert(error instanceof Error ? error.message : 'Failed to join battle. Battle may have been taken by another player.');
      setIsSearching(false);
    }
  };

  const handleCancelSearch = async () => {
    if (myBattleId) {
      try {
        // Delete the battle document - backend handles refund automatically
        await apiRequest(`/battles/${myBattleId}`, { method: 'DELETE' });
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

  // Debug wallet state
  const walletCoins = wallet?.coins ?? 0;
  const hasEnoughCoins = walletCoins >= selectedEntry.fee;
  const isButtonDisabled = !wallet || !hasEnoughCoins || isSearching || isCreating;

  console.log('BattleLobby render:', { wallet, walletCoins, selectedEntry, hasEnoughCoins, isButtonDisabled });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
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
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 text-center"
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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
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
          whileHover={{ scale: !isButtonDisabled ? 1.02 : 1 }}
          whileTap={{ scale: !isButtonDisabled ? 0.98 : 1 }}
          onClick={handleFindMatch}
          disabled={isButtonDisabled}
          className={`w-full py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
            !isButtonDisabled
              ? 'bg-gradient-to-r from-[#00ADB5] via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 cursor-pointer'
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

        {!wallet && (
          <p className="text-center text-amber-500 text-xs mt-2">
            Loading wallet... Please wait
          </p>
        )}

        {wallet && !hasEnoughCoins && (
          <p className="text-center text-red-500 text-xs mt-2">
            Need {selectedEntry.fee - walletCoins} more coins (You have {walletCoins})
          </p>
        )}

        {wallet && hasEnoughCoins && (
          <p className="text-center text-green-500 text-xs mt-2">
            Ready to battle! ({walletCoins} coins available)
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
                        // Coins are deducted inside joinBattle after successful join
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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
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
