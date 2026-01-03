import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Gift,
  History,
  Loader2,
  Plus,
  Trophy,
  Wallet,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { apiRequest } from '../../service/api';
import type { WalletData } from './types';

interface WalletPanelProps {
  onBack: () => void;
  onBalanceUpdate?: (balance: number) => void;
}

export default function WalletPanel({ onBack, onBalanceUpdate }: WalletPanelProps) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, [user?.id]);

  const fetchWallet = async () => {
    if (!user?.id) return;
    
    try {
      const response = await apiRequest(`/wallet/${user.id}`);
      setWallet({
        odId: user.id,
        coins: response.coins || 0,
        transactions: (response.transactions || []).map((t: any) => ({
          id: t._id || t.id || Math.random().toString(),
          type: t.type,
          amount: t.amount,
          reason: t.reason,
          createdAt: new Date(t.createdAt)
        })),
        achievements: {
          problemsSolved: response.achievements?.problemsSolved || 0,
          battlesWon: response.achievements?.battlesWon || 0,
          battlesPlayed: response.achievements?.battlesPlayed || 0
        }
      });
      onBalanceUpdate?.(response.coins || 0);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      // Initialize with defaults if wallet doesn't exist
      setWallet({
        odId: user.id,
        coins: 0,
        transactions: [],
        achievements: { problemsSolved: 0, battlesWon: 0, battlesPlayed: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDaily = async () => {
    if (claiming) return;
    
    setClaiming(true);
    try {
      const response = await apiRequest(`/wallet/${user?.id}/daily`, { method: 'POST' });
      if (response.success) {
        setShowClaimSuccess(true);
        await fetchWallet();
        setTimeout(() => setShowClaimSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('Failed to claim daily reward:', error);
    } finally {
      setClaiming(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onBack}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8" onClick={e => e.stopPropagation()}>
          <Loader2 className="w-8 h-8 animate-spin text-[#00ADB5]" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onBack}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-[#00ADB5]" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Wallet</h2>
            </div>
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#00ADB5] to-[#00d4ff] rounded-2xl p-6 text-white"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 mb-1">Available Balance</p>
            <div className="flex items-center gap-3">
              <Coins className="w-10 h-10" />
              <span className="text-4xl font-bold">{wallet?.coins || 0}</span>
            </div>
          </div>
          
          <button
            onClick={handleClaimDaily}
            disabled={claiming}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
          >
            {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
            Daily Reward
          </button>
        </div>

        {showClaimSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white/20 rounded-lg p-3 text-center"
          >
            🎉 You claimed your daily reward!
          </motion.div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{wallet?.achievements.battlesWon || 0}</p>
          <p className="text-xs text-gray-500">Battles Won</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <History className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{wallet?.achievements.battlesPlayed || 0}</p>
          <p className="text-xs text-gray-500">Battles Played</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <Plus className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{wallet?.achievements.problemsSolved || 0}</p>
          <p className="text-xs text-gray-500">Problems Solved</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-[#00ADB5]" />
          Transaction History
        </h3>

        {wallet?.transactions && wallet.transactions.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {wallet.transactions
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .slice(0, 20)
              .map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'credit'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {tx.type === 'credit' ? (
                        <ArrowDownRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.reason}</p>
                      <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Coins className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No transactions yet</p>
          </div>
        )}
      </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
