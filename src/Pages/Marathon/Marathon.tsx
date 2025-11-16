import { useState, useEffect } from 'react';
import {
    Trophy,
    Clock,
    Code,
    PlayCircle,
    CheckCircle,
    Medal,
    Calendar,
    Target,
    TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDataContext } from '../../Context/UserDataContext';
import { useAuth } from '../../Context/AuthContext';

interface MCQOption {
    id: string;
    text: string;
}

interface MCQChallenge {
    id: string;
    title: string;
    type: 'MCQ';
    difficulty: string;
    points: number;
    timeLimit: number;
    topic: string;
    description: string;
    question: string;
    options: MCQOption[];
    correctAnswer: string;
}

interface CodeChallenge {
    id: string;
    title: string;
    type: 'Code';
    difficulty: string;
    points: number;
    timeLimit: number;
    topic: string;
    description: string;
    problem: string;
    starterCode: string;
}

interface LeaderboardUser {
    rank: number;
    name: string;
    score: number;
    streak: number;
    badge: string;
    isCurrentUser?: boolean;
}

interface Stat {
    title: string;
    value: string;
    icon: LucideIcon;
    color: string;
}

interface RecentChallenge {
    date: string;
    title: string;
    type: string;
    status: 'pending' | 'completed';
    points: number;
}

export default function Marathon() {
    const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
    const [codeSubmission, setCodeSubmission] = useState<string>('');
    const [todayChallenge, setTodayChallenge] = useState<MCQChallenge | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const { user } = useAuth();
    const { fetchTodayChallenge, submitMarathonAnswer, fetchLeaderboard, updateUserStreak, userprofile } = useDataContext();

    // Fetch today's challenge and leaderboard
    useEffect(() => {
        const loadData = async () => {
            try {
                const challenge = await fetchTodayChallenge();
                if (challenge) {
                    setTodayChallenge(challenge);
                } else {
                    // Set default challenge if none exists
                    const defaultChallenge: MCQChallenge = {
                        id: 'daily-47',
                        title: 'Array Manipulation Challenge',
                        type: 'MCQ',
                        difficulty: 'Medium',
                        points: 25,
                        timeLimit: 30,
                        topic: 'Data Structures',
                        description: 'Test your knowledge of array manipulation techniques and algorithms.',
                        question: 'What is the time complexity of finding the maximum element in an unsorted array of n elements?',
                        options: [
                            { id: 'a', text: 'O(1)' },
                            { id: 'b', text: 'O(log n)' },
                            { id: 'c', text: 'O(n)' },
                            { id: 'd', text: 'O(n log n)' }
                        ],
                        correctAnswer: 'c'
                    };
                    setTodayChallenge(defaultChallenge);
                }

                const leaderboardData = await fetchLeaderboard();
                const formattedLeaderboard = leaderboardData.map((leaderboardUser: any, index: number) => ({
                    rank: index + 1,
                    name: leaderboardUser.name || 'Anonymous',
                    score: leaderboardUser.marathon_score || 0,
                    streak: leaderboardUser.streakCount || 0,
                    badge: leaderboardUser.marathon_score > 2000 ? 'Champion' : leaderboardUser.marathon_score > 1500 ? 'Expert' : 'Intermediate',
                    isCurrentUser: leaderboardUser.id === user?.uid
                }));
                setLeaderboard(formattedLeaderboard);
            } catch (error) {
                console.error('Error loading marathon data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSubmitMCQ = async () => {
        if (!todayChallenge || !mcqAnswers[todayChallenge.id]) {
            alert('Please select an answer');
            return;
        }

        setSubmitting(true);
        try {
            const selectedAnswer = mcqAnswers[todayChallenge.id];
            const isCorrect = selectedAnswer === todayChallenge.correctAnswer;
            const points = isCorrect ? todayChallenge.points : 0;

            await submitMarathonAnswer(todayChallenge.id, selectedAnswer, isCorrect, points);
            await updateUserStreak();

            if (isCorrect) {
                alert(`Correct! You earned ${points} points!`);
            } else {
                alert('Incorrect answer. Better luck next time!');
            }

            // Refresh leaderboard
            const leaderboardData = await fetchLeaderboard();
            const formattedLeaderboard = leaderboardData.map((leaderboardUser: any, index: number) => ({
                rank: index + 1,
                name: leaderboardUser.name || 'Anonymous',
                score: leaderboardUser.marathon_score || 0,
                streak: leaderboardUser.streakCount || 0,
                badge: leaderboardUser.marathon_score > 2000 ? 'Champion' : leaderboardUser.marathon_score > 1500 ? 'Expert' : 'Intermediate',
                isCurrentUser: leaderboardUser.id === user?.uid
            }));
            setLeaderboard(formattedLeaderboard);
        } catch (error) {
            console.error('Error submitting answer:', error);
            alert('Error submitting answer. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCodeSubmit = async () => {
        if (!codeSubmission.trim()) {
            alert('Please write your solution');
            return;
        }

        setSubmitting(true);
        try {
            // For now, just submit as a code challenge (you can add test case validation later)
            const points = 0; // Would be calculated based on test cases
            await submitMarathonAnswer(codeChallenge.id, codeSubmission, false, points);
            alert('Code submitted for evaluation! Results will be available soon.');
            setCodeSubmission('');
        } catch (error) {
            console.error('Error submitting code:', error);
            alert('Error submitting code. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const codeChallenge: CodeChallenge = {
        id: 'code-12',
        title: 'Binary Search Implementation',
        type: 'Code',
        difficulty: 'Hard',
        points: 50,
        timeLimit: 60,
        topic: 'Algorithms',
        description: 'Implement binary search algorithm with edge case handling.',
        problem: `Given a sorted array of integers and a target value, implement binary search to find the index of the target.
Return -1 if the target is not found.

Example:
Input: arr = [1, 3, 5, 7, 9, 11], target = 7
Output: 3

Constraints:
- Array is sorted in ascending order
- Array length: 1 ≤ n ≤ 10^6
- Handle edge cases (empty array, single element, etc.)`,
        starterCode: `function binarySearch(arr, target) {
    // Your implementation here
    
    return -1;
}`
    };

    const userRank = leaderboard.find(u => u.isCurrentUser)?.rank || 0;
    const stats: Stat[] = [
        { title: 'Current Rank', value: userRank > 0 ? `#${userRank}` : 'N/A', icon: Trophy, color: 'text-yellow-600' },
        { title: 'Total Score', value: userprofile?.marathon_score?.toString() || '0', icon: Target, color: 'text-blue-600' },
        { title: 'Streak Days', value: userprofile?.streakCount?.toString() || '0', icon: TrendingUp, color: 'text-green-600' },
        { title: 'Challenges Solved', value: userprofile?.challenges_solved?.toString() || '0', icon: CheckCircle, color: 'text-purple-600' }
    ];

    const recentChallenges: RecentChallenge[] = [
        { date: 'Today', title: 'Array Manipulation', type: 'MCQ', status: 'pending', points: 25 },
        { date: 'Yesterday', title: 'String Algorithms', type: 'Code', status: 'completed', points: 45 },
        { date: '2 days ago', title: 'Tree Traversal', type: 'MCQ', status: 'completed', points: 30 },
        { date: '3 days ago', title: 'Dynamic Programming', type: 'Code', status: 'completed', points: 50 },
        { date: '4 days ago', title: 'Graph Theory', type: 'MCQ', status: 'completed', points: 35 }
    ];

    const getBadgeColor = (badge: string): string => {
        switch (badge) {
            case 'Champion': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'Expert': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'Advanced': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'Intermediate': return 'bg-green-100 text-green-700 border-green-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading marathon challenge...</div>
            </div>
        );
    }

    if (!todayChallenge) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">No challenge available today</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Daily Marathon 🏃‍♂️
                </h1>
                <p className="text-muted-foreground mt-1">Challenge yourself with daily coding problems and climb the leaderboard</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-lg shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <Icon className={`h-8 w-8 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Challenges */}
                <div className="lg:col-span-2 space-y-6">
                    {/* MCQ Challenge */}
                    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-lg shadow">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-xl font-semibold">
                                    <Trophy className="h-5 w-5 text-yellow-600" />
                                    Today's MCQ Challenge
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-1 rounded text-xs font-medium">
                                        {todayChallenge.difficulty}
                                    </span>
                                    <span className="border border-blue-300 px-2 py-1 rounded text-xs font-medium">
                                        {todayChallenge.points} pts
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {todayChallenge.timeLimit} minutes
                                </div>
                                <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4" />
                                    {todayChallenge.topic}
                                </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                                <h4 className="font-semibold mb-2">{todayChallenge.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{todayChallenge.description}</p>
                                <p className="font-medium">{todayChallenge.question}</p>
                            </div>

                            <div className="space-y-2">
                                {todayChallenge.options.map((option) => (
                                    <label key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-blue-50 cursor-pointer transition-colors">
                                        <input
                                            type="radio"
                                            name={`mcq-${todayChallenge.id}`}
                                            value={option.id}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMcqAnswers(prev => ({
                                                ...prev,
                                                [todayChallenge.id]: e.target.value
                                            }))}
                                            className="text-blue-600"
                                        />
                                        <span className="font-medium">{option.id.toUpperCase()})</span>
                                        <span>{option.text}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={handleSubmitMCQ}
                                disabled={!mcqAnswers[todayChallenge.id] || submitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {submitting ? 'Submitting...' : 'Submit Answer'}
                            </button>
                        </div>
                    </div>

                    {/* Code Challenge */}
                    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-lg shadow">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-xl font-semibold">
                                    <Code className="h-5 w-5 text-blue-600" />
                                    Coding Challenge
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="bg-red-100 text-red-700 border border-red-300 px-2 py-1 rounded text-xs font-medium">
                                        {codeChallenge.difficulty}
                                    </span>
                                    <span className="border border-green-300 px-2 py-1 rounded text-xs font-medium">
                                        {codeChallenge.points} pts
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {codeChallenge.timeLimit} minutes
                                </div>
                                <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4" />
                                    {codeChallenge.topic}
                                </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                <h4 className="font-semibold mb-2">{codeChallenge.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{codeChallenge.description}</p>
                                <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                                    {codeChallenge.problem}
                                </pre>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Your Solution:</label>
                                <textarea
                                    placeholder={codeChallenge.starterCode}
                                    value={codeSubmission}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCodeSubmission(e.target.value)}
                                    className="font-mono text-sm min-h-32 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCodeSubmit}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                                >
                                    <PlayCircle className="h-4 w-4" />
                                    Run & Submit
                                </button>
                                <button className="border border-purple-200 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-colors">
                                    Test Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-lg shadow">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <Medal className="h-5 w-5 text-orange-600" />
                                Leaderboard
                            </h3>
                        </div>
                        <div className="p-6 space-y-3">
                            {leaderboard.map((user) => (
                                <div
                                    key={user.rank}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${user.isCurrentUser
                                        ? 'bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${user.rank === 1 ? 'bg-yellow-500 text-white' :
                                        user.rank === 2 ? 'bg-gray-400 text-white' :
                                            user.rank === 3 ? 'bg-orange-600 text-white' :
                                                'bg-gray-200 text-gray-700'
                                        }`}>
                                        {user.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium truncate ${user.isCurrentUser ? 'text-blue-700' : ''}`}>
                                            {user.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeColor(user.badge)}`}>
                                                {user.badge}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                🔥 {user.streak}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{user.score.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-lg shadow">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                                Your Progress
                            </h3>
                        </div>
                        <div className="p-6 space-y-3">
                            {recentChallenges.map((challenge, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${challenge.status === 'completed'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {challenge.status === 'completed' ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : (
                                                <Clock className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{challenge.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <span>{challenge.date}</span>
                                                <span className="border px-1 py-0.5 rounded text-xs">
                                                    {challenge.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">+{challenge.points}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}