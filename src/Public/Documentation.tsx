import { ArrowRight, Award, BookOpen, Coins, Compass, Crown, Lightbulb, Menu, Settings, Sparkles, Star, Swords, Target, TrendingUp, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NextStepDocumentation = () => {
  type DocSection = 'getting-started' | 'projects' | 'codearena' | 'career-paths' | 'learning' | 'progress' | 'achievements' | 'settings';
  const [activeSection, setActiveSection] = useState<DocSection>('getting-started');
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide global footer while Documentation page is mounted
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const selectors = ['footer', '.site-footer', '#footer'];
    const els: HTMLElement[] = [];
    selectors.forEach((s) => {
      document.querySelectorAll<HTMLElement>(s).forEach((e) => els.push(e));
    });

    const originalDisplays = new Map<HTMLElement, string>();
    els.forEach((el) => {
      originalDisplays.set(el, el.style.display || '');
      el.style.display = 'none';
    });

    return () => {
      originalDisplays.forEach((display, el) => {
        el.style.display = display;
      });
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const sidebarItems: { id: DocSection; icon: any; label: string }[] = [
    { id: 'getting-started', icon: Compass, label: 'Getting Started' },
    { id: 'projects', icon: Lightbulb, label: 'Projects & Ideas' },
    { id: 'codearena', icon: Swords, label: 'CodeArena' },
    { id: 'career-paths', icon: Target, label: 'Career Paths' },
    { id: 'learning', icon: BookOpen, label: 'Courses' },

    
  ];

  const content = {
    'getting-started': {
      title: 'Getting Started with NextStep',
      sections: [
        {
          heading: 'Welcome to Your Future',
          text: 'NextStep is your personalized career companion that helps you navigate your professional journey. Whether you\'re a student exploring career options or a professional looking to upskill, we\'re here to guide your next step.',
          image: '🎯'
        },
        {
          heading: 'How It Works',
          text: '1. Create your profile and tell us about your goals\n2. Explore curated career paths tailored to your interests\n3. Access learning resources and skill-building content\n4. Battle in CodeArena and earn coins\n5. Work on real projects to build your portfolio\n6. Track your progress and celebrate achievements',
          image: '🚀'
        },
        {
          heading: 'Why Choose NextStep?',
          text: '• Personalized career roadmaps based on your goals\n• Industry-vetted learning resources and courses\n• Competitive coding battles with real rewards\n• Hands-on projects to build your portfolio\n• Community support from peers worldwide\n• AI-powered recommendations for your growth',
          image: '⭐'
        }
      ]
    },
    'codearena': {
      title: 'CodeArena - Battle & Earn',
      sections: [
        {
          heading: '⚔️ 1v1 Coding Battles',
          text: 'Challenge developers worldwide in intense 1v1 coding battles! Compete in real-time problem-solving duels where the fastest and most accurate coder wins.\n\n• Real-time competitive coding matches\n• Multiple difficulty levels (Easy, Medium, Hard)\n• Time-limited challenges (15-45 minutes)\n• Win coins for every victory\n• Lose/gain rating based on performance\n• Spectator mode to watch epic battles',
          image: '⚔️'
        },
        {
          heading: '💰 Coin System & Rewards',
          text: 'Every new user receives 1000 coins as a joining bonus! Use coins to enter premium battles and earn more through victories.\n\nHow to Earn Coins:\n• 🎁 1000 coins welcome bonus\n• 🏆 Win 1v1 battles: 50-500 coins\n• ✅ Solve practice problems: 10-100 coins\n• 🔥 Daily streak bonuses: 25-200 coins\n• 🎯 Complete challenges: 100-1000 coins\n• 👑 Top leaderboard positions: 500-5000 coins',
          image: '💰'
        },
        {
          heading: '🏆 Rankings & Leaderboards',
          text: 'Climb the global leaderboard and prove you\'re the best!\n\nRanking System:\n• 🥉 Bronze: 0-1000 rating\n• 🥈 Silver: 1000-1500 rating\n• 🥇 Gold: 1500-2000 rating\n• 💎 Platinum: 2000-2500 rating\n• 👑 Legendary: 2500+ rating\n\nFeatures:\n• Global rankings updated in real-time\n• Regional leaderboards\n• Weekly/Monthly/All-time champions\n• Special badges for top performers\n• Hall of Fame for legends',
          image: '🏆'
        },
        {
          heading: '📊 Battle History & Analytics',
          text: 'Track every battle and analyze your performance with detailed statistics.\n\nWhat You Can See:\n• Complete battle history with replays\n• Win/Loss ratio and statistics\n• Problems solved per difficulty\n• Time taken vs average time\n• Strength and weakness analysis\n• Performance graphs and trends\n• Code submission history\n• Peer comparison metrics',
          image: '📊'
        },
        {
          heading: '💪 Practice Arena',
          text: 'Sharpen your skills in the Practice Arena with thousands of curated problems!\n\n• 3000+ DSA problems across all difficulties\n• Topic-wise practice (Arrays, DP, Graphs, etc.)\n• Company-specific problem sets\n• Earn rewards for every solution\n• Get instant feedback and hints\n• View editorial solutions\n• Time yourself and compete with ghosts\n• Unlock achievements and badges',
          image: '💪'
        },
        {
          heading: '🎯 Special Events & Tournaments',
          text: 'Participate in special events for massive rewards!\n\n• Weekly tournaments with coin prizes\n• Themed challenges (String Week, DP Marathon)\n• Seasonal competitions with exclusive badges\n• Corporate sponsored contests\n• Community challenges\n• Grand championships with real prizes\n• Collaborative team battles\n• Speed coding sprints',
          image: '🎯'
        }
      ]
    },
    'career-paths': {
      title: 'Career Paths',
      sections: [
        {
          heading: 'Explore Career Options',
          text: 'Discover diverse career paths across technology, business, creative fields, and more. Each path includes detailed information about required skills, salary ranges, job market trends, and growth opportunities.',
          image: '🗺️'
        },
        {
          heading: 'Personalized Roadmaps',
          text: 'Get a customized step-by-step roadmap to achieve your career goals:\n• Skills you need to learn\n• Courses and certifications to pursue\n• Projects to build your portfolio\n• Timeline and milestones\n• Industry insights and trends',
          image: '📍'
        },
        {
          heading: 'Career Transitions',
          text: 'Planning a career change? We help you identify transferable skills, bridge knowledge gaps, and create a smooth transition plan with realistic timelines and resources.',
          image: '🔄'
        },
        {
          heading: 'Industry Insights',
          text: 'Stay updated with the latest industry trends, emerging technologies, and in-demand skills. Make informed decisions about your career direction based on real market data.',
          image: '📊'
        }
      ]
    },
    'learning': {
      title: 'Learning Resources',
      sections: [
        {
          heading: 'Curated Learning Paths',
          text: 'Access hand-picked courses, tutorials, and resources from top platforms. Each learning path is designed by industry experts to take you from beginner to professional.',
          image: '📚'
        },
        {
          heading: 'Skill Development',
          text: 'Build in-demand skills through:\n• Interactive coding challenges\n• Video tutorials and workshops\n• Live webinars with experts\n• Practice projects and assessments\n• Peer learning groups\n• Certificate programs',
          image: '💪'
        },
        {
          heading: 'Learning Tracks',
          text: 'Choose from specialized tracks like Web Development, Data Science, UI/UX Design, Digital Marketing, Business Analytics, and more. Each track includes beginner to advanced content.',
          image: '🎓'
        },
        {
          heading: 'Resource Library',
          text: 'Access our comprehensive library of articles, ebooks, cheat sheets, templates, and tools. Everything you need to accelerate your learning journey in one place.',
          image: '📖'
        }
      ]
    },
    'projects': {
      title: 'Projects & Ideas',
      sections: [
        {
          heading: 'Build Your Portfolio',
          text: 'Work on real-world projects that showcase your skills to potential employers. Each project includes requirements, starter templates, and evaluation criteria.',
          image: '🛠️'
        },
        {
          heading: 'Project Ideas',
          text: 'Get inspired by our curated project ideas across different skill levels:\n• Beginner: Landing pages, calculators, to-do apps\n• Intermediate: E-commerce sites, data dashboards, mobile apps\n• Advanced: Full-stack applications, ML models, complex systems\n\nComplete 50 verified tasks across projects to earn a Verified Certificate that you can download from your profile and share to showcase your skills.',
          image: '💡'
        },
        {
          heading: 'Collaborate & Learn',
          text: 'Join collaborative projects with other learners. Work in teams, practice agile methodologies, and experience real workplace dynamics while building impressive projects.',
          image: '🤝'
        },
        {
          heading: 'Get Feedback',
          text: 'Submit your projects for review by mentors and peers. Receive constructive feedback, improve your work, and learn best practices from experienced professionals.',
          image: '📝'
        }
      ]
    },
 
  };

  const activeContent = content[activeSection as keyof typeof content];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/30">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/15 to-pink-400/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Sidebar (desktop only) */}
      <div className={`hidden md:block bg-white/80 backdrop-blur-xl border-r border-gray-200/50 fixed top-0 bottom-0 pt-20 overflow-y-auto shadow-xl z-10 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>

        <nav className="p-2">
          <div className="mb-2 px-3">
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded hover:bg-gray-100 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              <button
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={() => setCollapsed((s) => !s)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <ArrowRight className={`w-4 h-4 transform transition-transform ${collapsed ? 'rotate-180' : ''}`} />
              </button>
              {!collapsed && (
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Navigation
                </div>
              )}
            </div>
          </div>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                title={item.label}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} ${collapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-xl mb-1 transition-all duration-300 transform ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white font-bold shadow-lg scale-105'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md font-medium'
                }`}
              >
                <Icon className="w-5 h-5" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-6 mt-4 border-t border-gray-200/50">
            <div className="bg-gradient-to-br from-[#00ADB5]/10 to-cyan-50 border-2 border-[#00ADB5]/20 rounded-2xl p-4 hover:shadow-xl transition-all duration-300">
              <BookOpen className="w-8 h-8 text-[#00ADB5] mb-2" />
              <h3 className="font-black text-gray-900 mb-1">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3 font-medium">Explore our guides and start your journey today.</p>
              <button onClick={() => navigate('/contact')} className="w-full bg-gradient-to-r from-[#00ADB5] to-cyan-600 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Get Support
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`ml-0 ${collapsed ? 'md:ml-16' : 'md:ml-56'} flex-1 p-6 md:p-8 pt-20 md:pt-24 lg:pt-28 relative z-10 transition-all duration-300`}>
        <div className="max-w-4xl mx-auto relative">
          {/* Header with Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg mb-4">
              <Sparkles className="w-4 h-4 text-[#00ADB5]" />
              <span className="text-sm font-bold text-gray-800">📚 Documentation</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2 leading-tight">
              {activeContent.title}
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#00ADB5] to-cyan-600 rounded-full"></div>
          </div>

          {/* Special CodeArena Welcome Banner */}
          {activeSection === 'codearena' && (
            <div className="mb-8 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Coins className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">🎁 Welcome Bonus!</h3>
                  <p className="text-white/90 font-medium">Get 1000 coins instantly when you join CodeArena</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold">Win Battles</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Star className="w-5 h-5" />
                  <span className="font-bold">Earn Rewards</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Crown className="w-5 h-5" />
                  <span className="font-bold">Climb Ranks</span>
                </div>
              </div>
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-6">
            {activeContent.sections.map((section: { heading: string; text: string; image: string }, index: number) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-3xl p-8 hover:border-[#00ADB5]/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className="flex items-start gap-6">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300">{section.image}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-4 group-hover:text-[#00ADB5] transition-colors duration-300">
                      {section.heading}
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line font-medium">{section.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-12 relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5] via-cyan-600 to-blue-600" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            
            <div className="relative p-8 lg:p-12 text-center text-white">
              <Compass className="w-16 h-16 text-white mx-auto mb-6 animate-pulse" />
              <h3 className="text-3xl lg:text-4xl font-black mb-4">Ready to Take Your Next Step?</h3>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto font-medium">
                Join thousands of learners building their dream careers with NextStep.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/signup')} className="group px-8 py-4 bg-white text-[#00ADB5] rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 inline-flex items-center justify-center">
                  <span className="flex items-center gap-2">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button onClick={() => navigate('/login')} className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl font-black text-lg hover:bg-white/20 transition-all duration-300 hover:shadow-xl">
                  Enter CodeArena
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">3000+</div>
                  <div className="text-sm text-white/80 font-medium">DSA Problems</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">500+</div>
                  <div className="text-sm text-white/80 font-medium">Live Projects</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">12K+</div>
                  <div className="text-sm text-white/80 font-medium">Active Developers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white/95 backdrop-blur-md p-4 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold">Navigation</div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded hover:bg-gray-100"><ArrowRight className="w-4 h-4 rotate-180" /></button>
            </div>
            <nav>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    title={item.label}
                    onClick={() => { setActiveSection(item.id); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-300 transform ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white font-bold shadow-lg scale-105'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md font-medium'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default NextStepDocumentation;