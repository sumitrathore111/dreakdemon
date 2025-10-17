import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, limit, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
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
    calculateCategoryCompletion :(userProfile :any) => object
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
            calculateCategoryCompletion
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
