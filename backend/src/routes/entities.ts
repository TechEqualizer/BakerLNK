import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// Helper function to get user's baker profile
const getUserBaker = async (userId: string) => {
  const baker = await prisma.baker.findUnique({
    where: { userId }
  });
  if (!baker) {
    throw createError(404, 'Baker profile not found');
  }
  return baker;
};

// Helper function to parse query parameters for filtering and sorting
const parseQueryParams = (query: any) => {
  const { sort, limit: limitStr, offset: offsetStr, ...filters } = query;
  const limit = limitStr ? parseInt(limitStr) : undefined;
  const offset = offsetStr ? parseInt(offsetStr) : undefined;
  
  // Parse sort parameter (e.g., '-created_at' for descending)
  let orderBy: any = undefined;
  if (sort) {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    
    // Map common field names
    const fieldMap: { [key: string]: string } = {
      'created_date': 'createdAt',
      'updated_date': 'updatedAt',
      'featured': 'featured'
    };
    
    const actualField = fieldMap[field] || field;
    orderBy = { [actualField]: desc ? 'desc' : 'asc' };
  }
  
  // Parse filters
  const where: any = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (key.startsWith('filter[') && key.endsWith(']')) {
      const fieldName = key.slice(7, -1); // Remove 'filter[' and ']'
      
      if (fieldName.endsWith('_gte')) {
        const field = fieldName.slice(0, -4);
        where[field] = { gte: value };
      } else if (fieldName.endsWith('_lte')) {
        const field = fieldName.slice(0, -4);
        where[field] = { lte: value };
      } else {
        where[fieldName] = value;
      }
    }
  });
  
  return { orderBy, limit, offset, where };
};

// BAKER ROUTES
router.get('/bakers', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { orderBy, limit, offset, where } = parseQueryParams(req.query);
    
    const bakers = await prisma.baker.findMany({
      where,
      orderBy: orderBy || { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: { select: { id: true, name: true, email: true } },
        theme: true
      }
    });
    
    res.json(bakers);
  } catch (error) {
    next(error);
  }
});

router.get('/bakers/:id', async (req, res, next) => {
  try {
    const baker = await prisma.baker.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        theme: true
      }
    });
    
    if (!baker) {
      throw createError(404, 'Baker not found');
    }
    
    res.json(baker);
  } catch (error) {
    next(error);
  }
});

router.put('/bakers/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    // Users can only update their own baker profile
    if (userBaker.id !== req.params.id) {
      throw createError(403, 'Access denied');
    }
    
    const baker = await prisma.baker.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        user: { select: { id: true, name: true, email: true } },
        theme: true
      }
    });
    
    res.json(baker);
  } catch (error) {
    next(error);
  }
});

// CUSTOMER ROUTES
router.get('/customers', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    const { orderBy, limit, offset, where } = parseQueryParams(req.query);
    
    const customers = await prisma.customer.findMany({
      where: { ...where, bakerId: userBaker.id },
      orderBy: orderBy || { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
    
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

router.post('/customers', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    const customer = await prisma.customer.create({
      data: {
        ...req.body,
        bakerId: userBaker.id
      }
    });
    
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

router.put('/customers/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    const customer = await prisma.customer.update({
      where: { 
        id: req.params.id,
        bakerId: userBaker.id
      },
      data: req.body
    });
    
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

router.delete('/customers/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    await prisma.customer.delete({
      where: { 
        id: req.params.id,
        bakerId: userBaker.id
      }
    });
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ORDER ROUTES
router.get('/orders', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    const { orderBy, limit, offset, where } = parseQueryParams(req.query);
    
    const orders = await prisma.order.findMany({
      where: { ...where, bakerId: userBaker.id },
      orderBy: orderBy || { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        customer: true
      }
    });
    
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.post('/orders', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    const order = await prisma.order.create({
      data: {
        ...req.body,
        bakerId: userBaker.id
      },
      include: {
        customer: true
      }
    });
    
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

router.put('/orders/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    const order = await prisma.order.update({
      where: { 
        id: req.params.id,
        bakerId: userBaker.id
      },
      data: req.body,
      include: {
        customer: true
      }
    });
    
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.delete('/orders/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    await prisma.order.delete({
      where: { 
        id: req.params.id,
        bakerId: userBaker.id
      }
    });
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GALLERY ROUTES
router.get('/gallery', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    const { orderBy, limit, offset, where } = parseQueryParams(req.query);
    
    const gallery = await prisma.gallery.findMany({
      where: { ...where, bakerId: userBaker.id },
      orderBy: orderBy || { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
    
    res.json(gallery);
  } catch (error) {
    next(error);
  }
});

router.post('/gallery', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    const galleryItem = await prisma.gallery.create({
      data: {
        ...req.body,
        bakerId: userBaker.id
      }
    });
    
    res.status(201).json(galleryItem);
  } catch (error) {
    next(error);
  }
});

// Bulk create for gallery
router.post('/gallery/bulk', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    const items = req.body;
    
    if (!Array.isArray(items)) {
      throw createError(400, 'Expected array of gallery items');
    }
    
    const galleryItems = await Promise.all(
      items.map(item => 
        prisma.gallery.create({
          data: {
            ...item,
            bakerId: userBaker.id
          }
        })
      )
    );
    
    res.status(201).json(galleryItems);
  } catch (error) {
    next(error);
  }
});

router.put('/gallery/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    const galleryItem = await prisma.gallery.update({
      where: { 
        id: req.params.id,
        bakerId: userBaker.id
      },
      data: req.body
    });
    
    res.json(galleryItem);
  } catch (error) {
    next(error);
  }
});

router.delete('/gallery/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    await prisma.gallery.delete({
      where: { 
        id: req.params.id,
        bakerId: userBaker.id
      }
    });
    
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// THEME ROUTES
router.get('/themes', async (req, res, next) => {
  try {
    const { orderBy, limit, offset, where } = parseQueryParams(req.query);
    
    const themes = await prisma.theme.findMany({
      where: { ...where },
      orderBy: orderBy || { themeName: 'asc' },
      take: limit,
      skip: offset
    });
    
    // Transform field names from camelCase to snake_case for frontend compatibility
    const transformedThemes = themes.map(theme => ({
      id: theme.id,
      theme_name: theme.themeName,
      description: theme.description,
      category: theme.category,
      css_variables: theme.cssVariables, // Legacy field for backwards compatibility
      light_mode_variables: theme.lightModeVariables,
      dark_mode_variables: theme.darkModeVariables,
      background_texture_url: theme.backgroundTextureUrl,
      is_active: theme.isActive,
      created_at: theme.createdAt,
      updated_at: theme.updatedAt,
      // Include raw fields for any missing mappings
      ...theme
    }));
    
    res.json(transformedThemes);
  } catch (error) {
    next(error);
  }
});

router.get('/themes/:id', async (req, res, next) => {
  try {
    const theme = await prisma.theme.findUnique({
      where: { id: req.params.id }
    });
    
    if (!theme) {
      throw createError(404, 'Theme not found');
    }
    
    // Transform field names from camelCase to snake_case for frontend compatibility
    const transformedTheme = {
      id: theme.id,
      theme_name: theme.themeName,
      description: theme.description,
      category: theme.category,
      css_variables: theme.cssVariables, // Legacy field for backwards compatibility
      light_mode_variables: theme.lightModeVariables,
      dark_mode_variables: theme.darkModeVariables,
      background_texture_url: theme.backgroundTextureUrl,
      is_active: theme.isActive,
      created_at: theme.createdAt,
      updated_at: theme.updatedAt,
      // Include raw fields for any missing mappings
      ...theme
    };
    
    res.json(transformedTheme);
  } catch (error) {
    next(error);
  }
});

router.post('/themes', async (req, res, next) => {
  try {
    // Transform snake_case to camelCase for database
    const dbData = {
      themeName: req.body.theme_name,
      description: req.body.description,
      category: req.body.category,
      cssVariables: req.body.css_variables, // Legacy field
      lightModeVariables: req.body.light_mode_variables,
      darkModeVariables: req.body.dark_mode_variables,
      backgroundTextureUrl: req.body.background_texture_url,
      isActive: req.body.is_active !== false, // default to true
      ...req.body // Allow other fields to pass through
    };
    
    const theme = await prisma.theme.create({
      data: dbData
    });
    
    // Transform response back to snake_case
    const transformedTheme = {
      id: theme.id,
      theme_name: theme.themeName,
      description: theme.description,
      category: theme.category,
      css_variables: theme.cssVariables, // Legacy field
      light_mode_variables: theme.lightModeVariables,
      dark_mode_variables: theme.darkModeVariables,
      background_texture_url: theme.backgroundTextureUrl,
      is_active: theme.isActive,
      created_at: theme.createdAt,
      updated_at: theme.updatedAt,
      ...theme
    };
    
    res.status(201).json(transformedTheme);
  } catch (error) {
    next(error);
  }
});

router.put('/themes/:id', async (req, res, next) => {
  try {
    // Transform snake_case to camelCase for database
    const dbData = {
      themeName: req.body.theme_name,
      description: req.body.description,
      category: req.body.category,
      cssVariables: req.body.css_variables, // Legacy field
      lightModeVariables: req.body.light_mode_variables,
      darkModeVariables: req.body.dark_mode_variables,
      backgroundTextureUrl: req.body.background_texture_url,
      isActive: req.body.is_active,
      ...req.body // Allow other fields to pass through
    };
    
    const theme = await prisma.theme.update({
      where: { id: req.params.id },
      data: dbData
    });
    
    // Transform response back to snake_case
    const transformedTheme = {
      id: theme.id,
      theme_name: theme.themeName,
      description: theme.description,
      category: theme.category,
      css_variables: theme.cssVariables, // Legacy field
      light_mode_variables: theme.lightModeVariables,
      dark_mode_variables: theme.darkModeVariables,
      background_texture_url: theme.backgroundTextureUrl,
      is_active: theme.isActive,
      created_at: theme.createdAt,
      updated_at: theme.updatedAt,
      ...theme
    };
    
    res.json(transformedTheme);
  } catch (error) {
    next(error);
  }
});

router.delete('/themes/:id', async (req, res, next) => {
  try {
    await prisma.theme.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GALLERY INQUIRY ROUTES
router.post('/gallery-inquiries', async (req: AuthenticatedRequest, res, next) => {
  try {
    const inquiry = await prisma.galleryInquiry.create({
      data: {
        userId: req.user!.id,
        galleryItemId: req.body.gallery_item_id
      }
    });
    
    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
});

router.get('/gallery-inquiries', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { orderBy, limit, offset, where } = parseQueryParams(req.query);
    
    const inquiries = await prisma.galleryInquiry.findMany({
      where: { ...where, userId: req.user!.id },
      orderBy: orderBy || { createdDate: 'desc' },
      take: limit,
      skip: offset,
      include: {
        galleryItem: true
      }
    });
    
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
});

// MESSAGES ROUTES
router.get('/messages', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    const { orderBy, limit, offset, where } = parseQueryParams(req.query);
    
    const messages = await prisma.message.findMany({
      where: { ...where, bakerId: userBaker.id },
      orderBy: orderBy || { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        customer: true
      }
    });
    
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

router.post('/messages', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    const message = await prisma.message.create({
      data: {
        ...req.body,
        bakerId: userBaker.id,
        senderType: 'baker'
      },
      include: {
        customer: true
      }
    });
    
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

export default router;