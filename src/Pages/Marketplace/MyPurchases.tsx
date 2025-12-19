import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink, Github, FileText, Calendar } from 'lucide-react';
import type { MarketplacePurchase } from '../../types/marketplace';
import { getUserPurchases } from '../../service/marketplaceService';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'react-hot-toast';

export default function MyPurchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<MarketplacePurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadPurchases();
    }
  }, [user]);

  const loadPurchases = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const data = await getUserPurchases(user.uid);
      setPurchases(data);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = purchases.reduce((sum, p) => sum + p.price, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading your purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent mb-2">
            My Purchases
          </h1>
          <p className="text-gray-600">
            Access all your purchased projects
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {purchases.length}
                </p>
                <p className="text-sm text-gray-600">Total Purchases</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalSpent}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <div className="p-4 bg-teal-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-teal-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No purchases yet
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Start building your project collection today!
            </p>
            <Link
              to="/dashboard/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-semibold shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {purchases.map((purchase, index) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-6">
                  {/* Image */}
                  <Link to={`/dashboard/marketplace/project/${purchase.projectId}`}>
                    {purchase.projectImages && purchase.projectImages.length > 0 ? (
                      <img
                        src={purchase.projectImages[0]}
                        alt={purchase.projectTitle}
                        className="w-48 h-32 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-48 h-32 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center text-white text-4xl font-bold shadow-sm">
                        {purchase.projectTitle.charAt(0)}
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1">
                    <Link
                      to={`/dashboard/marketplace/project/${purchase.projectId}`}
                      className="text-2xl font-bold text-gray-900 hover:text-teal-500 transition-colors mb-2 block"
                    >
                      {purchase.projectTitle}
                    </Link>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Purchased on{' '}
                          {new Date(purchase.purchasedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-teal-100 text-teal-600 rounded-full font-semibold">
                        {purchase.price === 0 ? 'FREE' : `$${purchase.price}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <span>Seller:</span>
                      <span className="font-semibold text-gray-900">
                        {purchase.sellerName}
                      </span>
                    </div>

                    {/* Access Links */}
                    {purchase.accessLinks && (
                      <div className="flex flex-wrap gap-3">
                        {purchase.accessLinks.github && (
                          <a
                            href={purchase.accessLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
                          >
                            <Github className="w-4 h-4" />
                            GitHub
                          </a>
                        )}
                        {purchase.accessLinks.liveDemo && (
                          <a
                            href={purchase.accessLinks.liveDemo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Live Demo
                          </a>
                        )}
                        {purchase.accessLinks.documentation && (
                          <a
                            href={purchase.accessLinks.documentation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Docs
                          </a>
                        )}
                        <Link
                          to={`/dashboard/marketplace/project/${purchase.projectId}`}
                          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium shadow-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back to Marketplace */}
        <div className="mt-8 text-center">
          <Link
            to="/dashboard/marketplace"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-semibold text-lg shadow-lg"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse More Projects
          </Link>
        </div>
      </div>
    </div>
  );
}


