import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Swords,
  Trophy,
  Users,
  Clock,
  ChevronLeft,
  Plus,
  Loader2
} from 'lucide-react';
import { useDataContext } from '../../Context/UserDataContext';

export default function Battles() {
  const navigate = useNavigate();
  const { fetchActiveBattles } = useDataContext();

  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'my-battles' | 'completed'>('active');

  useEffect(() => {
    loadBattles();
  }, []);

  const loadBattles = async () => {
    setLoading(true);
    try {
      const data = await fetchActiveBattles();
      setBattles(data);
    } catch (error) {
      console.error('Error loading battles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard/codearena')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Swords className="w-6 h-6 text-red-500" />
                  Battle Arena
                </h1>
                <p className="text-gray-600 text-sm">
                  Compete in real-time 1v1 coding battles
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/codearena/battles/create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Battle
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'active'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Active Battles
          </button>
          <button
            onClick={() => setActiveTab('my-battles')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'my-battles'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            My Battles
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'completed'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Battle Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : battles.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200 shadow-lg">
            <Swords className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Battles</h3>
            <p className="text-gray-600 mb-6">Be the first to create a coding battle!</p>
            <button
              onClick={() => navigate('/dashboard/codearena/battles/create')}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              Create Your First Battle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {battles.map((battle) => (
              <motion.div
                key={battle.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-6 border-2 border-red-200 shadow-lg cursor-pointer hover:border-red-400 transition-all"
                onClick={() => navigate(`/dashboard/codearena/battle/${battle.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                    {battle.status}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-bold">{battle.prizePool} coins</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">1v1 Coding Battle</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Challenge: {battle.challengeTitle || 'Random Problem'}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{battle.currentParticipants}/{battle.maxParticipants}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{battle.duration}m</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
