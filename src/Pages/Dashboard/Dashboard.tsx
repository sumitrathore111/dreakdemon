import { useEffect, useState } from 'react';
import { Briefcase, Code2, Flame, Clock, Zap, } from 'lucide-react';
import { useDataContext } from '../../Context/UserDataContext';

export default function DashboardComingSoon() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [overallCompletion, setoverallCompletion] = useState<number>(0);
  const [catageryCompletion, setcatageryCompletion] = useState<object | null>(null)

  const { userprofile, calculateResumeCompletion, calculateCategoryCompletion } = useDataContext()



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

  // Learning Progress


  // Skill Demand
  const skillDemand = [
    { skill: 'React', market: 95, yours: 95, color: '#06b6d4', gap: 0, trend: 'Perfect Match! 🎯' },
    { skill: 'JavaScript', market: 98, yours: 92, color: '#f59e0b', gap: 6, trend: 'Close Gap ↗️' },
    { skill: 'Node.js', market: 85, yours: 80, color: '#10b981', gap: 5, trend: 'Good Progress 👍' },
    { skill: 'TypeScript', market: 82, yours: 85, color: '#3b82f6', gap: -3, trend: 'Above Market! 🚀' },
    { skill: 'Python', market: 88, yours: 75, color: '#8b5cf6', gap: 13, trend: 'Focus Area 📚' },
  ];

  useEffect(() => {
    if (userprofile) {

      setoverallCompletion(calculateResumeCompletion(userprofile))

      setcatageryCompletion(calculateCategoryCompletion(userprofile))
    }

  }, [userprofile])



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
        className={`relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 ${isSelected ? ' scale-105' : ''}`}
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
          <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-4 sm:mb-6 text-center">{skill}</h3>

          <div className="flex items-end justify-center gap-4 sm:gap-8 mb-4 sm:mb-6 h-32 sm:h-40">
            <div
              className="relative group"
              onMouseEnter={() => setHoveredSkill(`${skill}-market`)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-12 sm:w-16 rounded-t-xl shadow-2xl transition-all duration-500 relative overflow-hidden"
                  style={{
                    height: `${market * 1}px`,
                    background: `linear-gradient(180deg, ${color}dd, ${color}99)`,
                    boxShadow: `0 4px 20px ${color}60`
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-2 sm:h-3"
                    style={{
                      background: `linear-gradient(90deg, ${color}ff, ${color}dd)`,
                      transform: 'perspective(100px) rotateX(45deg)',
                      transformOrigin: 'top'
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
                </div>
                <span className="text-xs font-bold mt-2 sm:mt-3 text-gray-700">Market</span>
                <span className="text-base sm:text-lg font-black mt-1" style={{ color }}>{market}%</span>
              </div>

              {hoveredSkill === `${skill}-market` && (
                <div className="hidden sm:block absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shadow-2xl z-50">
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
                  className="w-12 sm:w-16 rounded-t-xl shadow-2xl transition-all duration-500 relative overflow-hidden"
                  style={{
                    height: `${yours * 1}px`,
                    background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                    boxShadow: `0 4px 20px ${color}80`
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-2 sm:h-3"
                    style={{
                      background: `linear-gradient(90deg, ${color}ff, ${color}ee)`,
                      transform: 'perspective(100px) rotateX(45deg)',
                      transformOrigin: 'top'
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
                </div>
                <span className="text-xs font-bold mt-2 sm:mt-3 text-gray-700">Your Level</span>
                <span className="text-base sm:text-lg font-black mt-1" style={{ color }}>{yours}%</span>
              </div>

              {hoveredSkill === `${skill}-yours` && (
                <div className="hidden sm:block absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shadow-2xl z-50">
                  Your Level: {yours}%
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                </div>
              )}
            </div>
          </div>

          {isSelected && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl animate-pulse" style={{ backgroundColor: `${color}15` }}>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Skill Gap:</span>
                  <span className={`text-base sm:text-lg font-black ${gap > 0 ? 'text-red-600' : gap < 0 ? 'text-green-600' : 'text-blue-600'}`}>
                    {gap > 0 ? `+${gap}%` : gap < 0 ? `${gap}%` : 'Perfect!'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Status:</span>
                  <span className="text-xs sm:text-sm font-bold" style={{ color }}>{trend}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 lg:p-8 overflow-x-hidden"
      style={{ backgroundColor: '#c2f7fa' }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8 sm:mb-12 text-center px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text  mb-2 sm:mb-3 break-words"
            style={{ color: '#00ADB5' }}
          >
            Your Dashboard
          </h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl font-medium break-words">Visualize your growth and career potential</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
          <div className={`bg-gradient-to-br  rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white hover:shadow-xl transition-all transform hover:-translate-y-1`}>
            <Code2 className={`w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2 sm:mb-4`} />
            <p className="text-gray-600 text-xs sm:text-sm font-medium">Projects</p>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-black text-blue-600`}>{userprofile?.projects?.length || 0}</p>
          </div>
          <div className={`bg-gradient-to-br  rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white hover:shadow-xl transition-all transform hover:-translate-y-1`}>
            <Briefcase className={`w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mb-2 sm:mb-4`} />
            <p className="text-gray-600 text-xs sm:text-sm font-medium">Companies</p>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-black text-purple-600`}>{userprofile?.target_compnay?.length || 0}</p>
          </div>
          <div className={`bg-gradient-to-br  rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white hover:shadow-xl transition-all transform hover:-translate-y-1`}>
            <Flame className={`w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mb-2 sm:mb-4`} />
            <p className="text-gray-600 text-xs sm:text-sm font-medium">Streak</p>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-black text-orange-600`}>{userprofile?.streakCount || 0}</p>
          </div>
          <div className={`bg-gradient-to-br  rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white hover:shadow-xl transition-all transform hover:-translate-y-1`}>
            <Clock className={`w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2 sm:mb-4`} />
            <p className="text-gray-600 text-xs sm:text-sm font-medium">Hours</p>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-black text-green-600`}>0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className=" rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 sm:mb-8">Resume Completion</h2>
            <div className="flex flex-col items-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 mb-3 sm:mb-4">
                {overallCompletion}%
              </div>
              <p className="text-gray-600 font-medium mb-6 sm:mb-8">Overall</p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                <div className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#06b6d4' }}></div>
                  <span className="text-xs font-medium text-gray-700 flex-1 truncate">Personal</span>
                  <span className="text-xs font-bold" style={{ color: '#06b6d4' }}>{(catageryCompletion as { Personal?: number })?.Personal ?? 0}%</span>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#ec4899' }}></div>
                  <span className="text-xs font-medium text-gray-700 flex-1 truncate">Experience</span>
                  <span className="text-xs font-bold" style={{ color: '#ec4899' }}>{(catageryCompletion as { Experience?: number })?.Experience ?? 0}%</span>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span className="text-xs font-medium text-gray-700 flex-1 truncate">Projects</span>
                  <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>{(catageryCompletion as { Projects?: number })?.Projects ?? 0}%</span>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#8b5cf6' }}></div>
                  <span className="text-xs font-medium text-gray-700 flex-1 truncate">Skills</span>
                  <span className="text-xs font-bold" style={{ color: '#8b5cf6' }}>{(catageryCompletion as { Skills?: number })?.Skills ?? 0}%</span>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#14b8a6' }}></div>
                  <span className="text-xs font-medium text-gray-700 flex-1 truncate">Certifications</span>
                  <span className="text-xs font-bold" style={{ color: '#14b8a6' }}>{(catageryCompletion as { Certifications?: number })?.Certifications ?? 0}%</span>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span className="text-xs font-medium text-gray-700 flex-1 truncate">Education</span>
                  <span className="text-xs font-bold" style={{ color: '#3b82f6' }}>{(catageryCompletion as { Education?: number })?.Education ?? 0}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-purple-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 sm:mb-8">Company Matches</h2>
            <div className="space-y-4 sm:space-y-6">
              {companyMatches.map((company, idx) => {
                const colors = ['#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
                const color = colors[idx];

                return (
                  <div key={company.name} className="group cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">{company.name}</h3>
                        <p className="text-xs text-gray-500">{company.roles} open roles</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-bold" style={{ color }}>{company.match}%</p>
                        <p className="text-xs text-gray-500">Match</p>
                      </div>
                    </div>
                    <div className="relative h-2 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
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

        <div className=" rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-indigo-100 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 sm:mb-8">Technology Expertise</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {techStack.map((tech) => (
              <div key={tech.tech} className="p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border-2 text-center hover:shadow-lg transition-shadow" style={{ borderColor: tech.color }}>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mb-2">{tech.tech}</p>
                <div className="relative h-16 sm:h-20 flex items-center justify-center mb-2 sm:mb-3">
                  <svg width="50" height="50" viewBox="0 0 60 60" className="sm:w-[60px] sm:h-[60px]">
                    <circle cx="30" cy="30" r="25" fill="none" stroke="#e5e7eb" strokeWidth="3" />
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
        <div className=" rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-violet-100 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
              Market Demand vs Your Skills
            </h2>
            <span className="text-xs sm:text-sm text-gray-600 font-medium">Click on any card for detailed analytics</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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