import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Github, 
  ExternalLink,
  User,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  projectIndex: number;
  projectTitle: string;
  githubUrl: string;
  liveUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submittedAt: string;
  reviewedAt?: string;
}

const MentorDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewingSubmission, setReviewingSubmission] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  // Mock data - in production, fetch from Firebase
  useEffect(() => {
    const mockSubmissions: Submission[] = [
      {
        id: 'sub1',
        studentId: 'student1',
        studentName: 'Rahul Kumar',
        studentEmail: 'rahul@example.com',
        courseId: 'web-101',
        courseTitle: 'JavaScript Fundamentals',
        projectIndex: 0,
        projectTitle: 'Todo List App',
        githubUrl: 'https://github.com/rahul/todo-app',
        liveUrl: 'https://todo-app.vercel.app',
        status: 'pending',
        submittedAt: '2025-11-25T10:30:00Z'
      },
      {
        id: 'sub2',
        studentId: 'student2',
        studentName: 'Priya Sharma',
        studentEmail: 'priya@example.com',
        courseId: 'web-102',
        courseTitle: 'React.js Complete Guide',
        projectIndex: 1,
        projectTitle: 'E-commerce Product Page',
        githubUrl: 'https://github.com/priya/ecommerce',
        liveUrl: 'https://ecommerce-priya.vercel.app',
        status: 'pending',
        submittedAt: '2025-11-25T14:20:00Z'
      },
      {
        id: 'sub3',
        studentId: 'student3',
        studentName: 'Amit Singh',
        studentEmail: 'amit@example.com',
        courseId: 'web-101',
        courseTitle: 'JavaScript Fundamentals',
        projectIndex: 1,
        projectTitle: 'Weather Dashboard',
        githubUrl: 'https://github.com/amit/weather-app',
        liveUrl: '',
        status: 'approved',
        submittedAt: '2025-11-24T09:15:00Z',
        reviewedAt: '2025-11-24T16:30:00Z',
        feedback: 'Excellent work! Clean code and well-documented.'
      }
    ];

    setSubmissions(mockSubmissions);
  }, []);

  useEffect(() => {
    let filtered = submissions;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  }, [submissions, selectedStatus, searchTerm]);

  const handleApprove = (submissionId: string) => {
    const updatedSubmissions = submissions.map(s => {
      if (s.id === submissionId) {
        // Update localStorage for the student
        const courseId = s.courseId;
        const existingSubmissions = localStorage.getItem(`submissions_${courseId}`);
        if (existingSubmissions) {
          const parsed = JSON.parse(existingSubmissions);
          parsed[s.projectIndex] = {
            ...parsed[s.projectIndex],
            status: 'approved',
            feedback: feedback || 'Great work!',
            reviewedAt: new Date().toISOString()
          };
          localStorage.setItem(`submissions_${courseId}`, JSON.stringify(parsed));
        }

        return {
          ...s,
          status: 'approved' as const,
          feedback: feedback || 'Great work!',
          reviewedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setSubmissions(updatedSubmissions);
    setReviewingSubmission(null);
    setFeedback('');
    alert('✅ Project approved! Student will be notified.');
  };

  const handleReject = (submissionId: string) => {
    if (!feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }

    const updatedSubmissions = submissions.map(s => {
      if (s.id === submissionId) {
        // Update localStorage for the student
        const courseId = s.courseId;
        const existingSubmissions = localStorage.getItem(`submissions_${courseId}`);
        if (existingSubmissions) {
          const parsed = JSON.parse(existingSubmissions);
          parsed[s.projectIndex] = {
            ...parsed[s.projectIndex],
            status: 'rejected',
            feedback: feedback,
            reviewedAt: new Date().toISOString()
          };
          localStorage.setItem(`submissions_${courseId}`, JSON.stringify(parsed));
        }

        return {
          ...s,
          status: 'rejected' as const,
          feedback: feedback,
          reviewedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setSubmissions(updatedSubmissions);
    setReviewingSubmission(null);
    setFeedback('');
    alert('❌ Project rejected. Student will receive your feedback.');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold" style={{ color: '#00ADB5' }}>Mentor Dashboard</h1>
          <p className="text-gray-600 mt-1">Review and approve student project submissions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Reviews</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student, course, or project..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedStatus('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === 'approved'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setSelectedStatus('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedStatus === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No submissions found</p>
            </div>
          ) : (
            filteredSubmissions.map(submission => (
              <div key={submission.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Student & Project Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-400" />
                          {submission.studentName}
                        </h3>
                        <p className="text-sm text-gray-600">{submission.studentEmail}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        submission.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {submission.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm">
                        <span className="font-medium">Course:</span> {submission.courseTitle}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Project:</span> {submission.projectTitle}
                      </p>
                      <p className="text-sm flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Submitted: {formatDate(submission.submittedAt)}
                      </p>
                      {submission.reviewedAt && (
                        <p className="text-sm flex items-center gap-1 text-gray-600">
                          <CheckCircle className="w-4 h-4" />
                          Reviewed: {formatDate(submission.reviewedAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <a
                        href={submission.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all"
                      >
                        <Github className="w-4 h-4" />
                        View Code
                      </a>
                      {submission.liveUrl && (
                        <a
                          href={submission.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Live Demo
                        </a>
                      )}
                    </div>

                    {submission.feedback && (
                      <div className={`mt-4 p-3 rounded-lg text-sm ${
                        submission.status === 'approved' 
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}>
                        <p className="font-medium mb-1">Mentor Feedback:</p>
                        <p>{submission.feedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  {submission.status === 'pending' && (
                    <div className="lg:w-80 border-l lg:pl-6">
                      {reviewingSubmission === submission.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Feedback (optional for approval, required for rejection)
                            </label>
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Provide constructive feedback..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 h-32"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(submission.id)}
                              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(submission.id)}
                              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              setReviewingSubmission(null);
                              setFeedback('');
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingSubmission(submission.id)}
                          className="w-full px-6 py-3 rounded-lg font-bold text-white shadow-lg hover:shadow-xl transition-all"
                          style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}
                        >
                          Review Project
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
