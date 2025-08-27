import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // Default 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// File Upload Integration
router.post('/upload', upload.single('file'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      throw createError(400, 'No file uploaded');
    }

    let finalPath = req.file.path;
    let processedUrl = `/uploads/${req.file.filename}`;

    // Process image files
    if (req.file.mimetype.startsWith('image/')) {
      const isResize = req.body.resize === 'true';
      const quality = parseInt(req.body.quality || '80');
      const maxWidth = parseInt(req.body.maxWidth || '1200');
      const maxHeight = parseInt(req.body.maxHeight || '800');

      if (isResize) {
        const processedName = `processed_${req.file.filename}`;
        const processedPath = path.join(path.dirname(finalPath), processedName);

        await sharp(req.file.path)
          .resize(maxWidth, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality })
          .toFile(processedPath);

        // Remove original file
        await fs.unlink(req.file.path);
        finalPath = processedPath;
        processedUrl = `/uploads/${processedName}`;
      }
    }

    // Save file record to database
    const fileRecord = await prisma.file.create({
      data: {
        filename: path.basename(finalPath),
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: BigInt(req.file.size),
        filePath: processedUrl,
        uploadedBy: req.user?.id
      }
    });

    res.json({
      id: fileRecord.id,
      filename: fileRecord.filename,
      originalName: fileRecord.originalName,
      url: `${req.protocol}://${req.get('host')}${processedUrl}`,
      size: Number(fileRecord.sizeBytes),
      mimeType: fileRecord.mimeType
    });
  } catch (error) {
    // Clean up file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    next(error);
  }
});

// Email Integration
router.post('/email', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { to, subject, text, html, from } = req.body;

    if (!to || !subject || (!text && !html)) {
      throw createError(400, 'Missing required email fields: to, subject, and text or html');
    }

    // Create transporter (in production, use actual SMTP settings)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    });

    const mailOptions = {
      from: from || `"${process.env.FROM_NAME || 'BakerLink'}" <${process.env.FROM_EMAIL || 'noreply@bakerlink.com'}>`,
      to,
      subject,
      text,
      html
    };

    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:');
      console.log(mailOptions);
      res.json({ message: 'Email logged (development mode)', emailId: uuidv4() });
    } else {
      const info = await transporter.sendMail(mailOptions);
      res.json({ message: 'Email sent successfully', emailId: info.messageId });
    }
  } catch (error) {
    next(error);
  }
});

// LLM Integration (Mock)
router.post('/llm', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      throw createError(400, 'Prompt is required');
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock responses based on prompt content
    let response = '';
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('describe')) {
      response = 'This appears to be a beautifully crafted cake with elegant decorative elements. The composition shows attention to detail with professional presentation suitable for special occasions.';
    } else if (lowerPrompt.includes('suggest') || lowerPrompt.includes('recommend')) {
      response = 'Based on the context, I recommend considering seasonal flavors, complementary color schemes, and dietary restrictions. Popular combinations include vanilla-berry, chocolate-caramel, and lemon-lavender.';
    } else if (lowerPrompt.includes('price') || lowerPrompt.includes('cost')) {
      response = 'Pricing should consider complexity, ingredients, size, and market positioning. For custom cakes, typical ranges are $3-8 per serving depending on design intricacy and premium ingredients.';
    } else {
      response = 'Thank you for your inquiry. This is a mock AI response demonstrating the integration capability. In production, this would connect to an actual LLM service.';
    }

    res.json({
      response,
      usage: {
        prompt_tokens: prompt.length / 4,
        completion_tokens: response.length / 4,
        total_tokens: (prompt.length + response.length) / 4
      },
      model: 'mock-llm-v1'
    });
  } catch (error) {
    next(error);
  }
});

// Image Generation Integration (Mock)
router.post('/generate-image', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      throw createError(400, 'Prompt is required');
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return a placeholder image URL
    const placeholderUrls = [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=3',
      'https://picsum.photos/800/600?random=4',
      'https://picsum.photos/800/600?random=5'
    ];

    const randomUrl = placeholderUrls[Math.floor(Math.random() * placeholderUrls.length)];

    res.json({
      url: randomUrl,
      width: options.width || 800,
      height: options.height || 600,
      prompt: prompt,
      model: 'mock-image-generator-v1'
    });
  } catch (error) {
    next(error);
  }
});

// Data Extraction Integration (Mock)
router.post('/extract-data', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { fileUrl, type = 'auto' } = req.body;

    if (!fileUrl) {
      throw createError(400, 'File URL is required');
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock extracted data based on file type
    const mockData = {
      text: 'Sample extracted text from the uploaded file. This demonstrates the data extraction capability.',
      metadata: {
        pages: 1,
        format: 'PDF',
        size: '2.3 MB',
        language: 'en'
      },
      structure: {
        headings: ['Introduction', 'Main Content', 'Conclusion'],
        tables: 0,
        images: 2,
        links: 3
      }
    };

    res.json({
      success: true,
      data: mockData,
      extractionType: type,
      processingTime: '1.2s'
    });
  } catch (error) {
    next(error);
  }
});

// List uploaded files
router.get('/files', async (req: AuthenticatedRequest, res, next) => {
  try {
    const files = await prisma.file.findMany({
      where: req.user ? { uploadedBy: req.user.id } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const filesWithUrls = files.map(file => ({
      ...file,
      sizeBytes: Number(file.sizeBytes),
      url: `${req.protocol}://${req.get('host')}${file.filePath}`
    }));

    res.json(filesWithUrls);
  } catch (error) {
    next(error);
  }
});

// Delete file
router.delete('/files/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.id,
        uploadedBy: req.user?.id
      }
    });

    if (!file) {
      throw createError(404, 'File not found');
    }

    // Delete physical file
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadDir, file.filename);
    
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Could not delete physical file:', error);
    }

    // Delete database record
    await prisma.file.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;