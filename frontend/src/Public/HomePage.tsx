import { ArrowRight, Award, BarChart3, BookOpen, CheckCircle, ChevronLeft, Code, Globe, Lightbulb, Map, MessageSquare, Rocket, Search, Shield, Sparkles, Star, Swords, Target, TrendingUp, Trophy, Users, Zap } from "lucide-react";
import { memo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../Component/SEO";
import { FeatureCard, TestimonialCard } from "../components/HomePage/Cards";
import { useRevealAnimation } from "../components/hooks/useRevealAnimation";
import {
  features as homePageFeatures,
  galleryImages as homePageGallery,
  testimonials as homePageTestimonials,
  statistics
} from "../data/homePageData";

// Statistics Card Component
const StatCard = memo(({ stat, index }: { stat: typeof statistics[0]; index: number }) => {
  const { ref, isVisible } = useRevealAnimation(index * 100);

  return (
    <div
      ref={ref}
      className={`group relative bg-gradient-to-br ${stat.color} rounded-3xl p-8 text-white shadow-xl transform transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
        <stat.icon className="w-16 h-16" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <stat.icon className="w-6 h-6" />
          </div>
          <TrendingUp className="w-5 h-5 text-white/80" />
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-black mb-1 group-hover:scale-110 transition-transform duration-300 origin-left">
            {stat.number}
          </div>
          <div className="text-lg font-bold text-white/90">{stat.label}</div>
          <div className="text-sm text-white/70">{stat.sublabel}</div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-white/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
});

StatCard.displayName = 'StatCard';

// Interactive Dashboard Mockup Component
const DashboardMockup = memo(() => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const sidebarItems = [
    { id: 'dashboard', icon: BarChart3, label: 'DashBoard' },
    { id: 'creator', icon: Code, label: 'Creator Corner' },
    { id: 'connect', icon: Users, label: 'Developer Connect' },
    { id: 'arena', icon: Swords, label: 'CodeArena' },
    { id: 'roadmaps', icon: Map, label: 'Learning Roadmaps' },
    { id: 'practice', icon: Target, label: 'Practice' },
    { id: 'profile', icon: Shield, label: 'Profile Info' },
  ];

  // Dashboard Content
  const DashboardContent = () => (
    <div className="p-4 space-y-4">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white text-base font-semibold flex items-center gap-2">
            Welcome back, Amit! <span className="text-lg">👋</span>
          </h3>
          <p className="text-gray-500 text-xs">Here's your progress overview</p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#151c2a] rounded-md border border-[#1a2535]">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-[#00ADB5]">Just now</span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-[#1a3a4a] to-[#0d2535] rounded-lg p-3 border border-[#00ADB5]/30">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-[#00ADB5]" />
            <span className="text-[10px] text-gray-400">Challenges Solved</span>
          </div>
          <div className="text-2xl font-bold text-white">5</div>
        </div>
        <div className="bg-gradient-to-br from-[#3a2a1a] to-[#251a0d] rounded-lg p-3 border border-yellow-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-[10px] text-gray-400">Battle Wins</span>
          </div>
          <div className="text-2xl font-bold text-white">73</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a2a3a] to-[#0d1a25] rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] text-gray-400">Projects</span>
          </div>
          <div className="text-2xl font-bold text-white">2</div>
        </div>
        <div className="bg-gradient-to-br from-[#2a1a3a] to-[#1a0d25] rounded-lg p-3 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-gray-400">Day Streak</span>
          </div>
          <div className="text-2xl font-bold text-white">0</div>
        </div>
      </div>

      {/* Problem Categories & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Problem Categories */}
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#00ADB5]" />
              <span className="text-xs text-white font-medium">Problem Categories</span>
            </div>
            <span className="text-[9px] text-[#00ADB5] cursor-pointer hover:underline">Set your targets</span>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Arrays & Strings', done: 2, total: 20, color: 'bg-blue-500' },
              { name: 'Trees & Graphs', done: 1, total: 20, color: 'bg-green-500' },
              { name: 'Dynamic Programming', done: 1, total: 20, color: 'bg-orange-500' },
              { name: 'Sorting & Searching', done: 1, total: 75, color: 'bg-blue-400' },
              { name: 'Math & Logic', done: 1, total: 100, color: 'bg-red-400' },
            ].map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 w-28 truncate">{cat.name}</span>
                <div className="flex-1 h-1 bg-[#1a2535] rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${(cat.done / cat.total) * 100}%` }} />
                </div>
                <span className="text-[9px] text-gray-500 w-12 text-right">{cat.done}/ {cat.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[#00ADB5]" />
            <span className="text-xs text-white font-medium">Performance</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400">Acceptance Rate</span>
                <span className="text-[10px] text-green-400 font-medium">100%</span>
              </div>
              <div className="h-1.5 bg-[#1a2535] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400">Projects Approved</span>
                <span className="text-[10px] text-purple-400 font-medium">100%</span>
              </div>
              <div className="h-1.5 bg-[#1a2535] rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400">Streak Goal</span>
                <span className="text-[10px] text-gray-500 font-medium">0%</span>
              </div>
              <div className="h-1.5 bg-[#1a2535] rounded-full overflow-hidden">
                <div className="h-full bg-gray-600 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Creator Corner Content
  const CreatorContent = () => (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white text-base font-semibold">Project Collaboration Hub</h3>
          <p className="text-[10px] text-gray-500">Join exciting projects or submit your own idea</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ADB5] text-white text-[10px] rounded-md">
          <Lightbulb className="w-3 h-3" />
          Submit Your Idea
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#00ADB5] text-white text-[10px] rounded-md">
          <Search className="w-3 h-3" />
          Browse Projects
        </button>
        <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
          <Lightbulb className="w-3 h-3" />
          Tasks Completed
          <span className="px-1.5 py-0.5 bg-[#00ADB5]/20 text-[#00ADB5] rounded-full text-[9px]">12</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
          <Code className="w-3 h-3" />
          My Projects
          <span className="px-1.5 py-0.5 bg-[#00ADB5]/20 text-[#00ADB5] rounded-full text-[9px]">2</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#151c2a] rounded-md border border-[#1a2535]">
          <Search className="w-3 h-3 text-gray-500" />
          <span className="text-[10px] text-gray-500">Search projects...</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151c2a] rounded-md border border-[#1a2535]">
          <span className="text-[10px] text-white">All</span>
          <ChevronLeft className="w-3 h-3 text-gray-500 rotate-[-90deg]" />
        </div>
      </div>

      {/* Project Count & Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <span>▼</span>
          <span className="text-[#00ADB5]">7</span>
          <span>projects available</span>
        </div>
        <div className="flex items-center gap-1.5">
          {['Trending', 'Popular', 'Recent'].map((filter, idx) => (
            <button key={idx} className="px-2 py-1 text-[9px] text-gray-400 bg-[#151c2a] rounded border border-[#1a2535] hover:text-white">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Project 1 */}
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-xs text-white font-semibold">AI-Powered Resume Screening Sy...</h4>
            <span className="text-[8px] px-2 py-0.5 bg-[#00ADB5]/20 text-[#00ADB5] rounded border border-[#00ADB5]/40">Active</span>
          </div>
          <p className="text-[9px] text-gray-500 mb-2 leading-relaxed">An intelligent resume screening application that automates the candidate evaluation process...</p>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-gray-500">Progress</span>
              <span className="text-[9px] text-[#00ADB5]">0%</span>
            </div>
            <div className="h-1 bg-[#1a2535] rounded-full overflow-hidden">
              <div className="h-full bg-gray-600 rounded-full" style={{ width: '0%' }} />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[8px] px-2 py-0.5 bg-[#1a2535] text-gray-400 rounded border border-[#252d3d]">AI/ML</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#1a2535]">
            <div className="flex items-center gap-3 text-[9px] text-gray-500">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 1</span>
              <span>📅 2/16/2026</span>
            </div>
            <div className="flex gap-1.5">
              <button className="px-2 py-1 text-[8px] text-[#00ADB5] border border-[#00ADB5]/40 rounded hover:bg-[#00ADB5]/10">Show Details</button>
              <button className="px-2 py-1 text-[8px] bg-[#00ADB5] text-white rounded">Request to Join</button>
            </div>
          </div>
        </div>

        {/* Project 2 */}
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-xs text-white font-semibold">Travel mobile app</h4>
              <p className="text-[9px] text-gray-500">Mobile app</p>
            </div>
            <span className="text-[8px] px-2 py-0.5 bg-[#00ADB5]/20 text-[#00ADB5] rounded border border-[#00ADB5]/40">Active</span>
          </div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-gray-500">Progress</span>
              <span className="text-[9px] text-[#00ADB5]">0%</span>
            </div>
            <div className="h-1 bg-[#1a2535] rounded-full overflow-hidden">
              <div className="h-full bg-gray-600 rounded-full" style={{ width: '0%' }} />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[8px] px-2 py-0.5 bg-[#1a2535] text-gray-400 rounded border border-[#252d3d]">Mobile App</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#1a2535]">
            <div className="flex items-center gap-3 text-[9px] text-gray-500">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 3</span>
              <span>📅 2/7/2026</span>
            </div>
            <div className="flex gap-1.5">
              <button className="px-2 py-1 text-[8px] text-[#00ADB5] border border-[#00ADB5]/40 rounded hover:bg-[#00ADB5]/10">Show Details</button>
              <button className="px-2 py-1 text-[8px] bg-green-500 text-white rounded">Open Workspace</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Developer Connect Content
  const ConnectContent = () => (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div>
        <h3 className="text-[#00ADB5] text-base font-semibold flex items-center gap-2">
          Developer Connect <span className="text-lg">🤝</span>
        </h3>
        <p className="text-[10px] text-gray-500">Find teammates, build together, grow your network</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#1a2535] pb-2">
        <button className="flex items-center gap-1.5 text-[10px] text-[#00ADB5] border-b-2 border-[#00ADB5] pb-1">
          <Code className="w-3 h-3" />
          Developer Directory
        </button>
        <button className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300">
          <MessageSquare className="w-3 h-3" />
          Messages
        </button>
        <button className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300">
          <Users className="w-3 h-3" />
          Study Groups
        </button>
        <button className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300">
          <Star className="w-3 h-3" />
          Tech Reviews
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#151c2a] rounded-md border border-[#1a2535]">
          <Search className="w-3 h-3 text-gray-500" />
          <span className="text-[10px] text-gray-500">Search developers by name or skills...</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151c2a] rounded-md border border-[#1a2535]">
          <span className="text-[10px] text-white">All Skills</span>
          <ChevronLeft className="w-3 h-3 text-gray-500 rotate-[-90deg]" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151c2a] rounded-md border border-[#1a2535]">
          <span className="text-[10px] text-white">Looking For</span>
          <ChevronLeft className="w-3 h-3 text-gray-500 rotate-[-90deg]" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151c2a] rounded-md border border-[#1a2535]">
          <Trophy className="w-3 h-3 text-yellow-500" />
          <span className="text-[10px] text-white">Top Ranked</span>
          <ChevronLeft className="w-3 h-3 text-gray-500 rotate-[-90deg]" />
        </div>
      </div>

      {/* Count */}
      <p className="text-[10px] text-gray-500">Showing <span className="text-white">12</span> of <span className="text-white">42</span> developers</p>

      {/* Developer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Card 1 - Current User */}
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#00ADB5]/50 relative">
          <div className="absolute -top-2 left-3">
            <span className="text-[8px] px-2 py-0.5 bg-yellow-500 text-gray-900 rounded-full flex items-center gap-1">
              <Star className="w-2 h-2" /> This is you
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-xs font-bold border-2 border-[#00ADB5]">
                Amit
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white font-semibold">Amit Sharma</span>
                </div>
                <span className="text-[9px] text-gray-500">Vision institute of technology aligarh • Student</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#00ADB5] text-[10px]">
              <TrendingUp className="w-3 h-3" />
              #1
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">passionate developer</p>
          <div className="flex items-center justify-around mt-3 py-2 bg-[#0d1420] rounded-md">
            <div className="text-center">
              <div className="text-[10px] text-gray-500">Roadmap</div>
              <div className="text-sm font-bold text-white">3</div>
              <div className="text-[8px] text-gray-600">topics</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500">CodeArena</div>
              <div className="text-sm font-bold text-white">5</div>
              <div className="text-[8px] text-gray-600">solved</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500">Creator</div>
              <div className="text-sm font-bold text-white">16</div>
              <div className="text-[8px] text-gray-600">tasks</div>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-[9px] text-gray-500">Skills</span>
            <div className="flex gap-1 mt-1 flex-wrap">
              {['react', 'python', 'Node.js'].map((skill, i) => (
                <span key={i} className="text-[8px] px-2 py-0.5 bg-[#1a2535] text-gray-300 rounded border border-[#252d3d]">{skill}</span>
              ))}
              <span className="text-[8px] px-1.5 py-0.5 bg-[#1a2535] text-gray-500 rounded">+3</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#1a2535]">
            <span className="text-[9px] text-[#00ADB5]">Open to opportunities</span>
            <p className="text-[8px] text-gray-500">Looking to connect with other developers</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">
                Vansh
              </div>
              <div>
                <span className="text-xs text-white font-semibold">Vansh</span>
                <p className="text-[9px] text-gray-500">University Name • Student</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#00ADB5] text-[10px]">
              <TrendingUp className="w-3 h-3" />
              #2
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">About yourself</p>
          <div className="flex items-center justify-around mt-3 py-2 bg-[#0d1420] rounded-md">
            <div className="text-center">
              <div className="text-[10px] text-gray-500">Roadmap</div>
              <div className="text-sm font-bold text-white">23</div>
              <div className="text-[8px] text-gray-600">topics</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500">CodeArena</div>
              <div className="text-sm font-bold text-white">0</div>
              <div className="text-[8px] text-gray-600">solved</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500">Creator</div>
              <div className="text-sm font-bold text-white">0</div>
              <div className="text-[8px] text-gray-600">tasks</div>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-[9px] text-gray-500">Skills</span>
            <p className="text-[9px] text-gray-600 mt-1">No skills added</p>
          </div>
          <div className="mt-2 pt-2 border-t border-[#1a2535]">
            <span className="text-[9px] text-[#00ADB5]">Open to opportunities</span>
            <p className="text-[8px] text-gray-500">Looking to connect with other developers</p>
          </div>
          <div className="flex gap-2 mt-2">
            <button className="flex-1 px-2 py-1 text-[8px] bg-[#00ADB5] text-white rounded">Message</button>
            <button className="flex-1 px-2 py-1 text-[8px] text-gray-400 border border-[#1a2535] rounded hover:text-white">Reviews</button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 overflow-hidden">
                <img src="https://via.placeholder.com/40" alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs text-white font-semibold">sumit</span>
                <p className="text-[9px] text-gray-500">uptu • Student</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-[10px]">
              <TrendingUp className="w-3 h-3" />
              #3
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">hii everyone</p>
          <div className="flex items-center justify-around mt-3 py-2 bg-[#0d1420] rounded-md">
            <div className="text-center">
              <div className="text-[10px] text-gray-500">Roadmap</div>
              <div className="text-sm font-bold text-white">7</div>
              <div className="text-[8px] text-gray-600">topics</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500">CodeArena</div>
              <div className="text-sm font-bold text-white">5</div>
              <div className="text-[8px] text-gray-600">solved</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500">Creator</div>
              <div className="text-sm font-bold text-white">3</div>
              <div className="text-[8px] text-gray-600">tasks</div>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-[9px] text-gray-500">Skills</span>
            <div className="flex gap-1 mt-1 flex-wrap">
              {['python', 'java', 'mongodb'].map((skill, i) => (
                <span key={i} className="text-[8px] px-2 py-0.5 bg-[#1a2535] text-gray-300 rounded border border-[#252d3d]">{skill}</span>
              ))}
              <span className="text-[8px] px-1.5 py-0.5 bg-[#1a2535] text-gray-500 rounded">+1</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#1a2535]">
            <span className="text-[9px] text-[#00ADB5]">Open to opportunities</span>
            <p className="text-[8px] text-gray-500">Looking to connect with other developers</p>
          </div>
          <div className="flex gap-2 mt-2">
            <button className="flex-1 px-2 py-1 text-[8px] bg-[#00ADB5] text-white rounded">Message</button>
            <button className="flex-1 px-2 py-1 text-[8px] text-gray-400 border border-[#1a2535] rounded hover:text-white">Reviews</button>
          </div>
        </div>
      </div>
    </div>
  );

  // CodeArena Content
  const ArenaContent = () => (
    <div className="p-4 space-y-3">
      {/* Header with Logo and Tabs */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1a2535]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1 bg-[#00ADB5]/20 rounded">
            <Code className="w-4 h-4 text-[#00ADB5]" />
            <div>
              <span className="text-xs font-bold text-white">CodeArena</span>
              <p className="text-[7px] text-gray-500">Battle. Code. Win.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1 bg-[#00ADB5] text-white text-[9px] rounded">
              <Code className="w-3 h-3" /> Home
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1 text-gray-400 text-[9px] hover:text-white">
              <Swords className="w-3 h-3" /> Battle
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1 text-gray-400 text-[9px] hover:text-white">
              <BarChart3 className="w-3 h-3" /> History
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1 text-gray-400 text-[9px] hover:text-white">
              <Target className="w-3 h-3" /> Practice
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1 text-gray-400 text-[9px] hover:text-white">
              <Trophy className="w-3 h-3" /> Ranks
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#c5f82a] rounded-full">
          <Target className="w-3 h-3 text-gray-900" />
          <span className="text-xs font-bold text-gray-900">13,350</span>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-[#151c2a] rounded-lg p-4 border border-[#1a2535]">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          Welcome Back! <span className="text-lg">👋</span>
        </h3>
        <p className="text-[10px] text-gray-400 mt-1">Ready to test your coding skills? Battle other developers or practice with Codeforces problems.</p>
        <div className="flex items-center gap-2 mt-3">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#00ADB5] text-white text-[10px] rounded font-medium">
            <Swords className="w-3 h-3" /> Find Match
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#1a2535] text-white text-[10px] rounded border border-[#252d3d]">
            <Target className="w-3 h-3" /> Practice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="w-8 h-8 rounded-lg bg-[#00ADB5]/20 flex items-center justify-center mb-2">
            <Code className="w-4 h-4 text-[#00ADB5]" />
          </div>
          <div className="text-xl font-bold text-white">0</div>
          <span className="text-[9px] text-gray-500">Problems Solved</span>
        </div>
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mb-2">
            <Swords className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-xl font-bold text-white">0</div>
          <span className="text-[9px] text-gray-500">Battles Won</span>
        </div>
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-xl font-bold text-white">0</div>
          <span className="text-[9px] text-gray-500">Current Streak</span>
        </div>
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="w-8 h-8 rounded-lg bg-[#00ADB5]/20 flex items-center justify-center mb-2">
            <Trophy className="w-4 h-4 text-[#00ADB5]" />
          </div>
          <div className="text-xl font-bold text-white">-</div>
          <span className="text-[9px] text-gray-500">Global Rank</span>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#151c2a] rounded-lg p-4 border border-[#1a2535]">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-3">
            <Swords className="w-5 h-5 text-orange-500" />
          </div>
          <h4 className="text-sm font-semibold text-white">Quick Battle</h4>
          <p className="text-[9px] text-gray-500 mt-1">Compete in a 1v1 coding duel</p>
          <button className="flex items-center gap-1 text-[10px] text-[#00ADB5] mt-3 hover:underline">
            Get Started <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-[#151c2a] rounded-lg p-4 border border-[#1a2535]">
          <div className="w-10 h-10 rounded-lg bg-[#00ADB5]/20 flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-[#00ADB5]" />
          </div>
          <h4 className="text-sm font-semibold text-white">Practice Mode</h4>
          <p className="text-[9px] text-gray-500 mt-1">Solve problems from Codeforces</p>
          <button className="flex items-center gap-1 text-[10px] text-[#00ADB5] mt-3 hover:underline">
            Get Started <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-[#151c2a] rounded-lg p-4 border border-[#1a2535]">
          <div className="w-10 h-10 rounded-lg bg-[#00ADB5]/20 flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5 text-[#00ADB5]" />
          </div>
          <h4 className="text-sm font-semibold text-white">Leaderboard</h4>
          <p className="text-[9px] text-gray-500 mt-1">View global rankings</p>
          <button className="flex items-center gap-1 text-[10px] text-[#00ADB5] mt-3 hover:underline">
            Get Started <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Live Battles & Top Players */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-white font-medium">Live Battles</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-green-400">Live</span>
            </div>
          </div>
        </div>
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-white font-medium">Top Players</span>
            </div>
            <span className="text-[9px] text-[#00ADB5] cursor-pointer hover:underline">View All</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Learning Roadmaps Content
  const RoadmapsContent = () => (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-[#00ADB5]/20 flex items-center justify-center">
            <Map className="w-3.5 h-3.5 text-[#00ADB5]" />
          </div>
          <h2 className="text-white text-lg font-bold">Learning Roadmaps</h2>
        </div>
        <p className="text-[9px] text-gray-400 max-w-md mx-auto">
          Master IT skills with complete roadmaps. Track your progress, access curated resources, and prepare for interviews.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-[#151c2a] rounded-lg p-2 flex items-center gap-2 border border-[#1a2535]">
          <div className="w-6 h-6 rounded-lg bg-[#00ADB5]/20 flex items-center justify-center">
            <Map className="w-3 h-3 text-[#00ADB5]" />
          </div>
          <div>
            <div className="text-white text-sm font-bold">9</div>
            <div className="text-[8px] text-gray-500">Roadmaps</div>
          </div>
        </div>
        <div className="bg-[#151c2a] rounded-lg p-2 flex items-center gap-2 border border-[#1a2535]">
          <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-purple-400" />
          </div>
          <div>
            <div className="text-white text-sm font-bold">199+</div>
            <div className="text-[8px] text-gray-500">Topics</div>
          </div>
        </div>
        <div className="bg-[#151c2a] rounded-lg p-2 flex items-center gap-2 border border-[#1a2535]">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center">
            <Globe className="w-3 h-3 text-teal-400" />
          </div>
          <div>
            <div className="text-white text-sm font-bold">0+</div>
            <div className="text-[8px] text-gray-500">Resources</div>
          </div>
        </div>
        <div className="bg-[#151c2a] rounded-lg p-2 flex items-center gap-2 border border-[#1a2535]">
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Users className="w-3 h-3 text-orange-400" />
          </div>
          <div>
            <div className="text-white text-sm font-bold">11</div>
            <div className="text-[8px] text-gray-500">Learners</div>
          </div>
        </div>
      </div>

      {/* Featured Roadmaps */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <TrendingUp className="w-3 h-3 text-[#00ADB5]" />
          <span className="text-white text-xs font-medium">Featured Roadmaps</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Machine Learning Card */}
          <div className="bg-[#151c2a] rounded-lg p-2.5 border border-[#1a2535]">
            <div className="text-xl mb-2">🤖</div>
            <h4 className="text-white text-xs font-semibold mb-1">Machine Learning</h4>
            <p className="text-[8px] text-gray-500 mb-2 line-clamp-2">Master ML algorithms, deep learning, and build production-ready AI systems</p>
            <div className="flex items-center justify-between text-[8px] text-gray-500 mb-1.5">
              <span className="flex items-center gap-0.5">⏱ 28 weeks</span>
              <span className="flex items-center gap-0.5 text-yellow-400">⭐ 0.0</span>
            </div>
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-gray-500">Progress</span>
              <span className="text-[#00ADB5]">0%</span>
            </div>
            <div className="h-1 bg-[#1a2535] rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#00ADB5] rounded-full" style={{ width: '0%' }} />
            </div>
          </div>

          {/* Java Full Stack Card */}
          <div className="bg-[#151c2a] rounded-lg p-2.5 border border-[#1a2535]">
            <div className="text-xl mb-2">☕</div>
            <h4 className="text-white text-xs font-semibold mb-1">Java Full Stack Development</h4>
            <p className="text-[8px] text-gray-500 mb-2 line-clamp-2">Master enterprise full-stack development with Java, Spring Boot & React</p>
            <div className="flex items-center justify-between text-[8px] text-gray-500 mb-1.5">
              <span className="flex items-center gap-0.5">⏱ 28 weeks</span>
              <span className="flex items-center gap-0.5 text-yellow-400">⭐ 0.0</span>
            </div>
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-gray-500">Progress</span>
              <span className="text-[#00ADB5]">0%</span>
            </div>
            <div className="h-1 bg-[#1a2535] rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#00ADB5] rounded-full" style={{ width: '0%' }} />
            </div>
          </div>

          {/* Deep Learning Card */}
          <div className="bg-[#151c2a] rounded-lg p-2.5 border border-[#1a2535]">
            <div className="text-xl mb-2">🧠</div>
            <h4 className="text-white text-xs font-semibold mb-1">Deep Learning</h4>
            <p className="text-[8px] text-gray-500 mb-2 line-clamp-2">Master neural networks, CNNs, RNNs, Transformers, and cutting-edge deep...</p>
            <div className="flex items-center justify-between text-[8px] text-gray-500 mb-1.5">
              <span className="flex items-center gap-0.5">⏱ 24 weeks</span>
              <span className="flex items-center gap-0.5 text-yellow-400">⭐ 0.0</span>
            </div>
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-gray-500">Progress</span>
              <span className="text-[#c5f82a]">4%</span>
            </div>
            <div className="h-1 bg-[#1a2535] rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#c5f82a] rounded-full" style={{ width: '4%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2 mt-2">
        <div className="flex-1 bg-[#151c2a] rounded-lg px-3 py-2 flex items-center gap-2 border border-[#1a2535]">
          <Search className="w-3 h-3 text-gray-500" />
          <span className="text-[9px] text-gray-500">Search roadmaps...</span>
        </div>
        <button className="bg-[#151c2a] rounded-lg px-3 py-2 text-[9px] text-white border border-[#1a2535] flex items-center gap-1">
          All Categories <span className="text-gray-500">▼</span>
        </button>
        <button className="bg-[#151c2a] rounded-lg px-3 py-2 text-[9px] text-white border border-[#1a2535] flex items-center gap-1">
          All Levels <span className="text-gray-500">▼</span>
        </button>
      </div>
    </div>
  );

  // Practice Content
  const PracticeContent = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-base font-semibold">Practice Arena</h3>
        <button className="px-3 py-1.5 bg-[#00ADB5] text-white text-xs rounded-md">Start Practice</button>
      </div>
      <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
        <div className="space-y-2">
          {[
            { title: 'Two Sum', difficulty: 'Easy', solved: true },
            { title: 'Longest Substring', difficulty: 'Medium', solved: false },
            { title: 'Maximum Subarray', difficulty: 'Medium', solved: true },
          ].map((problem, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-[#1a2535] last:border-0">
              <span className="text-[10px] text-gray-300 flex-1">{problem.title}</span>
              <span className={`text-[9px] mx-2 ${problem.difficulty === 'Easy' ? 'text-green-400' : 'text-yellow-400'}`}>{problem.difficulty}</span>
              <span className={`text-[9px] ${problem.solved ? 'text-[#00ADB5]' : 'text-gray-600'}`}>{problem.solved ? '✓ Solved' : 'Unsolved'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Profile Content
  const ProfileContent = () => (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#00ADB5] text-lg font-bold">Profile</h2>
          <p className="text-[9px] text-gray-400">Manage your personal information and skills</p>
        </div>
        <button className="px-3 py-1.5 bg-[#00ADB5] text-white text-[9px] rounded-lg flex items-center gap-1">
          ✏️ Edit Profile
        </button>
      </div>

      <div className="flex gap-3">
        {/* Profile Summary Card (Left) */}
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535] w-2/5">
          <h4 className="text-white text-xs font-semibold mb-3">Profile Summary</h4>
          <div className="flex flex-col items-center mb-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center text-2xl mb-2">
              👨‍💻
            </div>
            <h3 className="text-white text-sm font-semibold">Rahul Verma</h3>
            <p className="text-[8px] text-gray-500">IIT Delhi</p>
          </div>
          <div className="space-y-2 text-[9px]">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📧</span>
              <span className="text-gray-300">rahulverma2024@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📱</span>
              <span className="text-gray-300">+91 9876543210</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📍</span>
              <span className="text-gray-300">New Delhi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">🏛️</span>
              <span className="text-gray-300">IIT Delhi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📝</span>
              <span className="text-gray-300">Full stack developer & ML enthusiast</span>
            </div>
          </div>
        </div>

        {/* Basic Information Card (Right) */}
        <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535] flex-1">
          <div className="flex items-center gap-1 mb-3">
            <span className="text-[#00ADB5]">👤</span>
            <h4 className="text-white text-xs font-semibold">Basic Information</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[8px] text-gray-500 block mb-1">Full Name</label>
              <div className="bg-[#0d1420] rounded px-2 py-1.5 text-[9px] text-white border border-[#1a2535]">Rahul Verma</div>
            </div>
            <div>
              <label className="text-[8px] text-gray-500 block mb-1">Email</label>
              <div className="bg-[#0d1420] rounded px-2 py-1.5 text-[9px] text-white border border-[#1a2535]">rahulverma2024@gmail.com</div>
            </div>
            <div>
              <label className="text-[8px] text-gray-500 block mb-1">Phone</label>
              <div className="bg-[#0d1420] rounded px-2 py-1.5 text-[9px] text-white border border-[#1a2535]">9876543210</div>
            </div>
            <div>
              <label className="text-[8px] text-gray-500 block mb-1">Institute</label>
              <div className="bg-[#0d1420] rounded px-2 py-1.5 text-[9px] text-white border border-[#1a2535]">IIT Delhi</div>
            </div>
            <div>
              <label className="text-[8px] text-gray-500 block mb-1">GitHub Username</label>
              <div className="bg-[#0d1420] rounded px-2 py-1.5 text-[9px] text-white border border-[#1a2535]">rahulverma-dev</div>
            </div>
            <div>
              <label className="text-[8px] text-gray-500 block mb-1">Year of Study</label>
              <div className="bg-[#0d1420] rounded px-2 py-1.5 text-[9px] text-gray-400 border border-[#1a2535] flex items-center justify-between">
                3rd Year <span className="text-gray-600">▼</span>
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-[8px] text-gray-500 block mb-1">Location</label>
              <div className="bg-[#0d1420] rounded px-2 py-1.5 text-[9px] text-white border border-[#1a2535]">New Delhi</div>
            </div>
            <div className="col-span-2">
              <label className="text-[8px] text-gray-500 block mb-1">Bio</label>
              <div className="bg-[#0d1420] rounded px-2 py-2 text-[9px] text-white border border-[#1a2535] min-h-[40px]">Full stack developer & ML enthusiast</div>
            </div>
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[#00ADB5]">🎓</span>
          <h4 className="text-white text-xs font-semibold">Education</h4>
        </div>
        <div className="text-[9px] text-white">B.Tech in Computer Science</div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardContent />;
      case 'creator': return <CreatorContent />;
      case 'connect': return <ConnectContent />;
      case 'arena': return <ArenaContent />;
      case 'roadmaps': return <RoadmapsContent />;
      case 'practice': return <PracticeContent />;
      case 'profile': return <ProfileContent />;
      default: return <DashboardContent />;
    }
  };

  return (
    <div className="relative bg-[#0d1420] rounded-xl border border-[#1a2535] overflow-hidden shadow-2xl shadow-black/60">
      {/* Browser Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0a0f18] border-b border-[#1a2535]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-1 bg-[#151c2a] rounded-md">
            <Globe className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">skillupx.online/dashboard</span>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex h-[480px]">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-44 bg-[#0a0f18] border-r border-[#1a2535]">
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a2535]">
            <div className="w-5 h-5 rounded bg-[#00ADB5] flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-white">SkillUpX</span>
            <ChevronLeft className="w-3 h-3 text-gray-500 ml-auto" />
          </div>

          {/* Nav Items */}
          <div className="flex-1 p-2 space-y-0.5">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-all ${
                  activeTab === item.id
                    ? 'bg-[#00ADB5] text-white'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#151c2a]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Theme Toggle & User */}
          <div className="p-3 border-t border-[#1a2535]">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-[#151c2a] rounded-md mb-3">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span className="text-[9px] text-gray-400">Light Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-medium">A</div>
              <div>
                <div className="text-[10px] text-white font-medium">Amit Sharma</div>
                <div className="text-[8px] text-gray-500 truncate w-24">sharmaamit962...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 h-full overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0f1a] to-transparent pointer-events-none" />
    </div>
  );
});

DashboardMockup.displayName = 'DashboardMockup';

// Hero Section Component - Supporting Both Light & Dark Themes
const HeroSection = memo(() => {
  const { ref, isVisible } = useRevealAnimation();

  return (
    <section className="relative min-h-screen overflow-hidden bg-white dark:bg-black">
      {/* Animated Background - Curved glow effect from top */}
      <div className="absolute inset-0">
        {/* Light mode background */}
        <div className="dark:hidden absolute top-0 left-1/2 -translate-x-1/2 w-full h-[700px]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[500px] bg-gradient-to-b from-[#00ADB5]/15 via-[#00ADB5]/5 to-transparent rounded-[100%] blur-3xl" />
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ADB5]/10 rounded-full blur-[150px]" />
        </div>
        {/* Dark mode background */}
        <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-full h-[700px]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[500px] bg-gradient-to-b from-[#0EA5E9]/30 via-[#0EA5E9]/10 to-transparent rounded-[100%] blur-3xl" />
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0EA5E9]/20 rounded-full blur-[150px]" />
        </div>

        {/* Side glows for depth */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#00ADB5]/5 dark:bg-[#0EA5E9]/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-cyan-500/3 dark:bg-sky-500/5 rounded-full blur-[100px]" />

        {/* Subtle curved line at top */}
        <svg className="absolute top-0 left-0 w-full h-64 opacity-10 dark:opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="none" stroke="#0EA5E9" strokeWidth="1" d="M0,160 Q720,320 1440,160" />
        </svg>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#00ADB5]/30 dark:bg-[#0EA5E9]/40 rounded-full animate-float-particle"
              style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${5 + Math.random() * 50}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${5 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div
          ref={ref}
          className={`text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00ADB5]/10 dark:bg-[#1a2535] border border-[#00ADB5]/20 dark:border-[#0EA5E9]/30 mb-8">
            <Rocket className="w-3.5 h-3.5 text-[#00ADB5] dark:text-[#0EA5E9]" />
            <span className="text-xs font-medium text-[#00ADB5] dark:text-[#0EA5E9]">Connect. Learn. Showcase. Succeed.</span>
          </div>

          {/* Main Heading - Bold impactful style */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            <span className="block">Learn by{' '}
              <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-500 to-teal-400 bg-clip-text text-transparent">Doing</span>
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl mt-2">
              <span className="text-gray-500 dark:text-gray-400 font-semibold">Grow by{' '}</span>
              <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-500 to-teal-400 bg-clip-text text-transparent">Contributing</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            SkillUpX is a smart platform designed for students who want to learn, grow, and showcase their abilities.
            Contribute to real open-source projects, collaborate with peers, and build a meaningful portfolio.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#151c2a] border border-gray-200 dark:border-[#1a2535] shadow-sm dark:shadow-none">
              <Users className="w-4 h-4 text-[#00ADB5]" />
              <span className="text-xs text-gray-700 dark:text-gray-300">Collaborate on projects & form teams</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#151c2a] border border-gray-200 dark:border-[#1a2535] shadow-sm dark:shadow-none">
              <Swords className="w-4 h-4 text-[#00ADB5]" />
              <span className="text-xs text-gray-700 dark:text-gray-300">Battle in CodeArena & practice coding</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#151c2a] border border-gray-200 dark:border-[#1a2535] shadow-sm dark:shadow-none">
              <Zap className="w-4 h-4 text-[#00ADB5]"/>
              <span className="text-xs text-gray-700 dark:text-gray-   300">Gain real-world experience instantly</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/signup"
              className="px-8 py-3 bg-[#00ADB5] hover:bg-[#00c4cc] text-white rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#00ADB5]/25 hover:scale-105"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-transparent border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 text-gray-900 dark:text-white rounded-full font-medium text-sm transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup with enhanced glow */}
        <div className={`relative transition-all duration-1000 delay-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        }`}>
          {/* Multiple layered glows behind dashboard */}
          <div className="absolute -inset-4 bg-gradient-to-t from-[#00ADB5]/10 dark:from-[#0EA5E9]/15 via-[#00ADB5]/3 dark:via-[#0EA5E9]/5 to-transparent rounded-3xl blur-3xl" />
          <div className="absolute -inset-8 bg-gradient-to-b from-transparent via-cyan-500/3 dark:via-sky-500/5 to-[#00ADB5]/8 dark:to-[#0EA5E9]/10 rounded-3xl blur-2xl" />

          <DashboardMockup />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none" />
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default function HomePage() {
  const [activeService, setActiveService] = useState(0);

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "SkillUpX (SkillUp X) – Skill Up Your Coding | DSA Practice, Battles & Projects",
    "alternateName": ["SkillUp", "Skill Up", "SkillUp X", "Skill Up X"],
    "description": "SkillUpX (SkillUp) – Skill up your coding! Practice DSA questions, 1v1 coding battles in CodeArena, collaborate on real-world projects, interview preparation with curated roadmaps, and explore career paths.",
    "url": "https://skillupx.online/",
    "mainEntity": {
      "@type": "EducationalOrganization",
      "name": "SkillUpX",
      "alternateName": ["SkillUp", "Skill Up", "SkillUp X"],
      "url": "https://skillupx.online"
    }
  };

  const services = [
    {
      id: 'creator-corner',
      title: 'Creator Corner',
      subtitle: 'Ideate & Innovate',
      description: 'Transform your ideas into reality. Share innovative project concepts and collaborate with talented developers.',
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80',
      icon: Lightbulb,
      color: 'from-[#00ADB5] to-cyan-600',
      lightBg: 'bg-[#00ADB5]/10',
      textColor: 'text-[#00ADB5]',
      stats: '50+ Ideas',
      features: ['Post project ideas', 'Find collaborators', 'Expert feedback', 'Build portfolio'],
      link: '/projects'
    },
    {
      id: 'developer-connect',
      title: 'Developer Connect',
      subtitle: 'Network & Grow',
      description: 'Build your professional network. Connect with skilled developers and grow together.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      lightBg: 'bg-violet-500/10',
      textColor: 'text-violet-600 dark:text-violet-400',
      stats: '1000+ Developers',
      features: ['Skill matching', 'Direct messaging', 'Endorsements', 'Pro profiles'],
      link: '/developer-connect'
    },
    {
      id: 'code-arena',
      title: 'Code Arena',
      subtitle: 'Battle & Conquer',
      description: 'Compete in real-time coding battles. Sharpen your skills and climb the global leaderboard.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      icon: Swords,
      color: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
      stats: '3000+ Problems',
      features: ['1v1 battles', 'DSA challenges', 'Leaderboard', 'Skill ratings'],
      link: '/code-arena'
    },
    {
      id: 'learning-roadmaps',
      title: 'Learning Roadmaps',
      subtitle: 'Your Path to Success',
      description: 'Follow structured learning paths, track your progress, and master new technologies step by step.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      icon: Map,
      color: 'from-teal-500 to-emerald-600',
      lightBg: 'bg-teal-500/10',
      textColor: 'text-teal-600 dark:text-teal-400',
      stats: '20+ Roadmaps',
      features: ['Curated paths', 'Track progress', 'Earn certificates', 'Resources'],
      link: '/dashboard/roadmaps'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black" style={{ overflowX: 'clip' }}>
      <SEO
        title="SkillUpX –The Developer Growth Platform,CodeArena Battles, Project Collaboration, Learning Roadmaps, Developer Connect & Tech Reviews"
        description="SkillUpX – Battle 1v1 in CodeArena, collaborate on real-world projects in Creator Corner, follow curated learning roadmaps, connect with developers via Developer Connect, read tech reviews. 3000+ DSA questions & growing. Free platform for all developers!"
        keywords="SkillUpX, CodeArena, CodeArena coding battle, CodeArena 1v1, code arena, coding arena, coding battle arena, 1v1 coding battle, real-time coding battle, coding duel, coding competition online, live coding challenge, peer coding, pair programming platform, project collaboration, project collaboration platform, team collaboration, real-world project collaboration, developer collaboration, Creator Corner, full stack project collaboration, learning roadmap, developer roadmap, career roadmap, coding roadmap, React roadmap, Node.js roadmap, full stack roadmap, DSA roadmap, interview roadmap, Developer Connect, developer connect platform, connect with developers, developer networking, developer community, developer network India, developer networking platform India, DSA practice, DSA practice platform, DSA questions for interview, data structures algorithms, 3000+ DSA problems, competitive programming, competitive coding India, interview preparation, career path, full stack development, open source projects, verified certificates, coding coins, coding leaderboard, global leaderboard, coding portfolio builder, developer portfolio platform, portfolio building, MERN stack projects, MERN stack project ideas, JavaScript React Node.js, leetcode alternative free, leetcode alternative India, hackerrank alternative free, skill development platform, coding practice website, online coding platform free, free coding platform India 2026, Project Bazaar, study groups, coding bootcamp alternative, system design, mock interview, developer community India, best coding platform 2026, project-based learning, sprint management, endorsed skills, coding community, learn to code free, coding for beginners, web development projects, gamified coding platform, earn while coding, coding rewards platform, placement preparation, campus placement coding, student developer platform, fresher developer projects, hackathon alternative, build projects online, learn React free, learn Node.js free, open source for beginners, developer resume builder, job ready skills, industry ready projects, hands on coding, learn by doing, grow by contributing, team projects for students, coding mentorship, full stack web development, agile project management, kanban board for developers, collaborative coding, algorithm practice, coding interview preparation, top coding websites India, best coding websites 2026, Python DSA practice, Java coding practice, C++ competitive programming, JavaScript projects beginners, real time code editor, code marketplace, GitHub projects students, software engineering projects, daily coding challenge, weekly coding contest, coding community India"
        canonicalUrl="/"
        structuredData={homeStructuredData}
      />
      {/* Hero Section */}
      <HeroSection />

      {/* ===== UNIQUE INTERACTIVE SERVICES SHOWCASE ===== */}
      <section className="relative py-12 lg:py-16 bg-white dark:bg-black overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,173,181,0.05) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ADB5]/10 dark:bg-white/10 backdrop-blur-sm border border-[#00ADB5]/20 dark:border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-[#00ADB5]" />
              <span className="text-sm font-bold text-[#00ADB5] dark:text-white uppercase tracking-wider">Our Services</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
              What We <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-400 bg-clip-text text-transparent">Offer</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left - Service Selector with Unique Design */}
            <div className="relative order-2 lg:order-1">
              {/* Vertical Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-white/10 hidden lg:block" />

              <div className="space-y-4">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    onClick={() => setActiveService(index)}
                    className={`relative group cursor-pointer transition-all duration-500 ${
                      activeService === index ? 'scale-100' : 'scale-95 opacity-60 hover:opacity-80'
                    }`}
                  >
                    {/* Active Indicator */}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hidden lg:flex items-center justify-center transition-all duration-500 ${
                      activeService === index
                        ? `bg-gradient-to-r ${service.color} scale-100 shadow-lg`
                        : 'bg-gray-200 dark:bg-white/10 scale-75'
                    }`}>
                      <service.icon className={`w-5 h-5 transition-colors ${activeService === index ? 'text-white' : 'text-gray-400 dark:text-white/60'}`} />
                    </div>

                    {/* Card */}
                    <div className={`lg:ml-20 p-6 rounded-2xl transition-all duration-500 ${
                      activeService === index
                        ? `bg-white dark:bg-white/10 shadow-xl backdrop-blur-md border border-gray-200 dark:border-white/10`
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}>
                      <div className="flex items-center gap-4 mb-3">
                        {/* Mobile Icon */}
                        <div className={`lg:hidden w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${service.color} shadow-lg`}>
                          <service.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                            activeService === index ? service.textColor : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {service.subtitle}
                          </span>
                          <h3 className={`text-xl lg:text-2xl font-bold transition-colors ${
                            activeService === index ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {service.title}
                          </h3>
                        </div>
                        {/* Stats Badge */}
                        <div className={`ml-auto px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          activeService === index
                            ? `bg-gradient-to-r ${service.color} text-white shadow-md`
                            : `${service.lightBg} ${service.textColor}`
                        }`}>
                          {service.stats}
                        </div>
                      </div>

                      {/* Expandable Content */}
                      <div className={`overflow-hidden transition-all duration-500 ${
                        activeService === index ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'
                      }`}>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{service.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {service.features.map((feature, idx) => (
                            <span key={idx} className={`px-3 py-1.5 ${service.lightBg} rounded-full text-xs font-medium ${service.textColor}`}>
                              {feature}
                            </span>
                          ))}
                        </div>
                        <Link
                          to={service.link}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${service.color} text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
                        >
                          Explore <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Dynamic Image Showcase */}
            <div className="relative order-1 lg:order-2">
              {/* Main Image Container */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    className={`absolute inset-0 transition-all duration-700 ${
                      activeService === index
                        ? 'opacity-100 scale-100 rotate-0'
                        : 'opacity-0 scale-110 rotate-3'
                    }`}
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      width={600}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-20`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Floating Elements */}
                    <div className={`absolute top-6 right-6 w-16 h-16 rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-md flex items-center justify-center shadow-xl transform transition-all duration-700 ${
                      activeService === index ? 'translate-x-0 rotate-0' : 'translate-x-20 rotate-45'
                    }`}>
                      <service.icon className={`w-8 h-8 ${service.textColor}`} />
                    </div>

                    {/* Title Overlay */}
                    <div className={`absolute bottom-0 left-0 right-0 p-8 transform transition-all duration-700 ${
                      activeService === index ? 'translate-y-0' : 'translate-y-20'
                    }`}>
                      <div className={`inline-block px-4 py-1.5 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm ${service.textColor} text-sm font-bold mb-3 shadow-lg`}>
                        {service.subtitle}
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-black text-white drop-shadow-lg">{service.title}</h3>
                    </div>
                  </div>
                ))}

                {/* Decorative Frame */}
                <div className="absolute inset-4 border-2 border-white/30 rounded-2xl pointer-events-none" />

                {/* Corner Accents */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#00ADB5] rounded-tl-xl" />
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#00ADB5] rounded-tr-xl" />
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#00ADB5] rounded-bl-xl" />
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#00ADB5] rounded-br-xl" />
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-3 mt-6">
                {services.map((service, index) => (
                  <button
                    key={service.id}
                    onClick={() => setActiveService(index)}
                    className={`relative h-2.5 rounded-full transition-all duration-500 ${
                      activeService === index
                        ? `w-12 bg-gradient-to-r ${service.color} shadow-md`
                        : `w-2.5 ${service.lightBg} hover:scale-125`
                    }`}
                  >
                    {activeService === index && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-full animate-pulse`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Benefits Section - Radial Feature Layout */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-black overflow-hidden relative">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Why SkillUpX is{' '}
              <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-400 bg-clip-text text-transparent">Your Best Choice</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to become a professional developer
            </p>
          </div>

          {/* Mobile: Simple grid */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🎯", title: "Learn Real Skills", desc: "Master DSA & industry technologies" },
              { icon: "👥", title: "Collaborate & Grow", desc: "Team up on real projects" },
              { icon: "📈", title: "Build Portfolio", desc: "Showcase projects to employers" },
              { icon: "⚔️", title: "Compete & Win", desc: "Battle in CodeArena" },
              { icon: "🏆", title: "Get Verified Certs", desc: "Industry-recognized certificates" },
              { icon: "💰", title: "100% Free Start", desc: "Access all resources free" }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-[#00ADB5]/30 rounded-2xl p-5 hover:border-[#00ADB5] transition-all shadow-sm dark:shadow-none">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ADB5]/20 to-cyan-500/20 flex items-center justify-center text-2xl mb-3">
                  {item.icon}
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold mb-1">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Desktop: Radial layout with center circle */}
          <div className="hidden lg:block relative h-[600px]">
            {/* Center Circle */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#00ADB5] to-cyan-400 rounded-full opacity-30 dark:opacity-20 blur-xl animate-pulse" />
                {/* Main circle */}
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#00ADB5] to-cyan-600 flex items-center justify-center shadow-2xl shadow-[#00ADB5]/30 relative">
                  <div className="text-center">
                    <div className="text-white font-black text-lg">Why</div>
                    <div className="text-white font-black text-lg">SkillUpX</div>
                  </div>
                  {/* Inner highlight */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full blur-md" />
                </div>
              </div>
            </div>

            {/* Feature cards arranged in a circle - wider spread */}
            {[
              { icon: "🎯", title: "Learn Real Skills", desc: "Master DSA & technologies", angle: -40, labelPos: "left" },
              { icon: "👥", title: "Collaborate & Grow", desc: "Team up on projects", angle: 0, labelPos: "left" },
              { icon: "📈", title: "Build Portfolio", desc: "Showcase to employers", angle: 40, labelPos: "left" },
              { icon: "⚔️", title: "Compete & Win", desc: "Battle in CodeArena", angle: 140, labelPos: "right" },
              { icon: "🏆", title: "Get Verified Certs", desc: "Industry certificates", angle: 180, labelPos: "right" },
              { icon: "💰", title: "100% Free Start", desc: "Access resources free", angle: 220, labelPos: "right" }
            ].map((item, idx) => {
              const radius = 240;
              const angleRad = (item.angle * Math.PI) / 180;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              return (
                <div
                  key={idx}
                  className="absolute left-1/2 top-1/2 group z-10"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                  }}
                >
                  {/* Hexagon-style card */}
                  <div className="w-14 h-14 relative cursor-pointer">
                    {/* Hexagon background */}
                    <div
                      className="absolute inset-0 bg-gray-100 dark:bg-gray-800 border-2 border-[#00ADB5]/40 group-hover:border-[#00ADB5] group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-all duration-300 shadow-lg group-hover:shadow-[#00ADB5]/20"
                      style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                      }}
                    />
                    {/* Icon */}
                    <div className="absolute inset-0 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                  </div>

                  {/* Label - positioned based on side with more spacing */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      item.labelPos === 'left'
                        ? 'right-[70px] text-right'
                        : 'left-[70px] text-left'
                    }`}
                    style={{ width: '120px' }}
                  >
                    <div className="text-gray-900 dark:text-white font-bold text-xs group-hover:text-[#00ADB5] transition-colors leading-tight">
                      {item.title}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-[10px] leading-tight">
                      {item.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== UNIQUE SPLIT-SCREEN PARALLAX SECTION ===== */}
      <section className="relative min-h-[200vh] bg-white dark:bg-black">
        <div className="flex flex-col lg:flex-row">
          {/* LEFT SIDE - STICKY/FIXED */}
          <div className="lg:w-1/2 lg:sticky lg:top-0 lg:h-screen flex items-center justify-center p-8 lg:p-16">
            <div className="relative max-w-lg w-full">
              {/* Animated Background Shapes */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00ADB5]/20 rounded-full blur-3xl animate-blob" />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

              {/* Main Content */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ADB5]/20 border border-[#00ADB5]/30 mb-6">
                  <Rocket className="w-4 h-4 text-[#00ADB5]" />
                  <span className="text-sm font-bold text-[#00ADB5]">YOUR JOURNEY</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                  Transform Your
                  <br />
                  <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    Career Path
                  </span>
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Scroll down to discover how SkillUpX takes you from beginner to industry-ready developer through our unique approach.
                </p>

                {/* Animated Image Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80"
                    alt="Developer working on code at a laptop"
                    loading="lazy"
                    width={600}
                    height={256}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Floating Badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="text-white">
                      <div className="text-2xl font-black">100%</div>
                      <div className="text-sm text-white/80">Practical Learning</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#00ADB5] flex items-center justify-center animate-bounce">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - SCROLLING CONTENT */}
          <div className="lg:w-1/2 py-20 lg:py-40 px-8 lg:px-16">
            <div className="space-y-32">
              {/* Journey Step 1 */}
              <div className="group opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <div className="relative p-8 bg-white dark:bg-white/10 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 hover:border-[#00ADB5]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#00ADB5]/10 shadow-lg">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ADB5] to-cyan-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                    01
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-10 h-10 text-[#00ADB5]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-[#00ADB5] transition-colors">
                        Learning Roadmaps
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        Start with structured roadmaps covering DSA, web development, and core programming concepts. Learn at your own pace with interactive tutorials.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['JavaScript', 'React', 'Node.js', 'DSA'].map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="mt-6 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"
                      alt="Student learning coding skills online with SkillUpX"
                      loading="lazy"
                      width={500}
                      height={192}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Journey Step 2 */}
              <div className="group opacity-0 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                <div className="relative p-8 bg-white dark:bg-white/10 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 shadow-lg">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                    02
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Code className="w-10 h-10 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-purple-400 transition-colors">
                        Practice & Battle
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        Sharpen your skills in CodeArena! Compete in real-time coding battles, solve 3000+ DSA problems, and climb the global leaderboard.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['1v1 Battles', 'Tournaments', 'DSA', 'Algorithms'].map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 rounded-full text-xs font-medium text-purple-600 dark:text-purple-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80"
                      alt="Code editor showing programming syntax for DSA practice"
                      loading="lazy"
                      width={500}
                      height={192}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Journey Step 3 */}
              <div className="group opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                <div className="relative p-8 bg-white dark:bg-white/10 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10 shadow-lg">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                    03
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-10 h-10 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-orange-400 transition-colors">
                        Collaborate & Build
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        Join teams, contribute to real open-source projects, and build applications that go live. Get hands-on experience that matters.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Teamwork', 'Open Source', 'Git', 'Deployment'].map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 rounded-full text-xs font-medium text-orange-600 dark:text-orange-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80"
                      alt="Team of developers collaborating on a real-world project"
                      loading="lazy"
                      width={500}
                      height={192}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Journey Step 4 */}
              <div className="group opacity-0 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                <div className="relative p-8 bg-white dark:bg-white/10 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10 shadow-lg">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                    04
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Award className="w-10 h-10 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-green-400 transition-colors">
                        Get Certified & Hired
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        Earn industry-recognized certificates, build an impressive portfolio, and land your dream tech job with real project experience.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Certificates', 'Portfolio', 'Jobs', 'Career'].map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-green-100 dark:bg-green-500/20 rounded-full text-xs font-medium text-green-600 dark:text-green-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80"
                      alt="Professional celebrating career success after SkillUpX certification"
                      loading="lazy"
                      width={500}
                      height={192}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Milestones Section - Horizontal Stepper Design */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">Achievement Milestones</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Track your progress and unlock exclusive rewards as you grow!</p>
          </div>
          {/* Achievement Timeline */}
          <div className="relative flex flex-col items-center">
            {/* Mobile: Vertical Grid Layout */}
            <div className="grid grid-cols-2 gap-4 md:hidden w-full mb-8">
              {[
                { icon: "💻", milestone: "Finish 5 Projects", reward: "Gold Badge", color: "from-yellow-400 to-yellow-600" },
                { icon: "⚔️", milestone: "Win 10 Battles", reward: "+500 Coins", color: "from-purple-400 to-purple-600" },
                { icon: "👥", milestone: "Join 3 Teams", reward: "Collaborator Badge", color: "from-pink-400 to-pink-600" },
                { icon: "🏆", milestone: "Get 3 Certificates", reward: "Elite Status", color: "from-green-400 to-green-600" },
                { icon: "⭐", milestone: "Reach 4.8+ Rating", reward: "Star Developer", color: "from-orange-400 to-orange-600" },
                { icon: "🎯", milestone: "Solve 100+ DSA", reward: "Coding Master", color: "from-cyan-400 to-cyan-600" },
              ].map((achievement, idx) => (
                <div key={idx} className="relative flex flex-col items-center group">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center text-white font-bold text-xl shadow-lg border-3 border-white z-10 mb-2 group-hover:scale-110 transition-transform duration-300`}>{achievement.icon}</div>
                  <div className="w-full rounded-xl p-3 bg-white/90 dark:bg-gray-900/80 shadow-lg border-2 border-[#00ADB5]/50 group-hover:border-[#00ADB5] transition-colors duration-300 text-center">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1 leading-tight">{achievement.milestone}</h3>
                    <div className="inline-block px-2 py-0.5 bg-gradient-to-r from-[#00ADB5] to-cyan-500 text-white rounded-full text-xs font-bold">{achievement.reward}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Horizontal Stepper Timeline */}
            <div className="hidden md:flex md:flex-col w-full items-center">
              <div className="w-full flex flex-row items-center justify-between relative mb-16">
                {/* Connecting line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full z-0" style={{ transform: 'translateY(-50%)' }} />
                {[
                  { icon: "💻", milestone: "Finish 5 Projects", reward: "Gold Badge", color: "from-yellow-400 to-yellow-600" },
                  { icon: "⚔️", milestone: "Win 10 CodeArena Battles", reward: "+500 Coins", color: "from-purple-400 to-purple-600" },
                  { icon: "👥", milestone: "Join 3 Teams", reward: "Collaborator Badge", color: "from-pink-400 to-pink-600" },
                  { icon: "🏆", milestone: "Get 3 Certificates", reward: "Elite Status", color: "from-green-400 to-green-600" },
                  { icon: "⭐", milestone: "Reach 4.8+ Rating", reward: "Star Developer", color: "from-orange-400 to-orange-600" },
                  { icon: "🎯", milestone: "Solve 100+ DSA Problems", reward: "Coding Master", color: "from-cyan-400 to-cyan-600" },
                ].map((achievement, idx) => (
                  <div key={idx} className="relative flex flex-col items-center z-10 w-1/6 group">
                    {/* Stepper dot */}
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-white z-10 mb-3 group-hover:scale-110 transition-transform duration-300 animate-pulse`}>{achievement.icon}</div>
                    {/* Card */}
                    <div className="w-40 rounded-2xl p-4 bg-white/90 dark:bg-gray-900/80 shadow-xl border-2 border-[#00ADB5] group-hover:scale-105 transition-transform duration-500 text-center -mt-2">
                      <h3 className="font-black text-base text-gray-900 dark:text-white mb-1">{achievement.milestone}</h3>
                      <div className="inline-block px-3 py-1 bg-gradient-to-r from-[#00ADB5] to-cyan-500 text-white rounded-full text-xs font-bold mb-1">{achievement.reward}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Certificate Card Highlighted Below */}
            <div className="mt-20 flex flex-col items-center justify-center animate-float-slow w-full">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">🎓 Your Verified Certificate</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Complete 50 tasks to unlock this certificate</p>
              </div>
              <div className="relative w-full max-w-2xl">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/80 via-white/90 to-amber-200/80 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl blur-[2px] -z-20" />
                {/* Enhanced glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-rose-400/20 blur-2xl -z-10" />
                {/* Certificate Card */}
                <div className="relative bg-white/95 dark:bg-gray-900/90 border-4 border-amber-400 dark:border-amber-600 rounded-3xl p-10 sm:p-14 shadow-[0_8px_40px_0_rgba(0,0,0,0.18)] hover:shadow-[0_12px_60px_0_rgba(0,0,0,0.22)] transition-shadow duration-500 scale-105 hover:scale-110 cursor-pointer overflow-hidden">
                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-amber-400 rounded-tl-3xl" />
                  <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-amber-400 rounded-tr-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-amber-400 rounded-bl-3xl" />
                  <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-amber-400 rounded-br-3xl" />
                  {/* Watermark */}
                  <div className="absolute inset-0 opacity-10 dark:opacity-15 pointer-events-none select-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] font-black text-amber-300 dark:text-amber-500 select-none">NS</div>
                  </div>
                  {/* Card Content */}
                  <div className="relative text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="relative">
                        <img src="https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg" alt="SkillUpX Logo" loading="lazy" width={80} height={80} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg" />
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ADB5] to-cyan-600">SkillUpX</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Building Tomorrow's Developers</p>
                      </div>
                    </div>
                    <h4 className="text-sm sm:text-base text-amber-600 dark:text-amber-400 font-bold tracking-[0.3em] uppercase mb-5">Certificate of Achievement</h4>
                    <div className="w-40 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-5" />
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-2">This is to certify that</p>
                    <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-1 font-serif italic">John Doe</h3>
                    <p className="text-base text-[#00ADB5] dark:text-cyan-400 font-medium mb-3">✉️ johndoe@example.com</p>
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-4">has successfully completed</p>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold mb-5 shadow-md"><CheckCircle className="w-6 h-6" /><span>50 Verified Tasks</span></div>
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-4">and is hereby recognized as a</p>
                    <h4 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 mb-5">Verified Collaborator</h4>
                    <div className="w-40 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-5" />
                    <div className="flex flex-wrap justify-center gap-6 mb-6">
                      <div className="text-center"><div className="text-xl font-black text-[#00ADB5]">50</div><div className="text-xs text-gray-500 dark:text-gray-400">Tasks</div></div>
                      <div className="text-center"><div className="text-xl font-black text-purple-500">8</div><div className="text-xs text-gray-500 dark:text-gray-400">Projects</div></div>
                      <div className="text-center"><div className="text-xl font-black text-pink-500">5</div><div className="text-xs text-gray-500 dark:text-gray-400">Skills</div></div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-amber-200 dark:border-amber-800">
                      <div className="text-left"><p className="text-xs text-gray-500 dark:text-gray-400">Issue Date</p><p className="text-base font-bold text-gray-700 dark:text-gray-300">December 22, 2025</p></div>
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600"><div className="grid grid-cols-3 gap-0.5">{[...Array(9)].map((_, i) => (<div key={i} className={`w-4 h-4 ${[0, 2, 3, 5, 6, 8].includes(i) ? 'bg-gray-800 dark:bg-gray-200' : 'bg-transparent'}`} />))}</div></div>
                      <div className="text-right"><p className="text-xs text-gray-500 dark:text-gray-400">Certificate ID</p><p className="text-base font-bold text-gray-700 dark:text-gray-300 font-mono">NS-2025-XXXXX</p></div>
                    </div>
                    <div className="mt-6 pt-4"><div className="w-32 h-0.5 bg-gray-400 mx-auto mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">SkillUpX Team</p></div>
                  </div>
                  {/* Gold seal badge */}
                  <div className="absolute -bottom-6 -right-6 sm:bottom-6 sm:right-6"><div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-amber-300"><Award className="w-10 h-10 sm:w-12 sm:h-12 text-white" /></div></div>
                </div>
                <p className="text-center text-base text-gray-500 dark:text-gray-400 mt-6">📥 Download and share on LinkedIn to showcase your skills!</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Collaboration & Teams Section */}
      <section className="py-20 px-6 lg:px-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">👥 COLLABORATE</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                Form Teams & <span className="text-[#00ADB5]">Collaborate on Projects</span>
              </h2>

              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                SkillUpX enables students to form teams, work together on real-world projects, and build meaningful experience. Connect with like-minded developers, share ideas, and deliver projects that showcase your teamwork abilities to employers.
              </p>

              <ul className="space-y-3">
                {[
                  "Find talented teammates with different skill sets",
                  "Collaborate on real open-source projects",
                  "Build projects from idea to deployment",
                  "Learn version control and team workflows",
                  "Impress employers with team-based accomplishments"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 group hover:translate-x-1 transition-transform">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ADB5] mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00ADB5] hover:bg-cyan-600 text-white rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                Explore Collaboration →
              </button>
            </div>

            {/* Right Visual */}
            <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-xl border border-white/40">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/20 to-cyan-600/10" />
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80"
                alt="Team collaborating around a table discussing project ideas"
                loading="lazy"
                width={500}
                height={300}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>


      {/* Code Arena Section - Enhanced with Unique Animations */}
      <section className="py-20 px-6 lg:px-8 bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden relative">
        {/* Animated Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ADB5]/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '5s' }} />

          {/* Animated Code Rain Effect */}
          <div className="absolute inset-0 opacity-5">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute text-[#00ADB5] font-mono text-xs animate-slide-down"
                style={{
                  left: `${i * 5}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${8 + i * 0.5}s`
                }}
              >
                {'<code/>'}
              </div>
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Visual with 3D Effect */}
            <div className="relative perspective-1000 group">
              <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 transform transition-all duration-700 group-hover:rotate-y-3 preserve-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/30 to-cyan-600/20" />
                <img
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80"
                  alt="Laptop showing code for a coding competition on SkillUpX"
                  loading="lazy"
                  width={500}
                  height={350}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating Code Elements */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#00ADB5]/80 rounded-lg text-xs font-mono animate-float">
                  function battle() {'{}'}
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-purple-500/80 rounded-lg text-xs font-mono animate-float-delayed">
                  {'<CodeArena />'}
                </div>

                {/* Live Battle Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500/90 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span className="text-xs font-bold">LIVE</span>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-[#00ADB5] to-cyan-600 rounded-xl p-4 shadow-xl animate-float">
                <div className="text-3xl font-black">⚔️</div>
                <div className="text-sm font-bold mt-1">1v1 Battles</div>
              </div>

              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 shadow-xl animate-float-delayed">
                <div className="text-3xl font-black">🏆</div>
                <div className="text-sm font-bold mt-1">Leaderboard</div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ADB5]/10 dark:bg-[#00ADB5]/20 border border-[#00ADB5]/30 dark:border-[#00ADB5]/50 animate-magnetic">
                <span className="text-sm font-bold text-[#00ADB5]">⚔️ CODE ARENA</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                Battle in <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">CodeArena</span> & Master Coding
              </h2>

              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Challenge yourself and compete against other developers in real-time coding battles. Practice with 3000+ DSA questions, compete in tournaments, earn coins, and climb the global leaderboard while building your coding skills.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "⚡", label: "1v1 Battles", desc: "Real-time coding duels", color: "from-yellow-400 to-orange-500" },
                  { icon: "🏆", label: "Tournaments", desc: "Compete globally", color: "from-purple-400 to-pink-500" },
                  { icon: "🎯", label: "3000+ Problems", desc: "DSA to interview prep", color: "from-blue-400 to-cyan-500" },
                  { icon: "💰", label: "Win Coins", desc: "Rewards & recognition", color: "from-green-400 to-emerald-500" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#00ADB5]/50 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-500 group cursor-pointer hover:-translate-y-2 hover:shadow-xl shadow-md dark:shadow-none spotlight"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                      {item.icon}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#00ADB5] transition-colors">{item.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
                  </div>
                ))}
              </div>

              <Link to="/codearena" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ADB5] to-cyan-600 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#00ADB5]/30 hover:-translate-y-1 spotlight group">
                Join CodeArena
                <Zap className="w-4 h-4 group-hover:animate-pulse" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Why Choose
              <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent"> SkillUpX?</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Unlock your potential with our comprehensive platform designed for career success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {homePageFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section with Unique Animations */}
      <section className="py-16 px-6 lg:px-8 bg-white dark:bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Our Community in Action
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See how our students are building their future, one project at a time
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {homePageGallery.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 hover:scale-105 spotlight"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  loading="lazy"
                  width={400}
                  height={300}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-125 group-hover:rotate-3 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <p className="text-xs font-semibold line-clamp-1">{image.caption}</p>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00ADB5] rounded-xl transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INFINITE SCROLLING TECH STACK ===== */}
      <section className="py-16 bg-white dark:bg-black overflow-hidden">
        <div className="text-center mb-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Technologies You'll Master</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Learn the most in-demand tech skills</p>
        </div>

        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10" />

          {/* Scrolling Container */}
          <div className="flex animate-scroll-x">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-8 mr-8">
                {[
                  { name: "React", icon: "⚛️", color: "from-cyan-400 to-blue-500" },
                  { name: "Node.js", icon: "🟢", color: "from-green-400 to-emerald-500" },
                  { name: "TypeScript", icon: "📘", color: "from-blue-400 to-blue-600" },
                  { name: "Python", icon: "🐍", color: "from-yellow-400 to-green-500" },
                  { name: "MongoDB", icon: "🍃", color: "from-green-500 to-green-700" },
                  { name: "Firebase", icon: "🔥", color: "from-yellow-400 to-orange-500" },
                  { name: "AWS", icon: "☁️", color: "from-orange-400 to-yellow-500" },
                  { name: "Docker", icon: "🐳", color: "from-blue-400 to-cyan-500" },
                  { name: "Git", icon: "📦", color: "from-orange-500 to-red-500" },
                  { name: "GraphQL", icon: "◈", color: "from-pink-400 to-purple-500" },
                  { name: "Next.js", icon: "▲", color: "from-gray-400 to-gray-600" },
                  { name: "TailwindCSS", icon: "🎨", color: "from-cyan-400 to-teal-500" }
                ].map((tech, idx) => (
                  <div
                    key={`${setIndex}-${idx}`}
                    className={`flex-shrink-0 px-6 py-4 rounded-xl bg-gradient-to-r ${tech.color} flex items-center gap-3 hover:scale-110 transition-transform duration-300 cursor-pointer shadow-lg`}
                  >
                    <span className="text-2xl">{tech.icon}</span>
                    <span className="text-white font-bold whitespace-nowrap">{tech.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-700 backdrop-blur-sm mb-6">
              <span className="text-2xl">🌟</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Success Stories</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              From Students to
              <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent"> Successful Developers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Hear from developers who landed their dream jobs after completing SkillUpX
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {homePageTestimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>



      {/* Platform Impact - Stats & Numbers Section */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-teal-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-semibold mb-6">
              <Star className="w-4 h-4" /> Growing Community
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Trusted by <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Developers Across India</span> & Beyond
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Join a growing community of developers who are leveling up their coding skills, building projects, and advancing their careers on SkillUpX.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { value: "100+", label: "Active Developers", icon: <Users className="w-6 h-6" />, color: "from-cyan-500 to-teal-500" },
              { value: "300+", label: "CodeArena Battles Played", icon: <Swords className="w-6 h-6" />, color: "from-red-500 to-orange-500" },
              { value: "3000+", label: "DSA Problems Available", icon: <Code className="w-6 h-6" />, color: "from-purple-500 to-pink-500" },
              { value: "30+", label: "Collaborative Projects Built", icon: <Rocket className="w-6 h-6" />, color: "from-blue-500 to-indigo-500" }
            ].map((stat, i) => (
              <div key={i} className="group relative bg-white dark:bg-gray-900/60 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 text-center hover:-translate-y-2">
                <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {stat.icon}
                </div>
                <p className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Globe className="w-5 h-5" />, title: "Developers Across India", desc: "From Delhi to Chennai, Mumbai to Kolkata — SkillUpX connects developers from across India for coding practice and collaboration." },
              { icon: <Award className="w-5 h-5" />, title: "Measurable Skill Growth", desc: "Developers who practice on SkillUpX regularly show real improvement in DSA problem-solving speed and code quality." },
              { icon: <TrendingUp className="w-5 h-5" />, title: "Better Interview Preparation", desc: "Our CodeArena battles and structured roadmaps help developers prepare for technical interviews at top companies and Indian IT firms." }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800/40 dark:to-gray-800/20 rounded-xl p-6 border border-cyan-100 dark:border-gray-700/50">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes SkillUpX Unique - Highlights Section */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50 dark:bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 dark:opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-500 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-white/10 text-cyan-600 dark:text-cyan-400 text-sm font-semibold mb-6">
              <Shield className="w-4 h-4" /> All-In-One Platform
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              What Makes <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">SkillUpX</span> Unique
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              SkillUpX is the only free platform that combines competitive coding, project collaboration, learning roadmaps, developer networking, and tech reviews — everything a developer needs in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <Swords className="w-6 h-6" />,
                title: "CodeArena — Live 1v1 Coding Battles",
                desc: "Go beyond solo practice. Challenge developers to real-time 1v1 battles, solve DSA problems under pressure, earn XP, climb the leaderboard, and prove your skills competitively.",
                color: "from-red-500 to-orange-500"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Creator Corner — Real Project Collaboration",
                desc: "Build portfolio-worthy projects with real teammates. Manage tasks with Kanban boards, plan sprints, review code, and ship applications — just like professional dev teams.",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: <Map className="w-6 h-6" />,
                title: "Structured Learning Roadmaps",
                desc: "Follow step-by-step roadmaps for MERN Stack, Full Stack, DSA Mastery, AI/ML, and Frontend Engineering. Track progress with milestones, earn certifications, and never feel lost.",
                color: "from-teal-500 to-cyan-500"
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Developer Connect & Tech Reviews",
                desc: "Network with developers across India, find mentors, join study groups, and read honest community-driven tech reviews on tools, frameworks, and courses to make better career decisions.",
                color: "from-purple-500 to-pink-500"
              }
            ].map((item, i) => (
              <div key={i} className="group relative bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-white/10 hover:border-cyan-500/40 transition-all duration-500 hover:bg-gray-50 dark:hover:bg-white/10 shadow-lg dark:shadow-none">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-1 text-lg"
            >
              Start Building for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live Community Activity Feed Section */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-teal-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> Live on SkillUpX
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              See What Developers Are <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Building Right Now</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Real activity from the SkillUpX community — battles won, projects launched, roadmaps completed, and developers connecting every day.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Activity Feed */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Recent Activity
              </h3>
              {[
                { icon: <Swords className="w-4 h-4" />, text: "Arjun won a CodeArena battle against Sneha — solved Binary Search in 4 min", time: "2 min ago", color: "bg-red-500/10 text-red-500" },
                { icon: <Rocket className="w-4 h-4" />, text: "Team InnovatorsHub launched their MERN e-commerce project on Creator Corner", time: "15 min ago", color: "bg-blue-500/10 text-blue-500" },
                { icon: <Map className="w-4 h-4" />, text: "Priya completed the Full Stack Development Roadmap — earned certificate", time: "32 min ago", color: "bg-teal-500/10 text-teal-500" },
                { icon: <Users className="w-4 h-4" />, text: "DevSquad study group reached 50 members on Developer Connect", time: "1 hr ago", color: "bg-purple-500/10 text-purple-500" },
                { icon: <MessageSquare className="w-4 h-4" />, text: "Rahul posted a tech review: \"React 19 vs Next.js 15 — Which to Learn in 2026\"", time: "2 hrs ago", color: "bg-orange-500/10 text-orange-500" },
                { icon: <Trophy className="w-4 h-4" />, text: "Vikram climbed to #3 on the CodeArena leaderboard this week", time: "3 hrs ago", color: "bg-yellow-500/10 text-yellow-600" }
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all duration-300">
                  <div className={`w-9 h-9 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Popular Categories & Skills */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-500" /> Trending Skills on SkillUpX
                </h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    "React.js", "Node.js", "Data Structures", "Algorithms", "Python", "JavaScript",
                    "TypeScript", "MongoDB", "REST APIs", "System Design", "Dynamic Programming",
                    "Machine Learning", "Docker", "Git & GitHub", "Tailwind CSS", "Next.js"
                  ].map((skill, i) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-300 cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-500" /> Popular Learning Paths
                </h3>
                <div className="space-y-4">
                  {[
                    { path: "MERN Stack Developer Roadmap", enrolled: "45+", difficulty: "Intermediate", color: "from-green-500 to-emerald-500" },
                    { path: "DSA Interview Preparation", enrolled: "80+", difficulty: "All Levels", color: "from-blue-500 to-indigo-500" },
                    { path: "AI & Machine Learning Path", enrolled: "25+", difficulty: "Advanced", color: "from-purple-500 to-pink-500" },
                    { path: "Frontend React Developer", enrolled: "60+", difficulty: "Beginner", color: "from-orange-500 to-red-500" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all duration-300 group">
                      <div className={`w-2 h-12 rounded-full bg-gradient-to-b ${item.color} flex-shrink-0`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{item.path}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.enrolled} enrolled • {item.difficulty}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to know about SkillUpX
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is SkillUpX really free?",
                a: "Yes! All courses and learning resources are completely free. You only pay optional fees for certificate verification (₹299-₹499) after completing projects."
              },
              {
                q: "What skills can I learn on SkillUpX?",
                a: "You can learn Web Development (JavaScript, React, Node.js), Data Structures & Algorithms (DSA), AI/Machine Learning, Full Stack Development (MERN), and more."
              },
              {
                q: "How do real projects work?",
                a: "Browse open projects posted by developers, apply to join teams, collaborate with other students, and build actual applications that go live."
              },
              {
                q: "Do I get certificates?",
                a: "Yes! Complete projects and earn verified certificates. These certificates are endorsed by project creators and recognized by employers."
              },
              {
                q: "Can I compete with other developers?",
                a: "Absolutely! CodeArena allows you to battle other developers in real-time coding competitions. Climb the leaderboard and earn coins."
              },
              {
                q: "How long does it take to get a job?",
                a: "It varies based on your dedication. With consistent learning and project completion (3-6 months), you'll have a strong portfolio to land tech jobs."
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 dark:border-gray-700 hover:border-[#00ADB5]/50">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-black text-gray-900 dark:text-white group-open:text-[#00ADB5]">
                  <span className="text-sm md:text-base">{faq.q}</span>
                  <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Immersive Design */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-black overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* Animated Dark background with multiple layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />

            {/* Animated Orbs */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-72 h-72 bg-[#00ADB5]/30 rounded-full blur-3xl animate-blob" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
            </div>

            {/* Background Image with Parallax */}
            <div className="absolute inset-0 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80"
                alt=""
                loading="lazy"
                width={1200}
                height={800}
                className="w-full h-full object-cover"
                aria-hidden="true"
              />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'linear-gradient(#00ADB5 1px, transparent 1px), linear-gradient(90deg, #00ADB5 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />

            {/* Content */}
            <div className="relative px-8 md:px-16 py-16 md:py-24 text-center z-10">
              <div className="space-y-8">
                {/* Animated Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ADB5]/20 border border-[#00ADB5]/30 animate-magnetic">
                  <Rocket className="w-4 h-4 text-[#00ADB5] animate-bounce" />
                  <span className="text-sm font-bold text-[#00ADB5]">START TODAY</span>
                </div>

                <div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                    Ready to Transform Your
                    <br />
                    <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                      Career?
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                    Join our growing community of developers building their careers with SkillUpX.
                    Your future in tech starts today.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link to="/signup" className="group relative px-10 py-5 bg-gradient-to-r from-[#00ADB5] to-cyan-600 rounded-2xl font-bold text-xl text-white shadow-2xl hover:shadow-[#00ADB5]/50 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 inline-flex items-center overflow-hidden">
                    <span className="relative z-10 flex items-center gap-3">
                      Start Your Journey Now
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Link>

                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Join 150+ students & growing</div>
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>★</span>
                      ))}
                      <span className="text-sm text-gray-300 ml-2">4.9/5 rating</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-700">
                  {[
                    { value: "Free", label: "Forever plan available", icon: "💎" },
                    { value: "24/7", label: "Community support", icon: "🌍" },
                    { value: "∞", label: "Lifetime access", icon: "🔓" }
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center group hover:scale-110 transition-transform duration-300">
                      <div className="text-2xl mb-2 group-hover:animate-bounce">{stat.icon}</div>
                      <div className="text-3xl font-black text-[#00ADB5] mb-2">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
