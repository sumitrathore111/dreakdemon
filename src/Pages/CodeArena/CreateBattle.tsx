import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Swords,
  ChevronLeft,
  Clock,
  Users,
  Trophy,
  Coins,
  Zap
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';

export default function CreateBattle() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBattle } = useDataContext();

  const [battleType, setBattleType] = useState<'public' | 'private'>('public');
  const [duration, setDuration] = useState(30);
  const [entryFee, setEntryFee] = useState(100);
  const [difficulty, setDifficulty] = useState('Medium');
  const [creating, setCreating] = useState(false);

  const handleCreateBattle = async () => {
    if (!user) return;

    setCreating(true);
    try {
      // For now, use a random challenge ID or first available challenge
      const challengeId = 'default-challenge-' + Date.now();
      
      await createBattle(challengeId, entryFee, duration);
      navigate(`/dashboard/codearena/battles`);
    } catch (error) {
      console.error('Error creating battle:', error);
      alert('Failed to create battle. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/codearena/battles')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Swords className="w-6 h-6 text-red-500" />
                Create Battle
              </h1>
              <p className="text-gray-600 text-sm">
                Set up a 1v1 coding battle
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-8 border-2 border-gray-200 shadow-lg">
          {/* Battle Type */}
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-3">Battle Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setBattleType('public')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  battleType === 'public'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="font-semibold text-gray-800">Public</p>
                <p className="text-xs text-gray-600">Anyone can join</p>
              </button>
              <button
                onClick={() => setBattleType('private')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  battleType === 'private'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Zap className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="font-semibold text-gray-800">Private</p>
                <p className="text-xs text-gray-600">Invite only</p>
              </button>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-3">
              <Clock className="w-4 h-4 inline mr-2" />
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="15"
              max="120"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Entry Fee */}
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-3">
              <Coins className="w-4 h-4 inline mr-2" />
              Entry Fee (coins)
            </label>
            <input
              type="number"
              value={entryFee}
              onChange={(e) => setEntryFee(Number(e.target.value))}
              min="0"
              step="50"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-sm text-gray-600 mt-2">
              Winner receives: <span className="font-bold text-green-600">{entryFee * 2 * 0.9} coins</span>
              <span className="text-xs text-gray-500"> (10% platform fee)</span>
            </p>
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-3">Difficulty Level</label>
            <div className="flex gap-3">
              {['Easy', 'Medium', 'Hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    difficulty === level
                      ? level === 'Easy'
                        ? 'bg-green-500 text-white'
                        : level === 'Medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Prize Pool Preview */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6 mb-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1">Total Prize Pool</p>
                <p className="text-3xl font-black text-gray-800 flex items-center gap-2">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  {entryFee * 2 * 0.9}
                  <span className="text-lg text-gray-600">coins</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-700">Entry Fee</p>
                <p className="text-xl font-bold text-gray-800">{entryFee} coins</p>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateBattle}
            disabled={creating}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-black text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating Battle...' : 'Create Battle'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
