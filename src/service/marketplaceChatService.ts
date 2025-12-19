import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { MarketplaceChat, MarketplaceMessage } from '../types/marketplace';
import { db } from './Firebase';

const CHATS_COLLECTION = 'marketplace_chats';
const MESSAGES_COLLECTION = 'marketplace_messages';

// ============= DEBUG FUNCTION =============
// Call this from browser console: import('./service/marketplaceChatService').then(m => m.debugChatSystem('YOUR_USER_ID'))
export const debugChatSystem = async (userId: string) => {
  console.log('=== DEBUG CHAT SYSTEM ===');
  console.log('Testing for user:', userId);
  
  try {
    // Test 1: Check all chats for this user
    const q1 = query(
      collection(db, CHATS_COLLECTION),
      where('participants', 'array-contains', userId)
    );
    const snapshot1 = await getDocs(q1);
    console.log('All chats where user is participant:', snapshot1.docs.length);
    snapshot1.docs.forEach(doc => {
      const data = doc.data();
      console.log('  Chat:', doc.id, 'status:', data.status, 'sellerId:', data.sellerId, 'requesterId:', data.requesterId);
    });

    // Test 2: Check all chats where user is seller
    const q2 = query(
      collection(db, CHATS_COLLECTION),
      where('sellerId', '==', userId)
    );
    const snapshot2 = await getDocs(q2);
    console.log('All chats where user is seller:', snapshot2.docs.length);
    snapshot2.docs.forEach(doc => {
      const data = doc.data();
      console.log('  Chat:', doc.id, 'status:', data.status, 'projectTitle:', data.projectTitle);
    });

    // Test 3: Get all chats in collection (for debugging)
    const q3 = query(collection(db, CHATS_COLLECTION));
    const snapshot3 = await getDocs(q3);
    console.log('Total chats in collection:', snapshot3.docs.length);
    
    return {
      participantChats: snapshot1.docs.length,
      sellerChats: snapshot2.docs.length,
      totalChats: snapshot3.docs.length
    };
  } catch (error) {
    console.error('Debug error:', error);
    throw error;
  }
};

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
): Promise<{ chatId: string; status: string; isNew: boolean }> => {
  try {
    console.log('createOrGetChat: Creating chat request', { userId1, userId2, projectId });
    
    // Check if chat already exists
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('participants', 'array-contains', userId1)
    );

    const querySnapshot = await getDocs(q);
    let existingChatId = null;
    let existingChatStatus = null;

    for (const chatDoc of querySnapshot.docs) {
      const chatData = chatDoc.data();
      if (
        chatData.participants.includes(userId2) &&
        chatData.projectId === projectId
      ) {
        existingChatId = chatDoc.id;
        existingChatStatus = chatData.status || 'accepted';
        console.log('createOrGetChat: Found existing chat', { existingChatId, existingChatStatus });
        break;
      }
    }

    if (existingChatId) {
      return { chatId: existingChatId, status: existingChatStatus, isNew: false };
    }

    // Create new chat request (pending status)
    const chatData = {
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
      status: 'pending',
      requesterId: userId1,
      sellerId: userId2,
    };
    
    console.log('createOrGetChat: Creating new chat with data', chatData);
    
    const chatRef = await addDoc(collection(db, CHATS_COLLECTION), chatData);

    console.log('createOrGetChat: Chat created successfully', { chatId: chatRef.id });
    
    return { chatId: chatRef.id, status: 'pending', isNew: true };
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
  console.log('sendMessage: Starting', { chatId, senderId, senderName, message: message.substring(0, 20), recipientId });
  
  try {
    // Add message
    const messageDoc = await addDoc(collection(db, MESSAGES_COLLECTION), {
      chatId,
      senderId,
      senderName,
      message,
      timestamp: Timestamp.now(),
      read: false,
    });

    console.log('sendMessage: Message added with id:', messageDoc.id);

    // Update chat
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      lastMessage: message.substring(0, 100),
      lastMessageTime: Timestamp.now(),
      [`unreadCount.${recipientId}`]: increment(1),
    });
    
    console.log('sendMessage: Chat updated successfully');
  } catch (error) {
    console.error('sendMessage: Error:', error);
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
  console.log('subscribeToMessages: Setting up listener for chat:', chatId);
  
  // Simple query - sort client-side to avoid composite index requirement
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('chatId', '==', chatId)
  );

  return onSnapshot(q, (snapshot) => {
    console.log('subscribeToMessages: Received', snapshot.docs.length, 'messages');
    
    const messages = snapshot.docs
      .map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as MarketplaceMessage;
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    console.log('subscribeToMessages: Sorted messages:', messages.length);
    callback(messages);
  }, (error) => {
    console.error('subscribeToMessages: Error:', error);
    callback([]);
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

// ============= CHAT REQUEST OPERATIONS =============

export const getPendingChatRequests = async (sellerId: string): Promise<MarketplaceChat[]> => {
  try {
    // Simple query - filter client-side to avoid composite index requirement
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('sellerId', '==', sellerId)
    );

    const querySnapshot = await getDocs(q);
    const chats = querySnapshot.docs
      .map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        } as MarketplaceChat;
      })
      .filter(chat => chat.status === 'pending')
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    
    return chats;
  } catch (error) {
    console.error('Error getting pending chat requests:', error);
    throw error;
  }
};

export const acceptChatRequest = async (chatId: string): Promise<void> => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      status: 'accepted',
    });
  } catch (error) {
    console.error('Error accepting chat request:', error);
    throw error;
  }
};

export const rejectChatRequest = async (chatId: string): Promise<void> => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      status: 'rejected',
    });
  } catch (error) {
    console.error('Error rejecting chat request:', error);
    throw error;
  }
};

export const subscribeToPendingRequests = (
  sellerId: string,
  callback: (chats: MarketplaceChat[]) => void
) => {
  console.log('subscribeToPendingRequests: Setting up listener for seller:', sellerId);
  
  // Simple query - filter client-side to avoid composite index requirement
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('sellerId', '==', sellerId)
  );

  return onSnapshot(q, (snapshot) => {
    console.log('subscribeToPendingRequests: Received snapshot with', snapshot.docs.length, 'docs');
    
    const allChats: MarketplaceChat[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      console.log('subscribeToPendingRequests: Chat doc', docSnap.id, 'status:', data.status, 'sellerId:', data.sellerId);
      return {
        id: docSnap.id,
        ...data,
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
      } as MarketplaceChat;
    });
    
    const chats = allChats
      .filter(chat => chat.status === 'pending')
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

    console.log('subscribeToPendingRequests: Filtered to', chats.length, 'pending chats');
    callback(chats);
  }, (error) => {
    console.error('Error subscribing to pending requests:', error);
    callback([]);
  });
};

export const getAcceptedChats = async (userId: string): Promise<MarketplaceChat[]> => {
  try {
    // Simple query - filter client-side to avoid composite index requirement
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('participants', 'array-contains', userId)
    );

    const querySnapshot = await getDocs(q);
    const chats = querySnapshot.docs
      .map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        } as MarketplaceChat;
      })
      .filter(chat => chat.status === 'accepted')
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    
    return chats;
  } catch (error) {
    console.error('Error getting accepted chats:', error);
    throw error;
  }
};

export const subscribeToAcceptedChats = (
  userId: string,
  callback: (chats: MarketplaceChat[]) => void
) => {
  // Simple query - filter client-side to avoid composite index requirement
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs
      .map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        } as MarketplaceChat;
      })
      .filter(chat => chat.status === 'accepted')
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

    callback(chats);
  }, (error) => {
    console.error('Error subscribing to accepted chats:', error);
    callback([]);
  });
};