import {
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FolderOpen,
    Lightbulb,
    Mail,
    MessageSquare,
    Search,
    Shield,
    Trash2,
    TrendingUp,
    User,
    Users,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';

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
  const { 
    fetchAllIdeas, 
    updateIdeaStatus,
    deleteProject,
    fetchAllUsers, 
    fetchAllProjectMembers,
    getPlatformStats 
  } = useDataContext();
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
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  console.log('AdminPanel rendered', { user, loading });

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadIdeas().catch(e => console.error('Load ideas error:', e)),
        loadStats().catch(e => console.error('Load stats error:', e)),
        loadUsers().catch(e => console.error('Load users error:', e)),
        loadProjects().catch(e => console.error('Load projects error:', e))
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading admin panel data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const loadIdeas = async () => {
    try {
      const allIdeas = await fetchAllIdeas();
      setIdeas(allIdeas);
      setFilteredIdeas(allIdeas);
    } catch (error) {
      console.error('Error loading ideas:', error);
    }
  };

  const loadStats = async () => {
    try {
      const platformStats = await getPlatformStats();
      setStats(platformStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await fetchAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const allIdeas = await fetchAllIdeas();
      const approvedProjects = allIdeas.filter((idea: any) => idea.status === 'approved');
      const members = await fetchAllProjectMembers();
      
      // Group members by project
      const projectsWithMembers = approvedProjects.map((project: any) => {
        const projectMembers = members.filter((m: any) => m.projectId === project.id);
        return {
          ...project,
          memberCount: projectMembers.length + 1, // +1 for creator
          members: projectMembers
        };
      });
      
      setProjects(projectsWithMembers);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

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

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setDeletingProjectId(projectToDelete.id);
      await deleteProject(projectToDelete.id);
      
      // Update local state - remove the deleted project
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setIdeas(ideas.filter(i => i.id !== projectToDelete.id));
      
      alert(`Project "${projectToDelete.title}" has been deleted successfully`);
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingProjectId(null);
    }
  };

  const openDeleteConfirm = (project: any) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-[#00ADB5]" />
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage ideas, projects, and users</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
          <div>
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#00ADB5] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-12 h-12 text-blue-500" />
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalUsers}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Users</h3>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Lightbulb className="w-12 h-12 text-yellow-500" />
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalIdeas}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Ideas</h3>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    {stats.pendingIdeas} pending • {stats.approvedIdeas} approved
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FolderOpen className="w-12 h-12 text-[#00ADB5]" />
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.activeProjects}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Active Projects</h3>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-12 h-12 text-green-500" />
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalContributors}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Contributors</h3>
                </div>

                {/* Pending Ideas Alert */}
                {stats.pendingIdeas > 0 && (
                  <div className="lg:col-span-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-700 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-1">
                          {stats.pendingIdeas} Ideas Awaiting Review
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
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

                {/* Recent Activity */}
                <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {ideas.slice(0, 5).map((idea) => (
                      <div key={idea.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{idea.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              by {idea.userName} • {new Date(idea.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(idea.status)}`}>
                          {idea.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ideas Tab */}
        {activeTab === 'ideas' && (
          <div>
            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ideas by title, user, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-[#00ADB5] focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-[#00ADB5] focus:outline-none font-semibold"
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                  <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No ideas found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter</p>
                </div>
              ) : (
                filteredIdeas.map((idea) => (
                  <div key={idea.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-gray-900 dark:text-white">{idea.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(idea.status)}`}>
                            {getStatusIcon(idea.status)}
                            {idea.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{idea.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
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
                      
                      <div className="ml-4 flex flex-col gap-2">
                        {idea.status === 'pending' && (
                          <button
                            onClick={() => setSelectedIdea(idea)}
                            className="px-6 py-3 bg-[#00ADB5] text-white font-semibold rounded-xl hover:bg-cyan-600 transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-5 h-5" />
                            Review
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteConfirm(idea)}
                          disabled={deletingProjectId === idea.id}
                          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {deletingProjectId === idea.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#00ADB5] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Active Projects</h3>
                <p className="text-gray-600 dark:text-gray-400">Approved project ideas will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{project.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{project.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{project.userName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{project.memberCount} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(project.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg">
                            {project.category}
                          </span>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-semibold rounded-lg flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Project Members */}
                    {project.members.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Contributors:</p>
                        <div className="flex flex-wrap gap-2">
                          {project.members.slice(0, 5).map((member: any) => (
                            <span key={member.id} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                              {member.userName}
                            </span>
                          ))}
                          {project.members.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{project.members.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Delete Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => openDeleteConfirm(project)}
                        disabled={deletingProjectId === project.id}
                        className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingProjectId === project.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Delete Project
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#00ADB5] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">Registered users will appear here</p>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Total Users: {users.length}</h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg">
                        Active: {users.filter(u => u.last_active_date).length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((userData) => (
                    <div key={userData.id} className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00ADB5] to-cyan-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {userData.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{userData.name || 'No Name'}</h3>
                          <p className="text-sm text-gray-600 truncate">{userData.email || 'No Email'}</p>
                          
                          <div className="mt-2 space-y-1">
                            {userData.institute && (
                              <p className="text-xs text-gray-500 truncate">🎓 {userData.institute}</p>
                            )}
                            {userData.yearOfStudy && (
                              <p className="text-xs text-gray-500">📚 Year {userData.yearOfStudy}</p>
                            )}
                            {userData.marathon_score !== undefined && userData.marathon_score > 0 && (
                              <p className="text-xs text-gray-500">🏆 {userData.marathon_score} points</p>
                            )}
                            {userData.streakCount && userData.streakCount > 0 && (
                              <p className="text-xs text-gray-500">🔥 {userData.streakCount} day streak</p>
                            )}
                          </div>

                          {userData.skills && userData.skills.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {userData.skills.slice(0, 3).map((skill: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                              {userData.skills.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{userData.skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {userData.last_active_date && (
                            <p className="text-xs text-gray-400 mt-2">
                              Last active: {new Date(userData.last_active_date.toDate()).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Project?</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete <span className="font-semibold">"{projectToDelete?.title}"</span>?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  This action cannot be undone. The project will be marked as deleted.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setProjectToDelete(null);
                  }}
                  disabled={deletingProjectId !== null}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={deletingProjectId !== null}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deletingProjectId ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
