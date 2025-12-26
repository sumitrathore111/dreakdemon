import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import Wallet from '../models/Wallet';
import User from '../models/User';

const router = express.Router();

// Get global leaderboard
router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    // Get all wallets with user info, sorted by coins
    const wallets = await Wallet.find()
      .sort({ coins: -1 })
      .limit(100)
      .lean();
    
    // Get user details for each wallet
    const leaderboard = await Promise.all(
      wallets.map(async (wallet, index) => {
        const user = await User.findById(wallet.userId).select('name email').lean();
        const userName = user?.name || 'Anonymous';
        const problemsSolved = wallet.achievements?.problemsSolved || 0;
        const battlesWon = wallet.achievements?.battlesWon || 0;
        
        // Calculate level based on problems solved and battles won
        const level = Math.floor((problemsSolved + battlesWon * 2) / 5) + 1;
        
        // Calculate rating based on coins and achievements
        const rating = wallet.coins + (problemsSolved * 10) + (battlesWon * 25);
        
        return {
          rank: index + 1,
          odId: wallet.userId.toString(),
          odName: userName,
          name: userName,
          email: user?.email || '',
          avatar: userName.charAt(0).toUpperCase(),
          coins: wallet.coins,
          problemsSolved,
          battlesWon,
          currentStreak: wallet.achievements?.currentStreak || 0,
          level,
          rating
        };
      })
    );
    
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
