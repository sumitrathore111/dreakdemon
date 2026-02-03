import {
    Activity,
    BarChart2,
    FileText,
    GitBranch,
    Kanban,
    MessageSquare,
    Target,
    UserCheck,
    UserPlus,
    Users,
    UserX
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { API_URL } from '../../../service/apiConfig';
import { ActivityTimeline } from '../ActivityTimeline';
import { GitHubPanel } from '../GitHub';
import { KanbanBoard } from '../KanbanBoard';
import type { Board, KanbanTask, ProjectMember } from '../KanbanBoard/kanban.types';
import InviteDeveloperModal from '../Modal/InviteDeveloperModal';
import { ProjectAnalytics } from '../ProjectAnalytics';
import { ProjectChat } from '../ProjectChat';
import { ProjectFiles } from '../ProjectFiles';
import { SprintPlanning } from '../SprintPlanning';

type TabType = 'board' | 'sprints' | 'activity' | 'analytics' | 'github' | 'files' | 'chat' | 'members';

interface JoinRequest {
  id: string;
  _id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestedAt?: string;
  createdAt?: string;
  skills?: string;
  experience?: string;
  motivation?: string;
  message?: string;
  status: string;
}

export default function EnhancedProjectWorkspace() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('board');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [project, setProject] = useState<Record<string, any> | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [, setSelectedTask] = useState<KanbanTask | null>(null);
  const [githubRepoFullName, setGithubRepoFullName] = useState<string | undefined>(undefined);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Get auth token
  const getToken = () => localStorage.getItem('authToken');

  // Fetch project data
  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      if (!token) {
        setError('Please log in to view this project');
        navigate('/login');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch project
      const projectRes = await fetch(`${API_URL}/projects/${projectId}`, { headers });

      if (projectRes.status === 404) {
        setError('Project not found. It may have been deleted or the link is incorrect.');
        return;
      }

      if (projectRes.status === 401) {
        setError('Please log in to view this project');
        navigate('/login');
        return;
      }

      if (projectRes.status === 403) {
        setError('You do not have permission to view this project');
        return;
      }

      if (!projectRes.ok) {
        const errorData = await projectRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch project');
      }

      const projectData = await projectRes.json();
      setProject(projectData.project);

      // Map members first to check roles
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projectMembers: ProjectMember[] = projectData.project.members.map((m: Record<string, any>) => ({
        _id: m._id,
        userId: m.userId?._id || m.userId,
        name: m.name || m.userId?.name,
        email: m.email || m.userId?.email,
        role: m.role,
        avatar: m.avatar
      }));
      setMembers(projectMembers);

      // Check if current user is the creator/owner ONLY (not admin)
      // Handle both string IDs and object IDs with ._id or .id
      const ownerId = projectData.project.owner?._id || projectData.project.owner?.id || projectData.project.owner;
      const createdById = projectData.project.createdBy?._id || projectData.project.createdBy?.id || projectData.project.createdBy;
      const userIdField = projectData.project.userId?._id || projectData.project.userId?.id || projectData.project.userId;
      const currentId = user?.id || (user as { _id?: string })?._id;

      // Only compare if both values exist to avoid undefined === undefined being true
      const isOwnerByField =
        (ownerId && currentId && String(ownerId) === String(currentId)) ||
        (createdById && currentId && String(createdById) === String(currentId)) ||
        (userIdField && currentId && String(userIdField) === String(currentId));

      // Only check for 'owner' role, NOT 'admin' - only owner can approve/reject
      const isOwnerByMemberRole = currentId && projectMembers.some(m =>
        m.userId && String(m.userId) === String(currentId) && m.role === 'owner'
      );

      const creatorCheck = !!(isOwnerByField || isOwnerByMemberRole);
      setIsCreator(creatorCheck);

      console.log('🔍 Creator Check Debug:', {
        rawOwner: projectData.project.owner,
        ownerId,
        createdById,
        userIdField,
        currentId,
        isOwnerByField,
        isOwnerByMemberRole,
        members: projectMembers,
        isCreator: creatorCheck
      });

      // Always fetch join requests (for debugging - will filter display later)
      console.log('🔍 Fetching join requests, isCreator:', creatorCheck);
      try {
        console.log('📋 Fetching join requests from:', `${API_URL}/join-requests/project/${projectId}`);
        const joinReqRes = await fetch(`${API_URL}/join-requests/project/${projectId}`, { headers });
        console.log('📋 Join requests response status:', joinReqRes.status);
        if (joinReqRes.ok) {
          const joinReqData = await joinReqRes.json();
          console.log('📋 Join requests raw data:', joinReqData);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const requests = (joinReqData.requests || []).map((r: Record<string, any>) => ({
            id: r._id || r.id,
            _id: r._id,
            userId: r.userId?._id || r.userId,
            userName: r.userId?.name || r.userName,
            userEmail: r.userId?.email || r.userEmail,
            requestedAt: r.createdAt || r.requestedAt,
            skills: r.skills,
            experience: r.experience,
            motivation: r.motivation || r.message,
            message: r.message,
            status: r.status
          }));
          console.log('📋 Mapped requests:', requests);
          // Include requests that are pending OR have no status (default to pending)
          const pendingRequests = requests.filter((r: JoinRequest) => !r.status || r.status === 'pending');
          console.log('📋 Pending requests:', pendingRequests);
          setJoinRequests(pendingRequests);
        } else {
          console.log('❌ Join requests fetch failed:', await joinReqRes.text());
        }
      } catch (err) {
        console.error('Error fetching join requests:', err);
      }

      // Fetch boards
      const boardsRes = await fetch(`${API_URL}/boards/project/${projectId}`, { headers });
      if (boardsRes.ok) {
        const boards = await boardsRes.json();
        if (boards.length > 0) {
          // Fetch board with tasks
          const boardRes = await fetch(`${API_URL}/boards/${boards[0]._id}`, { headers });
          if (boardRes.ok) {
            const boardData = await boardRes.json();
            setBoard(boardData.board || boardData);
            setTasks(boardData.tasks || []);
          }
        }
      }

      // Fetch GitHub connection status for this project
      try {
        const githubRes = await fetch(`${API_URL}/github/projects/${projectId}/status`, { headers });
        if (githubRes.ok) {
          const githubData = await githubRes.json();
          if (githubData.connected && githubData.repoFullName) {
            setGithubRepoFullName(githubData.repoFullName);
          }
        }
      } catch (err) {
        console.log('GitHub status fetch skipped:', err);
      }
    } catch (err: unknown) {
      console.error('Error fetching project data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, navigate, user?.id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProjectData();
  }, [user, fetchProjectData, navigate]);

  // Handle task click
  const handleTaskClick = (task: KanbanTask) => {
    setSelectedTask(task);
  };

  // Handle task move to sprint
  const handleTaskMoveToSprint = async (taskId: string, sprintId: string | null) => {
    try {
      const token = getToken();
      await fetch(`${API_URL}/boards/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sprintId })
      });

      // Update local state
      setTasks(prev => prev.map(t =>
        t._id === taskId ? { ...t, sprintId: sprintId || undefined } : t
      ));
    } catch (error) {
      console.error('Error moving task to sprint:', error);
    }
  };

  // Handle approve join request
  const handleApproveRequest = async (requestId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/join-requests/${requestId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        // Remove from join requests
        setJoinRequests(prev => prev.filter(r => r.id !== requestId && r._id !== requestId));
        // Refresh project data to get updated members
        fetchProjectData();
        alert('Request approved! User has been added to the project.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  // Handle reject join request
  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/join-requests/${requestId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        setJoinRequests(prev => prev.filter(r => r.id !== requestId && r._id !== requestId));
        alert('Request rejected.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Project
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error || 'Project not found. It may have been deleted or the link is incorrect.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard/projects')}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Browse Projects
            </button>
            <button
              onClick={() => fetchProjectData()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number; connected?: boolean }[] = [
    { id: 'board', label: 'Board', icon: <Kanban className="w-4 h-4" /> },
    { id: 'sprints', label: 'Sprints', icon: <Target className="w-4 h-4" /> },
    { id: 'github', label: 'GitHub', icon: <GitBranch className="w-4 h-4" />, connected: !!githubRepoFullName },
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" />, badge: isCreator ? joinRequests.length : 0 },

    { id: 'files', label: 'Files', icon: <FileText className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },{ id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {project.description?.substring(0, 100)}...
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* GitHub Connected Badge */}
              {githubRepoFullName && (
                <a
                  href={`https://github.com/${githubRepoFullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                  title={`Connected to ${githubRepoFullName}`}
                >
                  <GitBranch className="w-4 h-4" />
                  <span className="hidden sm:inline">{githubRepoFullName.split('/')[1]}</span>
                </a>
              )}
              {/* Team avatars */}
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((member, index) => (
                  <div
                    key={member.userId?.toString() || `member-${index}`}
                    className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-gray-900"
                    title={member.name}
                  >
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full" />
                    ) : (
                      member.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
                {members.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-900">
                    +{members.length - 4}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm"
              >
                <Users className="w-4 h-4" />
                Invite
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap relative
                  ${activeTab === tab.id
                    ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                )}
                {tab.connected && (
                  <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" title="Connected" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Board Tab - Kanban */}
        {activeTab === 'board' && (
          <KanbanBoard
            projectId={projectId!}
            boardId={board?._id}
            members={members}
            currentUserId={user?.id || ''}
            currentUserName={user?.name || user?.email?.split('@')[0] || 'User'}
            isProjectOwner={isCreator}
          />
        )}

        {/* Sprints Tab */}
        {activeTab === 'sprints' && (
          <div className="h-[calc(100vh-250px)]">
            <SprintPlanning
              projectId={projectId!}
              boardId={board?._id}
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onTaskMoveToSprint={handleTaskMoveToSprint}
            />
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="h-[calc(100vh-250px)]">
            <ActivityTimeline projectId={projectId!} includeGitHub={!!githubRepoFullName} />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <ProjectAnalytics projectId={projectId!} githubRepoFullName={githubRepoFullName} />
        )}

        {/* GitHub Tab */}
        {activeTab === 'github' && (
          <GitHubPanel projectId={projectId!} isOwner={isCreator} />
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <ProjectFiles
            projectId={projectId!}
          />
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <ProjectChat
            projectId={projectId!}
            currentUserId={user?.id || ''}
            currentUserName={user?.name || user?.email?.split('@')[0] || 'User'}
            members={members}
            projectTitle={project?.title || 'Team Chat'}
          />
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Pending Join Requests - Only show to project owner */}
            {isCreator && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Pending Join Requests
                {joinRequests.length > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    {joinRequests.length}
                  </span>
                )}
              </h3>

              {joinRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No pending join requests</p>
                  <p className="text-sm mt-1">When someone requests to join, they'll appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {joinRequests.map((request) => (
                    <div key={request.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {request.userName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.userEmail}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'recently'}
                          </p>
                          {request.message && (
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded">
                              "{request.message}"
                            </p>
                          )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="px-3 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                              <UserCheck className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="px-3 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                            >
                              <UserX className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Current Members */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members ({members.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member, index) => (
                  <div key={member.userId?.toString() || `member-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full" />
                      ) : (
                        member.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Invite Developer Modal */}
      {showInviteModal && projectId && (
        <InviteDeveloperModal
          projectId={projectId}
          projectTitle={project?.title || 'Project'}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
