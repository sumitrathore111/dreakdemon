import {
    BarChart2,
    CheckCircle2,
    Clock,
    RefreshCw,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AnalyticsData {
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
    overdue: number;
    byPriority: Record<string, number>;
    byColumn: Record<string, number>;
  };
  time: {
    totalSpent: number;
    totalEstimated: number;
    efficiency: number;
  };
  sprints: {
    total: number;
    completed: number;
    averageVelocity: number;
  };
  team: {
    memberCount: number;
    tasksPerMember: number;
    completedPerMember: number;
  };
}

interface ProjectAnalyticsProps {
  projectId: string;
}

export default function ProjectAnalytics({ projectId }: ProjectAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_URL}/boards/project/${projectId}/analytics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await res.json();
        setData(analyticsData);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId]);

  // Format time (minutes to hours/minutes)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Priority colors for chart
  const priorityColors: Record<string, string> = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    critical: '#EF4444'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-red-500">Failed to load analytics</p>
      </div>
    );
  }

  // Calculate max value for bar chart scaling
  const maxColumnTasks = Math.max(...Object.values(data.tasks.byColumn), 1);

  return (
    <div className="space-y-6 p-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
              <Target className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.tasks.total}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Completed</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.tasks.completed}/{data.tasks.total}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${data.tasks.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {data.tasks.completionRate}%
              </p>
            </div>
          </div>
          {data.tasks.overdue > 0 && (
            <p className="mt-4 text-sm text-red-500">
              ⚠️ {data.tasks.overdue} overdue tasks
            </p>
          )}
        </div>

        {/* Time Tracking */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(data.time.totalSpent)}
              </p>
            </div>
          </div>
          {data.time.totalEstimated > 0 && (
            <p className="mt-4 text-sm text-gray-500">
              Est: {formatTime(data.time.totalEstimated)} ({data.time.efficiency}% efficiency)
            </p>
          )}
        </div>

        {/* Team */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.team.memberCount}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            ~{data.team.tasksPerMember} tasks per member
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks by Column */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-teal-500" />
            Tasks by Column
          </h3>
          <div className="space-y-3">
            {Object.entries(data.tasks.byColumn).map(([column, count]) => (
              <div key={column}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{column}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full transition-all duration-500 flex items-center justify-end px-2"
                    style={{ width: `${(count / maxColumnTasks) * 100}%` }}
                  >
                    {count > 0 && (
                      <span className="text-xs text-white font-medium">{count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-teal-500" />
            Tasks by Priority
          </h3>
          <div className="flex items-center justify-center gap-4 h-48">
            {Object.entries(data.tasks.byPriority).map(([priority, count]) => {
              const maxPriorityTasks = Math.max(...Object.values(data.tasks.byPriority), 1);
              const height = (count / maxPriorityTasks) * 100;
              return (
                <div key={priority} className="flex flex-col items-center gap-2">
                  <div className="relative h-36 w-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-end">
                    <div
                      className="w-full rounded-lg transition-all duration-500"
                      style={{
                        backgroundColor: priorityColors[priority],
                        height: `${height}%`,
                        minHeight: count > 0 ? '8px' : '0'
                      }}
                    />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                  <span className="text-xs capitalize text-gray-500">{priority}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sprint Stats */}
      {data.sprints.total > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" />
            Sprint Performance
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.sprints.total}
              </p>
              <p className="text-sm text-gray-500">Total Sprints</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {data.sprints.completed}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-600">
                {data.sprints.averageVelocity}
              </p>
              <p className="text-sm text-gray-500">Avg Velocity (pts)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
