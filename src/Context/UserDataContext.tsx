import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
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
            updateTaskStatus
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
