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
import { db } from '../service/Firebase';

export interface DeveloperMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface DeveloperChat {
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  participantAvatars: { [userId: string]: string };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: { [userId: string]: number };
}

const CHATS_COLLECTION = 'developer_chats';
const MESSAGES_COLLECTION = 'developer_messages';

// Create or get chat between two developers
export const createOrGetDeveloperChat = async (
  userId1: string,
  userName1: string,
  userAvatar1: string,
  userId2: string,
  userName2: string,
  userAvatar2: string
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
      if (chatData.participants.includes(userId2)) {
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
      lastMessage: '',
      lastMessageTime: Timestamp.now(),
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
    });

    console.log('Chat created:', chatRef.id);
    return chatRef.id;
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
  message: string,
  recipientId: string
): Promise<void> => {
  try {
    console.log('Sending message to chat:', chatId);
    
    // Add message
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      chatId,
      senderId,
      senderName,
      senderAvatar,
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
    
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Subscribe to messages for a chat
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: DeveloperMessage[]) => void
) => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        } as DeveloperMessage));
        
        console.log('Messages updated:', messages);
        callback(messages);
      },
      (error) => {
        console.error('Error in message subscription:', error);
        // Still call callback with empty array on error
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    callback([]);
    return () => {};
  }
};

// Get user's developer chats
export const getUserDeveloperChats = async (userId: string): Promise<DeveloperChat[]> => {
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
    } as DeveloperChat));
  } catch (error) {
    console.error('Error getting developer chats:', error);
    return [];
  }
};

// Subscribe to all chats for a user (real-time)
export const subscribeToUserChats = (
  userId: string,
  callback: (chats: DeveloperChat[]) => void
) => {
  try {
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
      } as DeveloperChat));

      callback(chats);
    });
  } catch (error) {
    console.error('Error subscribing to chats:', error);
    return () => {};
  }
};

// Mark messages as read
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

// Legacy function for backward compatibility - get conversations with messages
export const getConversationsWithMessages = async (userId: string) => {
  try {
    const chats = await getUserDeveloperChats(userId);
    return chats.map(chat => ({
      id: chat.id,
      userId: userId,
      participantId: chat.participants.find(id => id !== userId) || '',
      participantName: chat.participantNames[chat.participants.find(id => id !== userId) || ''] || 'User',
      participantAvatar: chat.participantAvatars[chat.participants.find(id => id !== userId) || ''] || '',
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.lastMessageTime,
      unreadCount: chat.unreadCount[userId] || 0,
    }));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};
