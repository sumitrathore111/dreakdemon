import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  arrayUnion,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './Firebase';

const STUDY_GROUPS_COLLECTION = 'study_groups';

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  maxMembers: number;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  members: GroupMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  name: string;
  avatar: string;
  joinedAt: Date;
  role: 'creator' | 'member';
}

// Create a new study group
export const createStudyGroup = async (groupData: Omit<StudyGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, STUDY_GROUPS_COLLECTION), {
      ...groupData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating study group:', error);
    throw error;
  }
};

// Get all study groups
export const getAllStudyGroups = async (): Promise<StudyGroup[]> => {
  try {
    const q = query(
      collection(db, STUDY_GROUPS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      members: doc.data().members?.map((m: any) => ({
        ...m,
        joinedAt: m.joinedAt?.toDate() || new Date(),
      })) || [],
    } as StudyGroup));
  } catch (error) {
    console.error('Error fetching study groups:', error);
    return [];
  }
};

// Join a study group
export const joinStudyGroup = async (
  groupId: string,
  userId: string,
  userName: string,
  userAvatar: string
): Promise<void> => {
  try {
    const groupRef = doc(db, STUDY_GROUPS_COLLECTION, groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }
    
    const groupData = groupDoc.data();
    const currentMembers = groupData.members || [];
    
    // Check if already a member
    if (currentMembers.some((m: any) => m.userId === userId)) {
      throw new Error('Already a member');
    }
    
    // Check if group is full
    if (currentMembers.length >= groupData.maxMembers) {
      throw new Error('Group is full');
    }
    
    await updateDoc(groupRef, {
      members: arrayUnion({
        userId,
        name: userName,
        avatar: userAvatar,
        joinedAt: Timestamp.now(),
        role: 'member',
      }),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error joining study group:', error);
    throw error;
  }
};

// Delete a study group
export const deleteStudyGroup = async (groupId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, STUDY_GROUPS_COLLECTION, groupId));
  } catch (error) {
    console.error('Error deleting study group:', error);
    throw error;
  }
};
