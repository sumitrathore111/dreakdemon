import { Response, Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Endorsement from '../models/Endorsement';
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
      joinedDate: user.createdAt || new Date()
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

export default router;
