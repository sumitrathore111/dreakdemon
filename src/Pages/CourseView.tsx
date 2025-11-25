import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  // Play, 
  CheckCircle, 
  Lock, 
  Clock, 
  // BookOpen, 
  // Award,
  Download,
  Share2,
  ChevronLeft,
  PlayCircle
} from 'lucide-react';

interface Video {
  id: number;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  completed: boolean;
  locked: boolean;
}

interface CourseData {
  id: string;
  title: string;
  instructor: string;
  description: string;
  totalLessons: number;
  duration: string;
  videos: Video[];
}

const CourseView: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);

  useEffect(() => {
    // Load course data based on courseId
    const getCourseData = (): CourseData => {
      const coursesMap: { [key: string]: CourseData } = {
        'web-101': {
          id: 'web-101',
          title: 'JavaScript Fundamentals',
          instructor: 'Amit Verma',
          description: 'Learn JavaScript from scratch - variables, functions, DOM manipulation, and ES6+',
          totalLessons: 8,
          duration: '4 weeks',
          videos: [
            {
              id: 1,
              title: 'Introduction to JavaScript',
              duration: '15:30',
              videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
              thumbnail: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 2,
              title: 'Variables and Data Types',
              duration: '18:45',
              videoUrl: 'https://www.youtube.com/embed/7GvF7vkQzNc',
              thumbnail: 'https://img.youtube.com/vi/7GvF7vkQzNc/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 3,
              title: 'Functions in JavaScript',
              duration: '22:10',
              videoUrl: 'https://www.youtube.com/embed/N8ap4k_1QEQ',
              thumbnail: 'https://img.youtube.com/vi/N8ap4k_1QEQ/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 4,
              title: 'Arrays and Objects',
              duration: '25:20',
              videoUrl: 'https://www.youtube.com/embed/W-mQWq6HMMw',
              thumbnail: 'https://img.youtube.com/vi/W-mQWq6HMMw/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 5,
              title: 'DOM Manipulation',
              duration: '28:15',
              videoUrl: 'https://www.youtube.com/embed/5fb2aPlgoys',
              thumbnail: 'https://img.youtube.com/vi/5fb2aPlgoys/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 6,
              title: 'ES6 Features',
              duration: '20:40',
              videoUrl: 'https://www.youtube.com/embed/NCwa_xi0Uuc',
              thumbnail: 'https://img.youtube.com/vi/NCwa_xi0Uuc/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 7,
              title: 'Asynchronous JavaScript',
              duration: '30:25',
              videoUrl: 'https://www.youtube.com/embed/PoRJizFvM7s',
              thumbnail: 'https://img.youtube.com/vi/PoRJizFvM7s/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 8,
              title: 'Final Project - Todo App',
              duration: '35:50',
              videoUrl: 'https://www.youtube.com/embed/Ttf3CEsEwMQ',
              thumbnail: 'https://img.youtube.com/vi/Ttf3CEsEwMQ/maxresdefault.jpg',
              completed: false,
              locked: false
            }
          ]
        },
        'web-102': {
          id: 'web-102',
          title: 'React.js Complete Guide',
          instructor: 'Sneha Rao',
          description: 'Build modern web applications with React, Hooks, Context API, and Redux',
          totalLessons: 8,
          duration: '6 weeks',
          videos: [
            {
              id: 1,
              title: 'Introduction to React',
              duration: '16:30',
              videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
              thumbnail: 'https://img.youtube.com/vi/SqcY0GlETPk/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 2,
              title: 'Components and Props',
              duration: '20:15',
              videoUrl: 'https://www.youtube.com/embed/4-iX0B01Glc',
              thumbnail: 'https://img.youtube.com/vi/4-iX0B01Glc/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 3,
              title: 'State and Lifecycle',
              duration: '22:40',
              videoUrl: 'https://www.youtube.com/embed/35lXWvCuM8o',
              thumbnail: 'https://img.youtube.com/vi/35lXWvCuM8o/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 4,
              title: 'React Hooks - useState & useEffect',
              duration: '25:20',
              videoUrl: 'https://www.youtube.com/embed/O6P86uwfdR0',
              thumbnail: 'https://img.youtube.com/vi/O6P86uwfdR0/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 5,
              title: 'Context API',
              duration: '18:50',
              videoUrl: 'https://www.youtube.com/embed/35lXWvCuM8o',
              thumbnail: 'https://img.youtube.com/vi/35lXWvCuM8o/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 6,
              title: 'React Router',
              duration: '23:10',
              videoUrl: 'https://www.youtube.com/embed/Law7wfdg_ls',
              thumbnail: 'https://img.youtube.com/vi/Law7wfdg_ls/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 7,
              title: 'Redux Basics',
              duration: '28:30',
              videoUrl: 'https://www.youtube.com/embed/poQXNp9ItL4',
              thumbnail: 'https://img.youtube.com/vi/poQXNp9ItL4/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 8,
              title: 'Building a Full React App',
              duration: '40:00',
              videoUrl: 'https://www.youtube.com/embed/b9eMGE7QtTk',
              thumbnail: 'https://img.youtube.com/vi/b9eMGE7QtTk/maxresdefault.jpg',
              completed: false,
              locked: false
            }
          ]
        },
        'web-103': {
          id: 'web-103',
          title: 'Node.js & Express Backend',
          instructor: 'Rahul Mehta',
          description: 'Create powerful REST APIs and server-side applications with Node.js',
          totalLessons: 8,
          duration: '5 weeks',
          videos: [
            {
              id: 1,
              title: 'Node.js Introduction',
              duration: '14:20',
              videoUrl: 'https://www.youtube.com/embed/TlB_eWDSMt4',
              thumbnail: 'https://img.youtube.com/vi/TlB_eWDSMt4/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 2,
              title: 'NPM and Modules',
              duration: '17:30',
              videoUrl: 'https://www.youtube.com/embed/jHDhaSSKmB0',
              thumbnail: 'https://img.youtube.com/vi/jHDhaSSKmB0/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 3,
              title: 'Express.js Setup',
              duration: '19:45',
              videoUrl: 'https://www.youtube.com/embed/L72fhGm1tfE',
              thumbnail: 'https://img.youtube.com/vi/L72fhGm1tfE/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 4,
              title: 'Building REST APIs',
              duration: '26:10',
              videoUrl: 'https://www.youtube.com/embed/pKd0Rpw7O48',
              thumbnail: 'https://img.youtube.com/vi/pKd0Rpw7O48/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 5,
              title: 'MongoDB Integration',
              duration: '22:35',
              videoUrl: 'https://www.youtube.com/embed/bhiEJW5poHU',
              thumbnail: 'https://img.youtube.com/vi/bhiEJW5poHU/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 6,
              title: 'Authentication with JWT',
              duration: '28:50',
              videoUrl: 'https://www.youtube.com/embed/mbsmsi7l3r4',
              thumbnail: 'https://img.youtube.com/vi/mbsmsi7l3r4/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 7,
              title: 'File Upload & Validation',
              duration: '20:15',
              videoUrl: 'https://www.youtube.com/embed/wIOpe8S2Mk8',
              thumbnail: 'https://img.youtube.com/vi/wIOpe8S2Mk8/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 8,
              title: 'Deployment & Best Practices',
              duration: '24:40',
              videoUrl: 'https://www.youtube.com/embed/l134cBAJCuc',
              thumbnail: 'https://img.youtube.com/vi/l134cBAJCuc/maxresdefault.jpg',
              completed: false,
              locked: false
            }
          ]
        },
        'web-104': {
          id: 'web-104',
          title: 'Full Stack Development',
          instructor: 'Neha Gupta',
          description: 'Become a full stack developer with MERN stack',
          totalLessons: 8,
          duration: '12 weeks',
          videos: [
            {
              id: 1,
              title: 'MERN Stack Introduction',
              duration: '18:30',
              videoUrl: 'https://www.youtube.com/embed/7CqJlxBYj-M',
              thumbnail: 'https://img.youtube.com/vi/7CqJlxBYj-M/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 2,
              title: 'MongoDB Setup & Basics',
              duration: '22:15',
              videoUrl: 'https://www.youtube.com/embed/ExcRbA7fy_A',
              thumbnail: 'https://img.youtube.com/vi/ExcRbA7fy_A/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 3,
              title: 'Express Backend Development',
              duration: '28:40',
              videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE',
              thumbnail: 'https://img.youtube.com/vi/Oe421EPjeBE/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 4,
              title: 'React Frontend Setup',
              duration: '24:20',
              videoUrl: 'https://www.youtube.com/embed/w7ejDZ8SWv8',
              thumbnail: 'https://img.youtube.com/vi/w7ejDZ8SWv8/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 5,
              title: 'Connecting Frontend & Backend',
              duration: '30:50',
              videoUrl: 'https://www.youtube.com/embed/98BzS5Oz5E4',
              thumbnail: 'https://img.youtube.com/vi/98BzS5Oz5E4/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 6,
              title: 'User Authentication System',
              duration: '32:10',
              videoUrl: 'https://www.youtube.com/embed/b9eMGE7QtTk',
              thumbnail: 'https://img.youtube.com/vi/b9eMGE7QtTk/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 7,
              title: 'CRUD Operations',
              duration: '26:35',
              videoUrl: 'https://www.youtube.com/embed/fgTGADljAeg',
              thumbnail: 'https://img.youtube.com/vi/fgTGADljAeg/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 8,
              title: 'Full Stack Project Deployment',
              duration: '35:00',
              videoUrl: 'https://www.youtube.com/embed/l134cBAJCuc',
              thumbnail: 'https://img.youtube.com/vi/l134cBAJCuc/maxresdefault.jpg',
              completed: false,
              locked: false
            }
          ]
        },
        'web-105': {
          id: 'web-105',
          title: 'Tailwind CSS Mastery',
          instructor: 'Karan Sharma',
          description: 'Design beautiful, responsive websites with Tailwind CSS',
          totalLessons: 8,
          duration: '3 weeks',
          videos: [
            {
              id: 1,
              title: 'Tailwind CSS Introduction',
              duration: '12:30',
              videoUrl: 'https://www.youtube.com/embed/UBOj6rqRUME',
              thumbnail: 'https://img.youtube.com/vi/UBOj6rqRUME/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 2,
              title: 'Setup & Configuration',
              duration: '15:20',
              videoUrl: 'https://www.youtube.com/embed/dFgzHOX84xQ',
              thumbnail: 'https://img.youtube.com/vi/dFgzHOX84xQ/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 3,
              title: 'Utility Classes Basics',
              duration: '18:45',
              videoUrl: 'https://www.youtube.com/embed/mr15Xzb1Ook',
              thumbnail: 'https://img.youtube.com/vi/mr15Xzb1Ook/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 4,
              title: 'Responsive Design',
              duration: '20:10',
              videoUrl: 'https://www.youtube.com/embed/8eQwgc9nc64',
              thumbnail: 'https://img.youtube.com/vi/8eQwgc9nc64/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 5,
              title: 'Flexbox & Grid',
              duration: '22:30',
              videoUrl: 'https://www.youtube.com/embed/P8gZtz9o8n4',
              thumbnail: 'https://img.youtube.com/vi/P8gZtz9o8n4/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 6,
              title: 'Custom Components',
              duration: '19:15',
              videoUrl: 'https://www.youtube.com/embed/pfaSUYaSgRo',
              thumbnail: 'https://img.youtube.com/vi/pfaSUYaSgRo/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 7,
              title: 'Dark Mode & Themes',
              duration: '16:40',
              videoUrl: 'https://www.youtube.com/embed/MAtaT8BZEAo',
              thumbnail: 'https://img.youtube.com/vi/MAtaT8BZEAo/maxresdefault.jpg',
              completed: false,
              locked: false
            },
            {
              id: 8,
              title: 'Build a Landing Page',
              duration: '28:50',
              videoUrl: 'https://www.youtube.com/embed/dFgzHOX84xQ',
              thumbnail: 'https://img.youtube.com/vi/dFgzHOX84xQ/maxresdefault.jpg',
              completed: false,
              locked: false
            }
          ]
        }
      };

      return coursesMap[courseId || 'web-101'] || coursesMap['web-101'];
    };

    const data = getCourseData();
    setCourseData(data);
    setCurrentVideo(data.videos[0]);
  }, [courseId]);

  if (!courseData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const completedCount = courseData.videos.filter(v => v.completed).length;
  const progressPercentage = Math.round((completedCount / courseData.totalLessons) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard/courses')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back to Courses</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{courseData.title}</h1>
                <p className="text-sm text-gray-500">by {courseData.instructor}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Your Progress</p>
                <p className="text-lg font-bold" style={{ color: '#00ADB5' }}>{progressPercentage}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {currentVideo && (
                <>
                  <div className="aspect-video bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={currentVideo.videoUrl}
                      title={currentVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                        Lesson {currentVideo.id}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {currentVideo.duration}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{currentVideo.title}</h2>
                    <p className="text-gray-600 mb-6">{courseData.description}</p>
                    
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Resources</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Share</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Playlist */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="p-4 border-b" style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4d4 100%)' }}>
                <div className="flex items-center justify-between text-white">
                  <h3 className="font-bold text-lg">Course Content</h3>
                  <span className="text-sm">{completedCount}/{courseData.totalLessons}</span>
                </div>
                <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {courseData.videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => !video.locked && setCurrentVideo(video)}
                    disabled={video.locked}
                    className={`w-full p-4 text-left border-b hover:bg-gray-50 transition ${
                      currentVideo?.id === video.id ? 'bg-cyan-50 border-l-4' : ''
                    } ${video.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      borderLeftColor: currentVideo?.id === video.id ? '#00ADB5' : 'transparent'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-24 h-14 object-cover rounded"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
                          {video.locked ? (
                            <Lock className="w-5 h-5 text-white" />
                          ) : video.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <PlayCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Lesson {index + 1}</p>
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{video.duration}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
