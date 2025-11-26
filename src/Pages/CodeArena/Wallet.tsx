import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Coins,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Wallet as WalletIcon,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';

export default function Wallet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserWallet, subscribeToWallet, fetchUserTransactions } = useDataContext();

  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'spent'>('all');

  useEffect(() => {
    if (user) {
      loadWalletData();
      
      // Subscribe to real-time wallet updates
      const unsubscribe = subscribeToWallet(user.uid, (walletData) => {
        if (walletData) {
          setWallet(walletData);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [walletData, txData] = await Promise.all([
        getUserWallet(user.uid),
        fetchUserTransactions(user.uid)
      ]);
      
      setWallet(walletData);
      setTransactions(txData);
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'earned') return tx.type === 'credit';
    if (filter === 'spent') return tx.type === 'debit';
    return true;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 text-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard/codearena')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Wallet</h1>
                <p className="text-gray-600 text-sm">Manage your CodeArena coins</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-8 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 mb-2">Total Balance</p>
              <div className="flex items-center gap-3">
                <Coins className="w-10 h-10 text-white" />
                <h2 className="text-5xl font-black text-white">
                  {wallet?.balance?.toLocaleString() || 0}
                </h2>
                <span className="text-2xl text-yellow-100">coins</span>
              </div>
            </div>
            <WalletIcon className="w-24 h-24 text-white/20" />
          </div>

          <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-3 gap-4">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Total Earned</p>
              <p className="text-xl font-bold text-white">
                {wallet?.totalEarned?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-yellow-100 text-sm mb-1">Total Spent</p>
              <p className="text-xl font-bold text-white">
                {wallet?.totalSpent?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-yellow-100 text-sm mb-1">Rank</p>
              <p className="text-xl font-bold text-white">
                #{wallet?.rank || 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-gray-400 text-sm font-medium">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('earned')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'earned'
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Earned
          </button>
          <button
            onClick={() => setFilter('spent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'spent'
                ? 'bg-red-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Spent
          </button>
        </div>

        {/* Transactions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-lg font-bold">Transaction History</h3>
            <p className="text-gray-400 text-sm mt-1">
              {filteredTransactions.length} transactions
            </p>
          </div>

          <div className="divide-y divide-gray-800">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <WalletIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No transactions yet</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        tx.type === 'credit'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.type === 'credit' ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-white">
                          {tx.description || 'Transaction'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <p className="text-xs text-gray-400">
                            {formatDate(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        tx.type === 'credit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Balance: {tx.balanceAfter?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
