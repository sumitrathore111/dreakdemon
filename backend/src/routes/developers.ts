import { Router, Response } from 'express';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

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
      .select('name email bio skills institute location portfolio links profileCompletion createdAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
    
    // Transform users to developer profile format
    const developers = users.map((user, index) => ({
      odId: user._id.toString(),
      odName: user.name,
      odPic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name.replace(/\s+/g, '')}`,
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio || 'Developer on NextStep',
      skills: user.skills || [],
      institute: user.institute || 'Not specified',
      location: user.location || 'Not specified',
      portfolio: user.portfolio || '',
      links: user.links || [],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name.replace(/\s+/g, '')}`,
      rating: 4.5 + (Math.random() * 0.5), // Placeholder rating
      projectsCompleted: Math.floor(Math.random() * 10),
      endorsements: Math.floor(Math.random() * 20),
      isOnline: Math.random() > 0.5,
      lookingFor: ['Collaboration', 'Mentorship', 'Learning'][index % 3],
      experience: 'Intermediate',
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
      .select('-password');
    
    if (!user) {
      res.status(404).json({ error: 'Developer not found' });
      return;
    }
    
    const developer = {
      odId: user._id.toString(),
      odName: user.name,
      odPic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name.replace(/\s+/g, '')}`,
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio || 'Developer on NextStep',
      skills: user.skills || [],
      institute: user.institute || 'Not specified',
      location: user.location || 'Not specified',
      portfolio: user.portfolio || '',
      links: user.links || [],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name.replace(/\s+/g, '')}`,
      rating: 4.5,
      projectsCompleted: 5,
      endorsements: 10,
      isOnline: true,
      lookingFor: 'Collaboration',
      experience: 'Intermediate',
      joinedDate: user.createdAt || new Date()
    };
    
    res.json({ developer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endorse a developer
router.post('/:developerId/endorse', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skill, message } = req.body;
    
    // In a real implementation, you'd store endorsements in a separate collection
    // For now, we'll just return success
    res.json({ 
      message: 'Endorsement added successfully',
      endorsement: {
        fromUserId: req.user?.id,
        toUserId: req.params.developerId,
        skill,
        message,
        createdAt: new Date()
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
