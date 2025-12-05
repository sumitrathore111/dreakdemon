import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import type { ReactNode } from "react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../service/Firebase";
import { useAuth } from "./AuthContext";


interface DataContextType {

    loading: boolean;
    userprofile: any
    writeQueryOnDate: (question_data: Query) => void;
    fetchTodayQueries: () => Promise<Object[]>;
    addObjectToUserArray: (uid: string, arrayField: string, objectToAdd: any) => void
    pushDataToFirestore: (collectionName: string, dataList: object[]) => void
    contributors: Contributor[] | undefined
    avatrUrl: string
    pushDataWithId: (data: any) => void
    calculateResumeCompletion: (userProfile: any) => number
    calculateCategoryCompletion: (userProfile: any) => object
    
    // Marathon functions
    fetchTodayChallenge: () => Promise<any>;
    submitMarathonAnswer: (challengeId: string, answer: string, isCorrect: boolean, points: number) => Promise<void>;
    fetchLeaderboard: () => Promise<any[]>;
    updateUserStreak: () => Promise<void>;
    
    // Company functions
    fetchCompanies: () => Promise<any[]>;
    addCompanyToTarget: (companyId: string) => Promise<void>;
    
    // Course functions
    fetchCourses: () => Promise<any[]>;
    fetchEnrolledCourses: () => Promise<any[]>;
    enrollInCourse: (courseId: string) => Promise<void>;
    updateCourseProgress: (courseId: string, progress: number, lessonsCompleted: number) => Promise<void>;
    
    // Internship functions
    fetchInternshipTasks: () => Promise<any[]>;
    updateTaskStatus: (taskId: string, done: boolean) => Promise<void>;
    
    // Project Idea functions
    submitIdea: (ideaData: any) => Promise<void>;
    fetchAllIdeas: () => Promise<any[]>;
    updateIdeaStatus: (ideaId: string, status: string, feedback: string, reviewedBy: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    
    // Project Collaboration functions
    sendJoinRequest: (projectId: string, projectTitle: string, creatorId: string, application: any) => Promise<void>;
    fetchJoinRequests: (projectId: string) => Promise<any[]>;
    fetchAllJoinRequestsDebug: () => Promise<any[]>;
    fixJoinRequestProjectId: (requestId: string, correctProjectId: string) => Promise<void>;
    approveJoinRequest: (requestId: string, projectId: string, userId: string, userName: string) => Promise<void>;
    rejectJoinRequest: (requestId: string) => Promise<void>;
    getProjectMembers: (projectId: string) => Promise<any[]>;
    checkUserRole: (projectId: string, userId: string) => Promise<string | null>;
    checkAccessDiagnostics: (projectId: string, userId: string) => Promise<any>;
    forceAddMember: (projectId: string, userId: string, userName: string) => Promise<void>;
    
    // Admin functions
    fetchAllUsers: () => Promise<any[]>;
    fetchAllJoinRequests: () => Promise<any[]>;
    fetchAllProjectMembers: () => Promise<any[]>;
    getPlatformStats: () => Promise<any>;
    
    // Project Workspace functions
    addTask: (projectId: string, task: any) => Promise<void>;
    fetchTasks: (projectId: string) => Promise<any[]>;
    updateTask: (projectId: string, taskId: string, updates: any) => Promise<void>;
    deleteTask: (projectId: string, taskId: string) => Promise<void>;
    sendMessage: (projectId: string, message: any) => Promise<void>;
    fetchMessages: (projectId: string) => Promise<any[]>;
    uploadFile: (projectId: string, file: any) => Promise<void>;
    fetchFiles: (projectId: string) => Promise<any[]>;
    deleteFile: (projectId: string, fileId: string) => Promise<void>;
    
    // CodeArena functions
    // Challenges
    fetchAllChallenges: () => Promise<any[]>;
    fetchChallengeById: (challengeId: string) => Promise<any>;
    fetchDailyChallenge: () => Promise<any>;
    fetchChallengesByDifficulty: (difficulty: string) => Promise<any[]>;
    fetchChallengesByCategory: (category: string) => Promise<any[]>;
    
    // Submissions
    submitSolution: (submissionData: {
        challengeId: string;
        code: string;
        language: string;
        status?: string;
        passedTestCases?: number;
        totalTestCases?: number;
        executionTime?: number;
        timeSpent?: number;
    }) => Promise<any>;
    fetchUserSubmissions: (userId: string) => Promise<any[]>;
    fetchChallengeSubmissions: (challengeId: string) => Promise<any[]>;
    
    // Wallet & Transactions
    initializeWallet: (userId: string, userName: string) => Promise<void>;
    getUserWallet: (userId: string) => Promise<any>;
    subscribeToWallet: (userId: string, callback: (wallet: any) => void) => () => void;
    addCoins: (userId: string, amount: number, description: string, referenceId?: string) => Promise<void>;
    deductCoins: (userId: string, amount: number, description: string, referenceId?: string) => Promise<void>;
    fetchUserTransactions: (userId: string) => Promise<any[]>;
    purchaseHint: (userId: string, challengeId: string, hintIndex: number, cost: number) => Promise<void>;
    
    // Battles
    createBattle: (challengeId: string, entryFee: number, duration: number) => Promise<string>;
    joinBattle: (battleId: string, userId: string, userName: string) => Promise<void>;
    fetchActiveBattles: () => Promise<any[]>;
    fetchUserBattles: (userId: string) => Promise<any[]>;
    submitBattleSolution: (battleId: string, userId: string, code: string, language: string) => Promise<void>;
    completeBattle: (battleId: string) => Promise<void>;
    
    // Tournaments
    createTournament: (tournamentData: any) => Promise<string>;
    registerForTournament: (tournamentId: string, userId: string, userName: string) => Promise<void>;
    fetchActiveTournaments: () => Promise<any[]>;
    fetchUserTournaments: (userId: string) => Promise<any[]>;
    updateTournamentScore: (tournamentId: string, userId: string, score: number) => Promise<void>;
    
    // Leaderboards
    fetchGlobalLeaderboard: () => Promise<any[]>;
    fetchWeeklyLeaderboard: () => Promise<any[]>;
    fetchMonthlyLeaderboard: () => Promise<any[]>;
    updateLeaderboard: (userId: string, userName: string, score: number) => Promise<void>;
    
    // User Progress
    getUserProgress: (userId: string) => Promise<any>;
    markChallengeAsSolved: (userId: string, challengeId: string, submissionId: string) => Promise<void>;
    updateUserStats: (userId: string, stats: any) => Promise<void>;
    addBadge: (userId: string, badge: any) => Promise<void>;
    updateStreak: (userId: string) => Promise<void>;
}
interface Contributor {
    id: string;
    name: string;
    avatar: string;
    contributions: number;
    role: string;
    joinDate: string;
    specialties: string[];
    isTopContributor: boolean;
    from: string
}


type Query = {
    id: number;
    question: string;
    answer: string;
    ans_user: string
    createdAt: Timestamp;
    userId?: string;
}
const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    // const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [userprofile, setProfile] = useState<any>(null);
    const [contributors, setcontributers] = useState<Contributor[]>()
    const [avatrUrl, setAvatarUrl] = useState('')

    const maleAvatarLilst = [
        "Eliza",
        "Easton",
        "Brian",
        "Liam",
        "Jessica",
        "Destiny",
        "Luis",
        "Chase",
        "Ryan",
    ];

    const getTodayRange = () => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        return {
            start: Timestamp.fromDate(startOfDay),
            end: Timestamp.fromDate(endOfDay)
        };
    };

    const writeQueryOnDate = async (question_data: Query) => {
        await addDoc(collection(db, 'query'), {
            ...question_data
        });
        console.log('New document created for the date:');
    };

    const fetchTodayQueries = async () => {
        const { start, end } = getTodayRange();

        const q = query(
            collection(db, "query"),
            where("createdAt", ">=", start),
            where("createdAt", "<=", end),
            limit(20)
        );

        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log("Today's queries:", results);
        return results;
    };

    async function addObjectToUserArray(uid: string, arrayField: string, objectToAdd: any) {
        const userDocRef = doc(db, "Student_Detail", uid);

        try {
            await updateDoc(userDocRef, {
                [arrayField]: arrayUnion(objectToAdd)
            });
            console.log("Object added to array successfully!");
        } catch (error) {
            console.error("Error updating user document:", error);
        }
    }

    async function pushDataToFirestore(collectionName: string, dataList: object[]) {
        try {
            const colRef = collection(db, collectionName);
            for (const item of dataList) {
                await addDoc(colRef, item);
            }
            console.log("All data added to Firestore!");
        } catch (error) {
            console.error("Error adding data: ", error);
        }
    }

    const pushDataWithId = async (data: any) => {
        if (user) {
            await setDoc(doc(db, "Student_Detail", user?.uid), data);

        }
    };

    // ==================== MARATHON FUNCTIONS ====================
    const fetchTodayChallenge = async () => {
        const { start, end } = getTodayRange();
        const q = query(
            collection(db, "Marathon_Challenges"),
            where("date", ">=", start),
            where("date", "<=", end),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
        return null;
    };

    const submitMarathonAnswer = async (challengeId: string, answer: string, isCorrect: boolean, points: number) => {
        if (!user) return;
        
        await addDoc(collection(db, "Marathon_Submissions"), {
            userId: user.uid,
            challengeId,
            answer,
            isCorrect,
            points,
            submittedAt: Timestamp.now()
        });

        if (isCorrect) {
            const userDocRef = doc(db, "Student_Detail", user.uid);
            const userDoc = await getDoc(userDocRef);
            const currentScore = userDoc.data()?.marathon_score || 0;
            const currentChallengesSolved = userDoc.data()?.challenges_solved || 0;
            
            await updateDoc(userDocRef, {
                marathon_score: currentScore + points,
                challenges_solved: currentChallengesSolved + 1,
                last_active_date: Timestamp.now()
            });
        }
    };

    const fetchLeaderboard = async () => {
        const q = query(
            collection(db, "Student_Detail"),
            orderBy("marathon_score", "desc"),
            limit(10)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc, index) => ({
            rank: index + 1,
            id: doc.id,
            ...doc.data()
        }));
    };

    const updateUserStreak = async () => {
        if (!user) return;
        
        const userDocRef = doc(db, "Student_Detail", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        
        const lastActive = userData?.last_active_date?.toDate();
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let newStreak = 1;
        if (lastActive) {
            const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
            const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
            
            if (lastActiveDate.getTime() === yesterdayDate.getTime()) {
                newStreak = (userData?.streakCount || 0) + 1;
            }
        }
        
        await updateDoc(userDocRef, {
            streakCount: newStreak,
            last_active_date: Timestamp.now()
        });
    };

    // ==================== COMPANY FUNCTIONS ====================
    const fetchCompanies = async () => {
        const snapshot = await getDocs(collection(db, "Companies"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const addCompanyToTarget = async (companyId: string) => {
        if (!user) return;
        await addObjectToUserArray(user.uid, "target_compnay", companyId);
    };

    // ==================== COURSE FUNCTIONS ====================
    const fetchCourses = async () => {
        const snapshot = await getDocs(collection(db, "Courses"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const fetchEnrolledCourses = async () => {
        if (!user) return [];
        
        const q = query(
            collection(db, "Enrollments"),
            where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const enrollInCourse = async (courseId: string) => {
        if (!user) return;
        
        await addDoc(collection(db, "Enrollments"), {
            userId: user.uid,
            courseId,
            progress: 0,
            lessonsCompleted: 0,
            enrolledAt: Timestamp.now(),
            lastAccessed: Timestamp.now()
        });
    };

    const updateCourseProgress = async (courseId: string, progress: number, lessonsCompleted: number) => {
        if (!user) return;
        
        const q = query(
            collection(db, "Enrollments"),
            where("userId", "==", user.uid),
            where("courseId", "==", courseId)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            const enrollmentDoc = snapshot.docs[0];
            await updateDoc(doc(db, "Enrollments", enrollmentDoc.id), {
                progress,
                lessonsCompleted,
                lastAccessed: Timestamp.now()
            });
        }
    };

    // ==================== INTERNSHIP FUNCTIONS ====================
    const fetchInternshipTasks = async () => {
        if (!user) return [];
        
        const userDocRef = doc(db, "Student_Detail", user.uid);
        const userDoc = await getDoc(userDocRef);
        const tasks = userDoc.data()?.internship_tasks || [];
        
        if (tasks.length === 0) {
            // Initialize default tasks
            const defaultTasks = [
                { id: 1, text: "Complete React Basics", done: false },
                { id: 2, text: "Finish Tailwind Styling", done: false },
                { id: 3, text: "Build First Project", done: false },
                { id: 4, text: "Pass Level 4 Quiz", done: false },
                { id: 5, text: "Submit Final Project", done: false },
            ];
            await updateDoc(userDocRef, { internship_tasks: defaultTasks });
            return defaultTasks;
        }
        
        return tasks;
    };

    const updateTaskStatus = async (taskId: string, done: boolean) => {
        if (!user) return;
        
        const userDocRef = doc(db, "Student_Detail", user.uid);
        const userDoc = await getDoc(userDocRef);
        const tasks = userDoc.data()?.internship_tasks || [];
        
        const updatedTasks = tasks.map((task: any) => 
            task.id === taskId ? { ...task, done } : task
        );
        
        await updateDoc(userDocRef, { internship_tasks: updatedTasks });
    };

    // ==================== PROJECT IDEAS ====================
    
    const submitIdea = async (ideaData: any) => {
        if (!user) throw new Error("User not authenticated");
        
        try {
            await addDoc(collection(db, "Project_Ideas"), {
                ...ideaData,
                userId: user.uid,
                userName: userprofile?.name || user.email?.split('@')[0] || 'Unknown',
                userEmail: user.email,
                status: 'pending',
                submittedAt: Timestamp.now(),
                createdAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error submitting idea:", error);
            throw error;
        }
    };

    const fetchAllIdeas = async () => {
        try {
            const ideasRef = collection(db, "Project_Ideas");
            const q = query(ideasRef, orderBy("submittedAt", "desc"));
            const snapshot = await getDocs(q);
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                submittedAt: doc.data().submittedAt?.toDate().toISOString(),
                reviewedAt: doc.data().reviewedAt?.toDate().toISOString()
            }));
        } catch (error) {
            console.error("Error fetching ideas:", error);
            return [];
        }
    };

    const updateIdeaStatus = async (ideaId: string, status: string, feedback: string, reviewedBy: string) => {
        try {
            const ideaRef = doc(db, "Project_Ideas", ideaId);
            await updateDoc(ideaRef, {
                status,
                feedback,
                reviewedBy,
                reviewedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error updating idea status:", error);
            throw error;
        }
    };

    const deleteProject = async (projectId: string) => {
        try {
            // Actually delete the project from database
            const ideaRef = doc(db, "Project_Ideas", projectId);
            await deleteDoc(ideaRef);
            console.log("Project deleted successfully from database");
        } catch (error) {
            console.error("Error deleting project:", error);
            throw error;
        }
    };

    // ==================== END PROJECT IDEAS ====================

    // ==================== PROJECT COLLABORATION ====================
    
    const sendJoinRequest = async (projectId: string, projectTitle: string, creatorId: string, application: any) => {
        if (!user) throw new Error("User not authenticated");
        
        try {
            // Check if request already exists
            const requestsRef = collection(db, "Join_Requests");
            const q = query(requestsRef, 
                where("projectId", "==", projectId),
                where("userId", "==", user.uid),
                where("status", "==", "pending")
            );
            const existing = await getDocs(q);
            
            if (!existing.empty) {
                throw new Error("You already have a pending request for this project");
            }
            
            // Check if already a member
            const membersRef = collection(db, "Project_Members");
            const memberQuery = query(membersRef,
                where("projectId", "==", projectId),
                where("userId", "==", user.uid)
            );
            const memberCheck = await getDocs(memberQuery);
            
            if (!memberCheck.empty) {
                throw new Error("You are already a member of this project");
            }
            
            // Create join request with application details
            await addDoc(collection(db, "Join_Requests"), {
                projectId,
                projectTitle,
                creatorId,
                userId: user.uid,
                userName: userprofile?.name || user.email?.split('@')[0] || 'Unknown',
                userEmail: user.email,
                status: 'pending',
                requestedAt: Timestamp.now(),
                skills: application.skills,
                experience: application.experience,
                motivation: application.motivation,
                availability: application.availability
            });
        } catch (error) {
            console.error("Error sending join request:", error);
            throw error;
        }
    };

    const fetchJoinRequests = async (projectId: string) => {
        if (!user) return [];
        
        try {
            const requestsRef = collection(db, "Join_Requests");
            const q = query(requestsRef,
                where("projectId", "==", projectId),
                where("status", "==", "pending"),
                orderBy("requestedAt", "desc")
            );
            const snapshot = await getDocs(q);
            
            // Filter out requests made BY the current user
            // Only show requests FROM other users who want to join this project
            return snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    requestedAt: doc.data().requestedAt?.toDate().toISOString()
                }))
                .filter((request: any) => request.userId !== user.uid);
        } catch (error) {
            console.error("Error fetching join requests:", error);
            return [];
        }
    };
    
    const fetchAllJoinRequestsDebug = async () => {
        try {
            const requestsRef = collection(db, "Join_Requests");
            const snapshot = await getDocs(requestsRef);
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                requestedAt: doc.data().requestedAt?.toDate().toISOString()
            }));
        } catch (error) {
            console.error("Error fetching all join requests:", error);
            return [];
        }
    };

    const approveJoinRequest = async (requestId: string, projectId: string, userId: string, userName: string) => {
        try {
            console.log('🟢 APPROVING REQUEST:', {requestId, projectId, userId, userName});
            
            // Check if already a member (avoid duplicates)
            const membersRef = collection(db, "Project_Members");
            const existingMemberQuery = query(membersRef,
                where("projectId", "==", projectId),
                where("userId", "==", userId)
            );
            const existingMember = await getDocs(existingMemberQuery);
            
            if (existingMember.empty) {
                // Add to project members only if not already a member
                await addDoc(collection(db, "Project_Members"), {
                    projectId,
                    userId,
                    userName,
                    role: 'contributor',
                    joinedAt: Timestamp.now()
                });
                console.log('✅ Added user to Project_Members collection');
            } else {
                console.log('ℹ️ User already a member, skipping duplicate entry');
            }
            
            // Update request status
            const requestRef = doc(db, "Join_Requests", requestId);
            await updateDoc(requestRef, {
                status: 'approved',
                approvedAt: Timestamp.now()
            });
            console.log('✅ Updated join request status to approved');
        } catch (error) {
            console.error("❌ Error approving join request:", error);
            throw error;
        }
    };

    const rejectJoinRequest = async (requestId: string) => {
        try {
            const requestRef = doc(db, "Join_Requests", requestId);
            await updateDoc(requestRef, {
                status: 'rejected',
                rejectedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error rejecting join request:", error);
            throw error;
        }
    };
    
    const fixJoinRequestProjectId = async (requestId: string, correctProjectId: string) => {
        try {
            const requestRef = doc(db, "Join_Requests", requestId);
            await updateDoc(requestRef, {
                projectId: correctProjectId
            });
        } catch (error) {
            console.error("Error fixing join request:", error);
            throw error;
        }
    };

    const getProjectMembers = async (projectId: string) => {
        try {
            const membersRef = collection(db, "Project_Members");
            const q = query(membersRef, where("projectId", "==", projectId));
            const snapshot = await getDocs(q);
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                joinedAt: doc.data().joinedAt?.toDate().toISOString()
            }));
        } catch (error) {
            console.error("Error fetching project members:", error);
            return [];
        }
    };

    const checkUserRole = async (projectId: string, userId: string) => {
        try {
            console.log('🔍 CHECKING USER ROLE:', {projectId, userId});
            
            // Check if creator (from approved idea)
            const ideaRef = doc(db, "Project_Ideas", projectId);
            const ideaDoc = await getDoc(ideaRef);
            
            if (ideaDoc.exists()) {
                const idea = ideaDoc.data();
                console.log('📄 Project idea found:', {creatorId: idea.userId, currentUserId: userId});
                
                if (idea.userId === userId) {
                    console.log('👑 User is the CREATOR');
                    return 'creator';
                }
            } else {
                console.log('⚠️ Project idea document not found for projectId:', projectId);
            }
            
            // Check if member
            const membersRef = collection(db, "Project_Members");
            const memberQuery = query(membersRef,
                where("projectId", "==", projectId),
                where("userId", "==", userId)
            );
            const memberSnapshot = await getDocs(memberQuery);
            
            console.log('👥 Member check - Found documents:', memberSnapshot.docs.length);
            
            if (!memberSnapshot.empty) {
                const memberData = memberSnapshot.docs[0].data();
                console.log('✅ User IS a member:', memberData);
                return memberData.role || 'contributor';
            }
            
            console.log('❌ User has NO ACCESS to this project');
            return null;
        } catch (error) {
            console.error("❌ Error checking user role:", error);
            return null;
        }
    };

    const checkAccessDiagnostics = async (projectId: string, userId: string) => {
        try {
            // Get all join requests for this user and project
            const requestsRef = collection(db, "Join_Requests");
            const requestQuery = query(requestsRef,
                where("userId", "==", userId)
            );
            const requestSnapshot = await getDocs(requestQuery);
            const userRequests = requestSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get all project members for this project
            const membersRef = collection(db, "Project_Members");
            const memberQuery = query(membersRef,
                where("projectId", "==", projectId)
            );
            const memberSnapshot = await getDocs(memberQuery);
            const projectMembers = memberSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Check if user is in members
            const isMember = projectMembers.some((m: any) => m.userId === userId);

            // Get project details
            const ideaRef = doc(db, "Project_Ideas", projectId);
            const ideaDoc = await getDoc(ideaRef);
            const projectData = ideaDoc.exists() ? ideaDoc.data() : null;

            return {
                userId,
                projectId,
                projectExists: !!projectData,
                projectCreatorId: projectData?.userId,
                isCreator: projectData?.userId === userId,
                isMember,
                userRequests,
                projectMembers,
                totalMembers: projectMembers.length
            };
        } catch (error) {
            console.error("Error checking diagnostics:", error);
            return null;
        }
    };

    const forceAddMember = async (projectId: string, userId: string, userName: string) => {
        try {
            console.log('🔧 FORCE ADDING MEMBER:', {projectId, userId, userName});
            
            // Check if already exists
            const membersRef = collection(db, "Project_Members");
            const existingQuery = query(membersRef,
                where("projectId", "==", projectId),
                where("userId", "==", userId)
            );
            const existing = await getDocs(existingQuery);
            
            if (!existing.empty) {
                console.log('ℹ️ User already exists in Project_Members');
                return;
            }
            
            // Add as member
            await addDoc(collection(db, "Project_Members"), {
                projectId,
                userId,
                userName,
                role: 'contributor',
                joinedAt: Timestamp.now()
            });
            
            console.log('✅ Successfully force-added member to project');
        } catch (error) {
            console.error("❌ Error force adding member:", error);
            throw error;
        }
    };

    // ==================== END PROJECT COLLABORATION ====================

    // ==================== ADMIN FUNCTIONS ====================
    
    const fetchAllUsers = async () => {
        try {
            const snapshot = await getDocs(collection(db, "Student_Detail"));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    };

    const fetchAllJoinRequests = async () => {
        try {
            const q = query(collection(db, "Join_Requests"), orderBy("requestedAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                requestedAt: doc.data().requestedAt?.toDate().toISOString()
            }));
        } catch (error) {
            console.error("Error fetching all join requests:", error);
            return [];
        }
    };

    const fetchAllProjectMembers = async () => {
        try {
            const snapshot = await getDocs(collection(db, "Project_Members"));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                joinedAt: doc.data().joinedAt?.toDate().toISOString()
            }));
        } catch (error) {
            console.error("Error fetching all project members:", error);
            return [];
        }
    };

    const getPlatformStats = async () => {
        try {
            const [users, ideas, members, requests] = await Promise.all([
                fetchAllUsers(),
                fetchAllIdeas(),
                fetchAllProjectMembers(),
                fetchAllJoinRequests()
            ]);

            const pendingIdeas = ideas.filter((i: any) => i.status === 'pending').length;
            const approvedIdeas = ideas.filter((i: any) => i.status === 'approved').length;
            const rejectedIdeas = ideas.filter((i: any) => i.status === 'rejected').length;
            const pendingRequests = requests.filter((r: any) => r.status === 'pending').length;

            // Get unique contributors
            const uniqueContributors = new Set(members.map((m: any) => m.userId));

            return {
                totalUsers: users.length,
                totalIdeas: ideas.length,
                pendingIdeas,
                approvedIdeas,
                rejectedIdeas,
                activeProjects: approvedIdeas,
                totalContributors: uniqueContributors.size,
                pendingJoinRequests: pendingRequests
            };
        } catch (error) {
            console.error("Error getting platform stats:", error);
            return {
                totalUsers: 0,
                totalIdeas: 0,
                pendingIdeas: 0,
                approvedIdeas: 0,
                rejectedIdeas: 0,
                activeProjects: 0,
                totalContributors: 0,
                pendingJoinRequests: 0
            };
        }
    };

    // ==================== END ADMIN FUNCTIONS ====================

    // ==================== PROJECT WORKSPACE FUNCTIONS ====================
    
    const addTask = async (projectId: string, task: any) => {
        try {
            await addDoc(collection(db, "Project_Tasks"), {
                projectId,
                ...task,
                createdAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error adding task:", error);
            throw error;
        }
    };

    const fetchTasks = async (projectId: string) => {
        try {
            const q = query(
                collection(db, "Project_Tasks"),
                where("projectId", "==", projectId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching tasks:", error);
            return [];
        }
    };

    const updateTask = async (_projectId: string, taskId: string, updates: any) => {
        try {
            const taskRef = doc(db, "Project_Tasks", taskId);
            await updateDoc(taskRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error updating task:", error);
            throw error;
        }
    };

    const deleteTask = async (_projectId: string, taskId: string) => {
        try {
            const taskRef = doc(db, "Project_Tasks", taskId);
            await updateDoc(taskRef, {
                deleted: true,
                deletedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error deleting task:", error);
            throw error;
        }
    };

    const sendMessage = async (projectId: string, message: any) => {
        if (!user) throw new Error("User not authenticated");
        
        try {
            await addDoc(collection(db, "Project_Messages"), {
                projectId,
                userId: user.uid,
                userName: userprofile?.name || user.email?.split('@')[0] || 'User',
                message: message.text,
                timestamp: Timestamp.now()
            });
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    };

    const fetchMessages = async (projectId: string) => {
        try {
            const q = query(
                collection(db, "Project_Messages"),
                where("projectId", "==", projectId),
                orderBy("timestamp", "asc")
            );
            const snapshot = await getDocs(q);
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate().toISOString()
            }));
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        }
    };

    const uploadFile = async (projectId: string, file: any) => {
        if (!user) throw new Error("User not authenticated");
        
        try {
            await addDoc(collection(db, "Project_Files"), {
                projectId,
                uploadedBy: user.uid,
                uploaderName: userprofile?.name || user.email?.split('@')[0] || 'User',
                fileName: file.name,
                fileSize: file.size,
                fileUrl: file.url,
                uploadedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    };

    const fetchFiles = async (projectId: string) => {
        try {
            const q = query(
                collection(db, "Project_Files"),
                where("projectId", "==", projectId),
                orderBy("uploadedAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    uploadedAt: doc.data().uploadedAt?.toDate().toISOString()
                }))
                .filter((file: any) => !file.deleted);
        } catch (error) {
            console.error("Error fetching files:", error);
            return [];
        }
    };

    const deleteFile = async (_projectId: string, fileId: string) => {
        try {
            const fileRef = doc(db, "Project_Files", fileId);
            await updateDoc(fileRef, {
                deleted: true,
                deletedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error deleting file:", error);
            throw error;
        }
    };

    // ==================== END PROJECT WORKSPACE FUNCTIONS ====================

    // ==================== CODEARENA FUNCTIONS ====================
    
    // CHALLENGES
    const fetchAllChallenges = async () => {
        try {
            const q = query(collection(db, "CodeArena_Challenges"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching challenges:", error);
            return [];
        }
    };

    const fetchChallengeById = async (challengeId: string) => {
        try {
            const docRef = doc(db, "CodeArena_Challenges", challengeId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching challenge:", error);
            return null;
        }
    };

    const fetchDailyChallenge = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const q = query(
                collection(db, "CodeArena_Challenges"),
                where("isDaily", "==", true),
                where("dailyDate", ">=", Timestamp.fromDate(today)),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching daily challenge:", error);
            return null;
        }
    };

    const fetchChallengesByDifficulty = async (difficulty: string) => {
        try {
            const q = query(
                collection(db, "CodeArena_Challenges"),
                where("difficulty", "==", difficulty),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching challenges by difficulty:", error);
            return [];
        }
    };

    const fetchChallengesByCategory = async (category: string) => {
        try {
            const q = query(
                collection(db, "CodeArena_Challenges"),
                where("category", "==", category),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching challenges by category:", error);
            return [];
        }
    };

    // SUBMISSIONS
    const submitSolution = async (submissionData: {
        challengeId: string;
        code: string;
        language: string;
        status?: string;
        passedTestCases?: number;
        totalTestCases?: number;
        executionTime?: number;
        timeSpent?: number;
    }) => {
        if (!user) throw new Error("User not authenticated");
        
        try {
            const {
                challengeId,
                code,
                language,
                status = 'pending',
                passedTestCases = 0,
                totalTestCases = 0,
                executionTime = 0,
                timeSpent = 0
            } = submissionData;

            // Fetch challenge to get points and coins
            const challenge = await fetchChallengeById(challengeId);
            const allPassed = status === 'Accepted';
            const pointsEarned = allPassed && challenge ? (challenge as any).points || 0 : 0;
            const coinsEarned = allPassed && challenge ? (challenge as any).coinReward || 0 : 0;

            // Create submission
            const submissionRef = await addDoc(collection(db, "CodeArena_Submissions"), {
                challengeId,
                userId: user.uid,
                userName: userprofile?.name || user.email?.split('@')[0] || 'User',
                code,
                language,
                status,
                testsPassed: passedTestCases,
                totalTests: totalTestCases,
                executionTime,
                timeSpent,
                pointsEarned,
                coinsEarned,
                submittedAt: Timestamp.now()
            });

            // If accepted, update user progress and wallet
            if (allPassed) {
                // Check if challenge was already solved before awarding coins
                const progressRef = doc(db, "CodeArena_UserProgress", user.uid);
                const progressSnap = await getDoc(progressRef);
                
                let alreadySolved = false;
                if (progressSnap.exists()) {
                    const currentSolved = progressSnap.data().solvedChallenges || [];
                    alreadySolved = currentSolved.some((sc: any) => sc.challengeId === challengeId);
                    
                    if (!alreadySolved) {
                        // First time solving - award coins
                        await addCoins(user.uid, coinsEarned, `Challenge: ${challenge ? (challenge as any).title : 'Unknown'}`, challengeId);
                        
                        // Mark challenge as solved
                        await updateDoc(progressRef, {
                            solvedChallenges: arrayUnion({
                                challengeId,
                                solvedAt: Timestamp.now(),
                                submissionId: submissionRef.id
                            }),
                            totalPoints: (progressSnap.data().totalPoints || 0) + pointsEarned,
                            lastActive: Timestamp.now()
                        });
                        
                        // Update wallet achievements
                        const walletRef = doc(db, "CodeArena_Wallets", user.uid);
                        const walletDoc = await getDoc(walletRef);
                        if (walletDoc.exists()) {
                            await updateDoc(walletRef, {
                                'achievements.problemsSolved': (walletDoc.data()?.achievements?.problemsSolved || 0) + 1
                            });
                        }
                    }
                } else {
                    // First submission ever - initialize and award coins
                    await addCoins(user.uid, coinsEarned, `Challenge: ${challenge ? (challenge as any).title : 'Unknown'}`, challengeId);
                    
                    await setDoc(progressRef, {
                        userId: user.uid,
                        solvedChallenges: [{
                            challengeId,
                            solvedAt: Timestamp.now(),
                            submissionId: submissionRef.id
                        }],
                        totalPoints: pointsEarned,
                        categoryProgress: {},
                        hintsUsed: [],
                        favoriteProblems: [],
                        stats: {
                            totalAttempts: 0,
                            successfulAttempts: 0,
                            averageTime: 0,
                            fastestSolve: 0,
                            languagesUsed: [],
                            mostSolvedCategory: ''
                        },
                        lastActive: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });
                    
                    // Update wallet achievements
                    const walletRef = doc(db, "CodeArena_Wallets", user.uid);
                    const walletDoc = await getDoc(walletRef);
                    if (walletDoc.exists()) {
                        await updateDoc(walletRef, {
                            'achievements.problemsSolved': 1
                        });
                    }
                }
            }

            return { 
                id: submissionRef.id, 
                status,
                pointsEarned,
                coinsEarned
            };
        } catch (error) {
            console.error("Error submitting solution:", error);
            throw error;
        }
    };

    const fetchUserSubmissions = async (userId: string) => {
        try {
            const q = query(
                collection(db, "CodeArena_Submissions"),
                where("userId", "==", userId),
                orderBy("submittedAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching user submissions:", error);
            return [];
        }
    };

    const fetchChallengeSubmissions = async (challengeId: string) => {
        try {
            const q = query(
                collection(db, "CodeArena_Submissions"),
                where("challengeId", "==", challengeId),
                orderBy("submittedAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching challenge submissions:", error);
            return [];
        }
    };

    // WALLET & TRANSACTIONS
    const initializeWallet = async (userId: string, userName: string) => {
        try {
            const walletRef = doc(db, "CodeArena_Wallets", userId);
            const walletDoc = await getDoc(walletRef);
            
            if (!walletDoc.exists()) {
                await setDoc(walletRef, {
                    userId,
                    userName,
                    coins: 1000, // Starting bonus
                    totalEarned: 1000,
                    totalSpent: 0,
                    cashBalance: 0,
                    totalWithdrawn: 0,
                    level: 1,
                    experience: 0,
                    badges: [],
                    streak: {
                        current: 0,
                        longest: 0,
                        lastActiveDate: Timestamp.now()
                    },
                    achievements: {
                        problemsSolved: 0,
                        battlesWon: 0,
                        tournamentsWon: 0,
                        perfectSubmissions: 0
                    },
                    isPremium: false,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            }
        } catch (error) {
            console.error("Error initializing wallet:", error);
            throw error;
        }
    };

    const getUserWallet = async (userId: string) => {
        try {
            const walletRef = doc(db, "CodeArena_Wallets", userId);
            const walletDoc = await getDoc(walletRef);
            
            if (walletDoc.exists()) {
                return { id: walletDoc.id, ...walletDoc.data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching wallet:", error);
            return null;
        }
    };

    // Real-time wallet subscription
    const subscribeToWallet = (userId: string, callback: (wallet: any) => void) => {
        const walletRef = doc(db, "CodeArena_Wallets", userId);
        
        const unsubscribe = onSnapshot(walletRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                callback({ id: docSnapshot.id, ...docSnapshot.data() });
            } else {
                callback(null);
            }
        }, (error) => {
            console.error("Error in wallet subscription:", error);
            callback(null);
        });

        return unsubscribe;
    };

    const addCoins = async (userId: string, amount: number, description: string, referenceId?: string) => {
        try {
            const walletRef = doc(db, "CodeArena_Wallets", userId);
            const walletDoc = await getDoc(walletRef);
            
            if (!walletDoc.exists()) {
                throw new Error("Wallet not found");
            }
            
            const walletData = walletDoc.data();
            const currentBalance = walletData?.coins || 0;
            const newBalance = currentBalance + amount;
            
            // Calculate XP gain (e.g., 10 XP per coin earned)
            const xpGain = amount * 10;
            const currentXP = walletData?.experience || 0;
            const currentLevel = walletData?.level || 1;
            
            let newXP = currentXP + xpGain;
            let newLevel = currentLevel;
            
            // Calculate XP needed for next level: level * 100
            let xpForNextLevel = newLevel * 100;
            
            // Check for level up(s)
            while (newXP >= xpForNextLevel) {
                newXP -= xpForNextLevel;
                newLevel++;
                xpForNextLevel = newLevel * 100;
            }
            
            // Update wallet with coins, XP, and level
            await updateDoc(walletRef, {
                coins: newBalance,
                totalEarned: (walletData?.totalEarned || 0) + amount,
                experience: newXP,
                level: newLevel,
                updatedAt: Timestamp.now()
            });
            
            // Record transaction - only include referenceId if it's defined
            const transactionData: any = {
                userId,
                userName: walletData?.userName || 'User',
                type: 'earn',
                category: 'challenge',
                amount,
                currency: 'coins',
                balanceBefore: currentBalance,
                balanceAfter: newBalance,
                description,
                status: 'completed',
                createdAt: Timestamp.now()
            };
            
            if (referenceId) {
                transactionData.referenceId = referenceId;
            }
            
            await addDoc(collection(db, "CodeArena_Transactions"), transactionData);
        } catch (error) {
            console.error("Error adding coins:", error);
            throw error;
        }
    };

    const deductCoins = async (userId: string, amount: number, description: string, referenceId?: string) => {
        try {
            const walletRef = doc(db, "CodeArena_Wallets", userId);
            const walletDoc = await getDoc(walletRef);
            
            if (!walletDoc.exists()) {
                throw new Error("Wallet not found");
            }
            
            const currentBalance = walletDoc.data()?.coins || 0;
            
            if (currentBalance < amount) {
                throw new Error("Insufficient coins");
            }
            
            const newBalance = currentBalance - amount;
            
            // Update wallet
            await updateDoc(walletRef, {
                coins: newBalance,
                totalSpent: (walletDoc.data()?.totalSpent || 0) + amount,
                updatedAt: Timestamp.now()
            });
            
            // Record transaction - only include referenceId if it's defined
            const transactionData: any = {
                userId,
                userName: walletDoc.data()?.userName || 'User',
                type: 'spend',
                category: 'hint',
                amount,
                currency: 'coins',
                balanceBefore: currentBalance,
                balanceAfter: newBalance,
                description,
                status: 'completed',
                createdAt: Timestamp.now()
            };
            
            if (referenceId) {
                transactionData.referenceId = referenceId;
            }
            
            await addDoc(collection(db, "CodeArena_Transactions"), transactionData);
        } catch (error) {
            console.error("Error deducting coins:", error);
            throw error;
        }
    };

    const fetchUserTransactions = async (userId: string) => {
        try {
            const q = query(
                collection(db, "CodeArena_Transactions"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc"),
                limit(50)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    };

    const purchaseHint = async (userId: string, challengeId: string, hintIndex: number, cost: number) => {
        if (!user) throw new Error("User not authenticated");
        
        try {
            await deductCoins(userId, cost, `Purchased hint for challenge`, challengeId);
            
            // Update user progress
            const progressRef = doc(db, "CodeArena_UserProgress", userId);
            await updateDoc(progressRef, {
                hintsUsed: arrayUnion({
                    challengeId,
                    hintIndex,
                    usedAt: Timestamp.now()
                })
            });
        } catch (error) {
            console.error("Error purchasing hint:", error);
            throw error;
        }
    };

    // BATTLES
    const createBattle = async (challengeId: string, entryFee: number, duration: number) => {
        if (!user) throw new Error("User not authenticated");
        
        try {
            const challenge = await fetchChallengeById(challengeId);
            if (!challenge) throw new Error("Challenge not found");
            
            const battleRef = await addDoc(collection(db, "CodeArena_Battles"), {
                battleType: '1v1',
                challengeId,
                difficulty: (challenge as any).difficulty || 'medium',
                entryFee,
                prizePool: entryFee * 2 * 0.9, // 10% platform fee
                participants: [{
                    userId: user.uid,
                    userName: userprofile?.name || user.email?.split('@')[0] || 'User',
                    score: 0,
                    timeTaken: 0,
                    status: 'waiting'
                }],
                maxParticipants: 2,
                currentParticipants: 1,
                status: 'waiting',
                startTime: Timestamp.now(),
                duration,
                createdBy: user.uid,
                createdAt: Timestamp.now()
            });
            
            // Deduct entry fee
            await deductCoins(user.uid, entryFee, `Battle entry fee`, battleRef.id);
            
            return battleRef.id;
        } catch (error) {
            console.error("Error creating battle:", error);
            throw error;
        }
    };

    const joinBattle = async (battleId: string, userId: string, userName: string) => {
        try {
            const battleRef = doc(db, "CodeArena_Battles", battleId);
            const battleDoc = await getDoc(battleRef);
            
            if (!battleDoc.exists()) throw new Error("Battle not found");
            
            const battleData = battleDoc.data();
            
            if (battleData.currentParticipants >= battleData.maxParticipants) {
                throw new Error("Battle is full");
            }
            
            // Deduct entry fee
            await deductCoins(userId, battleData.entryFee, `Battle entry fee`, battleId);
            
            // Add participant
            await updateDoc(battleRef, {
                participants: arrayUnion({
                    userId,
                    userName,
                    score: 0,
                    timeTaken: 0,
                    status: 'waiting'
                }),
                currentParticipants: battleData.currentParticipants + 1,
                status: battleData.currentParticipants + 1 >= battleData.maxParticipants ? 'in_progress' : 'waiting'
            });
        } catch (error) {
            console.error("Error joining battle:", error);
            throw error;
        }
    };

    const fetchActiveBattles = async () => {
        try {
            const q = query(
                collection(db, "CodeArena_Battles"),
                where("status", "in", ['waiting', 'in_progress']),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching active battles:", error);
            return [];
        }
    };

    const fetchUserBattles = async (userId: string) => {
        try {
            const q = query(
                collection(db, "CodeArena_Battles"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            const battles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filter battles where user is a participant
            return battles.filter((battle: any) => 
                battle.participants?.some((p: any) => p.userId === userId)
            );
        } catch (error) {
            console.error("Error fetching user battles:", error);
            return [];
        }
    };

    const submitBattleSolution = async (battleId: string, userId: string, _code: string, _language: string) => {
        try {
            const battleRef = doc(db, "CodeArena_Battles", battleId);
            const battleDoc = await getDoc(battleRef);
            
            if (!battleDoc.exists()) throw new Error("Battle not found");
            
            const battleData = battleDoc.data();
            
            // Submit solution to challenges
            const submission = await submitSolution(battleData.challengeId);
            
            // Update participant status
            const participants = battleData.participants.map((p: any) => {
                if (p.userId === userId) {
                    return { ...p, submissionId: submission.id, status: 'submitted' };
                }
                return p;
            });
            
            await updateDoc(battleRef, { participants });
        } catch (error) {
            console.error("Error submitting battle solution:", error);
            throw error;
        }
    };

    const completeBattle = async (battleId: string) => {
        try {
            const battleRef = doc(db, "CodeArena_Battles", battleId);
            const battleDoc = await getDoc(battleRef);
            
            if (!battleDoc.exists()) throw new Error("Battle not found");
            
            const battleData = battleDoc.data();
            
            // Determine winner (would be based on actual test results)
            // For now, placeholder logic
            const winner = battleData.participants[0]; // Simplified
            
            // Award prize to winner
            await addCoins(winner.userId, battleData.prizePool, `Battle victory prize`, battleId);
            
            // Update battle status
            await updateDoc(battleRef, {
                status: 'completed',
                winnerId: winner.userId,
                winnerName: winner.userName,
                endTime: Timestamp.now()
            });
            
            // Update winner's stats
            const walletRef = doc(db, "CodeArena_Wallets", winner.userId);
            const walletDoc = await getDoc(walletRef);
            if (walletDoc.exists()) {
                await updateDoc(walletRef, {
                    'achievements.battlesWon': (walletDoc.data()?.achievements?.battlesWon || 0) + 1
                });
            }
        } catch (error) {
            console.error("Error completing battle:", error);
            throw error;
        }
    };

    // TOURNAMENTS
    const createTournament = async (tournamentData: any) => {
        if (!user) throw new Error("User not authenticated");
        
        try {
            const tournamentRef = await addDoc(collection(db, "CodeArena_Tournaments"), {
                ...tournamentData,
                currentParticipants: 0,
                participants: [],
                status: 'upcoming',
                createdBy: user.uid,
                createdAt: Timestamp.now()
            });
            
            return tournamentRef.id;
        } catch (error) {
            console.error("Error creating tournament:", error);
            throw error;
        }
    };

    const registerForTournament = async (tournamentId: string, userId: string, userName: string) => {
        try {
            const tournamentRef = doc(db, "CodeArena_Tournaments", tournamentId);
            const tournamentDoc = await getDoc(tournamentRef);
            
            if (!tournamentDoc.exists()) throw new Error("Tournament not found");
            
            const tournamentData = tournamentDoc.data();
            
            if (tournamentData.currentParticipants >= tournamentData.maxParticipants) {
                throw new Error("Tournament is full");
            }
            
            // Deduct entry fee
            if (tournamentData.entryFee > 0) {
                await deductCoins(userId, tournamentData.entryFee, `Tournament registration`, tournamentId);
            }
            
            // Add participant
            await updateDoc(tournamentRef, {
                participants: arrayUnion({
                    userId,
                    userName,
                    totalScore: 0,
                    solvedChallenges: 0
                }),
                currentParticipants: tournamentData.currentParticipants + 1
            });
        } catch (error) {
            console.error("Error registering for tournament:", error);
            throw error;
        }
    };

    const fetchActiveTournaments = async () => {
        try {
            const q = query(
                collection(db, "CodeArena_Tournaments"),
                where("status", "in", ['upcoming', 'registration', 'in_progress']),
                orderBy("startTime", "asc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching active tournaments:", error);
            return [];
        }
    };

    const fetchUserTournaments = async (userId: string) => {
        try {
            const q = query(
                collection(db, "CodeArena_Tournaments"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            const tournaments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filter tournaments where user is a participant
            return tournaments.filter((tournament: any) =>
                tournament.participants?.some((p: any) => p.userId === userId)
            );
        } catch (error) {
            console.error("Error fetching user tournaments:", error);
            return [];
        }
    };

    const updateTournamentScore = async (tournamentId: string, userId: string, score: number) => {
        try {
            const tournamentRef = doc(db, "CodeArena_Tournaments", tournamentId);
            const tournamentDoc = await getDoc(tournamentRef);
            
            if (!tournamentDoc.exists()) throw new Error("Tournament not found");
            
            const tournamentData = tournamentDoc.data();
            const participants = tournamentData.participants.map((p: any) => {
                if (p.userId === userId) {
                    return { ...p, totalScore: p.totalScore + score, solvedChallenges: p.solvedChallenges + 1 };
                }
                return p;
            });
            
            await updateDoc(tournamentRef, { participants });
        } catch (error) {
            console.error("Error updating tournament score:", error);
            throw error;
        }
    };

    // LEADERBOARDS
    const fetchGlobalLeaderboard = async () => {
        try {
            // Fetch all data in parallel for speed
            const [walletsSnapshot, progressSnapshot, battlesSnapshot] = await Promise.all([
                getDocs(collection(db, "CodeArena_Wallets")),
                getDocs(collection(db, "CodeArena_UserProgress")),
                getDocs(collection(db, "CodeArena_Battles"))
            ]);
            
            const wallets = walletsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const progressMap = new Map();
            progressSnapshot.docs.forEach(doc => {
                progressMap.set(doc.id, doc.data());
            });
            
            // Count wins from battles
            const winsMap = new Map<string, number>();
            battlesSnapshot.docs.forEach(doc => {
                const battle = doc.data();
                if ((battle.status === 'completed' || battle.status === 'forfeited') && battle.winnerId) {
                    const currentWins = winsMap.get(battle.winnerId) || 0;
                    winsMap.set(battle.winnerId, currentWins + 1);
                }
            });
            
            // Calculate rankings
            const rankings = wallets.map((wallet: any) => {
                const progress = progressMap.get(wallet.userId) || {};
                const solvedChallenges = progress.solvedChallenges || [];
                const battlesWon = winsMap.get(wallet.userId) || wallet.achievements?.battlesWon || 0;
                
                return {
                    odId: wallet.userId,
                    odName: wallet.userName || 'Unknown',
                    rating: wallet.coins || 0,
                    problemsSolved: solvedChallenges.length,
                    battlesWon: battlesWon,
                    level: wallet.level || 1,
                    avatar: wallet.userName?.[0] || '?',
                    coins: wallet.coins || 0
                };
            })
            .sort((a, b) => {
                // Sort by coins (rating) first, then by problems solved
                if (b.rating !== a.rating) return b.rating - a.rating;
                return b.problemsSolved - a.problemsSolved;
            })
            .map((user, index) => ({
                ...user,
                rank: index + 1
            }));
            
            return rankings;
        } catch (error) {
            console.error("Error fetching global leaderboard:", error);
            return [];
        }
    };

    const fetchWeeklyLeaderboard = async () => {
        try {
            // Get start of current week
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            
            // Fetch all data in parallel for speed
            const submissionsQuery = query(
                collection(db, "CodeArena_Submissions"),
                where("submittedAt", ">=", Timestamp.fromDate(startOfWeek)),
                where("status", "==", "Accepted")
            );
            
            const [submissionsSnapshot, walletsSnapshot, battlesSnapshot] = await Promise.all([
                getDocs(submissionsQuery),
                getDocs(collection(db, "CodeArena_Wallets")),
                getDocs(collection(db, "CodeArena_Battles"))
            ]);
            
            // Aggregate submissions by user
            const userStats = new Map();
            submissionsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const userId = data.userId;
                
                if (!userStats.has(userId)) {
                    userStats.set(userId, {
                        userId,
                        userName: data.userName,
                        problemsSolved: new Set(),
                        coinsEarned: 0,
                        pointsEarned: 0
                    });
                }
                
                const stats = userStats.get(userId);
                stats.problemsSolved.add(data.challengeId);
                stats.coinsEarned += data.coinsEarned || 0;
                stats.pointsEarned += data.pointsEarned || 0;
            });
            
            const walletsMap = new Map();
            walletsSnapshot.docs.forEach(doc => {
                walletsMap.set(doc.id, doc.data());
            });
            
            // Count wins from this week and track battle participants
            const winsMap = new Map<string, number>();
            const battleParticipants = new Map<string, { odId: string; odName: string }>();
            battlesSnapshot.docs.forEach(doc => {
                const battle = doc.data();
                const battleTime = battle.createdAt?.toDate?.() || new Date(0);
                if (battleTime >= startOfWeek) {
                    // Track all participants from this week's battles
                    if (battle.creatorId) {
                        battleParticipants.set(battle.creatorId, { 
                            odId: battle.creatorId, 
                            odName: battle.creatorName || 'Unknown' 
                        });
                    }
                    if (battle.opponentId) {
                        battleParticipants.set(battle.opponentId, { 
                            odId: battle.opponentId, 
                            odName: battle.opponentName || 'Unknown' 
                        });
                    }
                    // Count wins
                    if ((battle.status === 'completed' || battle.status === 'forfeited') && battle.winnerId) {
                        const currentWins = winsMap.get(battle.winnerId) || 0;
                        winsMap.set(battle.winnerId, currentWins + 1);
                    }
                }
            });
            
            // Add battle participants who don't have submissions
            battleParticipants.forEach((participant, odId) => {
                if (!userStats.has(odId)) {
                    userStats.set(odId, {
                        userId: odId,
                        userName: participant.odName,
                        problemsSolved: new Set(),
                        coinsEarned: 0,
                        pointsEarned: 0
                    });
                }
            });
            
            // Convert to rankings array
            const rankings = Array.from(userStats.values())
                .map((stats: any) => {
                    const odId = stats.userId;
                    const wallet = walletsMap.get(odId) || {};
                    const battlesWon = winsMap.get(odId) || 0;
                    return {
                        odId: odId,
                        odName: stats.userName || 'Unknown',
                        rating: stats.coinsEarned + (battlesWon * 50),
                        problemsSolved: stats.problemsSolved.size,
                        battlesWon: battlesWon,
                        level: wallet.level || 1,
                        avatar: stats.userName?.[0] || '?',
                        coins: wallet.coins || 0
                    };
                })
                .sort((a, b) => {
                    if (b.rating !== a.rating) return b.rating - a.rating;
                    return b.problemsSolved - a.problemsSolved;
                })
                .map((user, index) => ({
                    ...user,
                    rank: index + 1
                }));
            
            return rankings;
        } catch (error) {
            console.error("Error fetching weekly leaderboard:", error);
            return [];
        }
    };

    const fetchMonthlyLeaderboard = async () => {
        try {
            // Get start of current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            // Fetch all data in parallel for faster loading - monthly
            const [submissionsSnapshot, walletsSnapshot, battlesSnapshot] = await Promise.all([
                getDocs(query(
                    collection(db, "CodeArena_Submissions"),
                    where("submittedAt", ">=", Timestamp.fromDate(startOfMonth)),
                    where("status", "==", "Accepted")
                )),
                getDocs(collection(db, "CodeArena_Wallets")),
                getDocs(collection(db, "CodeArena_Battles"))
            ]);
            
            // Aggregate by user
            const userStats = new Map();
            submissionsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const userId = data.userId;
                
                if (!userStats.has(userId)) {
                    userStats.set(userId, {
                        userId,
                        userName: data.userName,
                        problemsSolved: new Set(),
                        coinsEarned: 0,
                        pointsEarned: 0
                    });
                }
                
                const stats = userStats.get(userId);
                stats.problemsSolved.add(data.challengeId);
                stats.coinsEarned += data.coinsEarned || 0;
                stats.pointsEarned += data.pointsEarned || 0;
            });
            
            // Process wallet data - monthly
            const walletsMap = new Map();
            walletsSnapshot.docs.forEach(doc => {
                walletsMap.set(doc.id, doc.data());
            });
            
            // Process battles from this month to count real wins and track participants
            const winsMap = new Map<string, number>();
            const battleParticipants = new Map<string, { odId: string; odName: string }>();
            battlesSnapshot.docs.forEach(doc => {
                const battle = doc.data();
                const battleTime = battle.createdAt?.toDate?.() || new Date(0);
                if (battleTime >= startOfMonth) {
                    // Track all participants from this month's battles
                    if (battle.creatorId) {
                        battleParticipants.set(battle.creatorId, { 
                            odId: battle.creatorId, 
                            odName: battle.creatorName || 'Unknown' 
                        });
                    }
                    if (battle.opponentId) {
                        battleParticipants.set(battle.opponentId, { 
                            odId: battle.opponentId, 
                            odName: battle.opponentName || 'Unknown' 
                        });
                    }
                    // Count wins
                    if ((battle.status === 'completed' || battle.status === 'forfeited') && battle.winnerId) {
                        const currentWins = winsMap.get(battle.winnerId) || 0;
                        winsMap.set(battle.winnerId, currentWins + 1);
                    }
                }
            });
            
            // Add battle participants who don't have submissions
            battleParticipants.forEach((participant, odId) => {
                if (!userStats.has(odId)) {
                    userStats.set(odId, {
                        userId: odId,
                        userName: participant.odName,
                        problemsSolved: new Set(),
                        coinsEarned: 0,
                        pointsEarned: 0
                    });
                }
            });
            
            // Convert to rankings array - monthly
            const rankings = Array.from(userStats.values())
                .map((stats: any) => {
                    const odId = stats.userId;
                    const wallet = walletsMap.get(odId) || {};
                    const battlesWon = winsMap.get(odId) || 0;
                    return {
                        odId: odId,
                        odName: stats.userName || 'Unknown',
                        rating: stats.coinsEarned + (battlesWon * 50),
                        problemsSolved: stats.problemsSolved.size,
                        battlesWon: battlesWon,
                        level: wallet.level || 1,
                        avatar: stats.userName?.[0] || '?',
                        coins: wallet.coins || 0
                    };
                })
                .sort((a, b) => {
                    if (b.rating !== a.rating) return b.rating - a.rating;
                    return b.problemsSolved - a.problemsSolved;
                })
                .map((user, index) => ({
                    ...user,
                    rank: index + 1
                }));
            
            return rankings;
        } catch (error) {
            console.error("Error fetching monthly leaderboard:", error);
            return [];
        }
    };

    const updateLeaderboard = async (userId: string, userName: string, score: number) => {
        // This would typically be handled by a backend function
        // For now, placeholder
        console.log("Update leaderboard:", userId, userName, score);
    };



    // USER PROGRESS
    const getUserProgress = async (userId: string) => {
        try {
            const progressRef = doc(db, "CodeArena_UserProgress", userId);
            const progressDoc = await getDoc(progressRef);
            
            if (progressDoc.exists()) {
                return { id: progressDoc.id, ...progressDoc.data() };
            }
            
            // Initialize if doesn't exist
            await setDoc(progressRef, {
                userId,
                solvedChallenges: [],
                categoryProgress: {},
                hintsUsed: [],
                favoriteProblems: [],
                stats: {
                    totalAttempts: 0,
                    successfulAttempts: 0,
                    averageTime: 0,
                    fastestSolve: 0,
                    languagesUsed: [],
                    mostSolvedCategory: ''
                },
                updatedAt: Timestamp.now()
            });
            
            return await getDoc(progressRef).then(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching user progress:", error);
            return null;
        }
    };

    const markChallengeAsSolved = async (userId: string, challengeId: string, submissionId: string) => {
        try {
            const progressRef = doc(db, "CodeArena_UserProgress", userId);
            await updateDoc(progressRef, {
                solvedChallenges: arrayUnion({
                    challengeId,
                    solvedAt: Timestamp.now(),
                    attempts: 1,
                    bestSubmissionId: submissionId
                }),
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error marking challenge as solved:", error);
            throw error;
        }
    };

    const updateUserStats = async (userId: string, stats: any) => {
        try {
            const progressRef = doc(db, "CodeArena_UserProgress", userId);
            await updateDoc(progressRef, {
                stats,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error updating user stats:", error);
            throw error;
        }
    };

    const addBadge = async (userId: string, badge: any) => {
        try {
            const walletRef = doc(db, "CodeArena_Wallets", userId);
            await updateDoc(walletRef, {
                badges: arrayUnion({
                    ...badge,
                    earnedAt: Timestamp.now()
                }),
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error adding badge:", error);
            throw error;
        }
    };

    const updateStreak = async (userId: string) => {
        try {
            const walletRef = doc(db, "CodeArena_Wallets", userId);
            const walletDoc = await getDoc(walletRef);
            
            if (!walletDoc.exists()) return;
            
            const lastActive = walletDoc.data()?.streak?.lastActiveDate?.toDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let newStreak = 1;
            if (lastActive) {
                const lastActiveDate = new Date(lastActive);
                lastActiveDate.setHours(0, 0, 0, 0);
                
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastActiveDate.getTime() === yesterday.getTime()) {
                    newStreak = (walletDoc.data()?.streak?.current || 0) + 1;
                }
            }
            
            await updateDoc(walletRef, {
                'streak.current': newStreak,
                'streak.longest': Math.max(newStreak, walletDoc.data()?.streak?.longest || 0),
                'streak.lastActiveDate': Timestamp.now(),
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error updating streak:", error);
            throw error;
        }
    };

    // ==================== END CODEARENA FUNCTIONS ====================

    function calculateResumeCompletion(userprofile: any) {
        let totalFields = 16;
        let completed = 0;

        if (userprofile.name) completed++;
        if (userprofile.email && userprofile.email.includes("@")) completed++;
        if (userprofile.phone && userprofile.phone.length >= 10) completed++;
        if (userprofile.location && userprofile.location !== "Location") completed++;
        if (userprofile.institute && userprofile.institute !== "University Name") completed++;
        if (userprofile.bio && userprofile.bio.length > 50) completed++;
        if (userprofile.skills && userprofile.skills.length >= 3) completed++;
        if (userprofile.education && userprofile.education.length > 0) completed++;
        if (userprofile.experience && userprofile.experience.length > 0) completed++;
        if (userprofile.achievements && userprofile.achievements.length > 0) completed++;
        if (userprofile.links && userprofile.links.length > 0) completed++;
        if (userprofile.languages && userprofile.languages.length > 0) completed++;
        if (userprofile.resume_objective && userprofile.resume_objective.length > 50) completed++;
        if (userprofile.portfolio && userprofile.portfolio.length > 0) completed++;
        if (userprofile.projects && userprofile.projects.length > 0) completed++;
        if (userprofile.target_compnay && userprofile.target_compnay.length > 0) completed++;

        return Math.round((completed / totalFields) * 100);
    }

    function calculateCategoryCompletion(userprofile: any) {
        const categories = {
            Personal: [
                !!userprofile.name,
                !!userprofile.email?.includes("@"),
                !!userprofile.phone && userprofile.phone.length >= 10,
                userprofile.location !== "Location",
                userprofile.bio?.length > 50,
                userprofile.portfolio?.length > 0,
                userprofile.resume_objective?.length > 50
            ],
            Experience: [
                userprofile.experience?.length > 0,
                userprofile.marathon_rank > 0,
                userprofile.streakCount > 0,
                !!userprofile.last_active_date
            ],
            Projects: [
                userprofile.projects?.length > 0,
                userprofile.target_compnay?.length > 0,
                userprofile.links?.length > 0
            ],
            Skills: [
                userprofile.skills?.length >= 3
            ],
            Certifications: [
                userprofile.achievements?.length > 0
            ],
            Education: [
                userprofile.institute !== "University Name",
                userprofile.education?.length > 0,
                userprofile.yearOfStudy > 0
            ]
        };

        const completion: Record<string, number> = {};
        for (const [category, checks] of Object.entries(categories)) {
            const valid = checks.filter(Boolean).length;
            completion[category] = Math.round((valid / checks.length) * 100);
        }

        return completion;
    }


    useEffect(() => {
        const seed = Math.floor(Math.random() * maleAvatarLilst.length) + 1;
        const url = `https://api.dicebear.com/9.x/adventurer/svg?seed=${maleAvatarLilst[seed]}`;
        setAvatarUrl(url);

    }, [])


    useEffect(() => {
        if (!user) {
            setProfile(null);
            return;
        }

        const fetchUserProfile = async () => {
            setLoading(true);
            try {

                const docRef = doc(db, "Student_Detail", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.warn("No user profile found in Firestore");
                    setProfile(null);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const colRef = collection(db, "Contributers"); // your collection name
                const snapshot = await getDocs(colRef);
                const data: Contributor[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                    avatar: doc.data().avatar,
                    role: doc.data().role,
                    contributions: doc.data().contributions,
                    joinDate: doc.data().joinDate,
                    specialties: doc.data().specialties,
                    isTopContributor: doc.data().isTopContributor,
                    from: doc.data().from
                }));
                setcontributers(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);
    return (
        <DataContext.Provider value={{
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
            // Marathon
            fetchTodayChallenge,
            submitMarathonAnswer,
            fetchLeaderboard,
            updateUserStreak,
            // Company
            fetchCompanies,
            addCompanyToTarget,
            // Course
            fetchCourses,
            fetchEnrolledCourses,
            enrollInCourse,
            updateCourseProgress,
            // Internship
            fetchInternshipTasks,
            updateTaskStatus,
            // Project Ideas
            submitIdea,
            fetchAllIdeas,
            updateIdeaStatus,
            deleteProject,
            // Project Collaboration
            sendJoinRequest,
            fetchJoinRequests,
            fetchAllJoinRequestsDebug,
            fixJoinRequestProjectId,
            approveJoinRequest,
            rejectJoinRequest,
            getProjectMembers,
            checkUserRole,
            checkAccessDiagnostics,
            forceAddMember,
            // Admin
            fetchAllUsers,
            fetchAllJoinRequests,
            fetchAllProjectMembers,
            getPlatformStats,
            // Project Workspace
            addTask,
            fetchTasks,
            updateTask,
            deleteTask,
            sendMessage,
            fetchMessages,
            uploadFile,
            fetchFiles,
            deleteFile,
            // CodeArena
            fetchAllChallenges,
            fetchChallengeById,
            fetchDailyChallenge,
            fetchChallengesByDifficulty,
            fetchChallengesByCategory,
            submitSolution,
            fetchUserSubmissions,
            fetchChallengeSubmissions,
            initializeWallet,
            getUserWallet,
            subscribeToWallet,
            addCoins,
            deductCoins,
            fetchUserTransactions,
            purchaseHint,
            createBattle,
            joinBattle,
            fetchActiveBattles,
            fetchUserBattles,
            submitBattleSolution,
            completeBattle,
            createTournament,
            registerForTournament,
            fetchActiveTournaments,
            fetchUserTournaments,
            updateTournamentScore,
            fetchGlobalLeaderboard,
            fetchWeeklyLeaderboard,
            fetchMonthlyLeaderboard,
            updateLeaderboard,
            getUserProgress,
            markChallengeAsSolved,
            updateUserStats,
            addBadge,
            updateStreak
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useDataContext must be used within DataProvider");
    return context;
};
