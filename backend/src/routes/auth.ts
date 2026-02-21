import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { generateToken, verifyToken } from '../middleware/auth';
import { loginValidation, signupValidation } from '../middleware/validation';
import User from '../models/User';
import { generateOTP, sendPasswordResetOTP, sendSignupOTP } from '../services/emailService';

const router = Router();

// ============================================
// GOOGLE SIGN UP / SIGN IN
// ============================================
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { googleId, email, name, avatar } = req.body;

    if (!googleId || !email) {
      res.status(400).json({ error: 'Google ID and email are required' });
      return;
    }

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      // User exists with Google ID - login
      const token = generateToken(user._id.toString(), user.email, user.name, user.role);
      res.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        },
        token,
        isNewUser: false
      });
      return;
    }

    // Check if email already exists (user signed up with email before)
    user = await User.findOne({ email });

    if (user) {
      // Link Google account to existing email account
      user.googleId = googleId;
      user.authProvider = 'google';
      if (avatar && !user.avatar) user.avatar = avatar;
      user.isEmailVerified = true; // Google verifies email
      await user.save();

      const token = generateToken(user._id.toString(), user.email, user.name, user.role);
      res.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        },
        token,
        isNewUser: false
      });
      return;
    }

    // Create new user with Google
    user = await User.create({
      email,
      googleId,
      name: name || email.split('@')[0],
      authProvider: 'google',
      avatar: avatar || '',
      isEmailVerified: true,
      password: '' // No password for Google users
    });

    const token = generateToken(user._id.toString(), user.email, user.name, user.role);
    res.status(201).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      },
      token,
      isNewUser: true
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// OTP BASED SIGNUP
// ============================================

// Step 1: Send OTP for signup
router.post('/signup/send-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      res.status(400).json({ error: 'Email and name are required' });
      return;
    }

    // Check if user already exists and is verified or has completed registration
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // User is verified OR has a real password (not temp) OR uses Google auth
      const hasCompletedRegistration = existingUser.isEmailVerified ||
        (existingUser.password && existingUser.password !== 'TEMP_PASSWORD') ||
        existingUser.authProvider === 'google';

      if (hasCompletedRegistration) {
        res.status(400).json({ error: 'Email already registered. Please login.' });
        return;
      }
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser) {
      // Update OTP for existing unverified user
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      existingUser.name = name;
      await existingUser.save();
    } else {
      // Create temporary user record
      await User.create({
        email,
        name,
        otp,
        otpExpiry,
        password: 'TEMP_PASSWORD', // Temporary, will be set after OTP verification
        isEmailVerified: false,
        authProvider: 'email'
      });
    }

    // Send OTP email
    const sent = await sendSignupOTP(email, otp, name);
    if (!sent) {
      res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
      return;
    }

    res.json({ message: 'OTP sent successfully', email });
  } catch (error: any) {
    console.error('Send signup OTP error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Step 2: Verify OTP and complete signup
router.post('/signup/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      res.status(400).json({ error: 'Email, OTP, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'Invalid email. Please request OTP first.' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ error: 'Email already verified. Please login.' });
      return;
    }

    if (!user.otp || !user.otpExpiry) {
      res.status(400).json({ error: 'No OTP found. Please request a new one.' });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    if (new Date() > user.otpExpiry) {
      res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      return;
    }

    // OTP is valid - complete signup
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

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
    console.error('Verify signup OTP error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PASSWORD RESET WITH OTP
// ============================================

// Step 1: Send password reset OTP
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      res.json({ message: 'If the email exists, an OTP has been sent.' });
      return;
    }

    // Check if user signed up with Google only
    if (user.authProvider === 'google' && !user.password) {
      res.status(400).json({ error: 'This account uses Google Sign-In. Please login with Google.' });
      return;
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const sent = await sendPasswordResetOTP(email, otp, user.name);
    if (!sent) {
      res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
      return;
    }

    res.json({ message: 'OTP sent successfully', email });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Step 2: Verify OTP for password reset
router.post('/verify-reset-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      res.status(400).json({ error: 'Invalid request. Please request a new OTP.' });
      return;
    }

    if (user.resetOtp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    if (new Date() > user.resetOtpExpiry) {
      res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      return;
    }

    // OTP is valid - allow password reset
    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error: any) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Step 3: Reset password after OTP verification
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ error: 'Email, OTP, and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      res.status(400).json({ error: 'Invalid request. Please request a new OTP.' });
      return;
    }

    if (user.resetOtp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    if (new Date() > user.resetOtpExpiry) {
      res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      return;
    }

    // Reset password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EXISTING AUTH ROUTES
// ============================================

// Signup - Deprecated: Use OTP-based signup instead
// This route is kept for backward compatibility but redirects to OTP flow
router.post('/signup', signupValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    // Direct signup without OTP is no longer allowed
    // Users must use the OTP-based signup flow
    res.status(400).json({
      error: 'Direct signup is disabled. Please use OTP verification to register.',
      useOtpFlow: true
    });
    return;
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

    // Check if email is verified
    // Allow: verified users, Google users, OR legacy users (registered before OTP system)
    const isLegacyUser = !user.otp && !user.otpExpiry && user.password && user.password !== 'TEMP_PASSWORD';
    const canLogin = user.isEmailVerified || user.authProvider === 'google' || isLegacyUser;

    if (!canLogin) {
      res.status(401).json({ error: 'Please verify your email first. Check your inbox for the OTP.' });
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

export default router;
