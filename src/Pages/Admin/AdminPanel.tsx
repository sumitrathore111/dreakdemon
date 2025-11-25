import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Clock, Users, FolderOpen, 
  Lightbulb, TrendingUp, Mail, Shield, Eye, Search,
  Calendar, User, MessageSquare
} from 'lucide-react';

interface SubmittedIdea {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  category: string;
  expectedTimeline: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  feedback?: string;
}

interface PlatformStats {
  totalUsers: number;
  totalIdeas: number;
  pendingIdeas: number;
  approvedIdeas: number;
  rejectedIdeas: number;
  activeProjects: number;
  totalContributors: number;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { fetchAllIdeas, updateIdeaStatus } = useDataContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'ideas' | 'projects' | 'users'>('overview');
  const [ideas, setIdeas] = useState<SubmittedIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<SubmittedIdea[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedIdea, setSelectedIdea] = useState<SubmittedIdea | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalIdeas: 0,
    pendingIdeas: 0,
    approvedIdeas: 0,
    rejectedIdeas: 0,
    activeProjects: 0,
    totalContributors: 0
  });

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // TODO: Check if user has admin role in Firebase
    // For now, allow all logged-in users (change this in production)
    loadIdeas();
    loadStats();
  }, [user, navigate]);

  const loadIdeas = async () => {
    try {
      const allIdeas = await fetchAllIdeas();
      setIdeas(allIdeas);
      setFilteredIdeas(allIdeas);
    } catch (error) {
      console.error('Error loading ideas:', error);
    }
  };

  const loadStats = () => {
    // Calculate from actual ideas data
    const pending = ideas.filter(i => i.status === 'pending').length;
    const approved = ideas.filter(i => i.status === 'approved').length;
    const rejected = ideas.filter(i => i.status === 'rejected').length;
    
    setStats({
      totalUsers: 1248,
      totalIdeas: ideas.length,
      pendingIdeas: pending,
      approvedIdeas: approved,
      rejectedIdeas: rejected,
      activeProjects: approved,
      totalContributors: 156
    });
  };

  useEffect(() => {
    loadStats();
  }, [ideas]);

  useEffect(() => {
    let filtered = ideas;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(idea => idea.status === statusFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredIdeas(filtered);
  }, [ideas, statusFilter, searchQuery]);

  const approveIdea = async (ideaId: string) => {
    if (!reviewFeedback.trim()) {
      alert('Please provide feedback before approving');
      return;
    }

    try {
      await updateIdeaStatus(ideaId, 'approved', reviewFeedback, user?.email || 'Admin');
      
      // Update local state
      setIdeas(ideas.map(idea => 
        idea.id === ideaId 
          ? { 
              ...idea, 
              status: 'approved', 
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.email || 'Admin',
              feedback: reviewFeedback
            }
          : idea
      ));
      
      alert(`Idea approved! Email notification sent to ${selectedIdea?.userEmail}`);
      setSelectedIdea(null);
      setReviewFeedback('');
    } catch (error) {
      console.error('Error approving idea:', error);
      alert('Failed to approve idea. Please try again.');
    }
  };

  const rejectIdea = async (ideaId: string) => {
    if (!reviewFeedback.trim()) {
      alert('Please provide feedback before rejecting');
      return;
    }

    try {
      await updateIdeaStatus(ideaId, 'rejected', reviewFeedback, user?.email || 'Admin');
      
      // Update local state
      setIdeas(ideas.map(idea => 
        idea.id === ideaId 
          ? { 
              ...idea, 
              status: 'rejected', 
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.email || 'Admin',
              feedback: reviewFeedback
            }
          : idea
      ));
      
      alert(`Idea rejected. Email notification sent to ${selectedIdea?.userEmail}`);
      setSelectedIdea(null);
      setReviewFeedback('');
    } catch (error) {
      console.error('Error rejecting idea:', error);
      alert('Failed to reject idea. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-[#00ADB5]" />
            <h1 className="text-4xl font-black text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600">Manage ideas, projects, and users</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-lg mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'ideas'
                ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Ideas
              {stats.pendingIdeas > 0 && (
                <span className="bg-white text-[#00ADB5] px-2 py-1 rounded-full text-xs font-bold">
                  {stats.pendingIdeas}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Projects
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Users
            </div>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-12 h-12 text-blue-500" />
                <span className="text-3xl font-black text-gray-900">{stats.totalUsers}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Total Users</h3>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Lightbulb className="w-12 h-12 text-yellow-500" />
                <span className="text-3xl font-black text-gray-900">{stats.totalIdeas}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Total Ideas</h3>
              <div className="mt-2 text-xs text-gray-500">
                {stats.pendingIdeas} pending • {stats.approvedIdeas} approved
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <FolderOpen className="w-12 h-12 text-[#00ADB5]" />
                <span className="text-3xl font-black text-gray-900">{stats.activeProjects}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Active Projects</h3>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-12 h-12 text-green-500" />
                <span className="text-3xl font-black text-gray-900">{stats.totalContributors}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Contributors</h3>
            </div>

            {/* Pending Ideas Alert */}
            {stats.pendingIdeas > 0 && (
              <div className="lg:col-span-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-yellow-900 mb-1">
                      {stats.pendingIdeas} Ideas Awaiting Review
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Review pending project ideas to help users get started
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('ideas')}
                    className="px-6 py-3 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-700 transition-colors"
                  >
                    Review Now
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ideas Tab */}
        {activeTab === 'ideas' && (
          <div>
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ideas by title, user, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none font-semibold"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Ideas List */}
            <div className="space-y-4">
              {filteredIdeas.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No ideas found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter</p>
                </div>
              ) : (
                filteredIdeas.map((idea) => (
                  <div key={idea.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-gray-900">{idea.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(idea.status)}`}>
                            {getStatusIcon(idea.status)}
                            {idea.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{idea.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{idea.userName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{idea.userEmail}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(idea.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-3">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                            {idea.category}
                          </span>
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg">
                            Timeline: {idea.expectedTimeline}
                          </span>
                        </div>

                        {idea.feedback && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-gray-600" />
                              <span className="text-xs font-semibold text-gray-600">Admin Feedback:</span>
                            </div>
                            <p className="text-sm text-gray-700">{idea.feedback}</p>
                          </div>
                        )}
                      </div>
                      
                      {idea.status === 'pending' && (
                        <button
                          onClick={() => setSelectedIdea(idea)}
                          className="ml-4 px-6 py-3 bg-[#00ADB5] text-white font-semibold rounded-xl hover:bg-cyan-600 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-5 h-5" />
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Project Management</h3>
            <p className="text-gray-600">Monitor all active projects and their progress</p>
            <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600">Manage users, roles, and permissions</p>
            <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
          </div>
        )}

        {/* Review Modal */}
        {selectedIdea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Review Idea</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Title</label>
                    <p className="text-lg font-bold text-gray-900">{selectedIdea.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Description</label>
                    <p className="text-gray-700">{selectedIdea.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Category</label>
                      <p className="text-gray-900">{selectedIdea.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Timeline</label>
                      <p className="text-gray-900">{selectedIdea.expectedTimeline}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Submitted By</label>
                    <p className="text-gray-900">{selectedIdea.userName} ({selectedIdea.userEmail})</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">
                      Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Provide feedback for the user..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none resize-none"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => approveIdea(selectedIdea.id)}
                    className="flex-1 px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectIdea(selectedIdea.id)}
                    className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIdea(null);
                      setReviewFeedback('');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
