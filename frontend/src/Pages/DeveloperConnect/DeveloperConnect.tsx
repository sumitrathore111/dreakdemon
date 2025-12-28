import { motion } from 'framer-motion';
import {
  AlertCircle,
  Award,
  BookOpen,
  Check,
  Code2,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Send,
  Trash2,
  UserMinus,
  X,
  Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import CustomSelect from '../../Component/Global/CustomSelect';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { apiRequest } from '../../service/api';
import { getSocket, initializeSocket } from '../../service/socketService';
import { approveJoinRequest, createStudyGroup, deleteStudyGroup, getAllStudyGroups, rejectJoinRequest, removeMember, requestJoinStudyGroup } from '../../service/studyGroupsService';
import type { DeveloperProfile } from '../../types/developerConnect';

// Helper function to format timestamps
const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'Unknown date';
  
  try {
    // Handle date object with toDate method
    if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }
    // Handle seconds/nanoseconds object (MongoDB/timestamp format)
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    // Handle regular Date object or ISO string
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    return 'Unknown date';
  } catch {
    return 'Unknown date';
  }
};

export default function DeveloperConnect() {
  const { user } = useAuth();
  const { userprofile } = useDataContext();
  
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
  
  // Study Groups state
  const [studyGroups, setStudyGroups] = useState<any[]>([]);
  const [studyGroupSearch, setStudyGroupSearch] = useState('');
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch ALL initial data in one optimized call
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use optimized endpoint that fetches everything in parallel
        const data = await apiRequest('/developers/init/page-data');
        
        console.log('Developer Connect data loaded:', data);
        
        setDevelopers(data.developers || []);
        setStudyGroups(data.studyGroups || []);
        setEndorsements(data.endorsements || []);
        
        if (!data.developers || data.developers.length === 0) {
          setError('No developers found. The community is waiting for you!');
        }
      } catch (err) {
        console.error('Error loading Developer Connect data:', err);
        // Fallback to individual calls if optimized endpoint fails
        try {
          const [developersData, groupsData, endorsementsData] = await Promise.all([
            apiRequest('/developers').catch(() => []),
            apiRequest('/study-groups').catch(() => ({ groups: [] })),
            apiRequest('/developers/endorsements/me').catch(() => ({ endorsements: [] }))
          ]);
          
          setDevelopers(developersData || []);
          setStudyGroups(groupsData.groups || []);
          setEndorsements(endorsementsData.endorsements || []);
        } catch (fallbackErr) {
          setError('Failed to load developers: ' + (err instanceof Error ? err.message : String(err)));
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load conversations when messages tab is opened
  useEffect(() => {
    if (!selectedChat || !user) {
      setMessages([]);
      setChatId(null);
      return;
    }

    let isMounted = true;
    let currentChatId: string | null = null;

    const setupChat = async () => {
      console.log('Setting up chat for:', user.id, selectedChat);
      setLoadingMessages(true);

      try {
        // Get selected developer info
        const selectedDev = developers.find(d => d.userId === selectedChat);
        if (!selectedDev) {
          console.error('Selected developer not found');
          setLoadingMessages(false);
          return;
        }

        // Create or get the chat
        const chat = await apiRequest('/chats', {
          method: 'POST',
          body: JSON.stringify({
            participantIds: [user.id, selectedChat],
            participantNames: [userprofile?.displayName || user.name || 'User', selectedDev.name],
            participantAvatars: [userprofile?.avatrUrl || '', selectedDev.avatar]
          })
        });
        
        if (!isMounted) return;
        setChatId(chat.id);
        currentChatId = chat.id;
        console.log('Chat ID obtained:', chat.id);

        // Fetch initial messages
        const loadedMessages = await apiRequest(`/chats/${chat.id}/messages`);
        if (isMounted) {
          setMessages(loadedMessages);
        }
        setLoadingMessages(false);

        // Initialize socket for real-time messaging
        try {
          initializeSocket();
          const socket = getSocket();
          if (socket) {
            // Join chat room
            socket.emit('join-chat', chat.id);
            console.log('📡 Joined chat room:', chat.id);
            
            // Listen for new messages
            const messageHandler = (payload: any) => {
              console.log('📩 Received new message:', payload);
              if (payload.chatId === chat.id && isMounted) {
                setMessages(prev => {
                  // Avoid duplicates
                  const exists = prev.some(m => m.id === payload.id);
                  if (exists) return prev;
                  return [...prev, payload];
                });
              }
            };
            
            socket.on('newMessage', messageHandler);
            
            // Store handler for cleanup
            (socket as any)._chatMessageHandler = messageHandler;
          }
        } catch (e) {
          console.warn('Socket init failed, falling back to polling:', e);
        }

      } catch (error) {
        console.error('Error setting up chat:', error);
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    };

    setupChat();

    return () => {
      isMounted = false;
      // Leave socket room and cleanup listener
      try {
        const socket = getSocket();
        if (socket && socket.connected && currentChatId) {
          socket.emit('leave-chat', currentChatId);
          const handler = (socket as any)._chatMessageHandler;
          if (handler) {
            socket.off('newMessage', handler);
          }
          delete (socket as any)._chatMessageHandler;
        }
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, [selectedChat, user?.id, developers, userprofile]);

  // Load conversations when messages tab is opened
  useEffect(() => {
    if (!user || activeTab !== 'messages') {
      setConversations([]);
      return;
    }

    const loadConversations = async () => {
      try {
        // Load chats from the chats endpoint
        const chats = await apiRequest('/chats');
        // Transform chats to conversation format
        const formattedConversations = (chats || []).map((chat: any) => ({
          participantId: chat.participantId,
          participantName: chat.participantName,
          participantAvatar: chat.participantAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.participantName?.replace(/\s+/g, '')}`,
          lastMessage: chat.lastMessage,
          lastMessageAt: chat.lastMessageAt
        }));
        setConversations(formattedConversations);
      } catch (err) {
        console.warn('Could not load conversations yet:', err);
        setConversations([]);
      }
    };

    loadConversations();
  }, [user?.id, activeTab]);

  // Real-time socket events for study groups
  useEffect(() => {
    if (!user) return;

    try {
      initializeSocket();
      const socket = getSocket();
      if (!socket) return;

      // Join user's personal room for notifications
      socket.emit('join-user', user.id);

      // Handle new join request (for group admins)
      const handleJoinRequest = (data: any) => {
        console.log('New join request:', data);
        // Update the selected group if it matches
        if (selectedGroup && selectedGroup.id === data.groupId) {
          setSelectedGroup((prev: any) => {
            if (!prev) return prev;
            const existingRequests = prev.joinRequests || [];
            // Check if request already exists
            if (existingRequests.some((r: any) => r.userId === data.request.userId)) {
              return prev;
            }
            return {
              ...prev,
              joinRequests: [...existingRequests, data.request]
            };
          });
        }
        toast.success(`${data.request.userName} requested to join your group!`);
      };

      // Handle request approved (for the user who requested)
      const handleRequestApproved = (data: any) => {
        console.log('Request approved:', data);
        toast.success(`You've been approved to join ${data.groupName}!`);
        // Update the group in the list
        if (data.group) {
          setStudyGroups(prev => prev.map(g => g.id === data.groupId ? data.group : g));
          if (selectedGroup && selectedGroup.id === data.groupId) {
            setSelectedGroup(data.group);
          }
        }
      };

      // Handle request rejected (for the user who requested)
      const handleRequestRejected = (data: any) => {
        console.log('Request rejected:', data);
        toast.error(`Your request to join ${data.groupName} was rejected.`);
        // Update the selected group to clear pending state
        if (selectedGroup && selectedGroup.id === data.groupId) {
          setSelectedGroup((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              joinRequests: prev.joinRequests?.filter((r: any) => r.userId !== user.id) || []
            };
          });
        }
      };

      // Handle member joined (for group members)
      const handleMemberJoined = (data: any) => {
        console.log('Member joined:', data);
        toast.success(`${data.member.name} has joined the group!`);
        if (data.group) {
          setStudyGroups(prev => prev.map(g => g.id === data.groupId ? data.group : g));
          if (selectedGroup && selectedGroup.id === data.groupId) {
            setSelectedGroup(data.group);
          }
        }
      };

      // Handle removed from group (for the removed user)
      const handleRemovedFromGroup = (data: any) => {
        console.log('Removed from group:', data);
        toast.error(`You've been removed from ${data.groupName}`);
        // If viewing this group, go back to list
        if (selectedGroup && selectedGroup.id === data.groupId) {
          setSelectedGroup(null);
        }
        // Remove from study groups list
        setStudyGroups(prev => prev.filter(g => g.id !== data.groupId));
      };

      // Handle member removed (for group members)
      const handleMemberRemoved = (data: any) => {
        console.log('Member removed:', data);
        if (data.group) {
          setStudyGroups(prev => prev.map(g => g.id === data.groupId ? data.group : g));
          if (selectedGroup && selectedGroup.id === data.groupId) {
            setSelectedGroup(data.group);
          }
        }
      };

      // Handle group updated
      const handleGroupUpdated = (data: any) => {
        console.log('Group updated:', data);
        if (data.group) {
          setStudyGroups(prev => prev.map(g => g.id === data.groupId ? data.group : g));
          if (selectedGroup && selectedGroup.id === data.groupId) {
            setSelectedGroup(data.group);
          }
        }
      };

      socket.on('joinRequest', handleJoinRequest);
      socket.on('requestApproved', handleRequestApproved);
      socket.on('requestRejected', handleRequestRejected);
      socket.on('memberJoined', handleMemberJoined);
      socket.on('removedFromGroup', handleRemovedFromGroup);
      socket.on('memberRemoved', handleMemberRemoved);
      socket.on('groupUpdated', handleGroupUpdated);

      return () => {
        socket.emit('leave-user', user.id);
        socket.off('joinRequest', handleJoinRequest);
        socket.off('requestApproved', handleRequestApproved);
        socket.off('requestRejected', handleRequestRejected);
        socket.off('memberJoined', handleMemberJoined);
        socket.off('removedFromGroup', handleRemovedFromGroup);
        socket.off('memberRemoved', handleMemberRemoved);
        socket.off('groupUpdated', handleGroupUpdated);
      };
    } catch (error) {
      console.warn('Socket initialization failed for study groups:', error);
    }
  }, [user?.id, selectedGroup?.id]);

  // Join/leave group socket rooms when viewing a group
  useEffect(() => {
    if (!selectedGroup || !user) return;

    try {
      const socket = getSocket();
      if (socket) {
        socket.emit('join-group', selectedGroup.id);
      }

      return () => {
        if (socket) {
          socket.emit('leave-group', selectedGroup.id);
        }
      };
    } catch (error) {
      console.warn('Could not join group socket room:', error);
    }
  }, [selectedGroup?.id, user]);

  // Load group messages when a group is selected
  useEffect(() => {
    if (!selectedGroup || !user) {
      setGroupMessages([]);
      return;
    }

    const loadGroupMessages = async () => {
      try {
        const response = await apiRequest(`/study-groups/${selectedGroup.id}/messages`);
        setGroupMessages(response.messages || []);
      } catch (err) {
        console.warn('Could not load group messages:', err);
        setGroupMessages([]);
      }
    };

    loadGroupMessages();
    
    // Set up real-time message listener
    try {
      const socket = getSocket();
      if (socket) {
        const handleNewGroupMessage = (data: any) => {
          if (data.groupId === selectedGroup.id && data.message) {
            setGroupMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === data.message.id)) {
                return prev;
              }
              return [...prev, data.message];
            });
          }
        };
        
        socket.on('newGroupMessage', handleNewGroupMessage);
        
        return () => {
          socket.off('newGroupMessage', handleNewGroupMessage);
        };
      }
    } catch (error) {
      console.warn('Socket not available for group messages:', error);
    }
  }, [selectedGroup?.id, user]);


  const filteredDevelopers = developers.filter(dev => {
    const devSkills = dev.skills || [];
    const devLookingFor = dev.lookingFor || '';
    
    const matchesSearch = (dev.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         devSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(s => devSkills.includes(s));
    const matchesLookingFor = !lookingForFilter || devLookingFor.includes(lookingForFilter);
    
    return matchesSearch && matchesSkills && matchesLookingFor;
  });

  // Apply display limit for pagination
  const displayedDevelopers = filteredDevelopers.slice(0, displayLimit);
  const canLoadMore = filteredDevelopers.length > displayLimit;

  const allSkills = ['React', 'Node.js', 'Python', 'Java', 'MongoDB', 'TypeScript', 'AWS', 'Machine Learning'];

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
          <p className="text-gray-600 dark:text-white mb-6">Developers who complete their profiles will appear here. Invite your friends!</p>
          <button className="px-6 py-2 text-white rounded-lg transition-all shadow-lg hover:opacity-90" style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}>
            Invite Friends
          </button>
        </div>
      );
    }

    return (
    <div className="space-y-6">
      {/* Search and Filters - Marketplace Style */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search developers by name or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:bg-white dark:focus:bg-gray-600 transition-all"
            />
          </div>

          {/* Skills Filter */}
          <CustomSelect
            value={selectedSkills.length > 0 ? selectedSkills[0] : ''}
            onChange={(value) => {
              if (value === '') {
                setSelectedSkills([]);
              } else {
                setSelectedSkills(prev =>
                  prev.includes(value)
                    ? prev.filter(s => s !== value)
                    : [value]
                );
              }
            }}
            options={[
              { value: '', label: 'All Skills' },
              ...allSkills.map(skill => ({ value: skill, label: skill }))
            ]}
            className="w-full sm:min-w-[180px] sm:w-auto"
          />

          {/* Looking For Filter */}
          <CustomSelect
            value={lookingForFilter}
            onChange={(value) => setLookingForFilter(value)}
            options={[
              { value: '', label: 'Looking For' },
              { value: 'Teammates', label: 'Teammates' },
              { value: 'Mentoring', label: 'Mentoring' },
              { value: 'Both', label: 'Both' }
            ]}
            className="w-full sm:min-w-[180px] sm:w-auto"
          />
        </div>

        {/* Selected Skills Tags */}
        {selectedSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedSkills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}
              >
                {skill}
                <button
                  onClick={() => setSelectedSkills(prev => prev.filter(s => s !== skill))}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => setSelectedSkills([])}
              className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-white">
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
                  src={dev.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.name}`}
                  alt={dev.name || 'Developer'}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{dev.name || 'Unknown'}</h3>
                  <p className="text-xs text-gray-500 dark:text-white">
                    {dev.institute || dev.college || 'Not specified'} • {
                      dev.yearOfStudy ? 
                        (dev.yearOfStudy === 1 ? '1st Year' : dev.yearOfStudy === 2 ? '2nd Year' : dev.yearOfStudy === 3 ? '3rd Year' : dev.yearOfStudy === 4 ? '4th Year' : `${dev.yearOfStudy} Year`) 
                        : (dev.year || 'Student')
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1" style={{ color: '#00ADB5' }}>
                <Award className="w-4 h-4" />
                <span className="text-sm font-semibold">{endorsements.filter(e => e.recipientId === dev.userId).length}</span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-600 dark:text-white mb-4 line-clamp-2">{dev.bio || 'No bio available'}</p>

            {/* CodeArena Stats */}
            <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(0, 173, 181, 0.1)' }}>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-600 dark:text-white">Problems Solved</p>
                  <p className="font-bold text-gray-900 dark:text-white">{dev.challenges_solved || dev.codeArenaStats?.problemsSolved || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-white">Rank</p>
                  <p className="font-bold text-gray-900 dark:text-white">#{dev.marathon_rank || dev.codeArenaStats?.rank || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 dark:text-white mb-2">Skills</p>
              <div className="flex flex-wrap gap-1">
                {(dev.skills || []).length > 0 ? (
                  <>
                    {(dev.skills || []).slice(0, 3).map((skill: string) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(0, 173, 181, 0.15)', color: '#00ADB5' }}
                      >
                        {skill}
                      </span>
                    ))}
                    {(dev.skills || []).length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-full">
                        +{(dev.skills || []).length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">No skills added</span>
                )}
              </div>
            </div>

            {/* Looking For */}
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                {dev.lookingFor || 'Open to opportunities'}
              </p>
              <p className="text-xs text-green-600 dark:text-green-300 line-clamp-2">{dev.lookingForDetails || 'Looking to connect with other developers'}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => {
                  setSelectedChat(dev.userId);
                  setActiveTab('messages');
                }}
                className="flex-1 px-3 py-2 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}>
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
              <button 
                onClick={() => {
                  setSelectedUserToEndorse(dev);
                  setShowEndorseModal(true);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white text-sm font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
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
            className="px-8 py-3 text-white rounded-lg transition-all shadow-lg hover:opacity-90 font-semibold"
            style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}
          >
            Load More ({filteredDevelopers.length - displayLimit} remaining)
          </button>
        </div>
      )}

      {filteredDevelopers.length === 0 && (
        <div className="text-center py-12">
          <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No developers found</h3>
          <p className="text-gray-600 dark:text-white">Try adjusting your filters</p>
        </div>
      )}
    </div>
    );
  };

  const renderMessages = () => {
    // Get selected developer info
    const selectedDev = selectedChat ? developers.find(d => d.userId === selectedChat) : null;

    const handleSendMessage = async () => {
      if (!newMessage.trim() || !user || !chatId) return;
      
      const messageContent = newMessage;
      setNewMessage('');
      
      // Optimistically add message to UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        senderName: userprofile?.displayName || user.name || 'User',
        senderAvatar: userprofile?.avatrUrl || '',
        message: messageContent,
        timestamp: new Date(),
        isRead: false
      };
      setMessages(prev => [...prev, optimisticMessage]);
      
      try {
        await apiRequest(`/chats/${chatId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            senderId: user.id,
            senderName: userprofile?.displayName || user.name || 'User',
            senderAvatar: userprofile?.avatrUrl || '',
            message: messageContent,
          }),
        });
        
        // Fetch updated messages to get the real message with ID
        const loadedMessages = await apiRequest(`/chats/${chatId}/messages`);
        setMessages(loadedMessages);
      } catch (error) {
        console.error('Error sending message:', error);
        setNewMessage(messageContent);
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      }
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        {/* Left Side - Users/Conversations List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" style={{ color: '#00ADB5' }} />
              Messages
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{conversations.length} conversations</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-2 text-gray-400">Go to Developer Directory to start chatting</p>
              </div>
            ) : (
              conversations.map(conv => (
                <motion.button
                  key={conv.participantId}
                  whileHover={{ backgroundColor: 'rgba(0, 173, 181, 0.05)' }}
                  onClick={() => setSelectedChat(conv.participantId)}
                  className={`w-full p-3 border-b border-gray-100 dark:border-gray-700 transition-all text-left`}
                  style={selectedChat === conv.participantId ? { 
                    backgroundColor: 'rgba(0, 173, 181, 0.1)', 
                    borderLeft: '3px solid #00ADB5' 
                  } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={conv.participantAvatar}
                        alt={conv.participantName}
                        className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-700 shadow-sm"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{conv.participantName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col shadow-lg overflow-hidden">
          {!selectedChat || !selectedDev ? (
            // No chat selected - show welcome message
            <div className="flex-1 flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-6"
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, rgba(0, 173, 181, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)' }}>
                  <MessageSquare className="w-10 h-10" style={{ color: '#00ADB5' }} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Conversation</h3>
                <p className="text-gray-500 dark:text-gray-400">Choose a user from the left to start chatting</p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={selectedDev.avatar} alt={selectedDev.name} className="w-10 h-10 rounded-full ring-2 ring-cyan-500" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedDev.name}</h3>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Online
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Messages Container */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{
                  backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(0, 173, 181, 0.03) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 173, 181, 0.03) 2%, transparent 0%)',
                  backgroundSize: '100px 100px'
                }}
              >
                {loadingMessages ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full"
                  >
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent mb-3" style={{ borderTopColor: '#00ADB5', borderRightColor: '#00d4ff' }}></div>
                    <div className="text-gray-500 text-sm">Loading messages...</div>
                  </motion.div>
                ) : messages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full"
                  >
                    <p className="text-gray-500">No messages yet. Say hello! 👋</p>
                  </motion.div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isMe = msg.senderId === user?.id || msg.senderId === user?.id?.toString() || msg.userId === user?.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
                          className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <img 
                              src={msg.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderName?.replace(/\s+/g, '') || 'User'}`} 
                              alt={msg.senderName || 'User'} 
                              className="w-8 h-8 rounded-full flex-shrink-0 mr-2 shadow-sm" 
                            />
                          )}
                          
                          <div className={`max-w-[70%] ${isMe ? 'mr-2' : ''}`}>
                            <motion.div 
                              whileHover={{ scale: 1.01 }}
                              className={`px-4 py-2.5 ${
                                isMe 
                                  ? 'rounded-tl-2xl rounded-tr-md rounded-bl-2xl rounded-br-2xl text-white' 
                                  : 'rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600'
                              }`}
                              style={isMe ? { 
                                background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)',
                                boxShadow: '0 4px 15px rgba(0, 173, 181, 0.3)'
                              } : {
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                              }}
                            >
                              <p className="text-sm leading-relaxed">{msg.message || msg.content || msg.text}</p>
                              <p className={`text-[10px] mt-1 ${isMe ? 'text-cyan-100 text-right' : 'text-gray-400'}`}>
                                {msg.createdAt 
                                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </motion.div>
                          </div>
                          
                          {isMe && (
                            <img 
                              src={userprofile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name?.replace(/\s+/g, '') || 'Me'}`} 
                              alt="Me" 
                              className="w-8 h-8 rounded-full flex-shrink-0 ml-2 shadow-sm" 
                            />
                          )}
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex gap-3 items-center">
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
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': 'rgba(0, 173, 181, 0.5)' } as React.CSSProperties}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg"
                    style={{ 
                      background: newMessage.trim() 
                        ? 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' 
                        : '#9ca3af'
                    }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderGroups = () => {
    // If a group is selected, show group details
    if (selectedGroup) {
      const isMember = selectedGroup.members?.some((m: any) => m.userId === user?.id);
      const isAdmin = selectedGroup.members?.some((m: any) => m.userId === user?.id && (m.role === 'admin' || m.role === 'creator'));
      const hasPendingRequest = selectedGroup.joinRequests?.some((r: any) => r.userId === user?.id && r.status === 'pending');
      
      return (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedGroup(null)}
            className="font-semibold flex items-center gap-2 transition-colors"
            style={{ color: '#00ADB5' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            ← Back to Groups
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedGroup.name}</h2>
                <p className="text-gray-600 dark:text-white">{selectedGroup.description}</p>
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
              <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(0, 173, 181, 0.15)', color: '#00ADB5' }}>
                {selectedGroup.topic}
              </span>
              <span className="text-sm text-gray-600 dark:text-white">
                {selectedGroup.members?.length || 0} / {selectedGroup.maxMembers} members
              </span>
            </div>
            
            {/* Pending Join Requests - Only visible to owner/admin */}
            {isAdmin && selectedGroup.joinRequests?.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Pending Join Requests ({selectedGroup.joinRequests.length})
                </h3>
                <div className="space-y-3">
                  {selectedGroup.joinRequests.map((request: any) => (
                    <div key={request.userId} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <img
                        src={request.userAvatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${request.userName}`}
                        alt={request.userName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{request.userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Requested {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const updatedGroup = await approveJoinRequest(selectedGroup.id, request.userId);
                              setSelectedGroup(updatedGroup);
                              const groups = await getAllStudyGroups();
                              setStudyGroups(groups);
                              toast.success(`${request.userName} has been approved!`);
                            } catch (error: any) {
                              toast.error(error?.message || 'Failed to approve request');
                            }
                          }}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const updatedGroup = await rejectJoinRequest(selectedGroup.id, request.userId);
                              setSelectedGroup(updatedGroup);
                              toast.success(`Request from ${request.userName} has been rejected`);
                            } catch (error: any) {
                              toast.error(error?.message || 'Failed to reject request');
                            }
                          }}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Members List */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedGroup.members?.map((member: any) => (
                  <div key={member.userId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <img
                      src={member.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${member.name}`}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-white">
                        {member.role === 'creator' ? '👑 Creator' : member.role === 'admin' ? '⭐ Admin' : 'Member'}
                      </p>
                    </div>
                    {/* Remove member button - only for admin/owner, can't remove creator */}
                    {isAdmin && member.role !== 'creator' && member.userId !== user?.id && (
                      <button
                        onClick={async () => {
                          if (window.confirm(`Remove ${member.name} from the group?`)) {
                            try {
                              const updatedGroup = await removeMember(selectedGroup.id, member.userId);
                              setSelectedGroup(updatedGroup);
                              const groups = await getAllStudyGroups();
                              setStudyGroups(groups);
                              toast.success(`${member.name} has been removed from the group`);
                            } catch (error: any) {
                              toast.error(error?.message || 'Failed to remove member');
                            }
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
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
                              <p className="text-sm text-gray-700 dark:text-white">{msg.message}</p>
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
                      onKeyPress={async (e) => {
                        if (e.key === 'Enter' && groupMessage.trim()) {
                          try {
                            const senderName = userprofile?.displayName || userprofile?.name || user?.name || 'User';
                            const senderAvatar = userprofile?.avatar || userprofile?.avatrUrl || '';
                            
                            const response = await apiRequest(`/study-groups/${selectedGroup.id}/messages`, {
                              method: 'POST',
                              body: JSON.stringify({
                                message: groupMessage.trim(),
                                senderName,
                                senderAvatar
                              })
                            });
                            
                            if (response.message) {
                              setGroupMessages(prev => [...prev, response.message]);
                            }
                            setGroupMessage('');
                          } catch (error) {
                            console.error('Error sending group message:', error);
                            toast.error('Failed to send message');
                          }
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={async () => {
                        if (groupMessage.trim()) {
                          try {
                            const senderName = userprofile?.displayName || userprofile?.name || user?.name || 'User';
                            const senderAvatar = userprofile?.avatar || userprofile?.avatrUrl || '';
                            
                            const response = await apiRequest(`/study-groups/${selectedGroup.id}/messages`, {
                              method: 'POST',
                              body: JSON.stringify({
                                message: groupMessage.trim(),
                                senderName,
                                senderAvatar
                              })
                            });
                            
                            if (response.message) {
                              setGroupMessages(prev => [...prev, response.message]);
                            }
                            setGroupMessage('');
                          } catch (error) {
                            console.error('Error sending group message:', error);
                            toast.error('Failed to send message');
                          }
                        }
                      }}
                      className="px-4 py-2 text-white rounded-lg transition-all shadow-md hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resources & Schedule</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors text-gray-600 dark:text-white"
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00ADB5'; e.currentTarget.style.backgroundColor = 'rgba(0, 173, 181, 0.1)'; e.currentTarget.style.color = '#00ADB5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}>
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Share Resource</p>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors text-gray-600 dark:text-white"
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00ADB5'; e.currentTarget.style.backgroundColor = 'rgba(0, 173, 181, 0.1)'; e.currentTarget.style.color = '#00ADB5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}>
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Schedule Session</p>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors text-gray-600 dark:text-white"
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00ADB5'; e.currentTarget.style.backgroundColor = 'rgba(0, 173, 181, 0.1)'; e.currentTarget.style.color = '#00ADB5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}>
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Set Goal</p>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
                {hasPendingRequest ? (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-gray-600 dark:text-white mb-2 font-semibold">Request Pending</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Waiting for the group owner to approve your request</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-white mb-4">Request to join this group and get approval from the owner</p>
                    <button
                      onClick={async () => {
                        if (user) {
                          try {
                            const userName = userprofile?.displayName || user.name || 'User';
                            const userAvatar = userprofile?.avatrUrl || '';
                            const response = await requestJoinStudyGroup(selectedGroup.id, userName, userAvatar);
                            
                            // Update the group with the new joinRequest
                            if (response.group) {
                              setSelectedGroup(response.group);
                              const groups = await getAllStudyGroups();
                              setStudyGroups(groups);
                            }
                            toast.success(response.message || 'Join request sent! Waiting for approval.');
                          } catch (error: any) {
                            console.error('Error requesting to join group:', error);
                            toast.error(error?.message || 'Failed to send join request. Please try again.');
                          }
                        }
                      }}
                      disabled={selectedGroup.members?.length >= selectedGroup.maxMembers}
                      className="px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}
                    >
                      Request to Join
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Group list view
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Study Groups</h3>
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md mx-0 sm:mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={studyGroupSearch}
              onChange={(e) => setStudyGroupSearch(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            {studyGroupSearch && (
              <button
                onClick={() => setStudyGroupSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setShowCreateGroup(true)}
            className="px-4 py-2 text-white rounded-lg transition-all shadow-lg hover:opacity-90 flex items-center gap-2 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}>
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Create Study Group</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                  placeholder="DSA Interview Prep"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Description</label>
                <textarea
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                  placeholder="Daily DSA practice and mock interviews"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Topic</label>
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Level</label>
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Max Members</label>
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
                      await createStudyGroup({
                        ...newGroupData,
                        creatorId: user.id,
                        creatorName: userprofile?.displayName || user.name || 'User',
                        creatorAvatar: userprofile?.avatrUrl || '',
                        members: [{
                          userId: user.id,
                          name: userprofile?.displayName || user.name || 'User',
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
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
        {/* Study Groups Grid */}
        {(() => {
          const filteredGroups = studyGroups.filter(group => 
            group.name?.toLowerCase().includes(studyGroupSearch.toLowerCase()) ||
            group.topic?.toLowerCase().includes(studyGroupSearch.toLowerCase()) ||
            group.description?.toLowerCase().includes(studyGroupSearch.toLowerCase())
          );
          
          if (filteredGroups.length === 0) {
            return (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {studyGroupSearch ? 'No Groups Found' : 'No Study Groups Yet'}
                </h3>
                <p className="text-gray-600 dark:text-white mb-6">
                  {studyGroupSearch 
                    ? `No groups matching "${studyGroupSearch}"`
                    : 'Create or join a study group to learn together'}
                </p>
                {!studyGroupSearch && (
                  <button 
                    onClick={() => setShowCreateGroup(true)}
                    className="px-6 py-2 text-white rounded-lg transition-all shadow-lg hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}>
                    Create First Group
                  </button>
                )}
              </div>
            );
          }
          
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredGroups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">{group.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-white">by {group.creatorName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    group.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    group.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {group.level}
                  </span>
                  {group.creatorId === user?.id && (
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
              
              <p className="text-sm text-gray-600 dark:text-white mb-4 line-clamp-2">{group.description}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(0, 173, 181, 0.15)', color: '#00ADB5' }}>
                  {group.topic}
                </span>
              </div>
              
              {/* Members Preview */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-white mb-2">Members ({group.members?.length || 0})</p>
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
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-white" style={{ marginLeft: '-8px' }}>
                      +{(group.members?.length || 0) - 5}
                    </div>
                  )}
                  {(!group.members || group.members.length === 0) && (
                    <p className="text-xs text-gray-500">No members yet</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-white mb-4">
                <span>{group.members?.length || 0} / {group.maxMembers} members</span>
                <span className="text-gray-400">Created {formatTimestamp(group.createdAt)}</span>
              </div>
              
              <button
                onClick={() => setSelectedGroup(group)}
                className="w-full px-4 py-2 text-white rounded-lg transition-all text-sm font-semibold shadow-md hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)' }}
              >
                View Details
              </button>
            </div>
          ))}
            </div>
          );
        })()}
      </div>
    );
  };

  const renderEndorsements = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Skill Endorsements</h3>
      </div>

      {/* My Endorsements Received */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" style={{ color: '#00ADB5' }} />
          Endorsements Received ({endorsements.filter(e => e.recipientId === user?.id).length})
        </h4>
        
        {endorsements.filter(e => e.recipientId === user?.id).length === 0 ? (
          <p className="text-gray-500 dark:text-white text-center py-8">No endorsements yet. Keep collaborating!</p>
        ) : (
          <div className="space-y-4">
            {endorsements.filter(e => e.recipientId === user?.id).map(endorsement => (
              <div key={endorsement.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <img src={endorsement.endorserAvatar} alt={endorsement.endorserName} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{endorsement.endorserName}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(0, 173, 181, 0.15)', color: '#00ADB5' }}>
                      {endorsement.skill}
                    </span>
                  </div>
                  {endorsement.message && (
                    <p className="text-sm text-gray-600 dark:text-white">{endorsement.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(endorsement.timestamp)}
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
          Endorsements Given ({endorsements.filter(e => e.endorserId === user?.id).length})
        </h4>
        
        {endorsements.filter(e => e.endorserId === user?.id).length === 0 ? (
          <p className="text-gray-500 dark:text-white text-center py-8">
            You haven't endorsed anyone yet. Go to the directory to endorse developers!
          </p>
        ) : (
          <div className="space-y-4">
            {endorsements.filter(e => e.endorserId === user?.id).map(endorsement => (
              <div key={endorsement.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">To: {endorsement.recipientName}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(0, 173, 181, 0.15)', color: '#00ADB5' }}>
                      {endorsement.skill}
                    </span>
                  </div>
                  {endorsement.message && (
                    <p className="text-sm text-gray-600 dark:text-white">{endorsement.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(endorsement.timestamp)}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #00ADB5 0%, #00d4ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Developer Connect 🤝
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-white">
                Find teammates, build together, grow your network
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
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
                className={`px-2 sm:px-4 py-2 sm:py-3 font-semibold flex items-center gap-1 sm:gap-2 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-base ${
                  activeTab === tab.id
                    ? 'border-transparent'
                    : 'border-transparent text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white'
                }`}
                style={activeTab === tab.id ? { borderBottomColor: '#00ADB5', color: '#00ADB5' } : {}}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.id === 'directory' ? 'Directory' : tab.id === 'messages' ? 'Messages' : tab.id === 'groups' ? 'Groups' : 'Endorsements'}</span>
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

      {/* Global Endorse Modal - Shows on any tab */}
      {showEndorseModal && selectedUserToEndorse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
              Endorse {selectedUserToEndorse.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Select Skill</label>
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Message (Optional)</label>
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
                onClick={async () => {
                  if (!endorsementData.skill) {
                    toast.error('Please select a skill to endorse');
                    return;
                  }
                  
                  if (!user) {
                    toast.error('You must be logged in to endorse');
                    return;
                  }

                  try {
                    // Save to backend first
                    const response = await apiRequest(`/developers/${selectedUserToEndorse.userId}/endorse`, {
                      method: 'POST',
                      body: JSON.stringify({
                        skill: endorsementData.skill,
                        message: endorsementData.message,
                        endorserName: userprofile?.displayName || user.name || 'User',
                        endorserAvatar: userprofile?.avatrUrl || `https://api.dicebear.com/9.x/adventurer/svg?seed=User`,
                        recipientName: selectedUserToEndorse.name
                      })
                    });
                    
                    // Update local state with the returned endorsement
                    if (response.endorsement) {
                      setEndorsements(prev => [...prev, response.endorsement]);
                    }
                    
                    // Close modal and reset
                    setShowEndorseModal(false);
                    setSelectedUserToEndorse(null);
                    setEndorsementData({skill: '', message: ''});
                    
                    // Show success toast
                    toast.success(`✅ Successfully endorsed ${selectedUserToEndorse.name} for ${endorsementData.skill}!`, {
                      duration: 4000,
                      position: 'top-center',
                    });
                  } catch (error: any) {
                    console.error('Error saving endorsement:', error);
                    const errorMessage = error?.message || 'Failed to save endorsement. Please try again.';
                    toast.error(errorMessage);
                  }
                }}
                disabled={!endorsementData.skill}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Endorsement
              </button>
              <button
                onClick={() => {
                  setShowEndorseModal(false);
                  setSelectedUserToEndorse(null);
                  setEndorsementData({skill: '', message: ''});
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
