import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Github, 
  Linkedin, 
  Mail, 
  MapPin, 
  Code2, 
  Award, 
  Users,
  ExternalLink,
  Download,
  Share2,
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react';
import { useDataContext } from '../../Context/UserDataContext';

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  role: 'creator' | 'contributor';
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  completedAt: string;
  teamSize: number;
  contributions: string[];
}

interface StudentProfile {
  userId: string;
  name: string;
  email: string;
  bio: string;
  location: string;
  github?: string;
  linkedin?: string;
  skills: string[];
  projects: PortfolioProject[];
  certificates: any[];
  stats: {
    totalProjects: number;
    totalContributions: number;
    totalCertificates: number;
    collaborators: number;
  };
}

const StudentPortfolio = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { fetchAllIdeas, getProjectMembers } = useDataContext();
  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, [userId]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      // Fetch all projects where user is involved
      const allIdeas = await fetchAllIdeas();
      
      const userProjects: PortfolioProject[] = [];
      let userName = '';
      let userEmail = '';
      const allCollaborators = new Set<string>();

      for (const idea of allIdeas) {
        if (idea.userId === userId && idea.status === 'approved') {
          // User is creator
          const members = await getProjectMembers(idea.id);
          
          userProjects.push({
            id: idea.id,
            title: idea.title,
            description: idea.description,
            role: 'creator',
            techStack: extractTechStack(idea.description),
            githubUrl: idea.githubUrl,
            liveUrl: idea.liveUrl,
            completedAt: idea.submittedAt,
            teamSize: members.length + 1,
            contributions: ['Project Creator', 'Architecture Design', 'Team Management']
          });

          userName = idea.userName;
          userEmail = idea.userEmail || '';
          
          members.forEach((m: any) => allCollaborators.add(m.userId));
        } else {
          // Check if user is a contributor
          const members = await getProjectMembers(idea.id);
          const isMember = members.find((m: any) => m.userId === userId);
          
          if (isMember) {
            userProjects.push({
              id: idea.id,
              title: idea.title,
              description: idea.description,
              role: 'contributor',
              techStack: extractTechStack(idea.description),
              githubUrl: idea.githubUrl,
              liveUrl: idea.liveUrl,
              completedAt: isMember.joinedAt,
              teamSize: members.length + 1,
              contributions: ['Code Contribution', 'Testing', 'Documentation']
            });

            userName = userName || isMember.userName;
            allCollaborators.add(idea.userId);
            members.forEach((m: any) => {
              if (m.userId !== userId) allCollaborators.add(m.userId);
            });
          }
        }
      }

      // Extract unique skills from all projects
      const allSkills = new Set<string>();
      userProjects.forEach(p => p.techStack.forEach(tech => allSkills.add(tech)));

      const portfolioProfile: StudentProfile = {
        userId: userId || '',
        name: userName || 'Student',
        email: userEmail,
        bio: 'Passionate developer building real-world projects and collaborating with teams.',
        location: 'India',
        github: '',
        linkedin: '',
        skills: Array.from(allSkills),
        projects: userProjects.sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        ),
        certificates: [],
        stats: {
          totalProjects: userProjects.length,
          totalContributions: userProjects.filter(p => p.role === 'contributor').length,
          totalCertificates: 0,
          collaborators: allCollaborators.size
        }
      };

      setProfile(portfolioProfile);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractTechStack = (description: string): string[] => {
    const techKeywords = [
      'React', 'Node', 'MongoDB', 'Express', 'Python', 'Django', 'Flask',
      'JavaScript', 'TypeScript', 'Next.js', 'Vue', 'Angular', 'Firebase',
      'AWS', 'Docker', 'TensorFlow', 'PyTorch', 'Flutter', 'React Native',
      'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API', 'Tailwind'
    ];
    
    return techKeywords.filter(tech => 
      description.toLowerCase().includes(tech.toLowerCase())
    );
  };

  const sharePortfolio = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadResume = () => {
    // TODO: Generate PDF resume
    alert('PDF download feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#00ADB5] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio not found</h2>
          <p className="text-gray-600 mb-4">This student hasn't created any projects yet</p>
          <button
            onClick={() => navigate('/dashboard/projects')}
            className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600"
          >
            Browse Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24" style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center">
            {/* Avatar */}
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-6xl font-bold text-white">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
              {profile.name}
            </h1>
            <p className="text-xl text-white/90 mb-6">{profile.bio}</p>

            {/* Contact Links */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {profile.location && (
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              )}
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={sharePortfolio}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-medium rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink ? 'Link Copied!' : 'Share Portfolio'}
              </button>
              <button
                onClick={downloadResume}
                className="px-6 py-3 bg-white text-cyan-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Resume
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-100 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-cyan-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{profile.stats.totalProjects}</p>
            <p className="text-sm text-gray-600">Projects</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{profile.stats.totalContributions}</p>
            <p className="text-sm text-gray-600">Contributions</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{profile.stats.collaborators}</p>
            <p className="text-sm text-gray-600">Collaborators</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{profile.stats.totalCertificates}</p>
            <p className="text-sm text-gray-600">Certificates</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Projects Section */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
              
              {profile.projects.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No projects yet</p>
              ) : (
                <div className="space-y-6">
                  {profile.projects.map((project) => (
                    <div
                      key={project.id}
                      className="border-2 border-gray-100 rounded-xl p-5 hover:border-cyan-300 transition-all cursor-pointer"
                      onClick={() => navigate(`/dashboard/openproject/${project.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              project.role === 'creator'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {project.role === 'creator' ? '👑 Creator' : '🤝 Contributor'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                        </div>
                      </div>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-cyan-50 text-cyan-700 rounded text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Contributions */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.contributions.map((contrib, idx) => (
                          <span key={idx} className="text-xs text-gray-600">
                            • {contrib}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{project.teamSize} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(project.completedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <Github className="w-4 h-4 text-gray-700" />
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-700" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
              {profile.skills.length === 0 ? (
                <p className="text-gray-600 text-sm">No skills listed yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Achievements */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Achievements</h3>
              <div className="space-y-3">
                {profile.stats.totalProjects > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Project Builder</p>
                      <p className="text-xs text-gray-600">Completed {profile.stats.totalProjects} projects</p>
                    </div>
                  </div>
                )}
                {profile.stats.collaborators > 5 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Team Player</p>
                      <p className="text-xs text-gray-600">Worked with {profile.stats.collaborators}+ developers</p>
                    </div>
                  </div>
                )}
                {profile.stats.totalProjects === 0 && profile.stats.collaborators === 0 && (
                  <p className="text-gray-600 text-sm">Start contributing to unlock achievements!</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortfolio;
