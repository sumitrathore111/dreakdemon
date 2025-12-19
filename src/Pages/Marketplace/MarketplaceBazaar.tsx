import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    ShoppingBag,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects } from '../../service/marketplaceService';
import type { MarketplaceProject } from '../../types/marketplace';
import { CATEGORY_LABELS } from '../../types/marketplace';
import ProjectCard from './components/ProjectCard';

export default function MarketplaceBazaar() {
  const [projects, setProjects] = useState<MarketplaceProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<MarketplaceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, searchQuery, selectedCategory, sortBy]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      // Set empty array so the UI still renders
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.techStack.some((tech) => tech.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.purchases - a.purchases);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredProjects(filtered);
  };

  const stats = {
    totalProjects: projects.length,
    totalSales: projects.reduce((sum, p) => sum + p.purchases, 0),
    avgRating: projects.length > 0
      ? projects.reduce((sum, p) => sum + p.rating, 0) / projects.length
      : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent mb-2">
                Project Bazaar 🛒
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Buy and sell amazing projects from talented developers
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard/marketplace/my-purchases"
                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-teal-500 text-teal-500 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors flex items-center gap-2 font-semibold"
              >
                <ShoppingBag className="w-5 h-5" />
                My Purchases
              </Link>
              <Link
                to="/dashboard/marketplace/my-listings"
                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-teal-500 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors flex items-center gap-2 font-semibold"
              >
                <TrendingUp className="w-5 h-5" />
                My Listings
              </Link>
              <Link
                to="/dashboard/marketplace/create"
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all flex items-center gap-2 font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Sell Project
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalProjects}
                  </p>
                  <p className="text-sm text-gray-600">Projects Listed</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalSales}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.avgRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, tech stack..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-gray-600 transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading amazing projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 bg-teal-100 dark:bg-teal-900/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-teal-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              No projects match your search criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


