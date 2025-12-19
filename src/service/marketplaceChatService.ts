import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from './Firebase';
import type { MarketplaceChat, MarketplaceMessage } from '../types/marketplace';

const CHATS_COLLECTION = 'marketplace_chats';
const MESSAGES_COLLECTION = 'marketplace_messages';

// ============= CHAT OPERATIONS =============

export const createOrGetChat = async (
  userId1: string,
  userName1: string,
  userAvatar1: string,
  userId2: string,
  userName2: string,
  userAvatar2: string,
  projectId: string,
  projectTitle: string
): Promise<string> => {
  try {
    // Check if chat already exists
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('participants', 'array-contains', userId1)
    );

    const querySnapshot = await getDocs(q);
    let existingChat = null;

    for (const chatDoc of querySnapshot.docs) {
      const chatData = chatDoc.data();
      if (
        chatData.participants.includes(userId2) &&
        chatData.projectId === projectId
      ) {
        existingChat = chatDoc.id;
        break;
      }
    }

    if (existingChat) {
      return existingChat;
    }

    // Create new chat
    const chatRef = await addDoc(collection(db, CHATS_COLLECTION), {
      participants: [userId1, userId2],
      participantNames: {
        [userId1]: userName1,
        [userId2]: userName2,
      },
      participantAvatars: {
        [userId1]: userAvatar1,
        [userId2]: userAvatar2,
      },
      projectId,
      projectTitle,
      lastMessage: '',
      lastMessageTime: Timestamp.now(),
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
    });

    return chatRef.id;
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    throw error;
  }
};

export const getUserChats = async (userId: string): Promise<MarketplaceChat[]> => {
  try {
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date(),
    })) as MarketplaceChat[];
  } catch (error) {
    console.error('Error getting chats:', error);
    throw error;
  }
};

export const getChatById = async (chatId: string): Promise<MarketplaceChat | null> => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      const data = chatSnap.data();
      return {
        id: chatSnap.id,
        ...data,
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
      } as MarketplaceChat;
    }
    return null;
  } catch (error) {
    console.error('Error getting chat:', error);
    throw error;
  }
};

// ============= MESSAGE OPERATIONS =============

export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderName: string,
  message: string,
  recipientId: string
): Promise<void> => {
  try {
    // Add message
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      chatId,
      senderId,
      senderName,
      message,
      timestamp: Timestamp.now(),
      read: false,
    });

    // Update chat
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      lastMessage: message.substring(0, 100),
      lastMessageTime: Timestamp.now(),
      [`unreadCount.${recipientId}`]: increment(1),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId: string): Promise<MarketplaceMessage[]> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as MarketplaceMessage[];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0,
    });

    // Mark individual messages as read
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('chatId', '==', chatId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(messageDoc => {
      if (messageDoc.data().senderId !== userId) {
        return updateDoc(doc(db, MESSAGES_COLLECTION, messageDoc.id), {
          read: true,
        });
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// ============= REAL-TIME LISTENERS =============

export const subscribeToChats = (
  userId: string,
  callback: (chats: MarketplaceChat[]) => void
) => {
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date(),
    })) as MarketplaceChat[];

    callback(chats);
  });
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: MarketplaceMessage[]) => void
) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as MarketplaceMessage[];

    callback(messages);
  });
};

export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  try {
    const chats = await getUserChats(userId);
    return chats.reduce((total, chat) => {
      return total + (chat.unreadCount[userId] || 0);
    }, 0);
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};
