import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins, Swords, Trophy, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { db } from '../../service/Firebase';

interface RematchRequest {
  battleId: string;
  challengerName: string;
  challengerAvatar: string;
  challengerRating: number;
  difficulty: string;
  entryFee: number;
  prize: number;
}

interface Wallet {
  coins: number;
  rating?: number;
}

// Store rejected rematch IDs in localStorage to persist across page navigation
const getRejectedRematches = (): string[] => {
  try {
    const stored = localStorage.getItem('rejectedRematches');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addRejectedRematch = (battleId: string) => {
  const rejected = getRejectedRematches();
  if (!rejected.includes(battleId)) {
    rejected.push(battleId);
    localStorage.setItem('rejectedRematches', JSON.stringify(rejected));
  }
};

const RematchNotification = () => {
  const { user } = useAuth();
  const { userprofile, deductCoins, subscribeToWallet } = useDataContext();
  const navigate = useNavigate();

  const [incomingRematch, setIncomingRematch] = useState<RematchRequest | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [showFullModal, setShowFullModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Subscribe to wallet updates
  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = subscribeToWallet(user.uid, (walletData: Wallet | null) => {
      setWallet(walletData);
    });
    
    return () => unsubscribe();
  }, [user?.uid, subscribeToWallet]);

  // Listen for incoming rematch requests targeting current user
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'CodeArena_Battles'),
      where('status', '==', 'waiting'),
      where('isRematch', '==', true),
      where('targetOpponent', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rejectedIds = getRejectedRematches();

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const battleId = docSnap.id;

        // Skip if already rejected or if it's from ourselves
        if (rejectedIds.includes(battleId) || data.createdBy === user.uid) {
          continue;
        }

        // Get challenger info from participants
        const challenger = data.participants?.[0];
        if (!challenger) continue;

        setIncomingRematch({
          battleId,
          challengerName: challenger.odName || 'Unknown',
          challengerAvatar: challenger.odProfilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.createdBy}`,
          challengerRating: challenger.rating || 1000,
          difficulty: data.difficulty,
          entryFee: data.entryFee,
          prize: data.prize
        });
        setShowToast(true);
        return; // Only show one rematch at a time
      }

      // No valid rematch found
      setIncomingRematch(null);
      setShowToast(false);
      setShowFullModal(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Auto-hide toast after 10 seconds
  useEffect(() => {
    if (!showToast || showFullModal) return;

    const timer = setTimeout(() => {
      setShowToast(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [showToast, showFullModal, incomingRematch?.battleId]);

  const handleAccept = useCallback(async () => {
    if (!incomingRematch || !user?.uid || isAccepting) return;

    const { battleId, entryFee } = incomingRematch;

    // Check wallet balance
    if (!wallet || wallet.coins < entryFee) {
      alert(`Insufficient coins! You need ${entryFee} coins to accept this rematch.`);
      return;
    }

    setIsAccepting(true);

    try {
      // Deduct entry fee from accepter's wallet
      await deductCoins(user.uid, entryFee, 'Rematch entry fee');

      // Join the battle - read current data first
      const battleRef = doc(db, 'CodeArena_Battles', battleId);
      const battleDoc = await getDoc(battleRef);
      
      if (battleDoc.exists()) {
        const battleData = battleDoc.data();
        const existingParticipants = battleData.participants || [];
        
        await updateDoc(battleRef, {
          status: 'countdown',
          participants: [
            existingParticipants[0], // Keep creator
            {
              odId: user.uid,
              odName: userprofile?.name || user.email?.split('@')[0] || 'User',
              odProfilePic: userprofile?.profilePic || '',
              rating: wallet?.rating || 1000,
              hasSubmitted: false
            }
          ],
          matchedAt: Timestamp.now()
        });
      }

      setIncomingRematch(null);
      setShowToast(false);
      setShowFullModal(false);
      navigate(`/dashboard/codearena/battle/${battleId}`);
    } catch (error) {
      console.error('Error accepting rematch:', error);
      alert('Failed to accept rematch. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  }, [incomingRematch, user, wallet, userprofile, deductCoins, navigate, isAccepting]);

  const handleDecline = useCallback(async () => {
    if (!incomingRematch) return;

    const { battleId } = incomingRematch;

    // Mark as rejected locally so it won't show again
    addRejectedRematch(battleId);

    // Optionally update the battle status to rejected
    try {
      const battleRef = doc(db, 'CodeArena_Battles', battleId);
      await updateDoc(battleRef, {
        status: 'rejected',
        rejectedAt: Timestamp.now(),
        rejectedBy: user?.uid
      });
    } catch (error) {
      console.error('Error rejecting rematch:', error);
    }

    setIncomingRematch(null);
    setShowToast(false);
    setShowFullModal(false);
  }, [incomingRematch, user?.uid]);

  const handleToastClick = () => {
    setShowToast(false);
    setShowFullModal(true);
  };

  const handleToastClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowToast(false);
  };

  // Don't render if no user or no incoming rematch
  if (!user || !incomingRematch) return null;

  return (
    <>
      {/* Small Toast Notification - Top Right */}
      <AnimatePresence>
        {showToast && !showFullModal && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            onClick={handleToastClick}
            className="fixed top-4 right-4 z-[9999] cursor-pointer"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 shadow-2xl shadow-orange-500/30 max-w-sm border border-orange-400/30">
              {/* Close button */}
              <button
                onClick={handleToastClose}
                className="absolute -top-2 -right-2 p-1 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors shadow-lg"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-3">
                {/* Animated Swords Icon */}
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  className="p-2 bg-white/20 rounded-lg flex-shrink-0"
                >
                  <Swords className="w-6 h-6 text-white" />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">⚔️ Rematch Challenge!</p>
                  <p className="text-orange-100 text-xs truncate">
                    {incomingRematch.challengerName} wants a rematch
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-orange-200 flex items-center gap-1">
                      <Coins className="w-3 h-3" /> {incomingRematch.entryFee}
                    </span>
                    <span className="text-xs text-orange-200">•</span>
                    <span className="text-xs text-orange-200 capitalize">{incomingRematch.difficulty}</span>
                  </div>
                </div>

                {/* Avatar */}
                <img
                  src={incomingRematch.challengerAvatar}
                  alt={incomingRematch.challengerName}
                  className="w-10 h-10 rounded-full border-2 border-white/30 flex-shrink-0"
                />
              </div>

              {/* Progress bar for auto-dismiss */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 10, ease: 'linear' }}
                className="h-1 bg-white/40 rounded-full mt-3"
              />
              
              <p className="text-orange-100 text-xs text-center mt-2">Click to view details</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Modal */}
      <AnimatePresence>
        {showFullModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

              {/* Close button */}
              <button
                onClick={handleDecline}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <div className="text-center mb-6 relative">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="inline-block"
                >
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl inline-block mb-4 shadow-lg">
                    <Swords className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900">⚔️ Rematch Challenge!</h3>
                <p className="text-gray-600 mt-2">Someone wants a rematch with you</p>
              </div>

              {/* Challenger Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-6">
                <img
                  src={incomingRematch.challengerAvatar}
                  alt={incomingRematch.challengerName}
                  className="w-16 h-16 rounded-full border-3 border-blue-500 shadow-md"
                />
                <div>
                  <p className="font-bold text-lg text-gray-900">{incomingRematch.challengerName}</p>
                  <p className="text-gray-600 text-sm">
                    Rating: <span className="font-semibold text-blue-600">{incomingRematch.challengerRating}</span>
                  </p>
                  <p className="text-gray-500 text-sm capitalize">
                    Difficulty: <span className={`font-semibold ${
                      incomingRematch.difficulty === 'easy' ? 'text-green-600' :
                      incomingRematch.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>{incomingRematch.difficulty}</span>
                  </p>
                </div>
              </div>

              {/* Entry Fee & Prize */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-amber-50 rounded-xl text-center">
                  <Coins className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-xs text-amber-600 font-medium">Entry Fee</p>
                  <p className="text-xl font-bold text-amber-700">{incomingRematch.entryFee}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <Trophy className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-green-600 font-medium">Prize Pool</p>
                  <p className="text-xl font-bold text-green-700">{incomingRematch.prize}</p>
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg mb-6">
                <Coins className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">
                  Your Balance: <span className="font-bold">{wallet?.coins || 0} coins</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDecline}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Decline
                </motion.button>
                <motion.button
                  whileHover={{ scale: wallet && wallet.coins >= incomingRematch.entryFee ? 1.02 : 1 }}
                  whileTap={{ scale: wallet && wallet.coins >= incomingRematch.entryFee ? 0.98 : 1 }}
                  onClick={handleAccept}
                  disabled={isAccepting || !wallet || wallet.coins < incomingRematch.entryFee}
                  className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    wallet && wallet.coins >= incomingRematch.entryFee
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isAccepting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Swords className="w-5 h-5" />
                      Accept ({incomingRematch.entryFee} coins)
                    </>
                  )}
                </motion.button>
              </div>

              {wallet && wallet.coins < incomingRematch.entryFee && (
                <p className="text-center text-red-500 text-sm mt-3">
                  Insufficient coins. You need {incomingRematch.entryFee - wallet.coins} more coins.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RematchNotification;
