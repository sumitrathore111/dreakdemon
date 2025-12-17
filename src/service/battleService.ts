// Utility to deeply remove undefined fields from an object
function removeUndefinedFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields);
  } else if (obj && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = removeUndefinedFields(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
}
// Random Battle Creator Service
// Creates battles with random challenges from database

import {
  addDoc,
  collection,
  getDocs,
  query,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from './Firebase';
import { getRandomQuestion } from './questionsService';

interface BattleRequest {
  difficulty: 'easy' | 'medium' | 'hard';
  entryFee: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating?: number;
}

// Create a new battle with random challenge from database
export const createRandomBattle = async (battleRequest: BattleRequest): Promise<string | null> => {
  try {
    const { difficulty, entryFee, userId, userName, userAvatar, rating } = battleRequest;
    
    // Get random question from questions.json
    const randomQuestion = await getRandomQuestion(difficulty);
    if (!randomQuestion) {
      throw new Error(`No ${difficulty} questions found in questions.json`);
    }
    // Calculate prize (winner takes all minus platform fee)
    const prize = entryFee * 2 * 0.9; // 10% platform fee
    // Battle time limit based on difficulty
    const timeLimit = difficulty === 'easy' ? 900 : difficulty === 'medium' ? 1200 : 1800; // 15-30 minutes
    // Store the full question object as challenge, ensuring all required fields are present
    const challenge = {
      id: randomQuestion.id,
      title: randomQuestion.title,
      difficulty: randomQuestion.difficulty,
      category: randomQuestion.category,
      coinReward: randomQuestion.coinReward,
      description: randomQuestion.description,
      testCases: randomQuestion.testCases,
      test_cases: randomQuestion.test_cases
    };
    const battleData = {
      status: 'waiting',
      difficulty,
      entryFee,
      prize: Math.floor(prize),
      timeLimit,
      maxParticipants: 2,
      participants: [{
        odId: userId,
        odName: userName,
        odProfilePic: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        rating: rating || 1000,
        hasSubmitted: false
      }],
      challenge: removeUndefinedFields(challenge),
      createdAt: Timestamp.now(),
      createdBy: userId,
      version: 'v2.0-questionsjson'
    };
    const battlesRef = collection(db, 'CodeArena_Battles');
    const docRef = await addDoc(battlesRef, battleData);
    console.log(`Created battle ${docRef.id} with question: ${randomQuestion.title}`);
    return docRef.id;
  } catch (error) {
    console.error('Error creating random battle:', error);
    throw error;
  }
};

// Find existing battle to join
export const findAvailableBattle = async (
  difficulty: 'easy' | 'medium' | 'hard',
  entryFee: number
): Promise<string | null> => {
  try {
    const battlesRef = collection(db, 'CodeArena_Battles');
    const q = query(
      battlesRef,
      where('status', '==', 'waiting'),
      where('difficulty', '==', difficulty),
      where('entryFee', '==', entryFee)
    );
    
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const battle = doc.data();
      if (battle.participants.length < battle.maxParticipants) {
        return doc.id;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding available battle:', error);
    return null;
  }
};

// Join existing battle or create new one
export const joinOrCreateBattle = async (battleRequest: BattleRequest): Promise<string> => {
  try {
    const { difficulty, entryFee } = battleRequest;
    
    // First try to find an existing battle to join
    const existingBattleId = await findAvailableBattle(difficulty, entryFee);
    
    if (existingBattleId) {
      return existingBattleId;
    }
    
    // Create new battle if no suitable one exists
    const newBattleId = await createRandomBattle(battleRequest);
    
    if (!newBattleId) {
      throw new Error('Failed to create battle');
    }
    
    return newBattleId;
  } catch (error) {
    console.error('Error joining or creating battle:', error);
    throw error;
  }
};

// Create a rematch battle targeting specific opponent
export const createRematchBattle = async (
  battleRequest: BattleRequest,
  opponentId: string
): Promise<string | null> => {
  try {
    const { difficulty, entryFee, userId, userName, userAvatar, rating } = battleRequest;
    
    // Get random question from questions.json
    const randomQuestion = await getRandomQuestion(difficulty);
    if (!randomQuestion) {
      throw new Error(`No ${difficulty} questions found in questions.json`);
    }
    // Calculate prize (winner takes all minus platform fee)
    const prize = entryFee * 2 * 0.9; // 10% platform fee
    // Battle time limit based on difficulty
    const timeLimit = difficulty === 'easy' ? 900 : difficulty === 'medium' ? 1200 : 1800;
    const challenge = {
      id: randomQuestion.id,
      title: randomQuestion.title,
      difficulty: randomQuestion.difficulty,
      category: randomQuestion.category,
      coinReward: randomQuestion.coinReward,
      description: randomQuestion.description,
      testCases: randomQuestion.testCases,
      test_cases: randomQuestion.test_cases
    };
    const battleData = {
      status: 'waiting',
      difficulty,
      entryFee,
      prize: Math.floor(prize),
      timeLimit,
      maxParticipants: 2,
      participants: [{
        odId: userId,
        odName: userName,
        odProfilePic: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        rating: rating || 1000,
        hasSubmitted: false
      }],
      challenge: removeUndefinedFields(challenge),
      createdAt: Timestamp.now(),
      createdBy: userId,
      isRematch: true,
      targetOpponent: opponentId,
      version: 'v2.0-questionsjson'
    };
    
    const battlesRef = collection(db, 'CodeArena_Battles');
    const docRef = await addDoc(battlesRef, battleData);
    
    console.log(`Created rematch battle ${docRef.id} targeting opponent: ${opponentId}`);
    return docRef.id;
  } catch (error) {
    console.error('Error creating rematch battle:', error);
    throw error;
  }
};

// Find rematch battle waiting for specific user
export const findRematchBattle = async (
  opponentId: string,
  myUserId: string
): Promise<string | null> => {
  try {
    const battlesRef = collection(db, 'CodeArena_Battles');
    const q = query(
      battlesRef,
      where('status', '==', 'waiting'),
      where('isRematch', '==', true),
      where('targetOpponent', '==', myUserId),
      where('createdBy', '==', opponentId)
    );
    
    const querySnapshot = await getDocs(q);
    
    console.log(`Finding rematch: opponent=${opponentId}, myUserId=${myUserId}, found=${querySnapshot.size}`);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding rematch battle:', error);
    return null;
  }
};

// Get battle statistics
export const getBattleStats = async (): Promise<{
  totalBattles: number;
  activeBattles: number;
  completedToday: number;
}> => {
  try {
    const battlesRef = collection(db, 'CodeArena_Battles');
    
    // Get all battles
    const allBattlesQuery = await getDocs(battlesRef);
    const totalBattles = allBattlesQuery.size;
    
    // Get active battles
    const activeBattlesQuery = query(
      battlesRef,
      where('status', 'in', ['waiting', 'countdown', 'active'])
    );
    const activeBattlesSnapshot = await getDocs(activeBattlesQuery);
    const activeBattles = activeBattlesSnapshot.size;
    
    // Get battles completed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const completedTodayQuery = query(
      battlesRef,
      where('status', '==', 'completed'),
      where('endTime', '>=', Timestamp.fromDate(todayStart))
    );
    const completedTodaySnapshot = await getDocs(completedTodayQuery);
    const completedToday = completedTodaySnapshot.size;
    
    return {
      totalBattles,
      activeBattles,
      completedToday
    };
  } catch (error) {
    console.error('Error getting battle stats:', error);
    return {
      totalBattles: 0,
      activeBattles: 0,
      completedToday: 0
    };
  }
};