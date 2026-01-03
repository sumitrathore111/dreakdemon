import { AnimatePresence, motion } from 'framer-motion';
import {
  Code2,
  FolderOpen,
  Loader2,
  Search,
  ShoppingBag,
  User,
  X
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../service/api';

interface SearchResult {
  id: string;
  type: 'developer' | 'project' | 'challenge' | 'bazaar';
  title: string;
  subtitle?: string;
  avatar?: string;
  icon: React.ReactNode;
  route: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Load recent searches
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    try {
      // Search developers
      const developers = await apiRequest('/developers');
      (developers || []).forEach((dev: any) => {
        if (
          dev.name?.toLowerCase().includes(lowerQuery) ||
          dev.skills?.some((s: string) => s.toLowerCase().includes(lowerQuery))
        ) {
          searchResults.push({
            id: dev._id || dev.id,
            type: 'developer',
            title: dev.name,
            subtitle: dev.skills?.slice(0, 3).join(', '),
            avatar: dev.avatar,
            icon: <User className="w-5 h-5 text-blue-500" />,
            route: `/dashboard/courses?chat=${dev._id || dev.id}`
          });
        }
      });

      // Search projects/ideas
      const ideas = await apiRequest('/ideas');
      (ideas || []).forEach((idea: any) => {
        if (
          idea.title?.toLowerCase().includes(lowerQuery) ||
          idea.description?.toLowerCase().includes(lowerQuery) ||
          idea.techStack?.some((t: string) => t.toLowerCase().includes(lowerQuery))
        ) {
          searchResults.push({
            id: idea._id || idea.id,
            type: 'project',
            title: idea.title,
            subtitle: idea.techStack?.slice(0, 3).join(', '),
            icon: <FolderOpen className="w-5 h-5 text-green-500" />,
            route: `/dashboard/projects?project=${idea._id || idea.id}`
          });
        }
      });

      // Search challenges
      try {
        const response = await fetch('/questions.json');
        const challenges = await response.json();
        (challenges || []).forEach((challenge: any) => {
          if (
            challenge.title?.toLowerCase().includes(lowerQuery) ||
            challenge.category?.toLowerCase().includes(lowerQuery)
          ) {
            searchResults.push({
              id: challenge.id,
              type: 'challenge',
              title: challenge.title,
              subtitle: `${challenge.difficulty} • ${challenge.category}`,
              icon: <Code2 className="w-5 h-5 text-orange-500" />,
              route: `/dashboard/arena?challenge=${challenge.id}`
            });
          }
        });
      } catch (e) { /* ignore */ }

      // Search marketplace listings
      try {
        const listings = await apiRequest('/marketplace/listings');
        (listings || []).forEach((listing: any) => {
          if (
            listing.title?.toLowerCase().includes(lowerQuery) ||
            listing.description?.toLowerCase().includes(lowerQuery) ||
            listing.technologies?.some((t: string) => t.toLowerCase().includes(lowerQuery))
          ) {
            searchResults.push({
              id: listing._id || listing.id,
              type: 'bazaar',
              title: listing.title,
              subtitle: `$${listing.price} • ${listing.technologies?.slice(0, 2).join(', ')}`,
              icon: <ShoppingBag className="w-5 h-5 text-purple-500" />,
              route: `/dashboard/bazaar?listing=${listing._id || listing.id}`
            });
          }
        });
      } catch (e) { /* ignore */ }

      // Limit results
      setResults(searchResults.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const updated = [result.title, ...recentSearches.filter((s) => s !== result.title)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate
    onClose();
    navigate(result.route);
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
    performSearch(search);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-2xl"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search developers, projects, challenges, marketplace..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-lg"
                />
                {loading ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {/* No Query - Show Recent Searches */}
                {!query && recentSearches.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2 px-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Recent Searches
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentClick(search)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}

                {/* No Query - Show Quick Links */}
                {!query && recentSearches.length === 0 && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Search across the entire platform</p>
                    <p className="text-xs mt-1">Try "React developer" or "e-commerce"</p>
                  </div>
                )}

                {/* Loading */}
                {query && loading && (
                  <div className="p-4 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </div>
                )}

                {/* Results List */}
                {query && !loading && results.length > 0 && (
                  <div className="p-2">
                    {results.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          index === selectedIndex
                            ? 'bg-[#00ADB5]/10'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {/* Icon or Avatar */}
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          {result.avatar ? (
                            <img
                              src={result.avatar}
                              alt={result.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            result.icon
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {result.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Type Badge */}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            result.type === 'developer'
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                              : result.type === 'project'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : result.type === 'challenge'
                              ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}
                        >
                          {result.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {query && !loading && results.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No results found for "{query}"
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↵</kbd>
                    select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to manage global search state
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    openSearch: () => setIsOpen(true),
    closeSearch: () => setIsOpen(false)
  };
}
