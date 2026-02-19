import { AlertCircle, Check, Loader2, LogIn, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { API_URL } from '../service/apiConfig';

interface InviteInfo {
  projectTitle: string;
  projectDescription?: string;
  invitedByName: string;
  expiresAt: string;
  status: string;
}

export default function JoinProjectViaLink() {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getToken = () => localStorage.getItem('authToken');

  useEffect(() => {
    const validateInvite = async () => {
      if (!inviteToken) {
        setError('Invalid invite link');
        setLoading(false);
        return;
      }

      try {
        const token = getToken();
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/project-invites/join/${inviteToken}`, {
          headers
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Invalid invite link');
        }

        setInviteInfo(data.invite);
      } catch (err) {
        console.error('Error validating invite:', err);
        setError(err instanceof Error ? err.message : 'Failed to validate invite');
      } finally {
        setLoading(false);
      }
    };

    validateInvite();
  }, [inviteToken]);

  const handleJoin = async () => {
    if (!user) {
      // Store the invite URL to redirect back after login
      localStorage.setItem('pendingInvite', `/project/join/${inviteToken}`);
      navigate('/login');
      return;
    }

    try {
      setJoining(true);
      setError(null);

      const token = getToken();
      const response = await fetch(`${API_URL}/project-invites/join/${inviteToken}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join project');
      }

      setSuccess(true);

      // Redirect to workspace after short delay
      setTimeout(() => {
        navigate(`/dashboard/projects/workspace/${data.projectId}`);
      }, 1500);
    } catch (err) {
      console.error('Error joining project:', err);
      setError(err instanceof Error ? err.message : 'Failed to join project');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Validating invite link...</p>
        </div>
      </div>
    );
  }

  if (error && !inviteInfo) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Invite
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Successfully Joined!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to project workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-teal-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You're Invited!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You've been invited to join a project
          </p>
        </div>

        {inviteInfo && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
              {inviteInfo.projectTitle}
            </h2>
            {inviteInfo.projectDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {inviteInfo.projectDescription}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Invited by <span className="font-medium">{inviteInfo.invitedByName}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {!user && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Please log in to accept this invite
            </p>
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-semibold"
        >
          {joining ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Joining...
            </>
          ) : user ? (
            <>
              <Check className="w-5 h-5" />
              Accept & Join Project
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Login to Join
            </>
          )}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
