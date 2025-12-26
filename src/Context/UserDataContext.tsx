import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../service/api";
import { useAuth } from "./AuthContext";

interface DataContextType {
  loading: boolean;
  userprofile: any;
  
  // Note: Many of these functions need to be implemented with your custom backend
  // For now, they are placeholder functions that throw "not implemented" errors
  writeQueryOnDate: (question_data: Query) => void;
  fetchTodayQueries: () => Promise<Object[]>;
  addObjectToUserArray: (uid: string, arrayField: string, objectToAdd: any) => void;
  pushDataToFirestore: (collectionName: string, dataList: object[]) => void;
  contributors: LegacyContributor[] | undefined;
  avatrUrl: string;
  pushDataWithId: (data: any) => void;
  calculateResumeCompletion: (userProfile: any) => number;
  calculateCategoryCompletion: (userProfile: any) => object;
  
  // Add custom backend functions as needed
  updateUserProfile: (userId: string, updates: any) => Promise<void>;
  getUserProfile: (userId: string) => Promise<any>;
  
  // Additional functions for components
  fetchAllIdeas: () => Promise<any[]>;
  fetchJoinRequests: () => Promise<any[]>;
  fetchAllJoinRequests: () => Promise<any[]>;
  submitIdea: (formData: { title: string; description: string; category: string; expectedTimeline: string }) => Promise<any>;
  triggerIdeasRefresh: () => void;
  ideasRefreshSignal: number;
  
  // Project functions
  sendJoinRequest: (projectId: string, message?: string) => Promise<any>;
  checkUserRole: (projectId: string) => Promise<string>;
  getProjectMembers: (projectId: string) => Promise<any[]>;
  fetchTasks: (projectId: string) => Promise<any[]>;
  fetchCompletedTasksCount: (userId: string) => Promise<number>;
  fetchAllJoinRequestsDebug: () => Promise<any[]>;
  fixJoinRequestProjectId: (requestId: string, projectId: string) => Promise<void>;
  
  // Dashboard functions
  fetchUserSubmissions: (userId: string) => Promise<any[]>;
  
  // Wallet functions
  fetchUserTransactions: (userId: string) => Promise<any[]>;
  
  // Admin functions
  updateIdeaStatus: (ideaId: string, status: string, feedback?: string, reviewedBy?: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  fetchAllUsers: () => Promise<any[]>;
  fetchAllProjectMembers: () => Promise<any[]>;
  getPlatformStats: () => Promise<any>;
  deductCoins: (userId: string, amount: number, reason: string) => Promise<void>;
  addCoins: (userId: string, amount: number, reason: string) => Promise<void>;
  
  // CodeArena functions
  getUserWallet: (userId: string) => Promise<any>;
  initializeWallet: (userId: string) => Promise<any>;
  subscribeToWallet: (userId: string, callback: (wallet: any) => void) => () => void;
  fetchGlobalLeaderboard: () => Promise<any[]>;
  fetchWeeklyLeaderboard: () => Promise<any[]>;
  fetchMonthlyLeaderboard: () => Promise<any[]>;
  getUserProgress: (userId: string) => Promise<any>;
  fetchUserBattles: (userId: string) => Promise<any[]>;
  fetchEnrolledCourses: () => Promise<any[]>;
  fetchCompanies: () => Promise<any[]>;
}

interface LegacyContributor {
  id: string;
  image: string;
  name: string;
  avatar: string;
  commit: number;
  contributions: number;
  role: string;
  joinDate: string;
  specialties: string[];
  isTopContributor: boolean;
  from: string;
}

interface Query {
  question: string;
  answer: string;
  date: string;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userprofile, setUserProfile] = useState<any>(null);
  const [contributors] = useState<LegacyContributor[] | undefined>(undefined);
  const avatrUrl = "";

  // Fetch user profile from custom backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest(`/users/${user.id}`);
        setUserProfile(response.user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Custom backend functions
  const getUserProfile = async (userId: string): Promise<any> => {
    const response = await apiRequest(`/users/${userId}`);
    return response.user;
  };

  const updateUserProfile = async (userId: string, updates: any): Promise<void> => {
    await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    
    // Refresh local profile if updating current user
    if (userId === user?.id) {
      const response = await apiRequest(`/users/${userId}`);
      setUserProfile(response.user);
    }
  };

  // Legacy functions - need backend implementation
  const writeQueryOnDate = (_question_data: Query) => {
    console.warn("writeQueryOnDate not implemented with custom backend");
  };

  const fetchTodayQueries = async (): Promise<Object[]> => {
    console.warn("fetchTodayQueries not implemented with custom backend");
    return [];
  };

  const addObjectToUserArray = (_uid: string, _arrayField: string, _objectToAdd: any) => {
    console.warn("addObjectToUserArray not implemented with custom backend");
  };

  const pushDataToFirestore = (_collectionName: string, _dataList: object[]) => {
    console.warn("pushDataToFirestore not implemented with custom backend");
  };

  const pushDataWithId = (_data: any) => {
    console.warn("pushDataWithId not implemented with custom backend");
  };

  const fetchAllIdeas = async (): Promise<any[]> => {
    try {
      const response = await apiRequest('/ideas');
      return response.ideas || [];
    } catch (error) {
      console.error('Error fetching ideas:', error);
      return [];
    }
  };

  const submitIdea = async (formData: { title: string; description: string; category: string; expectedTimeline: string }): Promise<any> => {
    try {
      const response = await apiRequest('/ideas', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      return response.idea;
    } catch (error) {
      console.error('Error submitting idea:', error);
      throw error;
    }
  };

  // Trigger refresh for ideas list (can be used by components)
  const [ideasRefreshKey, setIdeasRefreshKey] = useState(0);
  const triggerIdeasRefresh = () => {
    setIdeasRefreshKey(prev => prev + 1);
  };

  const fetchJoinRequests = async (): Promise<any[]> => {
    try {
      if (!user?.id) return [];
      const response = await apiRequest(`/users/${user.id}/join-requests`);
      return response.requests || [];
    } catch (error) {
      console.error('Error fetching join requests:', error);
      return [];
    }
  };

  const fetchAllJoinRequests = async (): Promise<any[]> => {
    try {
      const response = await apiRequest('/join-requests');
      return response.requests || [];
    } catch (error) {
      console.error('Error fetching all join requests:', error);
      return [];
    }
  };

  const fetchAllJoinRequestsDebug = async (): Promise<any[]> => {
    try {
      const response = await apiRequest('/join-requests/debug');
      return response.requests || [];
    } catch (error) {
      console.error('Error fetching all join requests debug:', error);
      return [];
    }
  };

  const fixJoinRequestProjectId = async (requestId: string, projectId: string): Promise<void> => {
    try {
      await apiRequest(`/join-requests/${requestId}/fix`, {
        method: 'PUT',
        body: JSON.stringify({ projectId })
      });
    } catch (error) {
      console.error('Error fixing join request:', error);
      throw error;
    }
  };

  const sendJoinRequest = async (projectId: string, message?: string): Promise<any> => {
    try {
      const response = await apiRequest('/join-requests', {
        method: 'POST',
        body: JSON.stringify({ projectId, message })
      });
      return response.request;
    } catch (error) {
      console.error('Error sending join request:', error);
      throw error;
    }
  };

  const checkUserRole = async (projectId: string): Promise<string> => {
    try {
      if (!user?.id) return 'guest';
      const response = await apiRequest(`/projects/${projectId}/role/${user.id}`);
      return response.role || 'guest';
    } catch (error) {
      console.error('Error checking user role:', error);
      return 'guest';
    }
  };

  const getProjectMembers = async (projectId: string): Promise<any[]> => {
    try {
      const response = await apiRequest(`/projects/${projectId}/members`);
      return response.members || [];
    } catch (error) {
      console.error('Error fetching project members:', error);
      return [];
    }
  };

  const fetchTasks = async (projectId: string): Promise<any[]> => {
    try {
      const response = await apiRequest(`/projects/${projectId}/tasks`);
      return response.tasks || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  };

  const fetchCompletedTasksCount = async (userId: string): Promise<number> => {
    try {
      const response = await apiRequest(`/users/${userId}/completed-tasks`);
      return response.count || 0;
    } catch (error) {
      console.error('Error fetching completed tasks count:', error);
      return 0;
    }
  };

  const fetchUserSubmissions = async (userId: string): Promise<any[]> => {
    try {
      const response = await apiRequest(`/challenges/submissions/${userId}`);
      return response.submissions || [];
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      return [];
    }
  };

  const fetchUserTransactions = async (userId: string): Promise<any[]> => {
    try {
      const wallet = await apiRequest(`/wallet/${userId}`);
      return wallet.wallet?.transactions || [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  };

  const updateIdeaStatus = async (ideaId: string, status: string, feedback?: string, reviewedBy?: string): Promise<void> => {
    try {
      await apiRequest(`/ideas/${ideaId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, feedback, reviewedBy })
      });
    } catch (error) {
      console.error('Error updating idea status:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      await apiRequest(`/projects/${projectId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const fetchAllUsers = async (): Promise<any[]> => {
    try {
      const response = await apiRequest('/admin/users');
      return response.users || [];
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  };

  const fetchAllProjectMembers = async (): Promise<any[]> => {
    try {
      const response = await apiRequest('/projects/members');
      return response.members || [];
    } catch (error) {
      console.error('Error fetching project members:', error);
      return [];
    }
  };

  const getPlatformStats = async (): Promise<any> => {
    try {
      const response = await apiRequest('/admin/stats');
      return response.stats || {};
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return {};
    }
  };

  const deductCoins = async (userId: string, amount: number, reason: string): Promise<void> => {
    try {
      await apiRequest(`/wallet/${userId}/deduct`, {
        method: 'POST',
        body: JSON.stringify({ amount, reason })
      });
    } catch (error) {
      console.error('Error deducting coins:', error);
      throw error;
    }
  };

  const addCoins = async (userId: string, amount: number, reason: string): Promise<void> => {
    try {
      await apiRequest(`/wallet/${userId}/add`, {
        method: 'POST',
        body: JSON.stringify({ amount, reason })
      });
    } catch (error) {
      console.error('Error adding coins:', error);
      throw error;
    }
  };

  const calculateResumeCompletion = (userProfile: any): number => {
    if (!userProfile) return 0;
    
    let completion = 0;
    const totalFields = 10;
    
    if (userProfile.name) completion++;
    if (userProfile.email) completion++;
    if (userProfile.phone && userProfile.phone !== '9999999999') completion++;
    if (userProfile.bio && userProfile.bio !== 'About yourself') completion++;
    if (userProfile.skills && userProfile.skills.length > 0) completion++;
    if (userProfile.education && userProfile.education.length > 0) completion++;
    if (userProfile.experience && userProfile.experience.length > 0) completion++;
    if (userProfile.projects && userProfile.projects.length > 0) completion++;
    if (userProfile.links && userProfile.links.length > 0) completion++;
    if (userProfile.portfolio) completion++;
    
    return Math.round((completion / totalFields) * 100);
  };

  const calculateCategoryCompletion = (userProfile: any): object => {
    return {
      basic: userProfile?.name ? 100 : 0,
      education: userProfile?.education?.length > 0 ? 100 : 0,
      experience: userProfile?.experience?.length > 0 ? 100 : 0,
      skills: userProfile?.skills?.length > 0 ? 100 : 0,
      projects: userProfile?.projects?.length > 0 ? 100 : 0,
    };
  };

  // CodeArena wallet functions
  const getUserWallet = async (userId: string): Promise<any> => {
    if (!userId) {
      console.warn('getUserWallet called with undefined userId');
      return null;
    }
    try {
      const response = await apiRequest(`/wallet/${userId}`);
      return response.wallet;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }
  };

  const initializeWallet = async (userId: string): Promise<any> => {
    try {
      const response = await apiRequest('/wallet', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      return response.wallet;
    } catch (error) {
      console.error('Error initializing wallet:', error);
      throw error;
    }
  };

  const subscribeToWallet = (userId: string, callback: (wallet: any) => void): (() => void) => {
    // Guard against undefined userId
    if (!userId) {
      console.warn('subscribeToWallet called with undefined userId');
      return () => {};
    }
    
    // For REST API, we'll poll for wallet updates every 10 seconds
    let isSubscribed = true;
    
    const pollWallet = async () => {
      if (!isSubscribed || !userId) return;
      try {
        const wallet = await getUserWallet(userId);
        if (wallet && isSubscribed) {
          callback(wallet);
        }
      } catch (error) {
        console.error('Error polling wallet:', error);
      }
      if (isSubscribed) {
        setTimeout(pollWallet, 30000); // Poll every 30 seconds
      }
    };
    
    // Initial fetch
    pollWallet();
    
    // Return unsubscribe function
    return () => {
      isSubscribed = false;
    };
  };

  const fetchGlobalLeaderboard = async (): Promise<any[]> => {
    try {
      const response = await apiRequest('/leaderboard');
      return response.leaderboard || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  };

  const fetchWeeklyLeaderboard = async (): Promise<any[]> => {
    try {
      const response = await apiRequest('/leaderboard?period=weekly');
      return response.leaderboard || [];
    } catch (error) {
      console.error('Error fetching weekly leaderboard:', error);
      return [];
    }
  };

  const fetchMonthlyLeaderboard = async (): Promise<any[]> => {
    try {
      const response = await apiRequest('/leaderboard?period=monthly');
      return response.leaderboard || [];
    } catch (error) {
      console.error('Error fetching monthly leaderboard:', error);
      return [];
    }
  };

  const getUserProgress = async (userId: string): Promise<any> => {
    try {
      const response = await apiRequest(`/challenges/progress/${userId}`);
      return response.progress || { solvedChallenges: [] };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return { solvedChallenges: [] };
    }
  };

  const fetchUserBattles = async (userId: string): Promise<any[]> => {
    try {
      const response = await apiRequest(`/battles/user/${userId}`);
      return response.battles || [];
    } catch (error) {
      console.error('Error fetching user battles:', error);
      return [];
    }
  };

  const fetchEnrolledCourses = async (): Promise<any[]> => {
    try {
      // Return empty array for now - can be implemented with a courses API
      return [];
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      return [];
    }
  };

  const fetchCompanies = async (): Promise<any[]> => {
    try {
      // Return empty array for now - can be implemented with a companies API
      return [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  };

  const value: DataContextType = {
    loading,
    userprofile,
    writeQueryOnDate,
    fetchTodayQueries,
    addObjectToUserArray,
    pushDataToFirestore,
    contributors,
    avatrUrl,
    pushDataWithId,
    calculateResumeCompletion,
    calculateCategoryCompletion,
    updateUserProfile,
    getUserProfile,
    fetchAllIdeas,
    fetchJoinRequests,
    fetchAllJoinRequests,
    submitIdea,
    triggerIdeasRefresh,
    ideasRefreshSignal: ideasRefreshKey,
    sendJoinRequest,
    checkUserRole,
    getProjectMembers,
    fetchTasks,
    fetchCompletedTasksCount,
    fetchAllJoinRequestsDebug,
    fixJoinRequestProjectId,
    fetchUserSubmissions,
    fetchUserTransactions,
    updateIdeaStatus,
    deleteProject,
    fetchAllUsers,
    fetchAllProjectMembers,
    getPlatformStats,
    deductCoins,
    addCoins,
    getUserWallet,
    initializeWallet,
    subscribeToWallet,
    fetchGlobalLeaderboard,
    fetchWeeklyLeaderboard,
    fetchMonthlyLeaderboard,
    getUserProgress,
    fetchUserBattles,
    fetchEnrolledCourses,
    fetchCompanies,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Hook to use the data context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a UserDataProvider');
  }
  return context;
};
