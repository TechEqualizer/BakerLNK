import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import entityRoutes from './routes/entities.js';
import publicRoutes from './routes/publicRoutes.js';
import integrationRoutes from './routes/integrations.js';
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);

// Public routes for showcase (no authentication required)
app.use('/api/public', publicRoutes);

// Protected routes (authentication required)
app.use('/api', authenticateToken, entityRoutes);
app.use('/api/integrations', authenticateToken, integrationRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    app.listen(PORT, () => {
      console.log(`🚀 BakerLink API server running on http://localhost:${PORT}`);
      console.log(`📖 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();