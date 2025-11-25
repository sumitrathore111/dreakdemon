import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { 
  Code2, Users, Calendar, Search, 
  Lightbulb, CheckCircle, Clock
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  creator: string;
  members: number;
  status: string;
  progress: number;
  tags: string[];
  createdAt: string;
}

export default function BrowseProjects() {
  const { user } = useAuth();
  const { fetchAllIdeas, sendJoinRequest } = useDataContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'browse' | 'myideas' | 'myprojects'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [myIdeas, setMyIdeas] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Application Modal State
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [application, setApplication] = useState({
    skills: '',
    experience: '',
    motivation: '',
    availability: ''
  });

  const categories = ['All', 'Web Development', 'Mobile App', 'AI/ML', 'Data Science', 'Game Development', 'IoT', 'Blockchain'];

  useEffect(() => {
    loadApprovedProjects();
    loadMyIdeas();
    loadMyProjects();
  }, [user]);

  const loadApprovedProjects = async () => {
    setLoading(true);
    try {
      const allIdeas = await fetchAllIdeas();
      // Convert approved ideas to projects
      const approvedProjects = allIdeas
        .filter((idea: any) => idea.status === 'approved')
        .map((idea: any) => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          creator: idea.userName,
          members: 1,
          status: 'Active',
          progress: 0,
          tags: [idea.category],
          createdAt: idea.submittedAt || new Date().toISOString()
        }));
      
      setProjects(approvedProjects);
    } catch (error) {
      console.error('Error loading approved projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyIdeas = async () => {
    if (!user) return;
    
    try {
      const allIdeas = await fetchAllIdeas();
      // Filter to show only current user's ideas
      const userIdeas = allIdeas.filter((idea: any) => idea.userId === user.uid);
      setMyIdeas(userIdeas);
    } catch (error) {
      console.error('Error loading user ideas:', error);
    }
  };

  const loadMyProjects = async () => {
    if (!user) return;
    
    try {
      const allIdeas = await fetchAllIdeas();
      // Show projects where user is the creator (their approved ideas)
      const userApprovedIdeas = allIdeas
        .filter((idea: any) => idea.userId === user.uid && idea.status === 'approved')
        .map((idea: any) => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          creator: idea.userName,
          members: 1,
          status: 'Active',
          progress: 0,
          tags: [idea.category],
          createdAt: idea.submittedAt || new Date().toISOString()
        }));
      
      setMyProjects(userApprovedIdeas);
    } catch (error) {
      console.error('Error loading user projects:', error);
    }
  };

  const requestToJoin = async (_projectId: string) => {
    if (!user) {
      alert('Please login to join projects');
      return;
    }
    
    try {
      // Get project details
      const allIdeas = await fetchAllIdeas();
      const project = allIdeas.find((idea: any) => idea.id === _projectId);
      
      if (!project) {
        alert('Project not found');
        return;
      }
      
      if (project.userId === user.uid) {
        alert('You cannot join your own project');
        return;
      }
      
      // Convert to Project type and open modal
      const projectData: Project = {
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category,
        creator: project.userName,
        members: 1,
        status: 'Active',
        progress: 0,
        tags: [project.category],
        createdAt: project.submittedAt || new Date().toISOString()
      };
      
      setSelectedProject(projectData);
      setShowApplicationModal(true);
    } catch (error: any) {
      alert(error.message || 'Failed to open application form');
    }
  };
  
  const submitApplication = async () => {
    if (!selectedProject || !user) return;
    
    // Validate application
    if (!application.skills.trim()) {
      alert('Please enter your skills');
      return;
    }
    
    if (!application.motivation.trim()) {
      alert('Please explain why you want to join this project');
      return;
    }
    
    try {
      const allIdeas = await fetchAllIdeas();
      const project = allIdeas.find((idea: any) => idea.id === selectedProject.id);
      
      if (!project) {
        alert('Project not found');
        return;
      }
      
      // Send join request with application details
      await sendJoinRequest(
        selectedProject.id, 
        selectedProject.title, 
        project.userId,
        application
      );
      
      alert('Application submitted successfully! The project creator will review your request.');
      setShowApplicationModal(false);
      setApplication({ skills: '', experience: '', motivation: '', availability: '' });
      setSelectedProject(null);
    } catch (error: any) {
      alert(error.message || 'Failed to submit application');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Project Collaboration Hub</h1>
              <p className="text-gray-600">Join exciting projects or submit your own idea</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/projects/submit-idea')}
              className="px-6 py-3 bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Lightbulb className="w-5 h-5" />
              Submit Your Idea
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white rounded-xl p-2 shadow-lg">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'browse'
                  ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Browse Projects
              </div>
            </button>
            <button
              onClick={() => setActiveTab('myideas')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'myideas'
                  ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Lightbulb className="w-5 h-5" />
                My Ideas
                {myIdeas.length > 0 && (
                  <span className="bg-white text-[#00ADB5] px-2 py-1 rounded-full text-xs font-bold">
                    {myIdeas.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('myprojects')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'myprojects'
                  ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Code2 className="w-5 h-5" />
                My Projects
                {myProjects.length > 0 && (
                  <span className="bg-white text-[#00ADB5] px-2 py-1 rounded-full text-xs font-bold">
                    {myProjects.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Browse Projects Tab */}
        {activeTab === 'browse' && (
          <div>
            {/* Search and Filter */}
            <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none font-semibold"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-[#00ADB5] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Code2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600">Try adjusting your search or submit a new idea!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      {project.status}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">Progress</span>
                      <span className="text-sm font-black text-[#00ADB5]">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${project.progress}%`, backgroundColor: '#00ADB5' }}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.members} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => requestToJoin(project.id)}
                      className="px-4 py-2 bg-[#00ADB5] text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                      Request to Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* My Ideas Tab */}
        {activeTab === 'myideas' && (
          <div>
            {myIdeas.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No ideas submitted yet</h3>
                <p className="text-gray-600 mb-6">Submit your project idea and get it approved by our team</p>
                <button
                  onClick={() => navigate('/dashboard/projects/submit-idea')}
                  className="px-6 py-3 bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Submit Your First Idea
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myIdeas.map((idea) => (
                  <div key={idea.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{idea.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Submitted on {new Date(idea.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {idea.status === 'pending' && (
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 font-semibold rounded-lg flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Pending Review
                          </span>
                        )}
                        {idea.status === 'approved' && (
                          <span className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Approved
                          </span>
                        )}
                      </div>
                    </div>
                    {idea.status === 'approved' && (
                      <button
                        onClick={() => navigate('/dashboard/projects/create')}
                        className="mt-4 px-6 py-2 bg-[#00ADB5] text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
                      >
                        Create Project
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Projects Tab */}
        {activeTab === 'myprojects' && (
          <div>
            {myProjects.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Code2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Join existing projects or create your own once your idea is approved</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                  >
                    Browse Projects
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/projects/submit-idea')}
                    className="px-6 py-3 bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    Submit Idea
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {myProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-black text-gray-900">{project.title}</h3>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                            CREATOR
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{project.description}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">Progress</span>
                        <span className="text-sm font-black text-[#00ADB5]">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${project.progress}%`, backgroundColor: '#00ADB5' }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{project.members} members</span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-[#00ADB5] text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors">
                        Manage →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Application Modal */}
      {showApplicationModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <h2 className="text-2xl font-black text-gray-900">Apply to Join Project</h2>
              <p className="text-gray-600 mt-1">{selectedProject.title}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Skills */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Your Skills <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={application.skills}
                  onChange={(e) => setApplication({ ...application, skills: e.target.value })}
                  placeholder="e.g., React, Node.js, Python, UI/UX Design..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none resize-none"
                  rows={3}
                />
              </div>
              
              {/* Experience */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Relevant Experience
                </label>
                <textarea
                  value={application.experience}
                  onChange={(e) => setApplication({ ...application, experience: e.target.value })}
                  placeholder="Share your previous projects or work experience..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none resize-none"
                  rows={3}
                />
              </div>
              
              {/* Motivation */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Why do you want to join? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={application.motivation}
                  onChange={(e) => setApplication({ ...application, motivation: e.target.value })}
                  placeholder="Explain what interests you about this project and how you can contribute..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none resize-none"
                  rows={4}
                />
              </div>
              
              {/* Availability */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Weekly Availability
                </label>
                <select
                  value={application.availability}
                  onChange={(e) => setApplication({ ...application, availability: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none"
                >
                  <option value="">Select your availability</option>
                  <option value="5-10 hours">5-10 hours per week</option>
                  <option value="10-20 hours">10-20 hours per week</option>
                  <option value="20+ hours">20+ hours per week</option>
                  <option value="Full-time">Full-time commitment</option>
                </select>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setApplication({ skills: '', experience: '', motivation: '', availability: '' });
                  setSelectedProject(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitApplication}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
