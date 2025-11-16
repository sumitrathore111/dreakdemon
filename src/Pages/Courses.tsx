import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  PlayCircle, 
  Award, 
  TrendingUp,
  Zap,
  Crown,
  Sparkles
} from 'lucide-react';
import { useDataContext } from '../Context/UserDataContext';
import { useAuth } from '../Context/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  price: number;
  originalPrice?: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  thumbnail: string;
  isPremium: boolean;
  category: 'AI' | 'Web Development';
}

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollInCourse, fetchEnrolledCourses } = useDataContext();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'AI' | 'Web Development'>('all');
  const [loading, setLoading] = useState(false);

  const handleEnroll = async (course: Course) => {
    if (!user) {
      alert('Please login to enroll');
      navigate('/login');
      return;
    }

    if (course.price === 0) {
      // Free course - direct to course page
      navigate(`/dashboard/courses/${course.id}`);
    } else {
      // Paid course - Razorpay integration
      initiatePayment(course);
    }
  };

  const initiatePayment = async (course: Course) => {
    try {
      setLoading(true);
      
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay key
          amount: course.price * 100, // Amount in paise
          currency: 'INR',
          name: 'NextStep Academy',
          description: course.title,
          image: 'https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg',
          handler: async function (response: any) {
            // Payment successful
            try {
              await enrollInCourse(course.id);
              alert(`Payment successful! You're now enrolled in ${course.title}`);
              navigate('/dashboard/courses/my-courses');
            } catch (error) {
              console.error('Error after payment:', error);
            }
          },
          prefill: {
            name: user?.displayName || '',
            email: user?.email || '',
          },
          theme: {
            color: '#00ADB5'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Premium AI Courses - ₹25 each
  const premiumCourses: Course[] = [
    {
      id: 'ai-101',
      title: 'AI & Machine Learning Fundamentals',
      description: 'Master the basics of AI and ML with hands-on projects and real-world applications',
      instructor: 'Dr. Priya Sharma',
      duration: '8 weeks',
      lessons: 45,
      students: 2340,
      rating: 4.9,
      price: 25,
      originalPrice: 999,
      level: 'Beginner',
      tags: ['AI', 'Machine Learning', 'Python'],
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
      isPremium: true,
      category: 'AI'
    },
    {
      id: 'ai-102',
      title: 'Deep Learning with TensorFlow',
      description: 'Build neural networks and deep learning models from scratch using TensorFlow',
      instructor: 'Dr. Rajesh Kumar',
      duration: '10 weeks',
      lessons: 52,
      students: 1890,
      rating: 4.8,
      price: 25,
      originalPrice: 1299,
      level: 'Intermediate',
      tags: ['Deep Learning', 'TensorFlow', 'Neural Networks'],
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
      isPremium: true,
      category: 'AI'
    },
    {
      id: 'ai-103',
      title: 'Natural Language Processing',
      description: 'Learn NLP techniques, build chatbots, and work with large language models',
      instructor: 'Dr. Anita Desai',
      duration: '6 weeks',
      lessons: 38,
      students: 1560,
      rating: 4.9,
      price: 25,
      originalPrice: 899,
      level: 'Intermediate',
      tags: ['NLP', 'Transformers', 'ChatGPT'],
      thumbnail: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80',
      isPremium: true,
      category: 'AI'
    },
    {
      id: 'ai-104',
      title: 'Computer Vision & Image Recognition',
      description: 'Master image processing, object detection, and facial recognition with OpenCV',
      instructor: 'Dr. Vikram Singh',
      duration: '7 weeks',
      lessons: 42,
      students: 1720,
      rating: 4.7,
      price: 25,
      originalPrice: 1099,
      level: 'Advanced',
      tags: ['Computer Vision', 'OpenCV', 'Image Processing'],
      thumbnail: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=80',
      isPremium: true,
      category: 'AI'
    }
  ];

  // Free Web Development Courses
  const freeCourses: Course[] = [
    {
      id: 'web-101',
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript from scratch - variables, functions, DOM manipulation, and ES6+',
      instructor: 'Amit Verma',
      duration: '4 weeks',
      lessons: 28,
      students: 5670,
      rating: 4.6,
      price: 0,
      level: 'Beginner',
      tags: ['JavaScript', 'ES6', 'Web'],
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80',
      isPremium: false,
      category: 'Web Development'
    },
    {
      id: 'web-102',
      title: 'React.js Complete Guide',
      description: 'Build modern web applications with React, Hooks, Context API, and Redux',
      instructor: 'Sneha Rao',
      duration: '6 weeks',
      lessons: 35,
      students: 4320,
      rating: 4.8,
      price: 0,
      level: 'Intermediate',
      tags: ['React', 'Hooks', 'Redux'],
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
      isPremium: false,
      category: 'Web Development'
    },
    {
      id: 'web-103',
      title: 'Node.js & Express Backend',
      description: 'Create powerful REST APIs and server-side applications with Node.js',
      instructor: 'Rahul Mehta',
      duration: '5 weeks',
      lessons: 30,
      students: 3890,
      rating: 4.5,
      price: 0,
      level: 'Intermediate',
      tags: ['Node.js', 'Express', 'MongoDB'],
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80',
      isPremium: false,
      category: 'Web Development'
    },
    {
      id: 'web-104',
      title: 'Full Stack Development',
      description: 'Become a full stack developer with MERN stack - MongoDB, Express, React, Node',
      instructor: 'Neha Gupta',
      duration: '12 weeks',
      lessons: 65,
      students: 6540,
      rating: 4.9,
      price: 0,
      level: 'Advanced',
      tags: ['MERN', 'Full Stack', 'MongoDB'],
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      isPremium: false,
      category: 'Web Development'
    },
    {
      id: 'web-105',
      title: 'Tailwind CSS Mastery',
      description: 'Design beautiful, responsive websites quickly with utility-first CSS framework',
      instructor: 'Karan Sharma',
      duration: '3 weeks',
      lessons: 20,
      students: 2890,
      rating: 4.7,
      price: 0,
      level: 'Beginner',
      tags: ['Tailwind', 'CSS', 'Design'],
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      isPremium: false,
      category: 'Web Development'
    }
  ];

  const allCourses = [...premiumCourses, ...freeCourses];
  const filteredCourses = selectedCategory === 'all' 
    ? allCourses 
    : allCourses.filter(c => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-12 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" style={{ color: '#00ADB5' }} />
            <span className="px-4 py-1.5 rounded-full text-sm border font-medium" style={{ 
              backgroundColor: 'rgba(0, 173, 181, 0.1)', 
              color: '#00ADB5',
              borderColor: 'rgba(0, 173, 181, 0.3)'
            }}>
              🎉 Special Launch Offer - AI Courses at ₹25 Only!
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: '#00ADB5' }}>
            Master Your Skills
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Premium AI courses at unbeatable prices + Free web development courses to boost your career
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl">
            {[
              { icon: Users, label: 'Students', value: '25,000+' },
              { icon: BookOpen, label: 'Courses', value: '9' },
              { icon: Award, label: 'Completion', value: '95%' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border-2 shadow-sm" style={{ borderColor: '#00ADB5' }}>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <stat.icon className="w-5 h-5" style={{ color: '#00ADB5' }} /> {stat.label}
                </div>
                <p className="text-2xl font-bold" style={{ color: '#00ADB5' }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <section className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            {['all', 'AI', 'Web Development'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`px-5 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedCategory === category ? '#00ADB5' : ''
                }}
              >
                {category === 'all' ? 'All Courses' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Premium AI Courses Section */}
      {(selectedCategory === 'all' || selectedCategory === 'AI') && (
        <section className="max-w-7xl mx-auto px-4 py-12 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div>
              <h2 className="text-3xl font-bold" style={{ color: '#00ADB5' }}>Premium AI Courses</h2>
              <p className="text-gray-600">Limited time offer - Just ₹25 each!</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {premiumCourses.map((course) => (
              <article
                key={course.id}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-yellow-400"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                    <Crown className="w-4 h-4" /> PREMIUM
                  </div>
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                    97% OFF
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                      {course.level}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{course.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                    <span className="text-gray-300">•</span>
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons} lessons</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black" style={{ color: '#00ADB5' }}>₹{course.price}</span>
                        <span className="text-gray-400 line-through text-sm">₹{course.originalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnroll(course)}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}
                  >
                    <Zap className="w-5 h-5" />
                    Enroll Now - ₹25
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Free Courses Section */}
      {(selectedCategory === 'all' || selectedCategory === 'Web Development') && (
        <section className="max-w-7xl mx-auto px-4 py-12 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8" style={{ color: '#00ADB5' }} />
            <div>
              <h2 className="text-3xl font-bold" style={{ color: '#00ADB5' }}>Free Web Development Courses</h2>
              <p className="text-gray-600">Start learning today - 100% Free!</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {freeCourses.map((course) => (
              <article
                key={course.id}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                    FREE
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {course.level}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{course.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                    <span className="text-gray-300">•</span>
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons} lessons</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEnroll(course)}
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                      <PlayCircle className="w-5 h-5" />
                      Start Free
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Courses;
