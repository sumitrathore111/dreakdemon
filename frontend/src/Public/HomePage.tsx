import { ArrowRight, Award, BarChart3, BookOpen, Brain, CheckCircle, ChevronLeft, Code, Globe, Lightbulb, Map, MessageSquare, Rocket, Search, Shield, Sparkles, Star, Swords, Target, TrendingUp, Trophy, Users, Zap } from "lucide-react";
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
    { id: 'query', icon: MessageSquare, label: 'Query' },
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

  // Query Content
  const QueryContent = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-base font-semibold">Query Center</h3>
        <button className="px-3 py-1.5 bg-[#00ADB5] text-white text-xs rounded-md">+ Ask Question</button>
      </div>
      <div className="bg-[#151c2a] rounded-lg p-3 border border-[#1a2535]">
        <div className="space-y-2">
          {[
            { q: 'How to optimize recursive solutions?', replies: 5, time: '2h ago' },
            { q: 'Best practices for React hooks?', replies: 12, time: '1d ago' },
            { q: 'Understanding Big O notation', replies: 8, time: '3d ago' },
          ].map((query, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-[#1a2535] last:border-0">
              <span className="text-[10px] text-gray-300 flex-1">{query.q}</span>
              <span className="text-[9px] text-[#00ADB5] mx-2">{query.replies} replies</span>
              <span className="text-[9px] text-gray-600">{query.time}</span>
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
      case 'query': return <QueryContent />;
      case 'profile': return <ProfileContent />;
      default: return <DashboardContent />;
    }
  };

  return (
    <div className="relative bg-[#0d1420] rounded-2xl border-2 border-blue-500/40 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2),0_0_100px_rgba(59,130,246,0.1),0_30px_80px_rgba(0,0,0,0.6)] dark:shadow-[0_0_60px_rgba(59,130,246,0.25),0_0_120px_rgba(59,130,246,0.12),0_30px_80px_rgba(0,0,0,0.8)]">
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

// Hero Section Component - DEVSKILL-inspired split layout
const HeroSection = memo(() => {
  const { ref, isVisible } = useRevealAnimation();

  return (
    <section className="relative overflow-hidden bg-white dark:bg-black">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft pink/salmon circle top-left — like DEVSKILL */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#FF6B6B]/8 dark:bg-[#00ADB5]/10 blur-xl" />
        {/* Small teal decorative circle left */}
        <div className="absolute top-28 left-8 w-12 h-12 rounded-full bg-[#00ADB5]/10 dark:bg-[#00ADB5]/15 hidden lg:block" />
        {/* Small floating dot center-left */}
        <div className="absolute top-[55%] left-[40%] w-3 h-3 rounded-full bg-[#00ADB5] dark:bg-[#00ADB5] hidden lg:block animate-float" />
        {/* Small dark dot right area */}
        <div className="absolute top-[18%] right-[42%] w-2.5 h-2.5 rounded-full bg-[#222831] dark:bg-[#00ADB5] hidden lg:block" />
      </div>

      {/* Main Content */}
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 lg:pt-28 pb-12">
        <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]">

          {/* LEFT SIDE — Text Content */}
          <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Platform badge */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ADB5]" />
              <span className="text-sm font-semibold text-[#00ADB5] tracking-wide uppercase">Developer Growth Platform</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
              Powerful Skills{' '}
              <br className="hidden sm:block" />
              <span className="text-[#00ADB5]">10,000+</span>{' '}
              <br className="hidden sm:block" />
              Developers Worldwide
            </h1>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-400 text-base lg:text-lg max-w-lg leading-relaxed">
              SkillUpX is a smart platform designed for students who want to learn, grow, and showcase their abilities. Contribute to real open-source projects, collaborate with peers, and build a meaningful portfolio.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-5 pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#00ADB5] hover:bg-[#00c4cc] text-white rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#00ADB5]/25 hover:-translate-y-0.5 group"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#00ADB5]/10 dark:bg-[#00ADB5]/20 flex items-center justify-center border-2 border-[#00ADB5]/30 group-hover:bg-[#00ADB5]/20 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-4 h-4 text-[#00ADB5] ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-[#00ADB5] transition-colors">How it Works</span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['bg-gradient-to-br from-[#00ADB5] to-teal-600', 'bg-gradient-to-br from-purple-500 to-pink-500', 'bg-gradient-to-br from-blue-500 to-cyan-500', 'bg-gradient-to-br from-orange-500 to-red-500'].map((gradient, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${gradient} border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] text-white font-bold`}>
                      {['S', 'P', 'A', 'R'][i]}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">100+ active developers</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">4.9/5</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — Hero image with decorative geometric background */}
          <div className={`absolute -top-8 -right-8 -bottom-8 w-[60%] hidden lg:flex items-center justify-end transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {/* Decorative triangle shapes behind person — DEVSKILL style */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] h-[90%]">
              {/* Large teal triangle — pointing up-right */}
              <div className="absolute right-[-8%] top-[5%] w-[75%] h-[90%] bg-[#00ADB5] dark:bg-[#00ADB5]/90 shadow-2xl shadow-[#00ADB5]/20" style={{ clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)' }} />
              {/* Orange/coral accent triangle — overlapping, pointing bottom-right */}
              <div className="absolute right-[-8%] top-[25%] w-[55%] h-[75%] bg-[#FF6B35] dark:bg-[#FF6B35]/80 shadow-2xl shadow-[#FF6B35]/20" style={{ clipPath: 'polygon(40% 10%, 100% 0%, 100% 100%, 0% 100%)' }} />
              {/* Subtle circle ring decoration */}
              <div className="absolute left-[10%] top-[18%] w-52 h-52 rounded-full border-2 border-[#00ADB5]/15 dark:border-[#00ADB5]/10" />
              <div className="absolute left-[14%] top-[22%] w-40 h-40 rounded-full border border-[#00ADB5]/10 dark:border-[#00ADB5]/8" />
              {/* Small dot decorations */}
              <div className="absolute left-[35%] top-[60%] w-2 h-2 rounded-full bg-[#00ADB5]/40" />
              <div className="absolute left-[38%] top-[63%] w-1.5 h-1.5 rounded-full bg-[#FF6B35]/40" />
              {/* "SkillUpX" watermark text on teal triangle */}
              <div className="absolute right-[8%] top-[35%] text-5xl font-black text-white/20 dark:text-white/10 -rotate-12 select-none pointer-events-none italic">SkillUpX</div>
            </div>
            {/* Person image — large and centered */}
            <img
              src="https://res.cloudinary.com/dvwmbidka/image/upload/e_background_removal/ChatGPT_Image_Feb_21_2026_02_46_21_PM_doveiy"
              alt="Developer"
              className="relative z-10 w-[140%] h-[130%] object-contain object-right drop-shadow-2xl"
            />
            {/* Floating review card — bottom left of image area */}
            <div className="absolute z-20 bottom-[15%] left-[10%] bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 px-5 py-4 flex items-center gap-3 border border-gray-100 dark:border-gray-800 animate-float">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center text-white font-bold text-sm">SX</div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">SkillUpX</p>
                <p className="text-xs text-[#00ADB5] font-medium">Developer Platform</p>
                <div className="flex gap-0.5 mt-0.5">{Array.from({ length: 5 }, (_, i) => (<span key={i} className="text-yellow-400 text-[10px]">★</span>))}</div>
              </div>
            </div>
            {/* Floating Google-like icon — top right */}
            <div className="absolute z-20 top-[12%] right-[8%] w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl shadow-lg shadow-black/10 flex items-center justify-center rotate-12 animate-float" style={{ animationDelay: '1s' }}>
              <CheckCircle className="w-7 h-7 text-[#00ADB5]" />
            </div>
          </div>
        </div>

        {/* Dashboard Mockup below hero — kept exactly the same */}
        <div className={`relative mt-20 lg:mt-28 transition-all duration-1000 delay-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        }`}>
          {/* Layered glows behind dashboard */}
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

      {/* ===== WHAT WE OFFER — YOUR DEVELOPER JOURNEY ===== */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-white dark:bg-black">
        {/* Subtle ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#00ADB5]/[0.04] to-transparent rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/[0.03] to-transparent rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-12">

          {/* ── Section Header — Narrative opener ── */}
          <div className="text-center mb-20">
            <p className="text-[#00ADB5] text-sm font-semibold tracking-widest uppercase mb-4">Your Developer Journey</p>
            <h2 className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              From <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-400 bg-clip-text text-transparent">Zero</span> to{' '}
              <span className="bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">Industry-Ready</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Every great developer started exactly where you are. Here's how SkillUpX walks with you — step by step — from your first line of code to landing your dream role.
            </p>
          </div>

          {/* ═══════════  CHAPTER 1 — Learn the Fundamentals  ═══════════ */}
          <div className="relative mb-24 lg:mb-32">
            {/* Vertical timeline connector */}
            <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#00ADB5]/40 via-[#00ADB5]/20 to-transparent" />

            {/* Chapter number */}
            <div className="flex items-start gap-6 lg:gap-10">
              <div className="hidden lg:flex flex-col items-center flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ADB5] to-cyan-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#00ADB5]/20">
                  01
                </div>
              </div>

              <div className="flex-1">
                <div className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ADB5] to-cyan-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#00ADB5]/20 mb-4">
                  01
                </div>
                <p className="text-[#00ADB5] text-xs font-bold uppercase tracking-widest mb-2">Chapter One</p>
                <h3 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
                  Learn with a Clear Roadmap
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg leading-relaxed max-w-2xl mb-8">
                  No more tutorial hell. Pick a curated roadmap — Full Stack, Machine Learning, Docker, GenAI, or System Design — and follow a structured path from fundamentals to mastery. Every module tells you <em>what</em> to learn, <em>why</em> it matters, and <em>what's next</em>.
                </p>

                {/* Visual: The journey path */}
                <div className="relative bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-gray-900/80 dark:to-gray-900/50 rounded-2xl border border-blue-200/60 dark:border-gray-800/60 p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 justify-between relative">
                    {/* Connector line */}
                    <div className="hidden sm:block absolute top-6 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-blue-500/30 via-blue-500/60 to-blue-500/20 rounded-full" />

                    {[
                      { step: 'Pick a Path', emoji: '🗺️', done: true },
                      { step: 'Learn Concepts', emoji: '📖', done: true },
                      { step: 'Build Projects', emoji: '🛠️', done: true },
                      { step: 'Go Advanced', emoji: '🚀', done: false },
                      { step: 'Become Expert', emoji: '👑', done: false },
                    ].map((s, i) => (
                      <div key={i} className="relative flex sm:flex-col items-center gap-3 sm:gap-2 z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${s.done ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-gray-200 dark:bg-gray-800'} transition-all`}>
                          {s.emoji}
                        </div>
                        <p className={`text-xs font-semibold ${s.done ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>{s.step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-blue-200/40 dark:border-gray-800/40">
                    {['Full Stack', 'Machine Learning', 'Docker & DevOps', 'GenAI', 'System Design', '25+ Paths'].map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">{tag}</span>
                    ))}
                  </div>
                </div>

                <Link to="/dashboard/roadmaps" className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors group/link">
                  Explore Roadmaps <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* ═══════════  CHAPTER 2 — Sharpen Through Battle  ═══════════ */}
          <div className="relative mb-24 lg:mb-32">
            <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-orange-400/40 via-orange-400/20 to-transparent" />

            <div className="flex items-start gap-6 lg:gap-10">
              <div className="hidden lg:flex flex-col items-center flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/20">
                  02
                </div>
              </div>

              <div className="flex-1">
                <div className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20 mb-4">
                  02
                </div>
                <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-2">Chapter Two</p>
                <h3 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
                  Sharpen Your Skills in the Arena
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg leading-relaxed max-w-2xl mb-8">
                  Theory alone won't cut it. Jump into <strong>Code Arena</strong> — challenge anyone to a live 1v1 DSA battle. Solve problems under pressure, climb the leaderboard, and prove your skills when it matters most. This is where you stop studying and start <em>performing</em>.
                </p>

                {/* Visual: Live battle mockup */}
                <div className="relative bg-gradient-to-br from-orange-50/80 to-amber-50/50 dark:from-gray-900/80 dark:to-gray-900/50 rounded-2xl border border-orange-200/60 dark:border-gray-800/60 p-6 lg:p-8">
                  {/* Battle scene */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ADB5] to-cyan-500 flex items-center justify-center text-white text-sm font-bold">Y</div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-bold text-sm">You</p>
                        <p className="text-emerald-500 text-xs font-semibold">Solving...</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-500 font-black text-sm">VS</span>
                        <Zap className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="text-gray-400 text-[10px] mt-1">Live Battle</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-gray-900 dark:text-white font-bold text-sm">Opponent</p>
                        <p className="text-orange-400 text-xs font-semibold">Thinking...</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold">O</div>
                    </div>
                  </div>

                  {/* Problem preview */}
                  <div className="bg-white/80 dark:bg-black/40 rounded-xl p-4 border border-orange-200/30 dark:border-gray-700/30 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">MEDIUM</span>
                      <span className="text-gray-500 text-xs">Two Sum Variants</span>
                    </div>
                    <div className="font-mono text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      <span className="text-purple-500">function</span> <span className="text-blue-500">solve</span>(nums, target) {'{'}<br />
                      <span className="text-gray-400 ml-4">// Your solution here...</span><br />
                      {'}'}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {['1v1 Real-time', 'DSA Problems', 'Skill Ratings', 'Live Leaderboard'].map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">{tag}</span>
                    ))}
                  </div>
                </div>

                <Link to="/code-arena" className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors group/link">
                  Enter the Arena <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* ═══════════  CHAPTER 3 — Master DSA  ═══════════ */}
          <div className="relative mb-24 lg:mb-32">
            <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400/40 via-emerald-400/20 to-transparent" />

            <div className="flex items-start gap-6 lg:gap-10">
              <div className="hidden lg:flex flex-col items-center flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-500/20">
                  03
                </div>
              </div>

              <div className="flex-1">
                <div className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20 mb-4">
                  03
                </div>
                <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2">Chapter Three</p>
                <h3 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
                  Crack Any Interview
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg leading-relaxed max-w-2xl mb-8">
                  3,000+ hand-picked DSA questions across every difficulty level — with AI-powered hints when you're stuck. Whether it's your first interview or your tenth, you'll walk in knowing you've seen it all. Categorized by topic, company, and difficulty.
                </p>

                {/* Visual: Question cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { difficulty: 'Easy', color: 'emerald', count: '1,350+', emoji: '🟢', desc: 'Build confidence with fundamentals' },
                    { difficulty: 'Medium', color: 'amber', count: '1,050+', emoji: '🟡', desc: 'The bread & butter of interviews' },
                    { difficulty: 'Hard', color: 'red', count: '600+', emoji: '🔴', desc: 'For FAANG-level preparation' },
                  ].map((d, i) => (
                    <div key={i} className={`relative bg-gradient-to-br from-${d.color}-50/80 to-${d.color}-50/30 dark:from-gray-900/80 dark:to-gray-900/50 rounded-xl border border-${d.color}-200/60 dark:border-gray-800/60 p-5 group/card hover:scale-[1.02] transition-transform`}>
                      <div className="text-3xl mb-3">{d.emoji}</div>
                      <p className="text-gray-900 dark:text-white font-black text-2xl mb-1">{d.count}</p>
                      <p className="text-gray-900 dark:text-white font-bold text-sm mb-1">{d.difficulty}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{d.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  {['AI Hints', 'Company-wise', 'Topic-wise', 'Interview Prep', 'Smart Guidance'].map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{tag}</span>
                  ))}
                </div>

                <Link to="/code-arena" className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors group/link">
                  Start Practicing <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* ═══════════  CHAPTER 4 — Connect & Collaborate  ═══════════ */}
          <div className="relative mb-24 lg:mb-32">
            <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#00ADB5]/40 via-[#00ADB5]/20 to-transparent" />

            <div className="flex items-start gap-6 lg:gap-10">
              <div className="hidden lg:flex flex-col items-center flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#00ADB5]/20">
                  04
                </div>
              </div>

              <div className="flex-1">
                <div className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#00ADB5]/20 mb-4">
                  04
                </div>
                <p className="text-[#00ADB5] text-xs font-bold uppercase tracking-widest mb-2">Chapter Four</p>
                <h3 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
                  Build With Real Developers
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg leading-relaxed max-w-2xl mb-8">
                  Coding alone gets lonely — and it slows you down. On <strong>Developer Connect</strong>, you'll find teammates for real-world projects, message developers directly, create topic-based groups, and earn free certificates when you ship. This is your professional network, built while you build.
                </p>

                {/* Visual: Chat / collaboration mockup */}
                <div className="relative bg-gradient-to-br from-teal-50/80 to-cyan-50/50 dark:from-gray-900/80 dark:to-gray-900/50 rounded-2xl border border-teal-200/60 dark:border-gray-800/60 p-6 lg:p-8">
                  <div className="space-y-4">
                    {/* Simulated conversation */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">R</div>
                      <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl rounded-tl-sm px-4 py-2.5 max-w-md">
                        <p className="text-gray-900 dark:text-white text-sm">Hey! I'm building a React + Node e-commerce app. Looking for a backend dev — interested?</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-[#00ADB5]/10 dark:bg-[#00ADB5]/20 rounded-xl rounded-tr-sm px-4 py-2.5 max-w-md">
                        <p className="text-gray-900 dark:text-white text-sm">Absolutely! I just finished a Node.js roadmap. Let's create a project group 🚀</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#00ADB5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">Y</div>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                      <span className="text-[10px] text-gray-400 font-medium px-2">Project created • Certificate earned on completion</span>
                      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-teal-200/30 dark:border-gray-800/30">
                    {['Real Projects', 'Direct Messaging', 'Free Certificates', 'Topic Groups'].map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#00ADB5]/10 text-[#00ADB5] border border-[#00ADB5]/20">{tag}</span>
                    ))}
                  </div>
                </div>

                <Link to="/developer-connect" className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-[#00ADB5] hover:text-[#00d4de] transition-colors group/link">
                  Join the Community <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* ═══════════  CHAPTER 5 — Contribute to Open Source  ═══════════ */}
          <div className="relative mb-20">
            <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-400/40 via-violet-400/20 to-transparent" />

            <div className="flex items-start gap-6 lg:gap-10">
              <div className="hidden lg:flex flex-col items-center flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-violet-500/20">
                  05
                </div>
              </div>

              <div className="flex-1">
                <div className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-violet-500/20 mb-4">
                  05
                </div>
                <p className="text-violet-500 text-xs font-bold uppercase tracking-widest mb-2">Chapter Five</p>
                <h3 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
                  Give Back to Open Source
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg leading-relaxed max-w-2xl mb-8">
                  The final unlocked level. Contribute to open-source projects, connect with maintainers, join community discussions, and build a GitHub profile that actually impresses. This is where learners become leaders.
                </p>

                {/* Visual: Contribution activity */}
                <div className="relative bg-gradient-to-br from-violet-50/80 to-purple-50/50 dark:from-gray-900/80 dark:to-gray-900/50 rounded-2xl border border-violet-200/60 dark:border-gray-800/60 p-6 lg:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                      { emoji: '🔀', label: 'Pull Requests', desc: 'Contribute real code to projects' },
                      { emoji: '💬', label: 'Discussions', desc: 'Join topic-based conversations' },
                      { emoji: '🌍', label: 'Global Network', desc: 'Connect across borders' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/[0.03] border border-violet-200/30 dark:border-gray-800/30">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <p className="text-gray-900 dark:text-white font-bold text-sm">{item.label}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {['Open Source', 'Real-time Chat', 'Collaboration', 'Community Driven'].map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">{tag}</span>
                    ))}
                  </div>
                </div>

                <Link to="/developer-connect" className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-violet-500 hover:text-violet-400 transition-colors group/link">
                  Start Contributing <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* ═══════════  THE DESTINATION — Where it all leads  ═══════════ */}
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-[#00ADB5]" />
            <div className="absolute inset-0 bg-black/5" />
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }} />

            <div className="relative px-8 py-12 lg:px-16 lg:py-16">
              <div className="text-center mb-10">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">The Result</p>
                <h3 className="text-3xl lg:text-4xl font-black text-white mb-3">
                  You, But Industry-Ready
                </h3>
                <p className="text-white/70 text-base max-w-xl mx-auto">
                  After walking this path, here's what you'll have built — not just skills, but proof.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 max-w-4xl mx-auto">
                {[
                  { icon: Map, value: '25+', label: 'Roadmaps Completed', emoji: '🗺️' },
                  { icon: Swords, value: '∞', label: 'Battles Won', emoji: '⚔️' },
                  { icon: Brain, value: '3K+', label: 'Problems Solved', emoji: '🧠' },
                  { icon: Users, value: '∞', label: 'Connections Made', emoji: '🤝' },
                  { icon: Award, value: '∞', label: 'Certificates Earned', emoji: '🏆' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <span className="text-3xl mb-2">{s.emoji}</span>
                    <p className="text-white font-black text-2xl">{s.value}</p>
                    <p className="text-white/60 text-[11px] uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-gray-900 font-bold text-sm hover:bg-white/90 transition-colors shadow-xl shadow-black/20 group/cta">
                  Start Your Journey — It's Free <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ===== WHY DEVELOPERS CHOOSE SKILLUPX — BENTO SHOWCASE ===== */}
      <section className="relative py-28 lg:py-36 overflow-hidden bg-gray-50 dark:bg-[#060606]">
        {/* Ambient glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#00ADB5]/[0.07] rounded-full blur-[150px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/[0.05] rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/[0.02] rounded-full blur-[200px]" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-gray-200 dark:border-white/[0.08] bg-gray-100 dark:bg-white/[0.03] backdrop-blur-sm mb-8">
              <div className="w-2 h-2 rounded-full bg-[#00ADB5] shadow-lg shadow-[#00ADB5]/50 animate-pulse" />
              <span className="text-[#00ADB5] text-xs font-semibold tracking-[0.2em] uppercase">The Unfair Advantage</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-gray-900 dark:text-white mb-6 leading-[1.08] tracking-tight">
              Why Developers Choose<br />
              <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-400 to-teal-300 bg-clip-text text-transparent">SkillUpX</span>
            </h2>
            <p className="text-gray-500 dark:text-white/70 max-w-xl mx-auto text-lg leading-relaxed">
              One platform that replaces five. No paywall. No scattered tools.<br className="hidden sm:block" />
              Just everything you need to level up.
            </p>
          </div>

          {/* ── BENTO GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 lg:gap-5">

            {/* ▸ Block 1 — CodeArena (spans 4 cols) — Hero block with terminal mockup */}
            <div className="md:col-span-4 group relative rounded-3xl bg-white dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.015] border border-gray-200 dark:border-white/[0.07] p-8 lg:p-10 overflow-hidden hover:border-orange-500/20 transition-all duration-700 shadow-sm dark:shadow-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/[0.06] to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Mini terminal mockup */}
              <div className="relative mb-8 rounded-xl bg-gray-900 dark:bg-black/80 border border-gray-200 dark:border-white/[0.06] overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-700 dark:border-white/[0.04] bg-gray-800 dark:bg-white/[0.02]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  <span className="ml-3 text-white/20 text-[11px] font-mono tracking-wide">codearena — battle_room_42</span>
                </div>
                <div className="px-5 py-4 font-mono text-[13px] space-y-2">
                  <p><span className="text-[#00ADB5]">→</span> <span className="text-white/80">Challenge received from</span> <span className="text-orange-400 font-semibold">@ninja_dev</span></p>
                  <p><span className="text-[#00ADB5]">→</span> <span className="text-white/80">Problem:</span> <span className="text-cyan-300">Two Sum</span> <span className="text-white/70">•</span> <span className="text-yellow-400/80 text-xs">Medium</span></p>
                  <p><span className="text-[#00ADB5]">→</span> <span className="text-white/80">Time limit:</span> <span className="text-yellow-300">15:00</span> <span className="text-white/70">|</span> <span className="text-white/70">Language: TypeScript</span></p>
                  <div className="w-full h-px bg-white/[0.10] my-1" />
                  <p><span className="text-green-400">✓</span> <span className="text-green-400/80">Solution accepted in</span> <span className="text-green-300 font-bold">4:32</span> <span className="text-white/70">— You win! +120 XP</span></p>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Swords className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-xs font-bold tracking-[0.2em] uppercase">CodeArena</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-3 leading-tight">Live 1v1 Code Battles</h3>
                <p className="text-gray-500 dark:text-white/70 max-w-lg leading-relaxed text-[15px]">
                  Challenge any developer to a real-time coding duel. Solve DSA problems under pressure, earn XP, and climb the global leaderboard. No other free platform offers this.
                </p>
              </div>
            </div>

            {/* ▸ Block 2 — Roadmaps (spans 2 cols) — Progress bars visual */}
            <div className="md:col-span-2 group relative rounded-3xl bg-white dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.015] border border-gray-200 dark:border-white/[0.07] p-7 lg:p-8 overflow-hidden hover:border-teal-500/20 transition-all duration-700 shadow-sm dark:shadow-none">
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-teal-500/[0.06] to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Mini roadmap progress visual */}
              <div className="relative mb-7 space-y-4">
                {[
                  { label: 'MERN Stack', progress: 85, color: 'from-[#00ADB5] to-cyan-400' },
                  { label: 'DSA Mastery', progress: 62, color: 'from-cyan-400 to-blue-400' },
                  { label: 'System Design', progress: 30, color: 'from-teal-400 to-emerald-400' },
                ].map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-gray-600 dark:text-white/70 text-xs font-medium">{r.label}</span>
                      <span className="text-gray-400 dark:text-white/50 text-xs font-mono">{r.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-white/[0.04] rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${r.color} rounded-full shadow-sm`} style={{ width: `${r.progress}%` }} />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ADB5] animate-pulse" />
                  <span className="text-gray-400 dark:text-white/50 text-[11px] font-mono">12 milestones unlocked</span>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Map className="w-4 h-4 text-teal-400" />
                  <span className="text-teal-400 text-xs font-bold tracking-[0.2em] uppercase">Roadmaps</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">25+ Learning Paths</h3>
                <p className="text-gray-500 dark:text-white/70 text-sm leading-relaxed">
                  Step-by-step roadmaps with milestone tracking, progress analytics, and verifiable certifications.
                </p>
              </div>
            </div>

            {/* ▸ Block 3 — Team Projects (spans 2 cols) — Mini kanban visual */}
            <div className="md:col-span-2 group relative rounded-3xl bg-white dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.015] border border-gray-200 dark:border-white/[0.07] p-7 lg:p-8 overflow-hidden hover:border-blue-500/20 transition-all duration-700 shadow-sm dark:shadow-none">
              <div className="absolute top-0 left-0 w-60 h-60 bg-gradient-to-br from-blue-500/[0.06] to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Mini kanban board */}
              <div className="relative mb-7 flex gap-2">
                {[
                  { title: 'To Do', items: ['Auth API', 'DB Schema'], dotColor: 'bg-white/20' },
                  { title: 'In Progress', items: ['Dashboard UI'], dotColor: 'bg-blue-400' },
                  { title: 'Done', items: ['Landing', 'CI/CD'], dotColor: 'bg-green-400' },
                ].map((col, i) => (
                  <div key={i} className="flex-1 rounded-lg bg-gray-100 dark:bg-white/[0.025] border border-gray-200 dark:border-white/[0.05] p-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
                      <p className="text-[10px] font-bold text-gray-400 dark:text-white/60 uppercase tracking-wider">{col.title}</p>
                    </div>
                    {col.items.map((item, j) => (
                      <div key={j} className="text-[11px] text-gray-600 dark:text-white/70 bg-gray-50 dark:bg-white/[0.03] rounded-md px-2 py-1.5 mb-1 border border-gray-200 dark:border-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-xs font-bold tracking-[0.2em] uppercase">Creator Corner</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">Real Team Projects</h3>
                <p className="text-gray-500 dark:text-white/70 text-sm leading-relaxed">
                  Kanban boards, sprint planning, and code reviews — build like professional dev teams.
                </p>
              </div>
            </div>

            {/* ▸ Block 4 — Developer Network (spans 4 cols) — Network graph visual */}
            <div className="md:col-span-4 group relative rounded-3xl bg-white dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.015] border border-gray-200 dark:border-white/[0.07] p-8 lg:p-10 overflow-hidden hover:border-purple-500/20 transition-all duration-700 shadow-sm dark:shadow-none">
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-500/[0.06] to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Network visualization */}
              <div className="relative mb-8 flex items-center justify-center">
                <div className="relative w-full max-w-md h-36">
                  {/* Connection lines SVG */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {[
                      { x2: '18%', y2: '18%' }, { x2: '82%', y2: '12%' },
                      { x2: '8%', y2: '78%' }, { x2: '88%', y2: '72%' },
                      { x2: '50%', y2: '3%' }, { x2: '42%', y2: '92%' },
                    ].map((l, i) => (
                      <line key={i} x1="50%" y1="50%" x2={l.x2} y2={l.y2} stroke="rgba(0,173,181,0.12)" strokeWidth="1" strokeDasharray="4 4" />
                    ))}
                  </svg>
                  {/* Central node - YOU */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00ADB5] to-cyan-600 flex items-center justify-center text-white font-black text-xs shadow-xl shadow-[#00ADB5]/20 border border-white/10">
                      YOU
                    </div>
                  </div>
                  {/* Orbiting developer nodes */}
                  {[
                    { emoji: '👨‍💻', x: '18%', y: '18%', delay: '0s' },
                    { emoji: '👩‍💻', x: '82%', y: '12%', delay: '0.5s' },
                    { emoji: '🧑‍💻', x: '8%', y: '78%', delay: '1s' },
                    { emoji: '👨‍🎓', x: '88%', y: '72%', delay: '1.5s' },
                    { emoji: '🧑‍🔬', x: '50%', y: '3%', delay: '0.7s' },
                    { emoji: '👩‍🎓', x: '42%', y: '92%', delay: '1.2s' },
                  ].map((node, i) => (
                    <div
                      key={i}
                      className="absolute w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-base hover:bg-gray-200 dark:hover:bg-white/[0.08] hover:scale-110 transition-all duration-300 cursor-default"
                      style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
                    >
                      {node.emoji}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-xs font-bold tracking-[0.2em] uppercase">Developer Connect</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-3 leading-tight">Your Developer Network</h3>
                <p className="text-gray-500 dark:text-white/70 max-w-lg leading-relaxed text-[15px]">
                  Direct messaging, study groups, mentorship, and open-source collaboration. A real network that grows with your career — not a generic forum.
                </p>
              </div>
            </div>

            {/* ▸ Block 5 — DSA Practice (spans 3 cols) — Animated bar chart */}
            <div className="md:col-span-3 group relative rounded-3xl bg-white dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.015] border border-gray-200 dark:border-white/[0.07] p-7 lg:p-8 overflow-hidden hover:border-green-500/20 transition-all duration-700 shadow-sm dark:shadow-none">
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-green-500/[0.06] to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Mini activity chart */}
              <div className="relative mb-7">
                <div className="flex items-end gap-1.5 h-24">
                  {[35, 60, 25, 80, 50, 90, 40, 70, 85, 55, 95, 45, 75, 65].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-green-500/30 to-green-400/10 group-hover:from-green-500/50 group-hover:to-green-400/20 transition-all duration-700 border-t border-green-400/20" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-300 dark:text-white/50 text-[10px] font-mono">Mon</span>
                  <span className="text-gray-300 dark:text-white/50 text-[10px] font-mono">Sun</span>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs font-bold tracking-[0.2em] uppercase">DSA Mastery</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">3,000+ Coding Problems</h3>
                <p className="text-gray-500 dark:text-white/70 text-sm leading-relaxed">
                  Categorized by topic, difficulty, and company. AI-powered hints to accelerate your interview prep.
                </p>
              </div>
            </div>

            {/* ▸ Block 6 — Certificates (spans 3 cols) — Mini certificate visual */}
            <div className="md:col-span-3 group relative rounded-3xl bg-white dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.015] border border-gray-200 dark:border-white/[0.07] p-7 lg:p-8 overflow-hidden hover:border-yellow-500/20 transition-all duration-700 shadow-sm dark:shadow-none">
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-yellow-500/[0.06] to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Mini certificate card */}
              <div className="relative mb-7 flex justify-center">
                <div className="relative w-full max-w-[220px] rounded-xl bg-gradient-to-br from-yellow-500/[0.06] to-orange-500/[0.03] border border-yellow-500/[0.12] p-5 group-hover:border-yellow-500/25 transition-all duration-500">
                  {/* Medal badge */}
                  <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-10 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent mx-auto" />
                    <p className="text-gray-400 dark:text-white/60 text-[9px] font-bold uppercase tracking-[0.15em]">Certificate of Completion</p>
                    <p className="text-gray-900 dark:text-white font-black text-sm tracking-tight">MERN Stack Mastery</p>
                    <div className="w-14 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent mx-auto" />
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <div className="w-1 h-1 rounded-full bg-yellow-500/40" />
                      <p className="text-gray-400 dark:text-white/50 text-[9px] font-mono">SkillUpX • Verified • 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold tracking-[0.2em] uppercase">Certificates</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">Verified Achievements</h3>
                <p className="text-gray-500 dark:text-white/70 text-sm leading-relaxed">
                  Earn certificates on completing roadmaps and milestones. Share on LinkedIn and showcase verified skills.
                </p>
              </div>
            </div>

          </div>

          {/* ── Bottom Proof Strip + CTA ── */}
          <div className="mt-16 lg:mt-20 flex flex-col items-center">
            {/* Stats ribbon */}
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12 px-8 py-5 rounded-2xl bg-gray-100 dark:bg-white/[0.025] border border-gray-200 dark:border-white/[0.05] mb-10">
              {[
                { val: '100%', label: 'Free to Start' },
                { val: '25+', label: 'Roadmaps' },
                { val: '3K+', label: 'Problems' },
                { val: '1v1', label: 'Live Battles' },
                { val: '∞', label: 'Possibilities' },
              ].map((s, i) => (
                <div key={i} className="text-center min-w-[70px]">
                  <p className="text-gray-900 dark:text-white font-black text-2xl tracking-tight">{s.val}</p>
                  <p className="text-gray-400 dark:text-white/60 text-[10px] uppercase tracking-[0.15em] mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            <p className="text-gray-500 dark:text-white/60 text-sm mb-6">
              Stop juggling five platforms. Start building your career in one.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-gradient-to-r from-[#00ADB5] to-cyan-500 text-white font-bold text-[15px] hover:shadow-2xl hover:shadow-[#00ADB5]/25 transition-all duration-300 hover:-translate-y-0.5 group/btn">
              Start Building — It's Free <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>

        </div>
      </section>

      {/* ===== ACHIEVEMENT MILESTONES — GAME LEVEL MAP ===== */}
      <section className="relative py-28 lg:py-36 overflow-hidden bg-gradient-to-b from-[#0c0a1d] via-[#111033] to-[#0c0a1d]">
        {/* Starfield / ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Nebula glows */}
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[180px]" />
          <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[200px]" />
          {/* Stars */}
          {[
            { x: '10%', y: '15%', s: 1, d: '0s' }, { x: '25%', y: '8%', s: 1.5, d: '1s' }, { x: '45%', y: '20%', s: 1, d: '0.5s' },
            { x: '65%', y: '10%', s: 2, d: '1.5s' }, { x: '80%', y: '18%', s: 1, d: '0.8s' }, { x: '92%', y: '25%', s: 1.5, d: '2s' },
            { x: '15%', y: '80%', s: 1, d: '0.3s' }, { x: '35%', y: '88%', s: 1.5, d: '1.2s' }, { x: '55%', y: '92%', s: 1, d: '0.7s' },
            { x: '75%', y: '85%', s: 2, d: '1.8s' }, { x: '88%', y: '78%', s: 1, d: '0.4s' }, { x: '5%', y: '45%', s: 1.5, d: '1.1s' },
            { x: '95%', y: '55%', s: 1, d: '0.9s' }, { x: '50%', y: '5%', s: 2, d: '2.2s' }, { x: '30%', y: '95%', s: 1, d: '1.6s' },
          ].map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{ left: star.x, top: star.y, width: star.s, height: star.s, animationDelay: star.d, animationDuration: '3s' }}
            />
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm mb-8">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-black tracking-[0.2em] uppercase">Level Up Your Career</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white mb-5 leading-[1.08] tracking-tight">
              Achievement{' '}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">Milestones</span>
            </h2>
            <p className="text-white/30 max-w-lg mx-auto text-lg leading-relaxed">
              Complete challenges, unlock rewards, and watch your developer profile transform.
            </p>
          </div>

          {/* ── GAME BOARD — Winding Path with Milestone Nodes ── */}
          <div className="relative">

            {/* SVG Winding Path (Desktop only) */}
            <svg className="absolute inset-0 w-full h-full hidden lg:block" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1000 600" fill="none">
              <defs>
                <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.4" />
                  <stop offset="30%" stopColor="#F97316" stopOpacity="0.3" />
                  <stop offset="60%" stopColor="#EC4899" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path d="M 80 100 Q 250 50 400 150 Q 550 250 700 120 Q 850 0 920 180 Q 970 300 800 350 Q 600 400 500 500 Q 400 580 200 480 Q 100 420 150 300" stroke="url(#pathGrad)" strokeWidth="3" strokeDasharray="12 8" fill="none" />
            </svg>

            {/* Milestone Grid — 3x2 on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 relative z-10">

              {[
                {
                  level: 1,
                  icon: '💻',
                  title: 'First Blood',
                  task: 'Complete 5 Projects',
                  reward: 'Gold Badge',
                  xp: '+200 XP',
                  gradient: 'from-yellow-500 to-amber-600',
                  glowColor: 'shadow-yellow-500/30',
                  borderColor: 'border-yellow-500/30 hover:border-yellow-400',
                  bgAccent: 'from-yellow-500/10 via-amber-500/5 to-transparent',
                  iconBg: 'bg-yellow-500/10',
                  textColor: 'text-yellow-400',
                  barColor: 'from-yellow-500 to-amber-500',
                  progress: 80,
                },
                {
                  level: 2,
                  icon: '⚔️',
                  title: 'Arena Warrior',
                  task: 'Win 10 Code Battles',
                  reward: '+500 Coins',
                  xp: '+350 XP',
                  gradient: 'from-red-500 to-orange-600',
                  glowColor: 'shadow-red-500/30',
                  borderColor: 'border-red-500/30 hover:border-red-400',
                  bgAccent: 'from-red-500/10 via-orange-500/5 to-transparent',
                  iconBg: 'bg-red-500/10',
                  textColor: 'text-red-400',
                  barColor: 'from-red-500 to-orange-500',
                  progress: 60,
                },
                {
                  level: 3,
                  icon: '👥',
                  title: 'Team Player',
                  task: 'Join 3 Teams',
                  reward: 'Collaborator Badge',
                  xp: '+280 XP',
                  gradient: 'from-pink-500 to-rose-600',
                  glowColor: 'shadow-pink-500/30',
                  borderColor: 'border-pink-500/30 hover:border-pink-400',
                  bgAccent: 'from-pink-500/10 via-rose-500/5 to-transparent',
                  iconBg: 'bg-pink-500/10',
                  textColor: 'text-pink-400',
                  barColor: 'from-pink-500 to-rose-500',
                  progress: 100,
                },
                {
                  level: 4,
                  icon: '🏆',
                  title: 'Scholar',
                  task: 'Earn 3 Certificates',
                  reward: 'Elite Status',
                  xp: '+500 XP',
                  gradient: 'from-emerald-500 to-teal-600',
                  glowColor: 'shadow-emerald-500/30',
                  borderColor: 'border-emerald-500/30 hover:border-emerald-400',
                  bgAccent: 'from-emerald-500/10 via-teal-500/5 to-transparent',
                  iconBg: 'bg-emerald-500/10',
                  textColor: 'text-emerald-400',
                  barColor: 'from-emerald-500 to-teal-500',
                  progress: 45,
                },
                {
                  level: 5,
                  icon: '⭐',
                  title: 'Rising Star',
                  task: 'Reach 4.8+ Rating',
                  reward: 'Star Developer',
                  xp: '+420 XP',
                  gradient: 'from-orange-500 to-yellow-600',
                  glowColor: 'shadow-orange-500/30',
                  borderColor: 'border-orange-500/30 hover:border-orange-400',
                  bgAccent: 'from-orange-500/10 via-yellow-500/5 to-transparent',
                  iconBg: 'bg-orange-500/10',
                  textColor: 'text-orange-400',
                  barColor: 'from-orange-500 to-yellow-500',
                  progress: 92,
                },
                {
                  level: 6,
                  icon: '🧠',
                  title: 'Code Master',
                  task: 'Solve 100+ DSA',
                  reward: 'Legendary Badge',
                  xp: '+600 XP',
                  gradient: 'from-violet-500 to-purple-600',
                  glowColor: 'shadow-violet-500/30',
                  borderColor: 'border-violet-500/30 hover:border-violet-400',
                  bgAccent: 'from-violet-500/10 via-purple-500/5 to-transparent',
                  iconBg: 'bg-violet-500/10',
                  textColor: 'text-violet-400',
                  barColor: 'from-violet-500 to-purple-500',
                  progress: 30,
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`group relative rounded-2xl bg-white/[0.03] backdrop-blur-sm border ${m.borderColor} p-6 overflow-hidden hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1.5 hover:${m.glowColor} hover:shadow-xl cursor-default`}
                >
                  {/* Accent gradient overlay */}
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${m.bgAccent} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Level badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${m.gradient} text-white text-[10px] font-black tracking-wider shadow-lg`}>
                      LVL {m.level}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl ${m.iconBg} border border-white/[0.06] flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      {m.icon}
                    </div>

                    {/* Title + XP */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-black text-white">{m.title}</h3>
                      <span className={`text-[11px] font-bold ${m.textColor} bg-white/[0.04] px-2 py-0.5 rounded-full`}>{m.xp}</span>
                    </div>

                    {/* Task */}
                    <p className="text-white/30 text-sm font-medium mb-4">{m.task}</p>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/20 text-[10px] font-bold uppercase tracking-wider">Progress</span>
                        <span className={`${m.textColor} text-[11px] font-bold`}>{m.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${m.barColor} rounded-full shadow-sm transition-all duration-1000`}
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Reward */}
                    <div className="flex items-center gap-2">
                      <Award className={`w-3.5 h-3.5 ${m.textColor}`} />
                      <span className="text-white/40 text-xs font-medium">Reward:</span>
                      <span className={`${m.textColor} text-xs font-bold`}>{m.reward}</span>
                      {m.progress === 100 && (
                        <span className="ml-auto text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">UNLOCKED</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* ── Player Stats Bar ── */}
          <div className="mt-14 lg:mt-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm p-6 lg:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {[
                { label: 'Total XP', value: '2,350', icon: <Zap className="w-5 h-5" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { label: 'Badges Earned', value: '12', icon: <Award className="w-5 h-5" />, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                { label: 'Current Streak', value: '23 days', icon: <TrendingUp className="w-5 h-5" />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: 'Global Rank', value: '#847', icon: <Trophy className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} border border-white/[0.06] flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className={`${stat.color} font-black text-xl lg:text-2xl`}>{stat.value}</p>
                    <p className="text-white/25 text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div className="mt-12 text-center">
            <p className="text-white/20 text-sm mb-5 font-medium">Every task completed brings you closer to your next badge.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 text-white font-bold text-sm hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-1 group/btn shadow-lg shadow-orange-500/15"
            >
              Start Earning Achievements <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
            </Link>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
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

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
