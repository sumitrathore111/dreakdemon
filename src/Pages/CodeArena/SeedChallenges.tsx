import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, CheckCircle, Loader2, Database, 
  AlertCircle, RefreshCw, Trash2
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc,
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../service/Firebase';
import { defaultChallenges } from '../../service/challenges';

const CHALLENGES_COLLECTION = 'CodeArena_Challenges';

const SeedChallenges = () => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [existingCount, setExistingCount] = useState<number | null>(null);

  const checkExistingChallenges = async () => {
    try {
      const snapshot = await getDocs(collection(db, CHALLENGES_COLLECTION));
      setExistingCount(snapshot.size);
      return snapshot.size;
    } catch (error) {
      console.error('Error checking challenges:', error);
      return 0;
    }
  };

  const seedChallenges = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const challengesRef = collection(db, CHALLENGES_COLLECTION);
      
      let added = 0;
      for (const challenge of defaultChallenges) {
        await addDoc(challengesRef, {
          ...challenge,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        added++;
      }
      
      setMessage({ 
        type: 'success', 
        text: `Successfully added ${added} challenges to Firebase!` 
      });
      await checkExistingChallenges();
    } catch (error: any) {
      console.error('Error seeding challenges:', error);
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.message || 'Failed to seed challenges'}` 
      });
    }

    setLoading(false);
  };

  const deleteAllChallenges = async () => {
    if (!confirm('Are you sure you want to delete ALL challenges? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const snapshot = await getDocs(collection(db, CHALLENGES_COLLECTION));
      
      let deleted = 0;
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, CHALLENGES_COLLECTION, docSnap.id));
        deleted++;
      }
      
      setMessage({ 
        type: 'info', 
        text: `Deleted ${deleted} challenges from Firebase.` 
      });
      setExistingCount(0);
    } catch (error: any) {
      console.error('Error deleting challenges:', error);
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.message || 'Failed to delete challenges'}` 
      });
    }

    setDeleting(false);
  };

  // Check on mount
  useEffect(() => {
    checkExistingChallenges();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CodeArena Seed Tool</h1>
          <p className="text-gray-500">Add sample challenges to your Firebase database</p>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Challenges to add:</span>
            <span className="font-semibold text-gray-900">{defaultChallenges.length}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-600">Existing in Firebase:</span>
            <span className="font-semibold text-gray-900">
              {existingCount !== null ? existingCount : (
                <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
              )}
            </span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : message.type === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : message.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${
              message.type === 'success' 
                ? 'text-green-700' 
                : message.type === 'error'
                ? 'text-red-700'
                : 'text-blue-700'
            }`}>
              {message.text}
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={seedChallenges}
            disabled={loading || deleting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {loading ? 'Adding Challenges...' : 'Seed Challenges'}
          </button>

          <button
            onClick={() => checkExistingChallenges()}
            disabled={loading || deleting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh Count
          </button>

          <button
            onClick={deleteAllChallenges}
            disabled={loading || deleting || existingCount === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-red-200"
          >
            {deleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
            {deleting ? 'Deleting...' : 'Delete All Challenges'}
          </button>
        </div>

        {/* Challenge Preview */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Challenges to be added:</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {defaultChallenges.map((challenge, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">{challenge.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  challenge.difficulty === 'easy' 
                    ? 'bg-green-100 text-green-700'
                    : challenge.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SeedChallenges;
