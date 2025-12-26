import { Router, Response } from 'express';
import Project from '../models/Project';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all projects (with filters)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, visibility, search, limit = 20, page = 1 } = req.query;
    
    let query: any = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (visibility) query.visibility = visibility;
    else query.visibility = 'public'; // Default to public projects
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('owner', 'name email');
    
    const total = await Project.countDocuments(query);
    
    res.json({ 
      projects, 
      total, 
      page: Number(page), 
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all project members (for admin stats) - MUST BE BEFORE /:projectId
router.get('/members', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({})
      .select('members title')
      .populate('members.userId', 'name email');
    
    const allMembers = projects.flatMap(p => 
      p.members.map((m: any) => ({
        userId: m.userId,
        name: m.name,
        email: m.email,
        role: m.role,
        joinedAt: m.joinedAt,
        projectTitle: p.title,
        projectId: p._id
      }))
    );
    
    res.json({ members: allMembers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project by ID
router.get('/:projectId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email')
      .populate('members.userId', 'name email');
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check if user has access to private project
    if (project.visibility === 'private') {
      const isMember = project.members.some(m => m.userId.toString() === req.user?.id);
      const isOwner = project.owner.toString() === req.user?.id;
      
      if (!isMember && !isOwner && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Not authorized to view this project' });
        return;
      }
    }
    
    res.json({ project });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new project
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, visibility, techStack, tags, maxMembers } = req.body;
    
    if (!title || !description || !category) {
      res.status(400).json({ error: 'Title, description, and category are required' });
      return;
    }
    
    const project = new Project({
      title,
      description,
      category,
      visibility: visibility || 'public',
      techStack: techStack || [],
      tags: tags || [],
      maxMembers: maxMembers || 5,
      owner: req.user?.id,
      members: [{
        userId: req.user?.id,
        name: req.user?.name,
        email: req.user?.email,
        role: 'owner',
        joinedAt: new Date()
      }],
      status: 'planning'
    });
    
    await project.save();
    
    res.status(201).json({ 
      message: 'Project created successfully',
      project 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a project
router.put('/:projectId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check authorization
    const isOwner = project.owner.toString() === req.user?.id;
    const isAdmin = project.members.some(m => 
      m.userId.toString() === req.user?.id && (m.role === 'owner' || m.role === 'admin')
    );
    
    if (!isOwner && !isAdmin && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to update this project' });
      return;
    }
    
    const allowedUpdates = [
      'title', 'description', 'category', 'status', 'visibility',
      'techStack', 'tags', 'repositoryUrl', 'liveUrl', 'maxMembers',
      'startDate', 'expectedEndDate', 'actualEndDate'
    ];
    
    const updates: any = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.projectId,
      { $set: updates },
      { new: true }
    );
    
    res.json({ 
      message: 'Project updated successfully',
      project: updatedProject 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a project
router.delete('/:projectId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Only owner or admin can delete
    if (project.owner.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to delete this project' });
      return;
    }
    
    await Project.findByIdAndDelete(req.params.projectId);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get projects for current user (member or owner)
router.get('/my/projects', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user?.id },
        { 'members.userId': req.user?.id }
      ]
    }).sort({ updatedAt: -1 });
    
    res.json({ projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Join a project (request to join)
router.post('/:projectId/join', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check if already a member
    const isMember = project.members.some(m => m.userId.toString() === req.user?.id);
    if (isMember) {
      res.status(400).json({ error: 'Already a member of this project' });
      return;
    }
    
    // Check if project is full
    if (project.members.length >= project.maxMembers) {
      res.status(400).json({ error: 'Project is full' });
      return;
    }
    
    // Add member
    project.members.push({
      userId: req.user?.id as any,
      name: req.user?.name || '',
      email: req.user?.email || '',
      role: 'member',
      joinedAt: new Date()
    });
    
    await project.save();
    
    res.json({ 
      message: 'Successfully joined the project',
      project 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Leave a project
router.post('/:projectId/leave', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Cannot leave if owner
    if (project.owner.toString() === req.user?.id) {
      res.status(400).json({ error: 'Owner cannot leave the project. Transfer ownership first or delete the project.' });
      return;
    }
    
    // Remove member
    project.members = project.members.filter(m => m.userId.toString() !== req.user?.id);
    await project.save();
    
    res.json({ message: 'Successfully left the project' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add an issue to a project
router.post('/:projectId/issues', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority, assignedTo } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Issue title is required' });
      return;
    }
    
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check if user is a member
    const isMember = project.members.some(m => m.userId.toString() === req.user?.id);
    if (!isMember && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Only project members can add issues' });
      return;
    }
    
    const issue = {
      title,
      description: description || '',
      status: 'open' as const,
      priority: priority || 'medium',
      assignedTo,
      createdBy: req.user?.id as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    project.issues.push(issue as any);
    await project.save();
    
    res.status(201).json({ 
      message: 'Issue added successfully',
      issue: project.issues[project.issues.length - 1]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update an issue
router.put('/:projectId/issues/:issueId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;
    
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    const issueIndex = project.issues.findIndex((i: any) => i._id?.toString() === req.params.issueId);
    if (issueIndex === -1) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }
    
    // Update issue fields
    if (title) project.issues[issueIndex].title = title;
    if (description !== undefined) project.issues[issueIndex].description = description;
    if (status) project.issues[issueIndex].status = status;
    if (priority) project.issues[issueIndex].priority = priority;
    if (assignedTo !== undefined) project.issues[issueIndex].assignedTo = assignedTo;
    project.issues[issueIndex].updatedAt = new Date();
    
    await project.save();
    
    res.json({ 
      message: 'Issue updated successfully',
      issue: project.issues[issueIndex]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
