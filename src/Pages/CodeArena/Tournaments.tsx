import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  Users,
  Calendar,
  Coins,
  ChevronLeft,
  Loader2,
  Star
} from 'lucide-react';
import { useDataContext } from '../../Context/UserDataContext';

export default function Tournaments() {
  const navigate = useNavigate();
  const { fetchActiveTournaments } = useDataContext();

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setLoading(true);
    try {
      const data = await fetchActiveTournaments();
      setTournaments(data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
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
                  <Crown className="w-6 h-6 text-purple-500" />
                  Tournaments
                </h1>
                <p className="text-gray-600 text-sm">
                  Compete for glory and massive prizes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'ongoing'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'completed'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Tournament Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200 shadow-lg">
            <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Tournaments Available</h3>
            <p className="text-gray-600">Check back soon for upcoming tournaments!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((tournament) => (
              <motion.div
                key={tournament.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl overflow-hidden border-2 border-purple-200 shadow-lg cursor-pointer hover:border-purple-400 transition-all"
                onClick={() => navigate(`/dashboard/codearena/tournament/${tournament.id}`)}
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <Crown className="w-8 h-8" />
                    <span className="px-3 py-1 bg-white text-purple-600 rounded-full text-xs font-bold">
                      {tournament.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tournament.title}</h3>
                  <p className="text-purple-100 text-sm">{tournament.description}</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Prize Pool</p>
                      <p className="font-bold text-yellow-600 flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        {tournament.prizePool?.first || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Participants</p>
                      <p className="font-bold text-gray-800 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {tournament.currentParticipants || 0}/{tournament.maxParticipants}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tournament.startDate?.toDate?.() || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{tournament.rounds || 3} Rounds</span>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg transition-all">
                    {tournament.status === 'registration' ? 'Register Now' : 'View Details'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
