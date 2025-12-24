import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Code2,
  Filter,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Star,
  Zap,
  AlertCircle,
  Send,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import type { DeveloperProfile } from '../../types/developerConnect';
import { sendMessage, subscribeToMessages, getConversationsWithMessages, createOrGetDeveloperChat } from '../../service/messagingService';
import { createStudyGroup, getAllStudyGroups, joinStudyGroup, deleteStudyGroup } from '../../service/studyGroupsService';

const avatarSeeds = [
  "Eliza", "Easton", "Brian", "Liam", "Jessica", "Destiny", "Luis", "Chase", "Ryan",
  "Emma", "Oliver", "Ava", "Sophia", "Jackson", "Aiden", "Isabella", "Mia", "Lucas"
];

export default function DeveloperConnect() {
  const { user } = useAuth();
  const { userprofile, fetchAllUsers } = useDataContext();
  
  const [activeTab, setActiveTab] = useState<'directory' | 'messages' | 'groups' | 'endorsements'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [lookingForFilter, setLookingForFilter] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [developers, setDevelopers] = useState<DeveloperProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  
  // Pagination
  const [displayLimit, setDisplayLimit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  
  // Study Groups state
  const [studyGroups, setStudyGroups] = useState<any[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    topic: '',
    level: 'Beginner' as const,
    maxMembers: 10
  });
  
  // Endorsements state
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [showEndorseModal, setShowEndorseModal] = useState(false);
  const [selectedUserToEndorse, setSelectedUserToEndorse] = useState<DeveloperProfile | null>(null);
  const [endorsementData, setEndorsementData] = useState({
    skill: '',
    message: ''
  });
  
  // Group details state
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [groupMessage, setGroupMessage] = useState('');
  const [groupMessages, setGroupMessages] = useState<any[]>([]);

  // Fetch REAL users from Firebase with actual profile photos
  useEffect(() => {
    const loadRealUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const allUsers = await fetchAllUsers();
        
        console.log('All users from Firebase:', allUsers); // Debug
        
        // Show ALL users with generated avatars
        const realDevelopers: DeveloperProfile[] = allUsers
          .filter((user: any) => user && user.id) // Only valid users with ID
          .map((user: any, index: number) => {
            // Generate avatar URL using DiceBear API with user-specific seed
            const seedIndex = (index + (user.id?.charCodeAt(0) || 0)) % avatarSeeds.length;
            const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${avatarSeeds[seedIndex]}`;
            
            return {
              userId: user.id || user.uid,
              name: user.displayName || user.odName || user.name || 'Developer',
              email: user.email || '',
              avatar: avatarUrl, // Generated avatar
              bio: user.bio || 'Student on NextStep',
              college: user.college || 'Not specified',
              year: user.year || ('Other' as const),
              codeArenaStats: {
                problemsSolved: user.problemsSolved || 0,
                rating: user.codeRating || 0,
                rank: user.rank || 0,
                battlesWon: user.battlesWon || 0,
                totalCoins: user.totalCoins || 0
              },
              skills: user.skills || [],
              languages: user.languages || [],
              projectsCompleted: user.projectsCompleted || 0,
              projectsLeading: user.projectsLeading || 0,
              endorsements: user.endorsements || [],
              averageRating: user.averageRating || 0,
              reviewCount: user.reviewCount || 0,
              lookingFor: user.lookingFor || 'Not looking',
              lookingForDetails: user.lookingForDetails || '',
              availability: user.availability || ('Flexible' as const),
              github: user.github,
              linkedin: user.linkedin,
              twitter: user.twitter,
              portfolio: user.portfolio,
              createdAt: user.createdAt || new Date(),
              updatedAt: user.updatedAt || new Date()
            };
          });
        
        console.log('Real developers mapped:', realDevelopers); // Debug
        setDevelopers(realDevelopers);
        
        if (realDevelopers.length === 0) {
          setError('No developers found in database. Check your Firebase connection.');
        }
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Failed to load developers: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    loadRealUsers();
  }, [fetchAllUsers]);

  // Load study groups from Firebase
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groups = await getAllStudyGroups();
        setStudyGroups(groups);
      } catch (err) {
        console.error('Error loading study groups:', err);
      }
    };
    
    loadGroups();
  }, []);

  // Subscribe to messages when chat is selected
  useEffect(() => {
    if (!selectedChat || !user) {
      setMessages([]);
      setChatId(null);
      return;
    }

    const setupChat = async () => {
      console.log('Setting up chat for:', user.uid, selectedChat);
      // Don't show loading indicator
      setLoadingMessages(false);

      try {
        // Get selected developer info
        const selectedDev = developers.find(d => d.userId === selectedChat);
        if (!selectedDev) {
          console.error('Selected developer not found');
          return;
        }

        // Create or get the chat
        const newChatId = await createOrGetDeveloperChat(
          user.uid,
          user.displayName || userprofile?.displayName || 'User',
          userprofile?.avatrUrl || `https://api.dicebear.com/9.x/adventurer/svg?seed=User`,
          selectedChat,
          selectedDev.name,
          selectedDev.avatar
        );

        setChatId(newChatId);
        console.log('Chat ID obtained:', newChatId);

        // Subscribe to messages
        const unsubscribe = subscribeToMessages(
          newChatId,
          (loadedMessages) => {
            console.log('Messages received:', loadedMessages);
            setMessages(loadedMessages);
          }
        );

        // Clear loading after subscription is set up (don't wait for first message)
        setLoadingMessages(false);

        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up chat:', error);
      }
    };

    const cleanupPromise = setupChat();

    return () => {
      cleanupPromise?.then(cleanup => cleanup?.());
    };
  }, [selectedChat, user?.uid, developers, userprofile]);

  // Load conversations when messages tab is opened (single effect, not duplicate)
  useEffect(() => {
    if (!user || activeTab !== 'messages') {
      setConversations([]);
      return;
    }

    const loadConversations = async () => {
      try {
        const convs = await getConversationsWithMessages(user.uid);
        setConversations(convs);
      } catch (err) {
        // Silently handle - indexes might still be building
        console.warn('Could not load conversations yet:', err);
        setConversations([]);
      }
    };

    loadConversations();
  }, [user?.uid, activeTab]);


  const filteredDevelopers = developers.filter(dev => {
    const matchesSearch = dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dev.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(s => dev.skills.includes(s));
    const matchesLookingFor = !lookingForFilter || dev.lookingFor.includes(lookingForFilter);
    
    return matchesSearch && matchesSkills && matchesLookingFor;
  });

  // Apply display limit for pagination
  const displayedDevelopers = filteredDevelopers.slice(0, displayLimit);
  const canLoadMore = filteredDevelopers.length > displayLimit;

  const allSkills = ['React', 'Node.js', 'Python', 'Java', 'MongoDB', 'TypeScript', 'AWS', 'Machine Learning'];
  const allColleges = ['IIT Delhi', 'IIT Mumbai', 'BITS Pilani', 'NIT Karnataka', 'DTU'];

  // Render functions for each tab
  const renderDirectory = () => {
    // Loading State
    if (loading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-1/2" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded flex-1" />
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded flex-1" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Error State
    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">Unable to Load Developers</h3>
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Empty State
    if (developers.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
          <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Developers Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Developers who complete their profiles will appear here. Invite your friends!</p>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Invite Friends
          </button>
        </div>
      );
    }

    return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <Filter className="w-5 h-5" />
          Search & Filter
        </h3>
        
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Skills Filter */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {allSkills.map(skill => (
              <button
                key={skill}
                onClick={() => {
                  setSelectedSkills(prev =>
                    prev.includes(skill)
                      ? prev.filter(s => s !== skill)
                      : [...prev, skill]
                  );
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedSkills.includes(skill)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Looking For Filter */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Looking For</p>
          <select
            value={lookingForFilter}
            onChange={(e) => setLookingForFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="">All</option>
            <option value="Teammates">Teammates</option>
            <option value="Mentoring">Mentoring</option>
            <option value="Both">Both</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <p>Showing {displayedDevelopers.length} of {filteredDevelopers.length} developers</p>
        {filteredDevelopers.length !== developers.length && (
          <p>{developers.length} total in directory</p>
        )}
      </div>

      {/* Developer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedDevelopers.map((dev, index) => (
          <motion.div
            key={dev.userId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={dev.avatar}
                  alt={dev.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{dev.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dev.college} • {dev.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-semibold">{dev.averageRating}</span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{dev.bio}</p>

            {/* CodeArena Stats */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Problems Solved</p>
                  <p className="font-bold text-gray-900 dark:text-white">{dev.codeArenaStats.problemsSolved}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Rank</p>
                  <p className="font-bold text-gray-900 dark:text-white">#{dev.codeArenaStats.rank}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1">
                {dev.skills.slice(0, 3).map(skill => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {dev.skills.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    +{dev.skills.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Looking For */}
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                {dev.lookingFor}
              </p>
              <p className="text-xs text-green-600 dark:text-green-300 line-clamp-2">{dev.lookingForDetails}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setSelectedChat(dev.userId);
                  setActiveTab('messages');
                }}
                className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
              <button 
                onClick={() => {
                  setSelectedUserToEndorse(dev);
                  setShowEndorseModal(true);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                <Award className="w-4 h-4" />
                Endorse
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {canLoadMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setDisplayLimit(prev => prev + 12)}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Load More ({filteredDevelopers.length - displayLimit} remaining)
          </button>
        </div>
      )}

      {filteredDevelopers.length === 0 && (
        <div className="text-center py-12">
          <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No developers found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
        </div>
      )}
    </div>
    );
  };

  const renderMessages = () => {
    // If no chat selected, show list of conversations
    if (!selectedChat) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Chat List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Messages</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{conversations.length} conversations</p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-2">Go to Developer Directory and send a message to start chatting</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.participantId}
                    onClick={() => setSelectedChat(conv.participantId)}
                    className={`w-full p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                      selectedChat === conv.participantId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={conv.participantAvatar}
                        alt={conv.participantName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{conv.participantName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Welcome Message */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Conversation</h3>
              <p className="text-gray-600 dark:text-gray-400">Click on a conversation to view messages</p>
            </div>
          </div>
        </div>
      );
    }

    // Get selected developer info
    const selectedDev = developers.find(d => d.userId === selectedChat);
    if (!selectedDev || !user) return null;

    const handleSendMessage = async () => {
      if (!newMessage.trim() || !user || !chatId) return;
      
      const messageContent = newMessage;
      setNewMessage('');
      
      try {
        // Send the message using the existing chatId
        await sendMessage(
          chatId,
          user.uid,
          user.displayName || userprofile?.displayName || 'User',
          userprofile?.avatrUrl || `https://api.dicebear.com/9.x/adventurer/svg?seed=User`,
          messageContent,
          selectedChat!
        );
        
        // Refresh conversations after sending
        const convs = await getConversationsWithMessages(user.uid);
        setConversations(convs);
      } catch (error) {
        console.error('Error sending message:', error);
        setNewMessage(messageContent);
      }
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setSelectedChat(null);
                setMessages([]);
              }}
              className="text-blue-500 hover:text-blue-600 text-sm font-semibold mb-3"
            >
              ← Back
            </button>
            <h3 className="font-semibold text-gray-900 dark:text-white">{selectedDev.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedDev.college}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center">
              <img src={selectedDev.avatar} alt={selectedDev.name} className="w-16 h-16 rounded-full mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{selectedDev.name}</h4>
              <p className="text-xs text-gray-500">{selectedDev.college} • {selectedDev.year}</p>
              {selectedDev.skills.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedDev.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Chat with {selectedDev.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Direct messaging</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <div className="text-gray-500 text-sm">Loading messages...</div>
                <div className="text-gray-400 text-xs mt-2">If this takes long, Firebase indexes may be building</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.senderId !== user.uid && (
                    <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-full flex-shrink-0" />
                  )}
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.senderId === user.uid
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm">{msg.message || msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === user.uid ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {msg.timestamp instanceof Date
                        ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newMessage.trim()) {
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGroups = () => {
    // If a group is selected, show group details
    if (selectedGroup) {
      const isMember = selectedGroup.members?.some((m: any) => m.userId === user?.uid);
      
      return (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedGroup(null)}
            className="text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-2"
          >
            ← Back to Groups
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedGroup.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{selectedGroup.description}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full ${
                selectedGroup.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                selectedGroup.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {selectedGroup.level}
              </span>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                {selectedGroup.topic}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedGroup.members?.length || 0} / {selectedGroup.maxMembers} members
              </span>
            </div>
            
            {/* Members List */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedGroup.members?.map((member: any) => (
                  <div key={member.userId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <img
                      src={member.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${member.name}`}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.role === 'creator' ? '👑 Creator' : 'Member'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {isMember ? (
              <>
                {/* Group Chat */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Group Discussion
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
                    {groupMessages.length === 0 ? (
                      <p className="text-gray-500 text-center text-sm py-8">No messages yet. Start the conversation!</p>
                    ) : (
                      <div className="space-y-3">
                        {groupMessages.map((msg: any, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <img src={msg.avatar} alt={msg.name} className="w-8 h-8 rounded-full" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{msg.name}</span>
                                <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{msg.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={groupMessage}
                      onChange={(e) => setGroupMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && groupMessage.trim()) {
                          const newMsg = {
                            name: user?.displayName || 'User',
                            avatar: userprofile?.avatrUrl || '',
                            message: groupMessage,
                            timestamp: new Date()
                          };
                          setGroupMessages([...groupMessages, newMsg]);
                          setGroupMessage('');
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => {
                        if (groupMessage.trim()) {
                          const newMsg = {
                            name: user?.displayName || 'User',
                            avatar: userprofile?.avatrUrl || '',
                            message: groupMessage,
                            timestamp: new Date()
                          };
                          setGroupMessages([...groupMessages, newMsg]);
                          setGroupMessage('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resources & Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-500">
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Share Resource</p>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-500">
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Schedule Session</p>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-500">
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Set Goal</p>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Join this group to access discussions and resources</p>
                <button
                  onClick={async () => {
                    if (user) {
                      try {
                        await joinStudyGroup(
                          selectedGroup.id,
                          user.uid,
                          user.displayName || 'User',
                          userprofile?.avatrUrl || ''
                        );
                        const groups = await getAllStudyGroups();
                        const updatedGroup = groups.find(g => g.id === selectedGroup.id);
                        setSelectedGroup(updatedGroup);
                        setStudyGroups(groups);
                      } catch (error) {
                        console.error('Error joining group:', error);
                        alert('Failed to join group. Please try again.');
                      }
                    }
                  }}
                  disabled={selectedGroup.members?.length >= selectedGroup.maxMembers}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Join Group
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Group list view
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Study Groups</h3>
          <button 
            onClick={() => setShowCreateGroup(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Study Group</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                  placeholder="DSA Interview Prep"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                  placeholder="Daily DSA practice and mock interviews"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                <select
                  value={newGroupData.topic}
                  onChange={(e) => setNewGroupData({...newGroupData, topic: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">Select Topic</option>
                  <option value="DSA">Data Structures & Algorithms</option>
                  <option value="Web Dev">Web Development</option>
                  <option value="Mobile">Mobile Development</option>
                  <option value="AI/ML">AI & Machine Learning</option>
                  <option value="System Design">System Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Level</label>
                <select
                  value={newGroupData.level}
                  onChange={(e) => setNewGroupData({...newGroupData, level: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Max Members</label>
                <input
                  type="number"
                  value={newGroupData.maxMembers}
                  onChange={(e) => setNewGroupData({...newGroupData, maxMembers: parseInt(e.target.value)})}
                  min="2"
                  max="50"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (newGroupData.name && newGroupData.topic && user) {
                    try {
                      const groupId = await createStudyGroup({
                        ...newGroupData,
                        creatorId: user.uid,
                        creatorName: user.displayName || 'User',
                        creatorAvatar: userprofile?.avatrUrl || '',
                        members: [{
                          userId: user.uid,
                          name: user.displayName || 'User',
                          avatar: userprofile?.avatrUrl || '',
                          joinedAt: new Date(),
                          role: 'creator' as const
                        }]
                      });
                      
                      // Reload groups
                      const groups = await getAllStudyGroups();
                      setStudyGroups(groups);
                      setShowCreateGroup(false);
                      setNewGroupData({name: '', description: '', topic: '', level: 'Beginner', maxMembers: 10});
                    } catch (error) {
                      console.error('Error creating group:', error);
                      alert('Failed to create group. Please try again.');
                    }
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Group
              </button>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
        {/* Study Groups Grid */}
        {studyGroups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Study Groups Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create or join a study group to learn together</p>
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Create First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGroups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">{group.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">by {group.creatorName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    group.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    group.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {group.level}
                  </span>
                  {group.creatorId === user?.uid && (
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this study group?')) {
                          try {
                            await deleteStudyGroup(group.id);
                            const groups = await getAllStudyGroups();
                            setStudyGroups(groups);
                          } catch (error) {
                            console.error('Error deleting group:', error);
                            alert('Failed to delete group. Please try again.');
                          }
                        }
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{group.description}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                  {group.topic}
                </span>
              </div>
              
              {/* Members Preview */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Members ({group.members?.length || 0})</p>
                <div className="flex items-center gap-1">
                  {group.members?.slice(0, 5).map((member: any, idx: number) => (
                    <img
                      key={member.userId}
                      src={member.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${member.name}`}
                      alt={member.name}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                      title={member.name}
                      style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
                    />
                  ))}
                  {(group.members?.length || 0) > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300" style={{ marginLeft: '-8px' }}>
                      +{(group.members?.length || 0) - 5}
                    </div>
                  )}
                  {(!group.members || group.members.length === 0) && (
                    <p className="text-xs text-gray-500">No members yet</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
                <span>{group.members?.length || 0} / {group.maxMembers} members</span>
                <span className="text-gray-400">Created {new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
              
              <button
                onClick={() => setSelectedGroup(group)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
        )}
      </div>
    );
  };

  const renderEndorsements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Skill Endorsements</h3>
      </div>

      {/* Endorse Modal */}
      {showEndorseModal && selectedUserToEndorse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Endorse {selectedUserToEndorse.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Skill</label>
                <select
                  value={endorsementData.skill}
                  onChange={(e) => setEndorsementData({...endorsementData, skill: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">Choose a skill</option>
                  {selectedUserToEndorse.skills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Message (Optional)</label>
                <textarea
                  value={endorsementData.message}
                  onChange={(e) => setEndorsementData({...endorsementData, message: e.target.value})}
                  placeholder="Great team player with excellent React skills..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (endorsementData.skill && user) {
                    const newEndorsement = {
                      id: Date.now().toString(),
                      endorserId: user.uid,
                      endorserName: user.displayName || 'User',
                      endorserAvatar: userprofile?.avatrUrl || '',
                      recipientId: selectedUserToEndorse.userId,
                      recipientName: selectedUserToEndorse.name,
                      skill: endorsementData.skill,
                      message: endorsementData.message,
                      timestamp: new Date()
                    };
                    setEndorsements([...endorsements, newEndorsement]);
                    setShowEndorseModal(false);
                    setSelectedUserToEndorse(null);
                    setEndorsementData({skill: '', message: ''});
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send Endorsement
              </button>
              <button
                onClick={() => {
                  setShowEndorseModal(false);
                  setSelectedUserToEndorse(null);
                  setEndorsementData({skill: '', message: ''});
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Endorsements Received */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-500" />
          Endorsements Received ({endorsements.filter(e => e.recipientId === user?.uid).length})
        </h4>
        
        {endorsements.filter(e => e.recipientId === user?.uid).length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No endorsements yet. Keep collaborating!</p>
        ) : (
          <div className="space-y-4">
            {endorsements.filter(e => e.recipientId === user?.uid).map(endorsement => (
              <div key={endorsement.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <img src={endorsement.endorserAvatar} alt={endorsement.endorserName} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{endorsement.endorserName}</p>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      {endorsement.skill}
                    </span>
                  </div>
                  {endorsement.message && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{endorsement.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(endorsement.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Endorsements Given */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Endorsements Given ({endorsements.filter(e => e.endorserId === user?.uid).length})
        </h4>
        
        {endorsements.filter(e => e.endorserId === user?.uid).length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            You haven't endorsed anyone yet. Go to the directory to endorse developers!
          </p>
        ) : (
          <div className="space-y-4">
            {endorsements.filter(e => e.endorserId === user?.uid).map(endorsement => (
              <div key={endorsement.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">To: {endorsement.recipientName}</p>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      {endorsement.skill}
                    </span>
                  </div>
                  {endorsement.message && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{endorsement.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(endorsement.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent mb-2">
                Developer Connect 🤝
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Find teammates, build together, grow your network
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'directory', label: 'Developer Directory', icon: Code2 },
            { id: 'messages', label: 'Messages', icon: Mail },
            { id: 'groups', label: 'Study Groups', icon: BookOpen },
            { id: 'endorsements', label: 'Endorsements', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'directory' && renderDirectory()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'groups' && renderGroups()}
        {activeTab === 'endorsements' && renderEndorsements()}
      </div>
    </div>
  );
}
