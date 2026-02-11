import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { generateToken, verifyToken } from '../middleware/auth';
import { loginValidation, signupValidation } from '../middleware/validation';
import User from '../models/User';

const router = Router();

// Signup
router.post('/signup', signupValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.name, user.role);

    res.status(201).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', loginValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.name, user.role);

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current User
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Transform _id to id for frontend compatibility
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      location: user.location,
      institute: user.institute,
      bio: user.bio,
      skills: user.skills,
      profileCompletion: user.profileCompletion
    };

    res.json({ user: userResponse });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.json({ message: 'Logged out successfully' });
});

// Password Reset Request
router.post('/reset-password-request', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If the email exists, a reset link has been sent' });
      return;
    }

    // TODO: Implement email sending with reset token
    // For now, just return success
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
