import { useState } from 'react';
import { Briefcase, Code2, Flame, Clock, Zap, Target } from 'lucide-react';

export default function DashboardComingSoon() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [hoveredLearning, setHoveredLearning] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Resume completion data
  const resumeSections = [
    { name: 'Personal', value: 100, color: '#06b6d4' },
    { name: 'Experience', value: 85, color: '#ec4899' },
    { name: 'Projects', value: 70, color: '#f59e0b' },
    { name: 'Skills', value: 90, color: '#8b5cf6' },
    { name: 'Certifications', value: 60, color: '#14b8a6' },
    { name: 'Education', value: 100, color: '#3b82f6' },
  ];

  // Company matches
  const companyMatches = [
    { name: 'Google', match: 92, roles: 5 },
    { name: 'Microsoft', match: 88, roles: 3 },
    { name: 'Amazon', match: 85, roles: 7 },
    { name: 'Meta', match: 82, roles: 4 },
    { name: 'Apple', match: 78, roles: 2 },
  ];

  // Technology stack
  const techStack = [
    { tech: 'React', proficiency: 95, projects: 12, color: '#06b6d4' },
    { tech: 'JavaScript', proficiency: 92, projects: 18, color: '#f59e0b' },
    { tech: 'TypeScript', proficiency: 85, projects: 8, color: '#3b82f6' },
    { tech: 'Node.js', proficiency: 80, projects: 6, color: '#10b981' },
    { tech: 'Python', proficiency: 75, projects: 4, color: '#8b5cf6' },
  ];

  // Platform usage
  const usageData = [
    { week: 'W1', hours: 8 },
    { week: 'W2', hours: 12 },
    { week: 'W3', hours: 15 },
    { week: 'W4', hours: 18 },
    { week: 'W5', hours: 22 },
    { week: 'W6', hours: 25 },
  ];

  // Marathon data
  const marathonData = [
    { day: 'Mon', points: 450 },
    { day: 'Tue', points: 520 },
    { day: 'Wed', points: 580 },
    { day: 'Thu', points: 620 },
    { day: 'Fri', points: 680 },
    { day: 'Sat', points: 750 },
    { day: 'Sun', points: 850 },
  ];

  // Learning Progress
  const learningProgress = [
    { skill: 'React Patterns', progress: 88, color: '#10b981' },
    { skill: 'System Design', progress: 72, color: '#06b6d4' },
    { skill: 'DevOps', progress: 55, color: '#f59e0b' },
    { skill: 'Cloud Architecture', progress: 65, color: '#8b5cf6' },
    { skill: 'Web Security', progress: 78, color: '#ec4899' },
    { skill: 'Performance Optimization', progress: 82, color: '#3b82f6' },
  ];

  // Project Activity
  const projectActivity = [
    { month: 'Jan', completed: 2, inProgress: 1, planned: 3 },
    { month: 'Feb', completed: 3, inProgress: 2, planned: 2 },
    { month: 'Mar', completed: 2, inProgress: 3, planned: 3 },
    { month: 'Apr', completed: 4, inProgress: 2, planned: 2 },
    { month: 'May', completed: 5, inProgress: 3, planned: 2 },
    { month: 'Jun', completed: 6, inProgress: 2, planned: 3 },
  ];

  // Skill Demand
  const skillDemand = [
    { skill: 'React', market: 95, yours: 95, color: '#06b6d4', gap: 0, trend: 'Perfect Match! 🎯' },
    { skill: 'JavaScript', market: 98, yours: 92, color: '#f59e0b', gap: 6, trend: 'Close Gap ↗️' },
    { skill: 'Node.js', market: 85, yours: 80, color: '#10b981', gap: 5, trend: 'Good Progress 👍' },
    { skill: 'TypeScript', market: 82, yours: 85, color: '#3b82f6', gap: -3, trend: 'Above Market! 🚀' },
    { skill: 'Python', market: 88, yours: 75, color: '#8b5cf6', gap: 13, trend: 'Focus Area 📚' },
  ];

  const overallCompletion = Math.round(
    resumeSections.reduce((sum, s) => sum + s.value, 0) / resumeSections.length
  );

  // Donut chart component
  const DonutChart = ({ value, color, size = 120 }: { value: number; color: string; size?: number }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{value}%</span>
        </div>
      </div>
    );
  };

  // 3D Card for Skill Comparison
  const Skill3DCard = ({ skill, market, yours, color, gap, trend }: { 
    skill: string; 
    market: number; 
    yours: number; 
    color: string; 
    gap: number; 
    trend: string 
  }) => {
    const isSelected = selectedSkill === skill;
    
    return (
      <div 
        className={`relative bg-white rounded-2xl p-6 shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 ${isSelected ? 'ring-4 scale-105' : ''}`}
        style={{ 
          borderColor: color,
          borderWidth: '2px',
          borderStyle: 'solid'
        }}
        onClick={() => setSelectedSkill(isSelected ? null : skill)}
      >
        <div 
          className="absolute inset-0 rounded-2xl opacity-20 blur-xl"
          style={{ 
            background: `linear-gradient(135deg, ${color}40, ${color}10)`
          }}
        />
        
        <div className="relative z-10">
          <h3 className="font-bold text-gray-900 text-lg mb-6 text-center">{skill}</h3>
          
          <div className="flex items-end justify-center gap-8 mb-6 h-40">
            <div 
              className="relative group"
              onMouseEnter={() => setHoveredSkill(`${skill}-market`)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <div className="flex flex-col items-center">
                <div 
                  className="w-16 rounded-t-xl shadow-2xl transition-all duration-500 relative overflow-hidden"
                  style={{ 
                    height: `${market * 1.2}px`,
                    background: `linear-gradient(180deg, ${color}dd, ${color}99)`,
                    boxShadow: `0 4px 20px ${color}60`
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-3"
                    style={{ 
                      background: `linear-gradient(90deg, ${color}ff, ${color}dd)`,
                      transform: 'perspective(100px) rotateX(45deg)',
                      transformOrigin: 'top'
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
                </div>
                <span className="text-xs font-bold mt-3 text-gray-700">Market</span>
                <span className="text-lg font-black mt-1" style={{ color }}>{market}%</span>
              </div>
              
              {hoveredSkill === `${skill}-market` && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shadow-2xl z-50">
                  Market Demand: {market}%
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                </div>
              )}
            </div>

            <div 
              className="relative group"
              onMouseEnter={() => setHoveredSkill(`${skill}-yours`)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <div className="flex flex-col items-center">
                <div 
                  className="w-16 rounded-t-xl shadow-2xl transition-all duration-500 relative overflow-hidden"
                  style={{ 
                    height: `${yours * 1.2}px`,
                    background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                    boxShadow: `0 4px 20px ${color}80`
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-3"
                    style={{ 
                      background: `linear-gradient(90deg, ${color}ff, ${color}ee)`,
                      transform: 'perspective(100px) rotateX(45deg)',
                      transformOrigin: 'top'
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
                </div>
                <span className="text-xs font-bold mt-3 text-gray-700">Your Level</span>
                <span className="text-lg font-black mt-1" style={{ color }}>{yours}%</span>
              </div>
              
              {hoveredSkill === `${skill}-yours` && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shadow-2xl z-50">
                  Your Level: {yours}%
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                </div>
              )}
            </div>
          </div>

          {isSelected && (
            <div className="mt-6 p-4 rounded-xl animate-pulse" style={{ backgroundColor: `${color}15` }}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Skill Gap:</span>
                  <span className={`text-lg font-black ${gap > 0 ? 'text-red-600' : gap < 0 ? 'text-green-600' : 'text-blue-600'}`}>
                    {gap > 0 ? `+${gap}%` : gap < 0 ? `${gap}%` : 'Perfect!'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Status:</span>
                  <span className="text-sm font-bold" style={{ color }}>{trend}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${(yours / market) * 100}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  {gap > 0 
                    ? `Focus on improving by ${gap}% to match market demand` 
                    : gap < 0 
                    ? `You're ${Math.abs(gap)}% ahead of market demand!` 
                    : 'Your skills perfectly match the market!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-3">
            Your Dashboard
          </h1>
          <p className="text-gray-600 text-xl font-medium">Visualize your growth and career potential</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Code2, label: 'Projects', value: '22', bg: 'from-blue-100 to-cyan-100', color: 'text-blue-600' },
            { icon: Briefcase, label: 'Companies', value: '28', bg: 'from-purple-100 to-pink-100', color: 'text-purple-600' },
            { icon: Flame, label: 'Streak', value: '19', bg: 'from-orange-100 to-red-100', color: 'text-orange-600' },
            { icon: Clock, label: 'Hours', value: '120', bg: 'from-green-100 to-emerald-100', color: 'text-green-600' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-6 shadow-lg border border-white hover:shadow-xl transition-all transform hover:-translate-y-1`}>
                <Icon className={`w-8 h-8 ${stat.color} mb-4`} />
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-lg border border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Resume Completion</h2>
            <div className="flex flex-col items-center">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
                {overallCompletion}%
              </div>
              <p className="text-gray-600 font-medium mb-8">Overall</p>
              <div className="grid grid-cols-2 gap-3 w-full">
                {resumeSections.map((section) => (
                  <div key={section.name} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: section.color }}></div>
                    <span className="text-xs font-medium text-gray-700 flex-1">{section.name}</span>
                    <span className="text-xs font-bold" style={{ color: section.color }}>{section.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg border border-purple-100">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Company Matches</h2>
            <div className="space-y-6">
              {companyMatches.map((company, idx) => {
                const colors = ['#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
                const color = colors[idx];
                
                return (
                  <div key={company.name} className="group cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{company.name}</h3>
                        <p className="text-xs text-gray-500">{company.roles} open roles</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color }}>{company.match}%</p>
                        <p className="text-xs text-gray-500">Match</p>
                      </div>
                    </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 shadow-lg group-hover:shadow-xl"
                        style={{
                          width: `${company.match}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}dd)`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 shadow-lg border border-indigo-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Technology Expertise</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {techStack.map((tech) => (
              <div key={tech.tech} className="p-4 bg-white rounded-xl border-2 text-center hover:shadow-lg transition-shadow" style={{ borderColor: tech.color }}>
                <p className="text-sm font-bold text-gray-900 mb-2">{tech.tech}</p>
                <div className="relative h-20 flex items-center justify-center mb-3">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="25" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                    <circle cx="30" cy="30" r="25" fill="none" stroke={tech.color} strokeWidth="3"
                      strokeDasharray={`${(tech.proficiency / 100) * 157} 157`}
                      strokeLinecap="round"
                      style={{ transformOrigin: '30px 30px', transform: 'rotate(-90deg)' }}
                    />
                    <text x="30" y="35" textAnchor="middle" fontSize="14" fontWeight="bold" fill={tech.color}>
                      {tech.proficiency}%
                    </text>
                  </svg>
                </div>
                <p className="text-xs text-gray-500">{tech.projects} projects</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 shadow-lg border border-cyan-100">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Platform Usage</h2>
            <div className="space-y-6">
              {usageData.map((item) => (
                <div key={item.week}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{item.week}</span>
                    <span className="text-sm font-bold text-cyan-600">{item.hours}h</span>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg transition-all duration-500"
                      style={{ width: `${(item.hours / 25) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 shadow-lg border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Marathon Progress</h2>
            <div className="flex items-end justify-between gap-2 h-80 px-4">
              {marathonData.map((item) => (
                <div key={item.day} className="flex flex-col items-center flex-1">
                  <div className="text-xs font-bold text-orange-600 mb-3 h-5">{item.points}</div>
                  <div className="w-full flex items-end justify-center h-60">
                    <div
                      className="w-10 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg shadow-md hover:shadow-lg transition-shadow"
                      style={{ height: `${(item.points / 850) * 240}px`, minHeight: '20px' }}
                    ></div>
                  </div>
                  <div className="text-xs font-semibold text-gray-700 mt-3">{item.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-lg border border-emerald-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-600" />
            Learning Progress
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {learningProgress.map((item) => (
              <div 
                key={item.skill} 
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                onMouseEnter={() => setHoveredLearning(item.skill)}
                onMouseLeave={() => setHoveredLearning(null)}
              >
                <DonutChart value={item.progress} color={item.color} size={110} />
                <h3 className="font-semibold text-gray-900 mt-4 text-center text-sm">{item.skill}</h3>
                {hoveredLearning === item.skill && (
                  <div className="mt-2 text-xs text-gray-600 font-medium animate-pulse">
                    Progress: {item.progress}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 shadow-lg border border-rose-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-rose-600" />
            Project Activity Timeline
          </h2>
          <div className="flex items-end justify-between gap-6 h-80 px-4">
            {projectActivity.map((item) => (
              <div key={item.month} className="flex flex-col items-center flex-1">
                <div className="flex items-end justify-center gap-2 h-64">
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-bold text-green-600 mb-2">{item.completed}</div>
                    <div
                      className="w-8 bg-green-500 rounded-t shadow-md hover:shadow-lg transition-shadow"
                      style={{ height: `${(item.completed / 6) * 200}px`, minHeight: '8px' }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-bold text-amber-600 mb-2">{item.inProgress}</div>
                    <div
                      className="w-8 bg-amber-500 rounded-t shadow-md hover:shadow-lg transition-shadow"
                      style={{ height: `${(item.inProgress / 3) * 200}px`, minHeight: '8px' }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-bold text-blue-600 mb-2">{item.planned}</div>
                    <div
                      className="w-8 bg-blue-500 rounded-t shadow-md hover:shadow-lg transition-shadow"
                      style={{ height: `${(item.planned / 3) * 200}px`, minHeight: '8px' }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs font-semibold text-gray-700 mt-4">{item.month}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-6 justify-center text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="font-medium">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="font-medium">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="font-medium">Planned</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-violet-100 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-violet-600" />
              Market Demand vs Your Skills
            </h2>
            <span className="text-sm text-gray-600 font-medium">Click on any card for detailed analytics</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillDemand.map((item) => (
              <Skill3DCard 
                key={item.skill}
                skill={item.skill}
                market={item.market}
                yours={item.yours}
                color={item.color}
                gap={item.gap}
                trend={item.trend}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}