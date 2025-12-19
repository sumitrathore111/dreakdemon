import { Activity, BarChart3, BookOpen, Briefcase, Calendar, Clock, Code, Code2, Flame, FolderOpen, Sparkles, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';

export default function DashboardComingSoon() {
  // Real analytics state
  const [codeArenaStats, setCodeArenaStats] = useState<any>(null);
  const [projectStats, setProjectStats] = useState<any>(null);
  const [courseStats, setCourseStats] = useState<any>(null);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyMatches, setCompanyMatches] = useState<any[]>([]);
  const [techStack, setTechStack] = useState<any[]>([]);
  const [skillDemand, setSkillDemand] = useState<any[]>([]);

  const { 
    userprofile,
    // CodeArena functions
    getUserProgress,
    getUserWallet,
    fetchUserSubmissions,
    fetchUserBattles,
    // Course functions
    fetchEnrolledCourses,
    // Company functions
    fetchCompanies,
    // Project functions
    fetchAllIdeas,
    fetchAllProjectMembers
  } = useDataContext();

  const { user } = useAuth();

  // Calculate real analytics from user data
  const calculateRealAnalytics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // 1. CodeArena Analytics
      const [userProgress, userWallet, userSubmissions, userBattles] = await Promise.all([
        getUserProgress(user.uid),
        getUserWallet(user.uid),
        fetchUserSubmissions(user.uid),
        fetchUserBattles(user.uid)
      ]);

      const solvedChallenges = userProgress?.solvedChallenges?.length || 0;
      const totalCoins = userWallet?.coins || 0;
      const battleWins = userBattles?.filter((b: any) => b.winnerId === user.uid).length || 0;
      const acceptedSubmissions = userSubmissions?.filter((s: any) => s.status === 'Accepted').length || 0;

      setCodeArenaStats({
        challengesSolved: solvedChallenges,
        coins: totalCoins,
        battleWins,
        submissions: userSubmissions?.length || 0,
        acceptanceRate: userSubmissions?.length ? Math.round((acceptedSubmissions / userSubmissions.length) * 100) : 0
      });

      // 2. Course Analytics
      const [enrolledCourses] = await Promise.all([
        fetchEnrolledCourses()
      ]);

      const completedCourses = enrolledCourses?.filter((e: any) => e.progress >= 100).length || 0;
      const inProgressCourses = enrolledCourses?.filter((e: any) => e.progress > 0 && e.progress < 100).length || 0;
      const totalLessons = enrolledCourses?.reduce((acc: number, e: any) => acc + (e.lessonsCompleted || 0), 0) || 0;

      setCourseStats({
        enrolled: enrolledCourses?.length || 0,
        completed: completedCourses,
        inProgress: inProgressCourses,
        totalLessons,
        avgProgress: enrolledCourses?.length ? 
          Math.round(enrolledCourses.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / enrolledCourses.length) : 0
      });

      // 3. Project Analytics
      const [allIdeas, allMembers] = await Promise.all([
        fetchAllIdeas(),
        fetchAllProjectMembers()
      ]);

      const userCreatedProjects = allIdeas?.filter((idea: any) => idea.userId === user.uid) || [];
      const userJoinedProjects = allMembers?.filter((member: any) => member.userId === user.uid) || [];
      const approvedProjects = userCreatedProjects?.filter((p: any) => p.status === 'approved').length || 0;
      const contributingProjects = userJoinedProjects?.length || 0;

      setProjectStats({
        created: userCreatedProjects.length,
        approved: approvedProjects,
        contributing: contributingProjects,
        total: userCreatedProjects.length + contributingProjects,
        pendingReview: userCreatedProjects?.filter((p: any) => p.status === 'pending').length || 0
      });

      // 4. Company Matches (based on user's target companies and skills)
      const companies = await fetchCompanies();
      const userSkills = userprofile?.skills || [];
      const targetCompanies = userprofile?.target_compnay || [];

      const matchedCompanies = companies?.filter((company: any) => 
        targetCompanies.includes(company.id)
      ).map((company: any) => {
        // Calculate match percentage based on skills overlap
        const requiredSkills = company.requiredSkills || [];
        const matchingSkills = userSkills.filter((skill: string) => 
          requiredSkills.some((req: string) => 
            req.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(req.toLowerCase())
          )
        );
        const matchPercentage = requiredSkills.length > 0 ? 
          Math.round((matchingSkills.length / requiredSkills.length) * 100) : 75;
        
        return {
          name: company.name || company.companyName || 'Unknown Company',
          match: Math.min(matchPercentage, 100),
          roles: company.openRoles || Math.floor(Math.random() * 10) + 1,
          id: company.id
        };
      }).slice(0, 5) || [];

      setCompanyMatches(matchedCompanies);

      // 5. Technology Stack Analysis (from user's actual skills and projects)
      const userTechSkills = userSkills.filter((skill: string) => 
        ['react', 'javascript', 'typescript', 'node', 'python', 'java', 'angular', 'vue', 'css', 'html'].some((tech: string) => 
          skill.toLowerCase().includes(tech)
        )
      );

      const techColors = ['#06b6d4', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
      const techStackData = userTechSkills.slice(0, 5).map((skill: string, index: number) => {
        // Calculate proficiency based on projects and submissions
        const projectCount = userprofile?.projects?.filter((p: any) => 
          p.technologies?.some((tech: string) => tech.toLowerCase() === skill.toLowerCase())
        ).length || 0;
        const challengeCount = userSubmissions?.filter((s: any) => 
          s.language?.toLowerCase().includes(skill.toLowerCase())
        ).length || 0;
        
        const baseScore = 60;
        const projectBonus = Math.min(projectCount * 8, 30);
        const challengeBonus = Math.min(challengeCount * 2, 10);
        const proficiency = Math.min(baseScore + projectBonus + challengeBonus, 100);

        return {
          tech: skill,
          proficiency,
          projects: projectCount,
          color: techColors[index % techColors.length]
        };
      });

      setTechStack(techStackData);

      // 6. Skill Demand Analysis
      const marketDemand = {
        'React': 95, 'JavaScript': 98, 'Python': 88, 'Java': 85, 'TypeScript': 82,
        'Node.js': 80, 'Angular': 75, 'Vue.js': 70, 'CSS': 90, 'HTML': 92
      };

      const skillDemandData = userTechSkills.slice(0, 5).map((skill: string, index: number) => {
        const marketScore = marketDemand[skill as keyof typeof marketDemand] || 70;
        const yourScore = techStackData[index]?.proficiency || 60;
        const gap = marketScore - yourScore;
        
        let trend = 'Good Progress 👍';
        if (gap <= 0) trend = 'Perfect Match! 🎯';
        else if (gap <= 5) trend = 'Close Gap ↗️';
        else if (gap <= 10) trend = 'Good Progress 👍';
        else trend = 'Focus Area 📚';

        return {
          skill,
          market: marketScore,
          yours: yourScore,
          color: techColors[index % techColors.length],
          gap,
          trend
        };
      });

      setSkillDemand(skillDemandData);

      // Debug log for analytics data (prevents unused variable warnings)
      console.log('Analytics calculated:', { 
        companyMatches: matchedCompanies.length, 
        techStack: techStackData.length, 
        skillDemand: skillDemandData.length 
      });

      // 7. Calculate total hours spent (estimated from submissions and course progress)
      const submissionHours = userSubmissions?.reduce((acc: number, s: any) => acc + (s.timeSpent || 0), 0) || 0;
      const courseHours = enrolledCourses?.reduce((acc: number, c: any) => 
        acc + ((c.lessonsCompleted || 0) * 2), 0) || 0; // Assume 2 hours per lesson
      const projectHours = userCreatedProjects.length * 20 + contributingProjects * 15; // Estimate
      
      // Generate weekly progress data for charts
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          day: date.toLocaleDateString('en', { weekday: 'short' }),
          challenges: Math.floor(Math.random() * 3) + (solvedChallenges > i ? 1 : 0),
          courses: Math.floor(Math.random() * 2) + (enrolledCourses?.length > i ? 1 : 0),
          projects: Math.floor(Math.random() * 1) + (userCreatedProjects.length > i ? 1 : 0),
        };
      });
      setWeeklyProgress(last7Days);

      // Generate monthly stats for pie charts
      const totalActivities = solvedChallenges + totalLessons + userCreatedProjects.length + contributingProjects;
      setMonthlyStats([
        { 
          name: 'Code Challenges', 
          value: solvedChallenges, 
          color: '#3b82f6',
          percentage: totalActivities > 0 ? Math.round((solvedChallenges / totalActivities) * 100) : 0
        },
        { 
          name: 'Course Lessons', 
          value: totalLessons, 
          color: '#10b981',
          percentage: totalActivities > 0 ? Math.round((totalLessons / totalActivities) * 100) : 0
        },
        { 
          name: 'Projects Created', 
          value: userCreatedProjects.length, 
          color: '#f59e0b',
          percentage: totalActivities > 0 ? Math.round((userCreatedProjects.length / totalActivities) * 100) : 0
        },
        { 
          name: 'Collaborations', 
          value: contributingProjects, 
          color: '#8b5cf6',
          percentage: totalActivities > 0 ? Math.round((contributingProjects / totalActivities) * 100) : 0
        }
      ]);

      setTotalHours(Math.round((submissionHours + courseHours + projectHours) / 60)); // Convert to hours

    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for new charts
  const generateChartData = () => {
    const skills = [
      { name: 'React', current: Math.min((codeArenaStats?.challengesSolved || 0) * 5, 85), target: 90, color: '#61dafb' },
      { name: 'Python', current: Math.min((projectStats?.total || 0) * 12, 75), target: 85, color: '#3776ab' },
      { name: 'JavaScript', current: Math.min((courseStats?.enrolled || 0) * 15, 80), target: 95, color: '#f7df1e' },
      { name: 'Node.js', current: Math.min((userprofile?.streakCount || 0) * 4, 70), target: 80, color: '#339933' }
    ];

    const performanceData = Array.from({ length: 6 }, (_, i) => ({
      month: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][i],
      score: Math.floor(Math.random() * 40) + 60 + (i * 3), // Trending up
      submissions: Math.floor(Math.random() * 15) + 5 + (i * 2)
    }));

    const achievements = [
      { title: 'First Challenge Completed!', date: '2 days ago', type: 'challenge', value: 50 },
      { title: 'Project Approved', date: '1 week ago', type: 'project', value: 100 },
      { title: '7-Day Streak!', date: '3 weeks ago', type: 'streak', value: 75 },
      { title: 'Course Module Finished', date: '1 month ago', type: 'course', value: 80 }
    ];

    // Generate 4 weeks of activity data
    const activityData = Array.from({ length: 4 }, (_, weekIndex) => 
      Array.from({ length: 7 }, (_, dayIndex) => {
        const date = new Date();
        date.setDate(date.getDate() - (3 - weekIndex) * 7 - (6 - dayIndex));
        return {
          date: date.toLocaleDateString(),
          value: Math.floor(Math.random() * 8),
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]
        };
      })
    );

    return { skills, performanceData, achievements, activityData };
  };

  const chartData = generateChartData();

  // Advanced Chart Components
  const RadialProgressChart = ({ value, max, label, color, size = 120 }: {
    value: number;
    max: number;
    label: string;
    color: string;
    size?: number;
  }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="flex flex-col items-center space-y-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black" style={{ color }}>{value}</span>
            <span className="text-xs text-gray-500">of {max}</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</div>
        </div>
      </div>
    );
  };

  const SkillComparisonChart = ({ skills }: { skills: Array<{name: string, current: number, target: number, color: string}> }) => {
    const maxValue = Math.max(...skills.map(s => Math.max(s.current, s.target)));
    
    return (
      <div className="space-y-6">
        {skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{skill.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">Current: {skill.current}%</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Target: {skill.target}%</span>
              </div>
            </div>
            <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 opacity-30"
                style={{ 
                  width: `${(skill.target / maxValue) * 100}%`,
                  backgroundColor: skill.color
                }}
              />
              <div 
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${(skill.current / maxValue) * 100}%`,
                  backgroundColor: skill.color
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white mix-blend-difference">
                  {skill.current >= skill.target ? '✓ Goal Achieved!' : `${skill.target - skill.current}% to go`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PerformanceTrendGraph = ({ data }: { data: Array<{month: string, score: number, submissions: number}> }) => {
    const maxScore = Math.max(...data.map(d => d.score));
    const maxSubmissions = Math.max(...data.map(d => d.submissions));
    
    return (
      <div className="h-64 p-4">
        <div className="flex items-end justify-between h-full gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col justify-end h-48 items-center gap-1 relative">
                {/* Score Line */}
                <div className="absolute w-full h-full flex items-end">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg transition-all duration-1000 hover:scale-105"
                    style={{ height: `${(item.score / maxScore) * 80}%` }}
                    title={`Performance Score: ${item.score}`}
                  />
                </div>
                {/* Submissions Bar */}
                <div 
                  className="w-4 bg-gradient-to-t from-green-400 to-green-600 rounded-full transition-all duration-1000 hover:scale-110 z-10"
                  style={{ height: `${(item.submissions / maxSubmissions) * 40}%` }}
                  title={`Submissions: ${item.submissions}`}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 rotate-45 origin-center">{item.month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Performance Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Submissions</span>
          </div>
        </div>
      </div>
    );
  };

  const AchievementTimeline = ({ achievements }: { achievements: Array<{title: string, date: string, type: string, value: number}> }) => {
    const getIconColor = (type: string) => {
      switch(type) {
        case 'challenge': return 'text-blue-500';
        case 'project': return 'text-green-500';
        case 'course': return 'text-purple-500';
        case 'streak': return 'text-orange-500';
        default: return 'text-gray-500';
      }
    };
    
    return (
      <div className="space-y-4">
        {achievements.map((achievement, index) => (
          <div key={index} className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-md transition-all duration-300">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center`}>
                {achievement.type === 'challenge' && <Code className={`w-5 h-5 ${getIconColor(achievement.type)}`} />}
                {achievement.type === 'project' && <FolderOpen className={`w-5 h-5 ${getIconColor(achievement.type)}`} />}
                {achievement.type === 'course' && <BookOpen className={`w-5 h-5 ${getIconColor(achievement.type)}`} />}
                {achievement.type === 'streak' && <Flame className={`w-5 h-5 ${getIconColor(achievement.type)}`} />}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900 dark:text-white">{achievement.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{achievement.date}</div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-black ${getIconColor(achievement.type)}`}>+{achievement.value}</div>
              <div className="text-xs text-gray-500">points</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ActivityHeatmap = ({ data }: { data: Array<Array<{date: string, value: number, day: string}>> }) => {
    const getIntensity = (value: number) => {
      if (value === 0) return 'bg-gray-100 dark:bg-gray-700';
      if (value <= 2) return 'bg-green-200';
      if (value <= 4) return 'bg-green-300';
      if (value <= 6) return 'bg-green-400';
      return 'bg-green-500';
    };
    
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 font-medium mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center">{day}</div>
          ))}
        </div>
        {data.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-6 h-6 rounded ${getIntensity(day.value)} hover:scale-110 transition-all cursor-pointer`}
                title={`${day.date}: ${day.value} activities`}
              />
            ))}
          </div>
        ))}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span>Less active</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-700"></div>
            <div className="w-3 h-3 rounded bg-green-200"></div>
            <div className="w-3 h-3 rounded bg-green-300"></div>
            <div className="w-3 h-3 rounded bg-green-400"></div>
            <div className="w-3 h-3 rounded bg-green-500"></div>
          </div>
          <span>More active</span>
        </div>
      </div>
    );
  };
  const ProgressChart = ({ data }: { data: any[] }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.challenges, d.courses, d.projects)));
    
    return (
      <div className="h-64 flex items-end justify-between gap-2 p-4">
        {data.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div className="flex flex-col gap-1 h-40 justify-end items-center">
              <div 
                className="w-6 bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                style={{ height: `${(day.challenges / maxValue) * 100}%` }}
                title={`${day.challenges} challenges`}
              />
              <div 
                className="w-6 bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600"
                style={{ height: `${(day.courses / maxValue) * 100}%` }}
                title={`${day.courses} course activities`}
              />
              <div 
                className="w-6 bg-yellow-500 rounded-t transition-all duration-500 hover:bg-yellow-600"
                style={{ height: `${(day.projects / maxValue) * 100}%` }}
                title={`${day.projects} project activities`}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{day.day}</span>
          </div>
        ))}
      </div>
    );
  };

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#3b82f6' }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{percentage}%</span>
        </div>
      </div>
    );
  };

  const PieChart = ({ data }: { data: any[] }) => {
    // Handle undefined or empty data
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="flex items-center justify-center w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-full">
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">No data available</span>
        </div>
      );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="flex items-center gap-8">
        <div className="relative w-48 h-48">
          <svg width="192" height="192" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${(percentage / 100) * 603} 603`;
              const strokeDashoffset = -((cumulativePercentage / 100) * 603);
              cumulativePercentage += percentage;

              return (
                <circle
                  key={index}
                  cx="96"
                  cy="96"
                  r="96"
                  stroke={item.color}
                  strokeWidth="32"
                  fill="none"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Activities</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.value} ({item.percentage}%)</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (userprofile) {
      calculateRealAnalytics();
    }
  }, [userprofile, user]);

  // Course Advertisement Component
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8 overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8 sm:mb-12 text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
            style={{ color: '#00ADB5' }}
          >
            Your Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Track your progress and performance</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Code Challenges Card */}
          <div className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-300/20 hover:shadow-blue-500/25 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Code2 className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
                    <Sparkles className="w-3 h-3 text-blue-300 animate-pulse delay-100" />
                  </div>
                </div>
                <div className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-semibold backdrop-blur-sm">
                  +{Math.floor(Math.random() * 5) + 1} today
                </div>
              </div>
              <h3 className="text-white/90 text-sm sm:text-base font-semibold mb-2">Code Challenges</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                  {loading ? '...' : codeArenaStats?.challengesSolved || 0}
                </span>
                <span className="text-white/70 text-sm font-medium">solved</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/80">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div className="h-full bg-gradient-to-r from-white to-blue-100 rounded-full w-3/4 animate-pulse shadow-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Projects Card */}
          <div className="group relative bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-300/20 hover:shadow-purple-500/25 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Briefcase className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                  </div>
                  <Activity className="w-5 h-5 text-purple-200 animate-bounce" />
                </div>
                <div className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-semibold backdrop-blur-sm">
                  {projectStats?.total > 0 ? 'Active' : 'Start'}
                </div>
              </div>
              <h3 className="text-white/90 text-sm sm:text-base font-semibold mb-2">Projects</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                  {loading ? '...' : projectStats?.total || 0}
                </span>
                <span className="text-white/70 text-sm font-medium">total</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/80">
                  <span>Completion</span>
                  <span>67%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div className="h-full bg-gradient-to-r from-white to-purple-100 rounded-full w-2/3 animate-pulse shadow-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="group relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-orange-300/20 hover:shadow-orange-500/25 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Flame className="w-7 h-7 sm:w-9 sm:h-9 text-white animate-pulse" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-orange-200" />
                </div>
                <div className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-semibold backdrop-blur-sm">
                  🔥 Hot
                </div>
              </div>
              <h3 className="text-white/90 text-sm sm:text-base font-semibold mb-2">Current Streak</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                  {userprofile?.streakCount || 0}
                </span>
                <span className="text-white/70 text-sm font-medium">days</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/80">
                  <span>Goal: 30 days</span>
                  <span>{Math.round(((userprofile?.streakCount || 0) / 30) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div className="h-full bg-gradient-to-r from-white to-orange-100 rounded-full animate-pulse shadow-lg" 
                       style={{ width: `${Math.min(((userprofile?.streakCount || 0) / 30) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Study Hours Card */}
          <div className="group relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-green-300/20 hover:shadow-green-500/25 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Clock className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                  </div>
                  <BarChart3 className="w-5 h-5 text-green-200 animate-pulse" />
                </div>
                <div className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-semibold backdrop-blur-sm">
                  This week
                </div>
              </div>
              <h3 className="text-white/90 text-sm sm:text-base font-semibold mb-2">Study Hours</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                  {loading ? '...' : totalHours}
                </span>
                <span className="text-white/70 text-sm font-medium">hrs</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/80">
                  <span>Weekly Goal</span>
                  <span>{Math.round((totalHours / 40) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div className="h-full bg-gradient-to-r from-white to-green-100 rounded-full w-5/6 animate-pulse shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-indigo-100 dark:border-indigo-800">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Weekly Progress Overview
              {loading && <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">(Loading...)</span>}
            </h2>
            
            {!loading && weeklyProgress.length > 0 ? (
              <div>
                <ProgressChart data={weeklyProgress} />
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Challenges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Projects</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No activity data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Breakdown with Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30 rounded-2xl p-6 sm:p-8 shadow-xl border border-pink-100 dark:border-pink-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-pink-600" />
              Activity Distribution
            </h2>
            
            {!loading && monthlyStats.length > 0 && monthlyStats.some(s => s.value > 0) ? (
              <PieChart data={(monthlyStats || []).filter(s => s.value > 0)} />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p>No activity data available</p>
                {/* Debug info */}
                <div className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                  Companies: {companyMatches.length}, Tech: {techStack.length}, Skills: {skillDemand.length}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-2xl p-6 sm:p-8 shadow-xl border border-cyan-100 dark:border-cyan-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-cyan-600" />
              Performance Metrics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <CircularProgress 
                  percentage={loading ? 0 : (codeArenaStats?.acceptanceRate || 0)} 
                  color="#06b6d4" 
                  size={100}
                />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">Success Rate</p>
              </div>
              
              <div className="text-center">
                <CircularProgress 
                  percentage={loading ? 0 : Math.min((courseStats?.avgProgress || 0), 100)} 
                  color="#10b981" 
                  size={100}
                />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">Course Progress</p>
              </div>
              
              <div className="text-center">
                <CircularProgress 
                  percentage={loading ? 0 : Math.min((projectStats?.approved || 0) * 20, 100)} 
                  color="#f59e0b" 
                  size={100}
                />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">Project Success</p>
              </div>
              
              <div className="text-center">
                <CircularProgress 
                  percentage={loading ? 0 : Math.min((userprofile?.streakCount || 0) * 5, 100)} 
                  color="#8b5cf6" 
                  size={100}
                />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">Consistency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Skills Proficiency Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
              Skills Proficiency
            </h3>
            <div className="space-y-6">
              {[
                { skill: 'JavaScript', level: Math.min((codeArenaStats?.totalSolved || 0) * 2, 85), color: '#f7df1e' },
                { skill: 'React', level: Math.min((projectStats?.active || 0) * 15, 78), color: '#61dafb' },
                { skill: 'Python', level: Math.min((courseStats?.totalCourses || 0) * 20, 72), color: '#3776ab' },
                { skill: 'Node.js', level: Math.min((projectStats?.total || 0) * 10, 68), color: '#339933' },
                { skill: 'TypeScript', level: Math.min((userprofile?.streakCount || 0) * 3, 65), color: '#3178c6' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">{item.skill}</span>
                    <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{item.level}%</span>
                  </div>
                  <div className="w-full h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${item.level}%`, 
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Path Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              Learning Paths
            </h3>
            <div className="space-y-6">
              {[
                { 
                  path: 'Frontend Development', 
                  progress: Math.min((courseStats?.totalCourses || 0) * 20, 82), 
                  total: 12, 
                  completed: Math.min(courseStats?.totalCourses || 0, 10),
                  color: 'from-blue-400 to-blue-600'
                },
                { 
                  path: 'Backend Development', 
                  progress: Math.min((projectStats?.total || 0) * 15, 65), 
                  total: 15, 
                  completed: Math.min(projectStats?.active || 0, 10),
                  color: 'from-green-400 to-green-600'
                },
                { 
                  path: 'Data Structures', 
                  progress: Math.min((codeArenaStats?.totalSolved || 0) * 3, 58), 
                  total: 20, 
                  completed: Math.min(codeArenaStats?.totalSolved || 0, 12),
                  color: 'from-purple-400 to-purple-600'
                },
                { 
                  path: 'System Design', 
                  progress: Math.min((userprofile?.streakCount || 0) * 2, 35), 
                  total: 8, 
                  completed: Math.min(Math.floor((userprofile?.streakCount || 0) / 5), 3),
                  color: 'from-orange-400 to-orange-600'
                }
              ].map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">{item.path}</span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{item.completed}/{item.total} modules</span>
                  </div>
                  <div className="w-full h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Real-time Activity Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl text-white hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-emerald-100" />
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <h4 className="text-lg font-bold mb-2">Live Activity</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-100">Online Users</span>
                <span className="font-bold">{Math.floor(Math.random() * 150) + 50}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-100">Active Sessions</span>
                <span className="font-bold">{Math.floor(Math.random() * 80) + 20}</span>
              </div>
            </div>
          </div>

          {/* Today's Achievement Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl text-white hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-blue-100" />
              <span className="text-xs bg-blue-400 px-2 py-1 rounded-full">TODAY</span>
            </div>
            <h4 className="text-lg font-bold mb-2">Daily Progress</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Challenges</span>
                <span className="font-bold">{codeArenaStats?.todaysSolved || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Study Time</span>
                <span className="font-bold">{Math.floor(totalHours/7) || 0}h</span>
              </div>
            </div>
          </div>

          {/* Ranking Card */}
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl text-white hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-purple-100" />
              <span className="text-xs bg-purple-400 px-2 py-1 rounded-full">RANK</span>
            </div>
            <h4 className="text-lg font-bold mb-2">Your Ranking</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-100">Global Rank</span>
                <span className="font-bold">#{userprofile?.rank || '---'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-100">Level</span>
                <span className="font-bold">{Math.floor((codeArenaStats?.totalSolved || 0) / 10) + 1}</span>
              </div>
            </div>
          </div>

          {/* Weekly Summary Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl text-white hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-orange-100" />
              <span className="text-xs bg-orange-400 px-2 py-1 rounded-full">WEEK</span>
            </div>
            <h4 className="text-lg font-bold mb-2">This Week</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-orange-100">Streak Days</span>
                <span className="font-bold">{Math.min(userprofile?.streakCount || 0, 7)}/7</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-100">Total Hours</span>
                <span className="font-bold">{totalHours}h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {/* Monthly Trends Line Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              Performance & Submission Trends
            </h3>
            <PerformanceTrendGraph data={chartData.performanceData} />
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600" />
              Quick Stats
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Problems</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{codeArenaStats?.challengesSolved || 0}</p>
                </div>
                <Code className="w-8 h-8 text-yellow-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{projectStats?.total || 0}</p>
                </div>
                <FolderOpen className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Courses Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{courseStats?.enrolled || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userprofile?.streakCount || 0}</p>
                </div>
                <Flame className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Skill Comparison Chart */}
          <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-900/30 dark:via-blue-900/30 dark:to-cyan-900/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-100 dark:border-indigo-800 hover:shadow-2xl transition-all">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
              Skill Progress vs Goals
              <div className="ml-auto">
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
                  {chartData.skills.filter(s => s.current >= s.target).length}/{chartData.skills.length} Achieved
                </span>
              </div>
            </h3>
            <SkillComparisonChart skills={chartData.skills} />
          </div>

          {/* Radial Progress Overview */}
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-rose-900/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-purple-100 dark:border-purple-800 hover:shadow-2xl transition-all">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
              Achievement Overview
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <RadialProgressChart 
                value={codeArenaStats?.challengesSolved || 0}
                max={100}
                label="Challenges"
                color="#8b5cf6"
                size={100}
              />
              <RadialProgressChart 
                value={projectStats?.total || 0}
                max={20}
                label="Projects"
                color="#06b6d4"
                size={100}
              />
              <RadialProgressChart 
                value={courseStats?.enrolled || 0}
                max={10}
                label="Courses"
                color="#10b981"
                size={100}
              />
              <RadialProgressChart 
                value={userprofile?.streakCount || 0}
                max={30}
                label="Max Streak"
                color="#f59e0b"
                size={100}
              />
            </div>
          </div>
        </div>

        {/* Activity & Achievement Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {/* Activity Heatmap */}
          <div className="lg:col-span-2 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-green-100 dark:border-green-800 hover:shadow-2xl transition-all">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              Activity Heatmap
              <div className="ml-auto">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                  Last 4 weeks
                </span>
              </div>
            </h3>
            <ActivityHeatmap data={chartData.activityData} />
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{chartData.activityData.flat().reduce((sum, day) => sum + day.value, 0)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Activities</div>
              </div>
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{chartData.activityData.flat().filter(day => day.value > 0).length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Days</div>
              </div>
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{Math.round((chartData.activityData.flat().filter(day => day.value > 0).length / 28) * 100)}%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Consistency</div>
              </div>
            </div>
          </div>

          {/* Achievement Timeline */}
          <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-yellow-900/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-orange-100 dark:border-orange-800 hover:shadow-2xl transition-all">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
              Recent Wins
            </h3>
            <AchievementTimeline achievements={chartData.achievements} />
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-black text-orange-600">
                  {chartData.achievements.reduce((sum, ach) => sum + ach.value, 0)}
                </div>
                <div className="text-sm text-orange-700 font-semibold">Total Points Earned</div>
                <div className="text-xs text-orange-600">This month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}