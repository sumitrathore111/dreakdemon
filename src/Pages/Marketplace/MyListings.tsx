import { motion } from 'framer-motion';
import { DollarSign, Eye, Package, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { deleteProject, getSellerProjects, getSellerSales } from '../../service/marketplaceService';
import type { MarketplaceProject, MarketplacePurchase } from '../../types/marketplace';

export default function MyListings() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<MarketplaceProject[]>([]);
  const [sales, setSales] = useState<MarketplacePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'sales'>('projects');

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const [projectsData, salesData] = await Promise.all([
        getSellerProjects(user.uid),
        getSellerSales(user.uid),
      ]);
      setProjects(projectsData);
      setSales(salesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const stats = {
    totalProjects: projects.length,
    totalViews: projects.reduce((sum, p) => sum + p.views, 0),
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + s.price, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent mb-2">
              My Listings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your projects and track sales
            </p>
          </div>
          <Link
            to="/dashboard/marketplace/create"
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-600 transition-all flex items-center gap-2 font-semibold w-fit shadow-lg shadow-teal-200 dark:shadow-teal-900/30"
          >
            <Plus className="w-5 h-5" />
            New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 shadow-lg shadow-teal-200 dark:shadow-teal-900/30 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalProjects}
                </p>
                <p className="text-sm text-teal-100">Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalViews}
                </p>
                <p className="text-sm text-emerald-100">Total Views</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 shadow-lg shadow-violet-200 dark:shadow-violet-900/30 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalSales}
                </p>
                <p className="text-sm text-violet-100">Sales</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 shadow-lg shadow-amber-200 dark:shadow-amber-900/30 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${stats.totalRevenue}
                </p>
                <p className="text-sm text-amber-100">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-4 px-4 font-semibold transition-colors relative ${
              activeTab === 'projects'
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            My Projects
            {activeTab === 'projects' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-4 px-4 font-semibold transition-colors relative ${
              activeTab === 'sales'
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Sales History
            {activeTab === 'sales' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"
              />
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'projects' ? (
          projects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                You haven't listed any projects yet
              </p>
              <Link
                to="/dashboard/marketplace/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-600 transition-colors font-semibold shadow-lg shadow-teal-200 dark:shadow-teal-900/30"
              >
                <Plus className="w-5 h-5" />
                Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-700 transition-all"
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <Link to={`/dashboard/marketplace/project/${project.id}`}>
                      {project.images && project.images.length > 0 ? (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-40 h-28 object-cover rounded-lg ring-2 ring-gray-100 dark:ring-gray-700"
                        />
                      ) : (
                        <div className="w-40 h-28 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                          {project.title.charAt(0)}
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1">
                      <Link
                        to={`/dashboard/marketplace/project/${project.id}`}
                        className="text-xl font-bold text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-2 block"
                      >
                        {project.title}
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-emerald-500" />
                          <span>{project.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4 text-violet-500" />
                          <span>{project.purchases} sales</span>
                        </div>
                        <span className="px-3 py-1 bg-gradient-to-r from-teal-100 to-teal-100 dark:from-teal-900/30 dark:to-teal-900/30 text-sky-700 dark:text-teal-400 rounded-full font-semibold">
                          {project.isFree ? 'FREE' : `$${project.price}`}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full font-semibold ${
                            project.status === 'published'
                              ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/dashboard/marketplace/project/${project.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-600 transition-colors text-center flex items-center gap-2 shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-colors flex items-center gap-2 shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          // Sales History
          sales.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No sales yet. Keep promoting your projects!
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buyer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {sale.projectTitle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {sale.buyerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            ${sale.price}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {new Date(sale.purchasedAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}



