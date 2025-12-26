import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import Wallet from '../models/Wallet';
import User from '../models/User';

const router = express.Router();

// Get global leaderboard
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { period } = req.query;
    
    // Get all wallets with user info, sorted by coins
    let wallets = await Wallet.find()
      .sort({ coins: -1 })
      .limit(100)
      .lean();
    
    // For weekly/monthly, filter based on recent activity
    if (period === 'weekly' || period === 'monthly') {
      const now = new Date();
      const periodStart = period === 'weekly' 
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      // Filter wallets that have recent transactions
      wallets = wallets.filter(wallet => {
        if (!wallet.transactions || wallet.transactions.length === 0) return false;
        // Check if any transaction is within the period
        return wallet.transactions.some((tx: any) => 
          tx.createdAt && new Date(tx.createdAt) >= periodStart
        );
      });
      
      // Re-sort by coins earned in this period (calculate from transactions)
      wallets = wallets.map(wallet => {
        const periodCoins = (wallet.transactions || [])
          .filter((tx: any) => tx.createdAt && new Date(tx.createdAt) >= periodStart)
          .reduce((sum: number, tx: any) => {
            if (tx.type === 'credit') return sum + (tx.amount || 0);
            if (tx.type === 'debit') return sum - (tx.amount || 0);
            return sum;
          }, 0);
        return { ...wallet, periodCoins };
      }).sort((a, b) => b.periodCoins - a.periodCoins);
    }
    
    // Get user details for each wallet
    const leaderboardData = await Promise.all(
      wallets.map(async (wallet, index) => {
        const user = await User.findById(wallet.userId).select('name email').lean();
        
        // Skip users without a proper name
        if (!user?.name || user.name.trim() === '') {
          return null;
        }
        
        const userName = user.name;
        const problemsSolved = wallet.achievements?.problemsSolved || 0;
        const battlesWon = wallet.achievements?.battlesWon || 0;
        
        // Calculate level based on problems solved and battles won
        const level = Math.floor((problemsSolved + battlesWon * 2) / 5) + 1;
        
        // Calculate rating on 1-10 scale based on achievements
        // Base rating is 1, increases with problems solved and battles won
        const rawScore = (problemsSolved * 0.5) + (battlesWon * 1) + (wallet.coins / 100);
        const rating = Math.min(10, Math.max(1, Math.round(rawScore * 10) / 10 + 1)); // 1-10 scale with 1 decimal
        
        return {
          odId: wallet.userId.toString(),
          odName: userName,
          name: userName,
          email: user?.email || '',
          avatar: userName.charAt(0).toUpperCase(),
          coins: (wallet as any).periodCoins !== undefined ? (wallet as any).periodCoins : wallet.coins,
          totalCoins: wallet.coins,
          problemsSolved,
          battlesWon,
          currentStreak: wallet.achievements?.currentStreak || 0,
          level,
          rating
        };
      })
    );
    
    // Filter out null entries (users without proper names) and add ranks
    const leaderboard = leaderboardData
      .filter(entry => entry !== null)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user rank
router.get('/rank/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get user's wallet
    const userWallet = await Wallet.findOne({ userId }).lean();
    
    if (!userWallet) {
      return res.json({ rank: null });
    }
    
    // Count how many users have more coins
    const higherRanked = await Wallet.countDocuments({
      coins: { $gt: userWallet.coins }
    });
    
    res.json({ rank: higherRanked + 1 });
  } catch (error) {
    console.error('Error fetching rank:', error);
    res.status(500).json({ error: 'Failed to fetch rank' });
  }
});

export default router;
