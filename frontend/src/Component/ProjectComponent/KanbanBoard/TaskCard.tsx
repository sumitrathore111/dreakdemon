import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  MessageSquare,
  Paperclip,
  User
} from 'lucide-react';
import { useMemo } from 'react';

// Local type definitions to avoid Vite module resolution issues
interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

interface TaskComment {
  id: string;
  content: string;
  author: string;
  authorName: string;
  authorAvatar?: string;
  mentions: string[];
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
}

interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description?: string;
}

interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

interface Assignee {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface KanbanTask {
  _id: string;
  boardId: string;
  columnId: string;
  projectId: string;
  title: string;
  description?: string;
  position: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  labels: string[];
  assignees: Assignee[];
  reporter: Assignee;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  subtasks: ChecklistItem[];
  checklists: { id: string; title: string; items: ChecklistItem[] }[];
  comments: TaskComment[];
  timeEntries: TimeEntry[];
  totalTimeSpent: number;
  attachments: TaskAttachment[];
  watchers: string[];
  sprintId?: string;
  storyPoints?: number;
  epicId?: string;
  completedAt?: string;
  completedBy?: string;
  // Review fields
  reviewStatus?: 'pending' | 'approved' | 'changes_requested' | 'not_submitted';
  reviewedBy?: Assignee;
  reviewedAt?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

interface BoardLabel {
  id: string;
  name: string;
  color: string;
}

interface TaskCardProps {
  task: KanbanTask;
  labels: BoardLabel[];
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export default function TaskCard({
  task,
  labels,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging
}: TaskCardProps) {
  const priorityColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  const priorityIcons = {
    low: <ChevronDown className="w-3 h-3" />,
    medium: <ChevronRight className="w-3 h-3" />,
    high: <AlertCircle className="w-3 h-3" />,
    critical: <AlertCircle className="w-3 h-3" />
  };

  // Calculate progress
  const subtaskProgress = useMemo(() => {
    if (task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(s => s.completed).length;
    return {
      completed,
      total: task.subtasks.length,
      percentage: Math.round((completed / task.subtasks.length) * 100)
    };
  }, [task.subtasks]);

  // Get labels with colors - handle both label IDs (strings) and label objects
  const taskLabels = useMemo(() => {
    if (!Array.isArray(task.labels)) return [];
    return task.labels
      .map(labelId => {
        // If labelId is already a label object with id, use it directly
        if (typeof labelId === 'object' && labelId !== null && 'id' in labelId) {
          return labelId as BoardLabel;
        }
        // If it's a string ID, find the matching label
        if (typeof labelId === 'string') {
          return labels.find(l => l.id === labelId);
        }
        return undefined;
      })
      .filter((label): label is BoardLabel => label !== undefined && label !== null && typeof label.id === 'string');
  }, [task.labels, labels]);

  // Check if overdue
  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.completedAt) return false;
    return new Date(task.dueDate) < new Date();
  }, [task.dueDate, task.completedAt]);

  // Format due date
  const formattedDueDate = useMemo(() => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays < 7) return `${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [task.dueDate]);

  // Format time spent
  const formattedTimeSpent = useMemo(() => {
    if (!task.totalTimeSpent) return null;
    const hours = Math.floor(task.totalTimeSpent / 60);
    const minutes = task.totalTimeSpent % 60;
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }, [task.totalTimeSpent]);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
        p-3 cursor-pointer transition-all duration-200
        hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600
        ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''}
      `}
    >
      {/* Labels */}
      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {taskLabels.map((label) => (
            <span
              key={label.id}
              className="px-2 py-0.5 text-xs rounded-full text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Subtask progress */}
      {subtaskProgress && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {subtaskProgress.completed}/{subtaskProgress.total}
            </span>
            <span>{subtaskProgress.percentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${subtaskProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Meta info row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
            {priorityIcons[task.priority]}
            <span className="capitalize">{task.priority}</span>
          </span>

          {/* Story points */}
          {task.storyPoints && (
            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded">
              {task.storyPoints} pts
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          {/* Comments count */}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3" />
              {task.comments.length}
            </span>
          )}

          {/* Attachments count */}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5">
              <Paperclip className="w-3 h-3" />
              {task.attachments.length}
            </span>
          )}
        </div>
      </div>

      {/* Bottom row: Due date, time, assignees */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs">
          {/* Due date */}
          {formattedDueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              <Calendar className="w-3 h-3" />
              {formattedDueDate}
            </span>
          )}

          {/* Time spent */}
          {formattedTimeSpent && (
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              {formattedTimeSpent}
            </span>
          )}
        </div>

        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees.slice(0, 3).map((assignee, index) => (
            <div
              key={typeof assignee._id === 'string' ? assignee._id : String(assignee._id) || `assignee-${index}`}
              className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
              title={assignee.name || 'Unknown'}
            >
              {assignee.avatar ? (
                <img src={assignee.avatar} alt={assignee.name || 'User'} className="w-full h-full rounded-full" />
              ) : (
                (assignee.name || 'U').charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
              +{task.assignees.length - 3}
            </div>
          )}
          {task.assignees.length === 0 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-3 h-3 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
