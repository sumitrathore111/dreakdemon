import { Response, Router } from 'express';
import mongoose from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth';
import Endorsement from '../models/Endorsement';
import HelpRequest from '../models/HelpRequest';
import TechReview from '../models/TechReview';
import User from '../models/User';

const router = Router();

// Get all developers (users who are available for connection)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, skills, lookingFor, limit = 50, page = 1 } = req.query;

    let query: any = {};

    // Don't include current user in results
    if (req.user?.id) {
      query._id = { $ne: req.user.id };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { institute: { $regex: search, $options: 'i' } }
      ];
    }

    if (skills) {
      const skillsArray = (skills as string).split(',');
      query.skills = { $in: skillsArray };
    }

    if (lookingFor) {
      query.lookingFor = lookingFor;
    }

    const users = await User.find(query)
      .select('-password')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    // Transform users to developer profile format
    const developers = users.map((user: any) => ({
      odId: user._id.toString(),
      odName: user.name,
      odPic: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name?.replace(/\s+/g, '') || 'User'}`,
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio || 'Developer on NextStep',
      skills: user.skills || [],
      languages: user.languages || [],
      institute: user.institute || 'Not specified',
      location: user.location || 'Not specified',
      phone: user.phone || '',
      portfolio: user.portfolio || '',
      resume_objective: user.resume_objective || '',
      githubUsername: user.githubUsername || '',
      links: user.links || [],
      education: user.education || [],
      experience: user.experience || [],
      achievements: user.achievements || [],
      target_company: user.target_company || [],
      projects: user.projects || [],
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name?.replace(/\s+/g, '') || 'User'}`,
      yearOfStudy: user.yearOfStudy || 0,
      profileCompletion: user.profileCompletion || 0,
      isProfileComplete: user.isProfileComplete || false,
      role: user.role || 'student',
      marathon_score: user.marathon_score || 0,
      marathon_rank: user.marathon_rank || 0,
      streakCount: user.streakCount || 0,
      challenges_solved: user.challenges_solved || 0,
      rating: 4.5 + (Math.random() * 0.5), // Placeholder rating
      projectsCompleted: user.projects?.filter((p: any) => p.project_status === 'Complete').length || 0,
      endorsements: 0, // Will be fetched separately if needed
      isOnline: Math.random() > 0.5,
      lookingFor: user.bio?.includes('mentor') ? 'Mentorship' : user.bio?.includes('collab') ? 'Collaboration' : 'Learning',
      joinedDate: user.createdAt || new Date(),
      badges: user.badges || []
    }));

    res.json(developers);
  } catch (error: any) {
    console.error('Error fetching developers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get developer by ID
router.get('/:developerId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.developerId)
      .select('-password') as any;

    if (!user) {
      res.status(404).json({ error: 'Developer not found' });
      return;
    }

    const developer = {
      odId: user._id.toString(),
      odName: user.name,
      odPic: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name?.replace(/\s+/g, '') || 'User'}`,
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio || 'Developer on NextStep',
      skills: user.skills || [],
      languages: user.languages || [],
      institute: user.institute || 'Not specified',
      location: user.location || 'Not specified',
      phone: user.phone || '',
      portfolio: user.portfolio || '',
      resume_objective: user.resume_objective || '',
      githubUsername: user.githubUsername || '',
      links: user.links || [],
      education: user.education || [],
      experience: user.experience || [],
      achievements: user.achievements || [],
      target_company: user.target_company || [],
      projects: user.projects || [],
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name?.replace(/\s+/g, '') || 'User'}`,
      yearOfStudy: user.yearOfStudy || 0,
      profileCompletion: user.profileCompletion || 0,
      isProfileComplete: user.isProfileComplete || false,
      role: user.role || 'student',
      marathon_score: user.marathon_score || 0,
      marathon_rank: user.marathon_rank || 0,
      streakCount: user.streakCount || 0,
      challenges_solved: user.challenges_solved || 0,
      rating: 4.5,
      projectsCompleted: user.projects?.filter((p: any) => p.project_status === 'Complete').length || 0,
      endorsements: 0,
      isOnline: true,
      lookingFor: user.bio?.includes('mentor') ? 'Mentorship' : user.bio?.includes('collab') ? 'Collaboration' : 'Learning',
      joinedDate: user.createdAt || new Date()
    };

    res.json({ developer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all endorsements for current user (given and received)
router.get('/endorsements/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const endorsements = await Endorsement.find({
      $or: [
        { endorserId: req.user!.id },
        { recipientId: req.user!.id }
      ]
    }).sort({ createdAt: -1 });

    const transformedEndorsements = endorsements.map(e => ({
      id: e._id.toString(),
      endorserId: e.endorserId,
      endorserName: e.endorserName,
      endorserAvatar: e.endorserAvatar,
      recipientId: e.recipientId,
      recipientName: e.recipientName,
      skill: e.skill,
      message: e.message,
      timestamp: e.createdAt
    }));

    res.json({ endorsements: transformedEndorsements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get endorsements for a specific developer
router.get('/:developerId/endorsements', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const endorsements = await Endorsement.find({
      recipientId: req.params.developerId
    }).sort({ createdAt: -1 });

    const transformedEndorsements = endorsements.map(e => ({
      id: e._id.toString(),
      endorserId: e.endorserId,
      endorserName: e.endorserName,
      endorserAvatar: e.endorserAvatar,
      recipientId: e.recipientId,
      recipientName: e.recipientName,
      skill: e.skill,
      message: e.message,
      timestamp: e.createdAt
    }));

    res.json({ endorsements: transformedEndorsements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endorse a developer
router.post('/:developerId/endorse', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skill, message, endorserName, endorserAvatar, recipientName } = req.body;

    // Check if user already endorsed this developer for this skill
    const existingEndorsement = await Endorsement.findOne({
      endorserId: req.user!.id,
      recipientId: req.params.developerId,
      skill
    });

    if (existingEndorsement) {
      res.status(400).json({ error: 'You have already endorsed this developer for this skill' });
      return;
    }

    // Get recipient info if not provided
    let recipientDisplayName = recipientName;
    if (!recipientDisplayName) {
      const recipient = await User.findById(req.params.developerId);
      recipientDisplayName = recipient?.name || 'Developer';
    }

    // Create endorsement
    const endorsement = await Endorsement.create({
      endorserId: req.user!.id,
      endorserName: endorserName || req.user!.name,
      endorserAvatar: endorserAvatar || '',
      recipientId: req.params.developerId,
      recipientName: recipientDisplayName,
      skill,
      message
    });

    res.status(201).json({
      message: 'Endorsement added successfully',
      endorsement: {
        id: endorsement._id.toString(),
        endorserId: endorsement.endorserId,
        endorserName: endorsement.endorserName,
        endorserAvatar: endorsement.endorserAvatar,
        recipientId: endorsement.recipientId,
        recipientName: endorsement.recipientName,
        skill: endorsement.skill,
        message: endorsement.message,
        timestamp: endorsement.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Optimized endpoint to get all initial data for Developer Connect page
router.get('/init/page-data', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Fetch all data in parallel
    const [users, studyGroupsData, endorsementsData, techReviewsData, helpRequestsData] = await Promise.all([
      // Get developers (excluding current user)
      User.find(userId ? { _id: { $ne: userId } } : {})
        .select('name email bio skills languages institute location avatar githubUsername createdAt marathon_rank challenges_solved yearOfStudy badges rating')
        .limit(50)
        .sort({ createdAt: -1 }),

      // Get study groups (remove isActive filter since field may not exist)
      (async () => {
        try {
          const StudyGroup = require('../models/StudyGroup').default;
          return await StudyGroup.find({})
            .sort({ createdAt: -1 })
            .limit(20);
        } catch {
          return [];
        }
      })(),

      // Get user's endorsements (keep for backward compatibility)
      userId ? Endorsement.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(20) : Promise.resolve([]),

      // Get tech reviews
      TechReview.find({}).sort({ createdAt: -1 }).limit(30),

      // Get help requests
      HelpRequest.find({ isResolved: false }).sort({ createdAt: -1 }).limit(20)
    ]);

    // Transform developers
    const developers = users.map((user: any) => ({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio || 'Developer on NextStep',
      skills: user.skills || [],
      languages: user.languages || [],
      institute: user.institute || 'Not specified',
      location: user.location || 'Not specified',
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name?.replace(/\s+/g, '') || 'User'}`,
      githubUsername: user.githubUsername || '',
      isOnline: Math.random() > 0.5,
      joinedDate: user.createdAt || new Date(),
      badges: user.badges || [],
      rating: user.rating || 0,
      marathon_rank: user.marathon_rank || 0,
      challenges_solved: user.challenges_solved || 0,
      yearOfStudy: user.yearOfStudy || 0
    }));

    // Transform study groups - include ALL fields needed by frontend
    const studyGroups = (studyGroupsData || []).map((group: any) => ({
      id: group._id.toString(),
      name: group.name,
      description: group.description,
      topic: group.topic,
      level: group.level,
      members: (group.members || []).map((m: any) => ({
        userId: m.userId,
        name: m.userName,
        avatar: m.userAvatar,
        role: m.role,
        joinedAt: m.joinedAt
      })),
      memberCount: group.members?.length || 0,
      maxMembers: group.maxMembers || 10,
      creatorId: group.createdBy,
      creatorName: group.creatorName || group.members?.[0]?.userName || 'Unknown',
      creatorAvatar: group.creatorAvatar || group.members?.[0]?.userAvatar || '',
      joinRequests: (group.joinRequests || []).filter((r: any) => r.status === 'pending').map((r: any) => ({
        userId: r.userId,
        userName: r.userName,
        userAvatar: r.userAvatar,
        requestedAt: r.requestedAt,
        status: r.status
      })),
      createdAt: group.createdAt,
      isActive: true
    }));

    // Transform endorsements
    const endorsements = (endorsementsData || []).map((e: any) => ({
      id: e._id.toString(),
      endorserId: e.endorserId,
      endorserName: e.endorserName,
      skill: e.skill,
      message: e.message,
      timestamp: e.createdAt
    }));

    // Transform tech reviews
    const techReviews = (techReviewsData || []).map((review: any) => ({
      id: review._id.toString(),
      userId: review.userId,
      userName: review.userName,
      userAvatar: review.userAvatar,
      userLevel: review.userLevel,
      website: review.website,
      url: review.url,
      category: review.category,
      rating: review.rating,
      title: review.title,
      content: review.content,
      pros: review.pros,
      cons: review.cons,
      likes: review.likes,
      likedBy: review.likedBy || [],
      helpful: review.helpful,
      helpfulBy: review.helpfulBy || [],
      comments: review.comments,
      timestamp: review.createdAt
    }));

    // Transform help requests
    const helpRequests = (helpRequestsData || []).map((request: any) => ({
      id: request._id.toString(),
      userId: request.userId,
      userName: request.userName,
      userAvatar: request.userAvatar,
      title: request.title,
      description: request.description,
      tags: request.tags,
      responses: request.responses,
      isResolved: request.isResolved,
      timestamp: request.createdAt
    }));

    res.json({
      developers,
      studyGroups,
      endorsements,
      techReviews,
      helpRequests,
      counts: {
        developers: developers.length,
        studyGroups: studyGroups.length,
        endorsements: endorsements.length,
        techReviews: techReviews.length,
        helpRequests: helpRequests.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching developer connect data:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TECH REVIEWS ====================

// Get all tech reviews
router.get('/tech-reviews', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search, limit = 50, page = 1 } = req.query;

    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { website: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await TechReview.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const formattedReviews = reviews.map((review: any) => ({
      id: review._id.toString(),
      userId: review.userId,
      userName: review.userName,
      userAvatar: review.userAvatar,
      userLevel: review.userLevel,
      website: review.website,
      url: review.url,
      category: review.category,
      rating: review.rating,
      title: review.title,
      content: review.content,
      pros: review.pros,
      cons: review.cons,
      likes: review.likes,
      likedBy: review.likedBy || [],
      helpful: review.helpful,
      helpfulBy: review.helpfulBy || [],
      comments: review.comments,
      timestamp: review.createdAt
    }));

    res.json({ reviews: formattedReviews });
  } catch (error: any) {
    console.error('Error fetching tech reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new tech review
router.post('/tech-reviews', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { website, url, category, rating, title, content, pros, cons, userName, userAvatar, userLevel } = req.body;

    if (!website || !title || !content) {
      res.status(400).json({ error: 'Website, title, and content are required' });
      return;
    }

    const review = await TechReview.create({
      userId: req.user!.id,
      userName: userName || req.user!.name,
      userAvatar: userAvatar || '',
      userLevel: userLevel || 'Student',
      website,
      url,
      category: category || 'Other',
      rating: rating || 5,
      title,
      content,
      pros: pros || [],
      cons: cons || [],
      likes: 0,
      likedBy: [],
      helpful: 0,
      helpfulBy: [],
      comments: 0
    });

    res.status(201).json({
      message: 'Review posted successfully',
      review: {
        id: review._id.toString(),
        userId: review.userId,
        userName: review.userName,
        userAvatar: review.userAvatar,
        userLevel: review.userLevel,
        website: review.website,
        url: review.url,
        category: review.category,
        rating: review.rating,
        title: review.title,
        content: review.content,
        pros: review.pros,
        cons: review.cons,
        likes: review.likes,
        helpful: review.helpful,
        comments: review.comments,
        timestamp: review.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error creating tech review:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like a tech review
router.post('/tech-reviews/:reviewId/like', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.id;

    const review = await TechReview.findById(reviewId);

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    // Check if already liked
    if (review.likedBy.includes(userId)) {
      // Unlike
      review.likedBy = review.likedBy.filter(id => id !== userId);
      review.likes = Math.max(0, review.likes - 1);
    } else {
      // Like
      review.likedBy.push(userId);
      review.likes += 1;
    }

    await review.save();

    res.json({ likes: review.likes, liked: review.likedBy.includes(userId) });
  } catch (error: any) {
    console.error('Error liking review:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark a tech review as helpful
router.post('/tech-reviews/:reviewId/helpful', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.id;

    const review = await TechReview.findById(reviewId);

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    // Check if already marked helpful
    if (review.helpfulBy.includes(userId)) {
      res.status(400).json({ error: 'You have already marked this as helpful' });
      return;
    }

    review.helpfulBy.push(userId);
    review.helpful += 1;
    await review.save();

    res.json({ helpful: review.helpful });
  } catch (error: any) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a tech review (only by creator)
router.delete('/tech-reviews/:reviewId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;

    const review = await TechReview.findById(reviewId);

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.userId !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to delete this review' });
      return;
    }

    await TechReview.findByIdAndDelete(reviewId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== HELP REQUESTS ====================

// Get all help requests
router.get('/help-requests', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tags, search, limit = 50, page = 1 } = req.query;

    let query: any = { isResolved: false };

    if (tags) {
      const tagsArray = (tags as string).split(',');
      query.tags = { $in: tagsArray };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const requests = await HelpRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const formattedRequests = requests.map((request: any) => ({
      id: request._id.toString(),
      userId: request.userId,
      userName: request.userName,
      userAvatar: request.userAvatar,
      title: request.title,
      description: request.description,
      tags: request.tags,
      responses: request.responses,
      isResolved: request.isResolved,
      timestamp: request.createdAt
    }));

    res.json({ requests: formattedRequests });
  } catch (error: any) {
    console.error('Error fetching help requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new help request
router.post('/help-requests', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, tags, userName, userAvatar } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    const request = await HelpRequest.create({
      userId: req.user!.id,
      userName: userName || req.user!.name,
      userAvatar: userAvatar || '',
      title,
      description,
      tags: tags || [],
      responses: 0,
      isResolved: false
    });

    res.status(201).json({
      message: 'Help request posted successfully',
      request: {
        id: request._id.toString(),
        userId: request.userId,
        userName: request.userName,
        userAvatar: request.userAvatar,
        title: request.title,
        description: request.description,
        tags: request.tags,
        responses: request.responses,
        isResolved: request.isResolved,
        timestamp: request.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error creating help request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a reply to a help request
router.post('/help-requests/:requestId/respond', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { content, userName, userAvatar } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Reply content is required' });
      return;
    }

    const reply = {
      id: new mongoose.Types.ObjectId().toString(),
      userId: req.user!.id,
      userName: userName || 'Anonymous',
      userAvatar: userAvatar || '',
      content,
      createdAt: new Date()
    };

    const request = await HelpRequest.findByIdAndUpdate(
      requestId,
      {
        $push: { replies: reply },
        $inc: { responses: 1 }
      },
      { new: true }
    );

    if (!request) {
      res.status(404).json({ error: 'Help request not found' });
      return;
    }

    res.json({ reply, responses: request.responses, replies: request.replies });
  } catch (error: any) {
    console.error('Error responding to help request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get replies for a help request
router.get('/help-requests/:requestId/replies', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    const request = await HelpRequest.findById(requestId);

    if (!request) {
      res.status(404).json({ error: 'Help request not found' });
      return;
    }

    res.json({ replies: request.replies || [] });
  } catch (error: any) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a reply from help request (only by reply author)
router.delete('/help-requests/:requestId/replies/:replyId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId, replyId } = req.params;
    const userId = req.user?.id;

    const request = await HelpRequest.findById(requestId) as any;

    if (!request) {
      res.status(404).json({ error: 'Help request not found' });
      return;
    }

    // Find the reply
    const replyIndex = request.replies?.findIndex((r: any) => r.id === replyId || r._id?.toString() === replyId);

    if (replyIndex === undefined || replyIndex === -1) {
      res.status(404).json({ error: 'Reply not found' });
      return;
    }

    const reply = request.replies[replyIndex];

    // Check if user is the author of the reply
    if (reply.userId !== userId && reply.userId?.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this reply' });
      return;
    }

    // Remove the reply
    request.replies.splice(replyIndex, 1);
    request.responses = Math.max((request.responses || 1) - 1, 0);
    await request.save();

    res.json({ success: true, responses: request.responses });
  } catch (error: any) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark help request as resolved (only by creator)
router.patch('/help-requests/:requestId/resolve', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    const request = await HelpRequest.findById(requestId);

    if (!request) {
      res.status(404).json({ error: 'Help request not found' });
      return;
    }

    if (request.userId !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to resolve this request' });
      return;
    }

    request.isResolved = true;
    await request.save();

    res.json({ message: 'Help request marked as resolved' });
  } catch (error: any) {
    console.error('Error resolving help request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a help request (only by creator)
router.delete('/help-requests/:requestId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    const request = await HelpRequest.findById(requestId);

    if (!request) {
      res.status(404).json({ error: 'Help request not found' });
      return;
    }

    if (request.userId !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to delete this request' });
      return;
    }

    await HelpRequest.findByIdAndDelete(requestId);

    res.json({ message: 'Help request deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting help request:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
