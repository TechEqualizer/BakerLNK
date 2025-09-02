import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../index.js';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  businessName: z.string().min(1, 'Business name is required').optional()
});

// Helper function to generate JWT token
const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.sign({ userId }, jwtSecret, { expiresIn });
};

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { baker: true }
    });

    if (!user) {
      throw createError(401, 'Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw createError(401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data with token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.createdAt.toISOString()
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Signup endpoint
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name, businessName } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw createError(409, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user only (baker profile will be created during onboarding)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: 'baker'
      }
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.createdAt.toISOString()
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError(401, 'User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { baker: true }
    });

    if (!user) {
      throw createError(404, 'User not found');
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.createdAt.toISOString(),
      baker: user.baker
    });
  } catch (error) {
    next(error);
  }
});

// Logout endpoint (client-side token removal, but good to have)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;