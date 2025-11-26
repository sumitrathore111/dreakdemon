import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { 
  CheckCircle, Circle, Clock, User, MessageSquare, 
  Upload, Bell, Activity, FileText, Send, Trash2, 
  UserPlus, UserCheck, UserX, Shield
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
}

interface Member {
  id: string;
  userId: string;
  userName: string;
  role: 'creator' | 'contributor';
  joinedAt: string;
}

interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestedAt: string;
  skills?: string;
  experience?: string;
  motivation?: string;
  availability?: string;
}

export default function ProjectWorkspace() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { 
    fetchAllIdeas, checkUserRole, getProjectMembers, fetchJoinRequests, fetchAllJoinRequestsDebug, fixJoinRequestProjectId,
    approveJoinRequest, rejectJoinRequest,
    addTask: addTaskToDb, fetchTasks: fetchTasksFromDb, updateTask: updateTaskInDb, deleteTask: deleteTaskFromDb,
    sendMessage: sendMessageToDb, fetchMessages: fetchMessagesFromDb,
    uploadFile: uploadFileToDb, fetchFiles: fetchFilesFromDb, deleteFile: deleteFileFromDb
  } = useDataContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat' | 'files' | 'members' | 'activity'>('tasks');
  const [userRole, setUserRole] = useState<'creator' | 'contributor' | null>(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
    dueDate: ''
  });

  // Chat
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Files
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !projectId) {
      navigate('/dashboard/projects');
      return;
    }
    loadProjectData();
  }, [projectId, user]);

  useEffect(() => {
    if (activeTab === 'chat' && projectId) {
      loadMessages();
    }
  }, [activeTab, projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      // Get project from ideas
      const allIdeas = await fetchAllIdeas();
      const projectData = allIdeas.find((idea: any) => idea.id === projectId);
      
      if (!projectData) {
        alert('Project not found');
        navigate('/dashboard/projects');
        return;
      }
      
      if (projectData.status !== 'approved') {
        alert('This project is not approved yet');
        navigate('/dashboard/projects');
        return;
      }
      
      setProject(projectData);
      
      // Check user role
      const role = await checkUserRole(projectId!, user!.uid);
      
      if (!role) {
        alert('You do not have access to this project');
        navigate('/dashboard/projects');
        return;
      }
      
      setUserRole(role as 'creator' | 'contributor');
      
      // Load members
      const membersList = await getProjectMembers(projectId!);
      console.log('🔍 LOADED MEMBERS FROM FIREBASE:', membersList);
      
      // Remove duplicates based on userId
      const uniqueMembers = membersList.filter((member: any, index: number, self: any[]) => 
        index === self.findIndex((m: any) => m.userId === member.userId)
      );
      
      // Add creator as first member, then filter out any duplicates
      const allMembers: Member[] = [
        {
          id: 'creator',
          userId: projectData.userId,
          userName: projectData.userName,
          role: 'creator',
          joinedAt: projectData.submittedAt
        },
        // Filter out the creator if they appear in membersList to avoid duplicates
        ...uniqueMembers.filter((member: any) => member.userId !== projectData.userId)
      ];
      
      console.log('👥 ALL MEMBERS (including creator):', allMembers);
      setMembers(allMembers);
      
      // Load join requests (only for creator)
      if (role === 'creator') {
        console.log('📋 Loading join requests for project:', projectId);
        console.log('📋 Current user ID:', user!.uid);
        console.log('📋 Project creator ID:', projectData.userId);
        
        const requests = await fetchJoinRequests(projectId!);
        console.log('📋 Fetched join requests:', requests);
        setJoinRequests(requests);
        
        // Auto-fix mismatched project IDs
        if (requests.length === 0) {
          const allRequests = await fetchAllJoinRequestsDebug();
          const needFix = allRequests.filter((r: any) => 
            r.status === 'pending' && 
            r.creatorId === user!.uid &&
            r.projectId !== projectId
          );
          
          if (needFix.length > 0) {
            for (const req of needFix) {
              await fixJoinRequestProjectId(req.id, projectId);
            }
            const fixed = await fetchJoinRequests(projectId!);
            setJoinRequests(fixed);
          }
        }
      }
      
      // Load tasks, messages, files from Firebase
      loadTasks();
      loadMessages();
      loadFiles();
      
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Failed to load project');
      navigate('/dashboard/projects');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const tasksList = await fetchTasksFromDb(projectId!);
      setTasks(tasksList.filter((t: any) => !t.deleted));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesList = await fetchMessagesFromDb(projectId!);
      setMessages(messagesList);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  
  const loadFiles = async () => {
    try {
      const filesList = await fetchFilesFromDb(projectId!);
      setFiles(filesList);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleApproveRequest = async (requestId: string, userId: string, userName: string) => {
    try {
      await approveJoinRequest(requestId, projectId!, userId, userName);
      setJoinRequests(joinRequests.filter(req => req.id !== requestId));
      
      // Reload members
      const membersList = await getProjectMembers(projectId!);
      const allMembers: Member[] = [
        {
          id: 'creator',
          userId: project.userId,
          userName: project.userName,
          role: 'creator',
          joinedAt: project.submittedAt
        },
        ...membersList
      ];
      setMembers(allMembers);
      
      alert(`${userName} has been added to the project!`);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectJoinRequest(requestId);
      setJoinRequests(joinRequests.filter(req => req.id !== requestId));
      alert('Join request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      await addTaskToDb(projectId!, {
        title: newTask.title,
        description: newTask.description,
        status: 'todo',
        priority: newTask.priority,
        assignedTo: newTask.assignedTo,
        dueDate: newTask.dueDate
      });
      
      await loadTasks();
      setNewTask({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'todo' | 'inprogress' | 'completed') => {
    try {
      await updateTaskInDb(projectId!, taskId, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (userRole !== 'creator') {
      alert('Only the project creator can delete tasks');
      return;
    }
    
    try {
      await deleteTaskFromDb(projectId!, taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessageToDb(projectId!, { text: newMessage });
      await loadMessages();
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inprogress': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#00ADB5] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-gray-900">{project?.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  userRole === 'creator' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {userRole === 'creator' ? (
                    <><Shield className="w-3 h-3 inline mr-1" />CREATOR</>
                  ) : (
                    <><UserCheck className="w-3 h-3 inline mr-1" />CONTRIBUTOR</>
                  )}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{project?.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{members.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{tasks.length} tasks</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Progress</div>
              <div className="text-3xl font-black text-[#00ADB5]">{calculateProgress()}%</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${calculateProgress()}%`, backgroundColor: '#00ADB5' }}
            />
          </div>
        </div>

        {/* Join Requests Alert */}
        {userRole === 'creator' && joinRequests.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900">
                  {joinRequests.length} Pending Join Request{joinRequests.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-yellow-700">Review requests in the Members tab</p>
              </div>
              <button
                onClick={() => setActiveTab('members')}
                className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Review
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-lg mb-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-5 h-5 inline mr-2" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'files'
                ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-5 h-5 inline mr-2" />
            Files
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'members'
                ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserPlus className="w-5 h-5 inline mr-2" />
            Members
            {joinRequests.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-white text-[#00ADB5] rounded-full text-xs font-bold">
                {joinRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'activity'
                ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-5 h-5 inline mr-2" />
            Activity
          </button>
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-gray-900">Tasks</h2>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="px-4 py-2 bg-[#00ADB5] text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
              >
                + Add Task
              </button>
            </div>

            {showTaskForm && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                <h3 className="text-lg font-bold mb-4">New Task</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none"
                  />
                  <textarea
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none"
                    >
                      <option value="">Assign to...</option>
                      {members.map(member => (
                        <option key={member.id} value={member.userName}>{member.userName}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addTask}
                      className="flex-1 px-4 py-3 bg-[#00ADB5] text-white font-semibold rounded-xl hover:bg-cyan-600 transition-colors"
                    >
                      Create Task
                    </button>
                    <button
                      onClick={() => setShowTaskForm(false)}
                      className="px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-600">Create your first task to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => {
                          if (task.status === 'completed') updateTaskStatus(task.id, 'todo');
                          else if (task.status === 'todo') updateTaskStatus(task.id, 'inprogress');
                          else updateTaskStatus(task.id, 'completed');
                        }}
                        className="mt-1"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </span>
                            {userRole === 'creator' && (
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {task.assignedTo && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{task.assignedTo}</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Team Chat</h2>
            
            <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className="bg-white rounded-lg p-3 shadow">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">{msg.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="px-6 py-3 bg-[#00ADB5] text-white font-semibold rounded-xl hover:bg-cyan-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-gray-900">Project Files</h2>
              <label className="px-6 py-3 bg-[#00ADB5] text-white font-semibold rounded-xl hover:bg-cyan-600 transition-colors cursor-pointer flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload File
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // For now, we'll store file metadata only (not actual file upload to storage)
                      // In production, you'd upload to Firebase Storage or similar
                      const fileData = {
                        name: file.name,
                        size: file.size,
                        url: '#' // Placeholder - would be Firebase Storage URL
                      };
                      try {
                        await uploadFileToDb(projectId!, fileData);
                        const filesList = await fetchFilesFromDb(projectId!);
                        setFiles(filesList);
                        alert('File metadata saved! (Note: Actual file upload requires Firebase Storage setup)');
                      } catch (error) {
                        console.error('Error uploading file:', error);
                        alert('Failed to upload file');
                      }
                    }
                  }}
                />
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No files uploaded yet</p>
                </div>
              ) : (
                files.map(file => (
                  <div key={file.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-[#00ADB5] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <h3 className="font-semibold text-gray-900">{file.fileName}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          Uploaded by {file.uploaderName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(file.uploadedAt).toLocaleDateString()} • {(file.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      {userRole === 'creator' && (
                        <button
                          onClick={async () => {
                            try {
                              await deleteFileFromDb(projectId!, file.id);
                              setFiles(files.filter(f => f.id !== file.id));
                            } catch (error) {
                              console.error('Error deleting file:', error);
                              alert('Failed to delete file');
                            }
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Note: Full file upload/download requires Firebase Storage setup. Currently storing metadata only.
            </p>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Pending Join Requests */}
            {userRole === 'creator' && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">
                  Pending Join Requests {joinRequests.length > 0 && `(${joinRequests.length})`}
                </h2>
                
                {joinRequests.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 font-semibold">No Pending Requests</p>
                    <p className="text-sm text-gray-500 mt-2">When someone requests to join your project, they will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">{joinRequests.map(request => (
                    <div key={request.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{request.userName}</h3>
                          <p className="text-sm text-gray-600">{request.userEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveRequest(request.id, request.userId, request.userName)}
                            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                          >
                            <UserCheck className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                          >
                            <UserX className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                      
                      {/* Application Details */}
                      <div className="bg-white rounded-lg p-4 space-y-3">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Skills</p>
                          <p className="text-sm text-gray-900">{request.skills || 'Not provided'}</p>
                        </div>
                        
                        {request.experience && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Experience</p>
                            <p className="text-sm text-gray-900">{request.experience}</p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Why they want to join</p>
                          <p className="text-sm text-gray-900">{request.motivation || 'Not provided'}</p>
                        </div>
                        
                        {request.availability && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Availability</p>
                            <p className="text-sm text-gray-900">{request.availability}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}

            {/* Current Members */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">Team Members</h2>
              <div className="space-y-3">
                {members.map(member => (
                  <div key={member.id} className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00ADB5] to-cyan-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {member.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{member.userName}</h3>
                          <p className="text-sm text-gray-600">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        member.role === 'creator' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {member.role === 'creator' ? (
                          <><Shield className="w-3 h-3 inline mr-1" />CREATOR</>
                        ) : (
                          <><UserCheck className="w-3 h-3 inline mr-1" />CONTRIBUTOR</>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Activity Timeline</h3>
            <p className="text-gray-600">Track all project activities</p>
            <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
