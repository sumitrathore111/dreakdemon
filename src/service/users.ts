import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../service/Firebase";
import type { User } from "firebase/auth";
interface Education {
  degree: string;
  school: string;
  year: string;
}
interface Experience {
  title: string;
  company: string;
  year: string;
  desc: string;
}
interface Link {
  platform: string;
  url: string;
}

interface Project {
  project_id: string;
  role: string;
  project_status: "Complete" | "Running" | "Not Started"

}

interface Target {
  Compnay_id: string;

}
export type UserProfile = {
  uid: string;
  email: string | null;
  createdAt: any;
  role: "student" | "admin";
  isprofileComplete: boolean,
  name: string;
  phone: string;
  location: string;
  institute: string;
  bio: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  achievements: string[];
  links: Link[];
  profileCompletion: number;
  languages: Array<String>;
  yearOfStudy: number;
  projects: Project[];
  portfolio: string;
  resume_objective: string;
  target_compnay: Target[];
  marathon_rank: Number;
  last_active_date:string;
  streakCount:number;


};


export async function createUserProfileIfNeeded(user: User, name: string) {
  const ref = doc(db, "Student_Detail", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      name: user.displayName ?? name,
      createdAt: serverTimestamp(),
      role: "student",
      isprofileComplete: false,
      phone: "9999999999",
      location: "Location",
      institute: "University Name",
      bio: "About yourself",
      skills: [],
      education: [],
      experience: [],
      achievements: [],
      links: [],
      profileCompletion: 0,
      languages: [],
      yearOfStudy: 0,
      marathon_rank: 0,
      target_compnay: [],
      resume_objective: "",
      portfolio: "",
      projects: [],
      last_active_date:"",
      streakCount:0

    };
    await setDoc(ref, profile);
  }
}
