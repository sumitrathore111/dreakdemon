import { ArrowRight, Award, BookOpen, CheckCircle, ClipboardList, Code, Coins, Compass, FolderOpen, Gift, Globe, History, Lightbulb, MessageCircle, RefreshCw, Rocket, Search, ShoppingBag, Sparkles, Swords, Target, Trophy, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NextStepDocumentation = () => {
  type DocSection = 'getting-started' | 'creator-corner' | 'codearena' | 'project-bazaar' | 'courses';
  const [activeSection, setActiveSection] = useState<DocSection>('getting-started');
  const navigate = useNavigate();

  const navItems: { id: DocSection; icon: any; label: string; gradient: string; description: string }[] = [
    { id: 'getting-started', icon: Compass, label: 'Getting Started', gradient: 'from-blue-500 to-cyan-500', description: 'Begin your journey' },
    { id: 'creator-corner', icon: Lightbulb, label: 'Creator Corner', gradient: 'from-purple-500 to-pink-500', description: 'Collaborate & build' },
    { id: 'codearena', icon: Swords, label: 'CodeArena', gradient: 'from-orange-500 to-red-500', description: 'Battle & earn coins' },
    { id: 'project-bazaar', icon: ShoppingBag, label: 'Project Bazaar', gradient: 'from-emerald-500 to-teal-500', description: 'Buy & sell projects' },
    { id: 'courses', icon: BookOpen, label: 'Courses', gradient: 'from-indigo-500 to-purple-500', description: 'Learn & grow' },
  ];

  const content = {
    'getting-started': {
      title: 'Getting Started with NextStep',
      icon: Compass,
      gradient: 'from-blue-500 to-cyan-500',
      sections: [
        {
          heading: '🌟 Welcome to NextStep',
          text: 'NextStep is the ultimate platform for developers who want to level up! Whether you\'re a beginner starting your coding journey or an experienced developer looking to sharpen your skills, NextStep has everything you need.\n\n🎮 Battle in CodeArena & earn coins\n💡 Collaborate on exciting projects\n🛒 Buy & sell templates in Project Bazaar\n📚 Learn from curated courses\n🏆 Earn certificates & climb leaderboards',
          image: '🌟'
        },
        {
          heading: '🚀 Quick Start Guide',
          text: '1️⃣ Create Your Account\nSign up and receive 1000 welcome coins instantly!\n\n2️⃣ Complete Your Profile\nAdd your skills, interests, and goals to get personalized recommendations.\n\n3️⃣ Explore the Platform\n• CodeArena: Battle 1v1 and win coins\n• Creator Corner: Join or create project teams\n• Project Bazaar: Buy templates or sell your work\n• Courses: Learn new technologies\n\n4️⃣ Start Your Journey\nJump into battles, join projects, or start learning!',
          image: '🚀'
        },
        {
          heading: '💰 Coins & Rewards System',
          text: 'Coins are the heart of NextStep! Earn and use them across the platform.\n\n💎 How to Earn Coins:\n• 🎁 1000 coins on signup (Welcome Bonus)\n• ⚔️ Win 1v1 coding battles (50-500 coins)\n• ✅ Solve practice problems (10-100 coins)\n• 🔥 Daily login streaks (25-200 coins)\n• 🏆 Leaderboard positions (500-5000 coins)\n\n🛒 Use Coins For:\n• Enter premium battles\n• Purchase from Project Bazaar\n• Unlock exclusive features',
          image: '💰'
        },
        {
          heading: '🎯 Platform Features at a Glance',
          text: '⚔️ CodeArena\nReal-time 1v1 coding battles, global rankings, rematch system, and 3000+ practice problems.\n\n💡 Creator Corner\nPost project ideas, find collaborators, assign tasks, team chat, and earn verified certificates after 50 tasks.\n\n🛒 Project Bazaar\nBuy premium templates, UI components, and complete projects. Sell your creations with 80% revenue share!\n\n📚 Courses\nCurated learning paths, video tutorials, interactive challenges, and skill certifications.',
          image: '🎯'
        },
        {
          heading: '🏅 Achievements & Certificates',
          text: 'Your progress is rewarded at every step!\n\n🎖️ Badges & Ranks:\n• Bronze → Silver → Gold → Platinum → Legendary\n• Unlock special badges for milestones\n• Showcase achievements on your profile\n\n📜 Verified Certificates:\n• Complete 50 tasks in Creator Corner\n• Download and share on LinkedIn\n• QR code verification for authenticity\n\n👑 Leaderboard Glory:\n• Compete globally and regionally\n• Weekly & monthly champions\n• Exclusive rewards for top performers',
          image: '🏅'
        },
        {
          heading: '🤝 Join Our Community',
          text: 'NextStep is more than a platform - it\'s a community of passionate developers!\n\n🌍 What You Get:\n• Connect with 12,000+ active developers\n• Find mentors and collaborators\n• Share knowledge and learn together\n• Participate in community events\n• Get help when you\'re stuck\n\n🚀 Ready to begin?\nCreate your account now and take your first step towards becoming a better developer!',
          image: '🤝'
        }
      ]
    },
    'creator-corner': {
      title: 'Creator Corner - Collaborate & Build Together',
      icon: Lightbulb,
      gradient: 'from-purple-500 to-pink-500',
      sections: [
        {
          heading: '💡 Turn Your Ideas Into Reality',
          text: 'Have a brilliant project idea but no team to build it? Creator Corner is your gateway to finding passionate collaborators! Register your project idea and let talented developers join your mission.\n\n• Post your project ideas with detailed descriptions\n• Set required skills and team size\n• Attract collaborators from our global community\n• Build your dream team without any hassle\n• Transform concepts into working products together',
          image: '💡'
        },
        {
          heading: '🔍 Browse Projects - Find Your Next Adventure',
          text: 'Explore hundreds of exciting project ideas submitted by creators worldwide! Filter by technology, difficulty, or domain to find projects that match your interests.\n\n• Discover innovative project ideas daily\n• Filter by tech stack (React, Node, Python, etc.)\n• See project requirements and team openings\n• Apply to join projects that excite you\n• Learn by working on real-world applications\n• Build your portfolio with diverse projects',
          image: '🔍'
        },
        {
          heading: '✅ Tasks Completed - Track Your Contributions',
          text: 'Every contribution counts! Track your completed tasks across all projects and watch your progress grow. Complete 50 verified tasks to unlock your Verified Certificate!\n\n🏆 Milestone Rewards:\n• 10 Tasks: Bronze Collaborator Badge\n• 25 Tasks: Silver Collaborator Badge\n• 50 Tasks: 🎓 Verified Certificate + Gold Badge\n• 100 Tasks: Platinum Expert Badge\n• 200 Tasks: Diamond Legend Badge\n\n📜 Your Verified Certificate can be downloaded from your profile and shared on LinkedIn!',
          image: '✅'
        },
        {
          heading: '📁 My Projects - Manage Your Creations',
          text: 'Take full control of your project ideas! Create, edit, and manage all your projects from one centralized dashboard.\n\n• Create new project ideas with rich descriptions\n• Edit project details and requirements anytime\n• Delete projects that are no longer active\n• Assign tasks to collaborators\n• Track team progress and contributions\n• Review and approve completed tasks\n• Communicate with your team seamlessly',
          image: '📁'
        },
        {
          heading: '💬 Team Chat - Seamless Communication',
          text: 'Stay connected with your team through built-in real-time chat! Discuss ideas, share resources, and coordinate tasks without leaving the platform.\n\n• Real-time messaging with team members\n• Share code snippets and files\n• Create task-specific discussion threads\n• Get notifications for important updates\n• Voice and video call integration (coming soon)\n• Keep all project communication in one place',
          image: '💬'
        },
        {
          heading: '🎓 Earn Your Verified Certificate',
          text: 'Your hard work deserves recognition! Complete 50 verified tasks across any projects to earn your official NextStep Verified Collaborator Certificate.\n\n📋 Certificate Includes:\n• Your name and profile photo\n• Total tasks completed\n• Projects contributed to\n• Skills demonstrated\n• Unique verification QR code\n• Shareable LinkedIn badge\n\n🌟 This certificate validates your real-world collaboration experience!',
          image: '🎓'
        }
      ]
    },
    'codearena': {
      title: 'CodeArena - Battle, Win & Conquer',
      icon: Swords,
      gradient: 'from-orange-500 to-red-500',
      sections: [
        {
          heading: '⚔️ Epic 1v1 Coding Battles',
          text: 'Enter the arena and face developers from around the world in thrilling 1v1 coding duels! Solve problems faster and more accurately than your opponent to claim victory and earn coins.\n\n• Real-time head-to-head battles\n• Matched with opponents of similar skill\n• Time-limited challenges add intensity\n• Watch your opponent\'s progress live\n• Winner takes the coin reward\n• Improve your problem-solving speed',
          image: '⚔️'
        },
        {
          heading: '🎁 1000 Coins Welcome Bonus',
          text: 'Start your CodeArena journey with a bang! Every new user receives 1000 coins instantly upon registration. Use these coins to enter battles, unlock premium features, and start building your empire!\n\n💰 Ways to Earn More Coins:\n• 🏆 Win 1v1 Battles: 50-500 coins\n• ✅ Solve Practice Problems: 10-100 coins\n• 🔥 Daily Login Streak: 25-200 coins\n• 🎯 Complete Challenges: 100-1000 coins\n• 👑 Leaderboard Positions: 500-5000 coins\n• 🔄 Rematch Victories: 2x coin bonus',
          image: '🎁'
        },
        {
          heading: '🌍 Global Rankings & Leaderboards',
          text: 'Climb the ranks and establish your dominance on the global leaderboard! Compete with the best coders worldwide and prove your skills.\n\n🏅 Ranking Tiers:\n• 🥉 Bronze: 0-1000 rating\n• 🥈 Silver: 1000-1500 rating\n• 🥇 Gold: 1500-2000 rating\n• 💎 Platinum: 2000-2500 rating\n• 👑 Legendary: 2500+ rating\n\n📊 Features:\n• Real-time global rankings\n• Weekly & monthly champions\n• Country-wise leaderboards\n• Exclusive badges for top 100',
          image: '🌍'
        },
        {
          heading: '📜 Battle History & Rematch',
          text: 'Every battle is recorded! Review your past performances, analyze your strategies, and challenge opponents to a rematch for redemption or glory.\n\n• Complete battle history with details\n• View opponent\'s profile and stats\n• One-click rematch request\n• Analyze time taken per problem\n• See winning/losing patterns\n• Track your improvement over time\n• Share epic battle moments',
          image: '📜'
        },
        {
          heading: '🔄 Rematch System',
          text: 'Lost a close battle? Want to prove it was a fluke? Challenge your opponent to a rematch instantly!\n\n• Send rematch request after any battle\n• Opponent has 24 hours to accept\n• 2x coin bonus for rematch victories\n• Build rivalries and track head-to-head stats\n• Prove your improvement over time\n• Special "Revenge Victory" badge available',
          image: '🔄'
        },
        {
          heading: '💪 Practice Arena - 3000+ Problems',
          text: 'Sharpen your skills with our massive collection of 3000+ DSA problems! Practice makes perfect, and every solved problem earns you coins.\n\n📚 Problem Categories:\n• Arrays & Strings: 500+ problems\n• Linked Lists & Stacks: 300+ problems\n• Trees & Graphs: 400+ problems\n• Dynamic Programming: 350+ problems\n• Sorting & Searching: 250+ problems\n• Math & Logic: 300+ problems\n• And many more!\n\n💰 Earn 10-100 coins per problem based on difficulty!',
          image: '💪'
        },
        {
          heading: '🏆 Rewards & Achievements',
          text: 'Unlock exclusive rewards and showcase your achievements! From coins to badges to special titles, your hard work is always recognized.\n\n🎖️ Achievement Categories:\n• Battle Victories (10, 50, 100, 500 wins)\n• Practice Streaks (7, 30, 100 days)\n• Problem Mastery (Easy, Medium, Hard expert)\n• Leaderboard Positions (Top 100, 50, 10)\n• Special Event Champions\n• Community Contributor badges',
          image: '🏆'
        }
      ]
    },
    'project-bazaar': {
      title: 'Project Bazaar - Buy, Sell & Trade',
      icon: ShoppingBag,
      gradient: 'from-emerald-500 to-teal-500',
      sections: [
        {
          heading: '🛒 Your Marketplace for Digital Assets',
          text: 'Welcome to Project Bazaar - the ultimate marketplace for developers! Buy and sell templates, complete projects, UI components, and much more. Turn your creations into income or find the perfect starting point for your next project.\n\n• Browse thousands of digital products\n• Secure payment and instant delivery\n• Quality-verified listings\n• Direct creator support\n• Fair pricing for all skill levels',
          image: '🛒'
        },
        {
          heading: '🎨 Premium Templates & Themes',
          text: 'Find stunning templates for every framework and use case! From React dashboards to landing pages, we\'ve got you covered.\n\n📦 Available Templates:\n• React/Next.js Templates\n• Vue.js & Nuxt Templates\n• Admin Dashboards\n• E-commerce Themes\n• Portfolio Templates\n• SaaS Starter Kits\n• Mobile App Templates\n• Email Templates',
          image: '🎨'
        },
        {
          heading: '🧩 UI Components & Libraries',
          text: 'Speed up your development with ready-to-use UI components! Copy, paste, and customize beautiful components for your projects.\n\n• Button Collections\n• Form Components\n• Navigation Bars\n• Card Layouts\n• Modal & Dialog Systems\n• Animation Libraries\n• Icon Packs\n• Chart & Graph Components',
          image: '🧩'
        },
        {
          heading: '📦 Complete Project Solutions',
          text: 'Need a head start? Purchase complete, production-ready projects and customize them to your needs. Save weeks of development time!\n\n🚀 Project Categories:\n• Full-Stack Web Apps\n• Mobile Applications\n• API & Backend Systems\n• E-commerce Solutions\n• Social Media Clones\n• Management Systems\n• Portfolio Websites\n• Blog Platforms',
          image: '📦'
        },
        {
          heading: '💵 Sell Your Creations',
          text: 'Turn your side projects into passive income! List your templates, components, or complete projects on the bazaar and earn money while you sleep.\n\n🎯 Why Sell on Bazaar:\n• Set your own prices\n• 80% revenue share (highest in industry)\n• Global audience of developers\n• Easy listing process\n• Analytics dashboard\n• Instant payouts\n• Build your brand as a creator',
          image: '💵'
        },
        {
          heading: '⭐ Quality Guarantee',
          text: 'Every product on Project Bazaar goes through a quality review process. We ensure all listings meet our standards for code quality, documentation, and support.\n\n✅ Our Promise:\n• Code quality verification\n• Documentation requirements\n• Regular security checks\n• Buyer protection policy\n• Refund guarantee for issues\n• Direct creator messaging\n• Community reviews & ratings',
          image: '⭐'
        }
      ]
    },
    'courses': {
      title: 'Courses - Learn & Master New Skills',
      icon: BookOpen,
      gradient: 'from-indigo-500 to-purple-500',
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
    }
  };

  const activeContent = content[activeSection as keyof typeof content];
  const ActiveIcon = activeContent.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 dark:from-blue-600/10 dark:to-cyan-600/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/10 dark:from-cyan-600/10 dark:to-blue-600/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/15 to-pink-400/10 dark:from-purple-600/10 dark:to-pink-600/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 lg:pt-28 pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 shadow-lg mb-6">
              <Sparkles className="w-4 h-4 text-[#00ADB5]" />
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">📚 NextStep Documentation</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
              Your Complete Guide to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ADB5] to-cyan-600">NextStep</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              Explore our features, master the platform, and accelerate your developer journey
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-12">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`group relative p-4 sm:p-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                    isActive
                      ? `bg-gradient-to-br ${item.gradient} text-white shadow-xl scale-105`
                      : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-[#00ADB5]/50 hover:shadow-xl'
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                    isActive ? 'bg-white/20' : `bg-gradient-to-br ${item.gradient} text-white`
                  }`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className={`font-bold text-sm sm:text-base mb-1 ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {item.label}
                  </h3>
                  <p className={`text-xs hidden sm:block ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {item.description}
                  </p>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Section Header */}
          <div className="mb-8">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${activeContent.gradient} text-white shadow-xl mb-4`}>
              <ActiveIcon className="w-6 h-6" />
              <span className="font-bold text-lg">{activeContent.title}</span>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-[#00ADB5] to-cyan-600 rounded-full"></div>
          </div>

          {/* Special Banners */}
          {activeSection === 'codearena' && (
            <div className="mb-8 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black">🎁 1000 Coins Welcome Bonus!</h3>
                  <p className="text-white/90 font-medium">Join CodeArena and receive 1000 coins instantly to start your battles</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">1v1 Battles</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">Rematch</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">Global Ranking</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <Code className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">3000+ DSA</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'creator-corner' && (
            <div className="mb-8 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black">🚀 Build Together, Grow Together!</h3>
                  <p className="text-white/90 font-medium">Find collaborators, build amazing projects, and earn your Verified Certificate</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">Browse Projects</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">Track Tasks</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">My Projects</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">Get Certified</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'project-bazaar' && (
            <div className="mb-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black">💰 Turn Code Into Cash!</h3>
                  <p className="text-white/90 font-medium">Buy premium templates or sell your creations to thousands of developers</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">Templates</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">Projects</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <Code className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">Components</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">80% Revenue</span>
                </div>
              </div>
            </div>
          )}

          {/* Content Sections */}
          <div className="grid gap-6">
            {activeContent.sections.map((section: { heading: string; text: string; image: string }, index: number) => (
              <div
                key={index}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-6 sm:p-8 hover:border-[#00ADB5]/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">{section.image}</div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-[#00ADB5] transition-colors duration-300">
                      {section.heading}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-medium text-sm sm:text-base">{section.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Features for Creator Corner */}
          {activeSection === 'creator-corner' && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 text-center">
                <Search className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                <h3 className="font-black text-lg text-gray-900 dark:text-white mb-2">Browse Projects</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Discover exciting project ideas from creators worldwide</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20 border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                <h3 className="font-black text-lg text-gray-900 dark:text-white mb-2">Tasks Completed</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress & earn certificate at 50 tasks</p>
              </div>
              <div className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20 border-2 border-rose-200 dark:border-rose-800 rounded-2xl p-6 text-center">
                <FolderOpen className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h3 className="font-black text-lg text-gray-900 dark:text-white mb-2">My Projects</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create, edit & manage your project ideas</p>
              </div>
            </div>
          )}

          {/* Certificate Preview for Creator Corner */}
          {activeSection === 'creator-corner' && (
            <div className="mt-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">🎓 Your Verified Certificate</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Complete 50 tasks to unlock this certificate</p>
              </div>
              
              {/* Certificate Card */}
              <div className="relative max-w-2xl mx-auto">
                {/* Decorative glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-rose-500/30 blur-3xl -z-10" />
                
                {/* Certificate */}
                <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-4 border-amber-400 dark:border-amber-600 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-amber-500 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-amber-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-amber-500 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-amber-500 rounded-br-xl" />
                  
                  {/* Watermark pattern */}
                  <div className="absolute inset-0 opacity-5 dark:opacity-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] font-black text-amber-900 dark:text-amber-400 select-none">
                      NS
                    </div>
                  </div>
                  
                  <div className="relative text-center">
                    {/* Logo & Header */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                      {/* NextStep Logo */}
                      <div className="relative">
                        <img 
                          src="https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg" 
                          alt="NextStep Logo"
                          className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ADB5] to-cyan-600">NextStep</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Building Tomorrow's Developers</p>
                      </div>
                    </div>
                    
                    <h4 className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-bold tracking-[0.3em] uppercase mb-4">Certificate of Achievement</h4>
                    
                    <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">This is to certify that</p>
                    
                    {/* Name */}
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1 font-serif italic">
                      John Doe
                    </h3>
                    
                    {/* Email */}
                    <p className="text-sm text-[#00ADB5] dark:text-cyan-400 font-medium mb-3">
                      ✉️ johndoe@example.com
                    </p>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">has successfully completed</p>
                    
                    {/* Achievement */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span>50 Verified Tasks</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      and is hereby recognized as a
                    </p>
                    
                    {/* Title */}
                    <h4 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 mb-4">
                      Verified Collaborator
                    </h4>
                    
                    <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />
                    
                    {/* Stats Row */}
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-black text-[#00ADB5]">50</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-purple-500">8</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-pink-500">5</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Skills</div>
                      </div>
                    </div>
                    
                    {/* Date & Verification */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                      <div className="text-left">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Issue Date</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">December 22, 2025</p>
                      </div>
                      
                      {/* QR Code placeholder */}
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                        <div className="grid grid-cols-3 gap-0.5">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className={`w-3 h-3 ${[0, 2, 3, 5, 6, 8].includes(i) ? 'bg-gray-800 dark:bg-gray-200' : 'bg-transparent'}`} />
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Certificate ID</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 font-mono">NS-2025-XXXXX</p>
                      </div>
                    </div>
                    
                    {/* Signature */}
                    <div className="mt-4 pt-4">
                      <div className="w-24 h-0.5 bg-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">NextStep Team</p>
                    </div>
                  </div>
                  
                  {/* Gold seal */}
                  <div className="absolute -bottom-4 -right-4 sm:bottom-4 sm:right-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-xl border-4 border-amber-300">
                      <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Download hint */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  📥 Download and share on LinkedIn to showcase your skills!
                </p>
              </div>
            </div>
          )}

          {/* Quick Features for CodeArena */}
          {activeSection === 'codearena' && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-4 text-center">
                <Swords className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">1v1 Battle</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Real-time duels</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 dark:from-red-500/20 dark:to-pink-500/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 text-center">
                <History className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Battle History</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Review & rematch</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-center">
                <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Global Rank</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Compete globally</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/20 dark:to-amber-500/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 text-center">
                <Target className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Practice</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">3000+ problems</p>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-12 relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5] via-cyan-600 to-blue-600" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            
            <div className="relative p-6 sm:p-8 lg:p-12 text-center text-white">
              <Compass className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto mb-4 sm:mb-6 animate-pulse" />
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4">Ready to Take Your Next Step?</h3>
              <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto font-medium">
                Join thousands of developers building their dream careers with NextStep.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button onClick={() => navigate('/signup')} className="group px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#00ADB5] rounded-2xl font-black text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 inline-flex items-center justify-center">
                  <span className="flex items-center gap-2">
                    Start Your Journey
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button onClick={() => navigate('/login')} className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl font-black text-base sm:text-lg hover:bg-white/20 transition-all duration-300 hover:shadow-xl">
                  Enter CodeArena
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-white mb-1">3000+</div>
                  <div className="text-xs sm:text-sm text-white/80 font-medium">DSA Problems</div>
                </div>
                <div className="w-px h-10 sm:h-12 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-white mb-1">500+</div>
                  <div className="text-xs sm:text-sm text-white/80 font-medium">Live Projects</div>
                </div>
                <div className="w-px h-10 sm:h-12 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-white mb-1">12K+</div>
                  <div className="text-xs sm:text-sm text-white/80 font-medium">Active Developers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00ADB5] to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Need Help?</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Have questions or need assistance? Our support team is here to help you succeed.</p>
              </div>
              <button onClick={() => navigate('/contact')} className="px-6 py-3 bg-gradient-to-r from-[#00ADB5] to-cyan-600 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex-shrink-0">
                Contact Support
              </button>
            </div>
          </div>

        </div>
      </div>

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