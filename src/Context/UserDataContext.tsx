import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "../service/Firebase";


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
    
    // Project Collaboration functions
    sendJoinRequest: (projectId: string, projectTitle: string, creatorId: string, application: any) => Promise<void>;
    fetchJoinRequests: (projectId: string) => Promise<any[]>;
    approveJoinRequest: (requestId: string, projectId: string, userId: string, userName: string) => Promise<void>;
    rejectJoinRequest: (requestId: string) => Promise<void>;
    getProjectMembers: (projectId: string) => Promise<any[]>;
    checkUserRole: (projectId: string, userId: string) => Promise<string | null>;
    
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
                // Application details
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
        try {
            const requestsRef = collection(db, "Join_Requests");
            const q = query(requestsRef,
                where("projectId", "==", projectId),
                where("status", "==", "pending"),
                orderBy("requestedAt", "desc")
            );
            const snapshot = await getDocs(q);
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                requestedAt: doc.data().requestedAt?.toDate().toISOString()
            }));
        } catch (error) {
            console.error("Error fetching join requests:", error);
            return [];
        }
    };

    const approveJoinRequest = async (requestId: string, projectId: string, userId: string, userName: string) => {
        try {
            // Add to project members
            await addDoc(collection(db, "Project_Members"), {
                projectId,
                userId,
                userName,
                role: 'contributor',
                joinedAt: Timestamp.now()
            });
            
            // Update request status
            const requestRef = doc(db, "Join_Requests", requestId);
            await updateDoc(requestRef, {
                status: 'approved',
                approvedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error approving join request:", error);
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
            // Check if creator (from approved idea)
            const ideaRef = doc(db, "Project_Ideas", projectId);
            const ideaDoc = await getDoc(ideaRef);
            
            if (ideaDoc.exists()) {
                const idea = ideaDoc.data();
                if (idea.userId === userId) {
                    return 'creator';
                }
            }
            
            // Check if member
            const membersRef = collection(db, "Project_Members");
            const memberQuery = query(membersRef,
                where("projectId", "==", projectId),
                where("userId", "==", userId)
            );
            const memberSnapshot = await getDocs(memberQuery);
            
            if (!memberSnapshot.empty) {
                return memberSnapshot.docs[0].data().role || 'contributor';
            }
            
            return null;
        } catch (error) {
            console.error("Error checking user role:", error);
            return null;
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
            // Project Collaboration
            sendJoinRequest,
            fetchJoinRequests,
            approveJoinRequest,
            rejectJoinRequest,
            getProjectMembers,
            checkUserRole,
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
            deleteFile
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
