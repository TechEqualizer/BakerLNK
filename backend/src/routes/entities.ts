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
      'featured': 'featured',
      'created_at': 'createdAt',
      'theme_name': 'themeName'
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
    
    // Transform field names from camelCase to snake_case for frontend compatibility
    const transformedBakers = bakers.map(baker => ({
      id: baker.id,
      user_id: baker.userId,
      business_name: baker.businessName,
      tagline: baker.tagline,
      description: baker.description,
      email: baker.email,
      phone: baker.phone,
      phone_number: baker.phoneNumber,
      location: baker.location,
      logo_url: baker.logoUrl,
      hero_image_url: baker.heroImageUrl,
      selected_theme_id: baker.selectedThemeId,
      lead_time_days: baker.leadTimeDays,
      max_orders_per_day: baker.maxOrdersPerDay,
      deposit_percentage: baker.depositPercentage,
      instagram_url: baker.instagramUrl,
      facebook_url: baker.facebookUrl,
      tiktok_url: baker.tiktokUrl,
      website_url: baker.websiteUrl,
      created_date: baker.createdAt,
      updated_date: baker.updatedAt,
      user: baker.user,
      theme: baker.theme
    }));
    
    res.json(transformedBakers);
  } catch (error) {
    next(error);
  }
});

// CREATE Baker
router.post('/bakers', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = req.body;
    
    // Transform field names from snake_case to camelCase for database
    const bakerData = {
      userId: data.user_id || req.user!.id, // Use current user if not specified
      businessName: data.business_name,
      tagline: data.tagline,
      description: data.description,
      email: data.email,
      phone: data.phone,
      phoneNumber: data.phone_number,
      location: data.location,
      logoUrl: data.logo_url,
      heroImageUrl: data.hero_image_url,
      selectedThemeId: data.selected_theme_id,
      leadTimeDays: parseInt(data.lead_time_days) || 7,
      maxOrdersPerDay: parseInt(data.max_orders_per_day) || 3,
      depositPercentage: parseInt(data.deposit_percentage) || 25,
      instagramUrl: data.instagram_url,
      facebookUrl: data.facebook_url,
      tiktokUrl: data.tiktok_url,
      websiteUrl: data.website_url
    };

    const baker = await prisma.baker.create({
      data: bakerData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        theme: true
      }
    });

    // Transform response back to snake_case
    const transformedBaker = {
      id: baker.id,
      user_id: baker.userId,
      business_name: baker.businessName,
      tagline: baker.tagline,
      description: baker.description,
      email: baker.email,
      phone: baker.phone,
      phone_number: baker.phoneNumber,
      location: baker.location,
      logo_url: baker.logoUrl,
      hero_image_url: baker.heroImageUrl,
      selected_theme_id: baker.selectedThemeId,
      lead_time_days: baker.leadTimeDays,
      max_orders_per_day: baker.maxOrdersPerDay,
      deposit_percentage: baker.depositPercentage,
      instagram_url: baker.instagramUrl,
      facebook_url: baker.facebookUrl,
      tiktok_url: baker.tiktokUrl,
      website_url: baker.websiteUrl,
      created_date: baker.createdAt,
      updated_date: baker.updatedAt,
      user: baker.user,
      theme: baker.theme
    };

    res.status(201).json(transformedBaker);
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
    
    // Transform field names from camelCase to snake_case for frontend compatibility
    const responseData = {
      id: baker.id,
      user_id: baker.userId,
      business_name: baker.businessName,
      tagline: baker.tagline,
      description: baker.description,
      email: baker.email,
      phone: baker.phone,
      phone_number: baker.phoneNumber,
      location: baker.location,
      logo_url: baker.logoUrl,
      hero_image_url: baker.heroImageUrl,
      selected_theme_id: baker.selectedThemeId,
      lead_time_days: baker.leadTimeDays,
      max_orders_per_day: baker.maxOrdersPerDay,
      deposit_percentage: baker.depositPercentage,
      instagram_url: baker.instagramUrl,
      facebook_url: baker.facebookUrl,
      tiktok_url: baker.tiktokUrl,
      website_url: baker.websiteUrl,
      created_date: baker.createdAt,
      updated_date: baker.updatedAt,
      user: baker.user,
      theme: baker.theme
    };
    
    res.json(responseData);
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
    
    // Transform field names from snake_case to camelCase for database
    const transformedData: any = {};
    Object.entries(req.body).forEach(([key, value]) => {
      switch (key) {
        case 'business_name':
          transformedData.businessName = value;
          break;
        case 'logo_url':
          transformedData.logoUrl = value;
          break;
        case 'hero_image_url':
          transformedData.heroImageUrl = value;
          break;
        case 'selected_theme_id':
          transformedData.selectedThemeId = value;
          break;
        case 'lead_time_days':
          transformedData.leadTimeDays = value;
          break;
        case 'max_orders_per_day':
          transformedData.maxOrdersPerDay = value;
          break;
        case 'deposit_percentage':
          transformedData.depositPercentage = value;
          break;
        case 'phone_number':
          transformedData.phoneNumber = value;
          break;
        case 'instagram_url':
          transformedData.instagramUrl = value;
          break;
        case 'facebook_url':
          transformedData.facebookUrl = value;
          break;
        case 'tiktok_url':
          transformedData.tiktokUrl = value;
          break;
        case 'website_url':
          transformedData.websiteUrl = value;
          break;
        // Keep fields that are already correctly named
        case 'tagline':
        case 'description':
        case 'email':
        case 'phone':
        case 'location':
          transformedData[key] = value;
          break;
        // Skip system fields and relations
        case 'id':
        case 'user_id':
        case 'created_date':
        case 'updated_date':
        case 'user':
        case 'theme':
        case 'category': // Skip category field as it's not part of Baker model
          break;
        default:
          // For any other field, use as-is
          transformedData[key] = value;
      }
    });
    
    const baker = await prisma.baker.update({
      where: { id: req.params.id },
      data: transformedData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        theme: true
      }
    });
    
    // Transform response back to snake_case for frontend
    const responseData = {
      id: baker.id,
      user_id: baker.userId,
      business_name: baker.businessName,
      tagline: baker.tagline,
      description: baker.description,
      email: baker.email,
      phone: baker.phone,
      phone_number: baker.phoneNumber,
      location: baker.location,
      logo_url: baker.logoUrl,
      hero_image_url: baker.heroImageUrl,
      selected_theme_id: baker.selectedThemeId,
      lead_time_days: baker.leadTimeDays,
      max_orders_per_day: baker.maxOrdersPerDay,
      deposit_percentage: baker.depositPercentage,
      instagram_url: baker.instagramUrl,
      facebook_url: baker.facebookUrl,
      tiktok_url: baker.tiktokUrl,
      website_url: baker.websiteUrl,
      created_date: baker.createdAt,
      updated_date: baker.updatedAt,
      user: baker.user,
      theme: baker.theme
    };
    
    res.json(responseData);
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
    
    // Transform tags from string to array for frontend compatibility
    const transformedCustomers = customers.map(customer => ({
      ...customer,
      tags: customer.tags ? customer.tags.split(',').map(tag => tag.trim()) : []
    }));
    
    res.json(transformedCustomers);
  } catch (error) {
    next(error);
  }
});

router.post('/customers', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    // Transform tags from array to comma-separated string for database
    const customerData = {
      ...req.body,
      bakerId: userBaker.id,
      tags: Array.isArray(req.body.tags) ? req.body.tags.join(', ') : req.body.tags
    };
    
    const customer = await prisma.customer.create({
      data: customerData
    });
    
    // Transform back to array for response
    const responseCustomer = {
      ...customer,
      tags: customer.tags ? customer.tags.split(',').map(tag => tag.trim()) : []
    };
    
    res.status(201).json(responseCustomer);
  } catch (error) {
    next(error);
  }
});

router.put('/customers/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    // Transform tags from array to comma-separated string for database
    const customerData = {
      ...req.body,
      tags: Array.isArray(req.body.tags) ? req.body.tags.join(', ') : req.body.tags
    };
    
    const customer = await prisma.customer.update({
      where: { 
        id: req.params.id,
        bakerId: userBaker.id
      },
      data: customerData
    });
    
    // Transform back to array for response
    const responseCustomer = {
      ...customer,
      tags: customer.tags ? customer.tags.split(',').map(tag => tag.trim()) : []
    };
    
    res.json(responseCustomer);
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
    
    // Transform field names from camelCase to snake_case for frontend compatibility
    const transformedGallery = gallery.map(item => ({
      id: item.id,
      baker_id: item.bakerId,
      title: item.title,
      description: item.description,
      image_url: item.imageUrl,
      category: item.category,
      tags: item.tags,
      featured: item.featured,
      price_range: item.priceRange,
      serves_count: item.servesCount,
      hearts_count: item.heartsCount,
      inquiries_count: item.inquiriesCount,
      created_at: item.createdAt,
      updated_at: item.updatedAt
    }));
    
    res.json(transformedGallery);
  } catch (error) {
    next(error);
  }
});

router.post('/gallery', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userBaker = await getUserBaker(req.user!.id);
    
    // Transform snake_case to camelCase for database
    const transformedData: any = {
      bakerId: userBaker.id
    };
    
    if (req.body.title !== undefined) transformedData.title = req.body.title;
    if (req.body.description !== undefined) transformedData.description = req.body.description;
    if (req.body.image_url !== undefined) transformedData.imageUrl = req.body.image_url;
    if (req.body.category !== undefined) transformedData.category = req.body.category;
    if (req.body.tags !== undefined) transformedData.tags = req.body.tags;
    if (req.body.featured !== undefined) transformedData.featured = req.body.featured;
    if (req.body.price_range !== undefined) transformedData.priceRange = req.body.price_range;
    if (req.body.serves_count !== undefined) transformedData.servesCount = req.body.serves_count;
    if (req.body.hearts_count !== undefined) transformedData.heartsCount = req.body.hearts_count || 0;
    if (req.body.inquiries_count !== undefined) transformedData.inquiriesCount = req.body.inquiries_count || 0;
    
    const galleryItem = await prisma.gallery.create({
      data: transformedData
    });
    
    // Transform response back to snake_case
    const responseData = {
      id: galleryItem.id,
      baker_id: galleryItem.bakerId,
      title: galleryItem.title,
      description: galleryItem.description,
      image_url: galleryItem.imageUrl,
      category: galleryItem.category,
      tags: galleryItem.tags,
      featured: galleryItem.featured,
      price_range: galleryItem.priceRange,
      serves_count: galleryItem.servesCount,
      hearts_count: galleryItem.heartsCount,
      inquiries_count: galleryItem.inquiriesCount,
      created_at: galleryItem.createdAt,
      updated_at: galleryItem.updatedAt
    };
    
    res.status(201).json(responseData);
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
    
    // Transform snake_case to camelCase for database
    const transformedData: any = {};
    
    if (req.body.title !== undefined) transformedData.title = req.body.title;
    if (req.body.description !== undefined) transformedData.description = req.body.description;
    if (req.body.image_url !== undefined) transformedData.imageUrl = req.body.image_url;
    if (req.body.category !== undefined) transformedData.category = req.body.category;
    if (req.body.tags !== undefined) transformedData.tags = req.body.tags;
    if (req.body.featured !== undefined) transformedData.featured = req.body.featured;
    if (req.body.price_range !== undefined) transformedData.priceRange = req.body.price_range;
    if (req.body.serves_count !== undefined) transformedData.servesCount = req.body.serves_count;
    if (req.body.hearts_count !== undefined) transformedData.heartsCount = req.body.hearts_count;
    if (req.body.inquiries_count !== undefined) transformedData.inquiriesCount = req.body.inquiries_count;
    
    const galleryItem = await prisma.gallery.update({
      where: { 
        id: req.params.id,
        bakerId: userBaker.id
      },
      data: transformedData
    });
    
    // Transform response back to snake_case
    const responseData = {
      id: galleryItem.id,
      baker_id: galleryItem.bakerId,
      title: galleryItem.title,
      description: galleryItem.description,
      image_url: galleryItem.imageUrl,
      category: galleryItem.category,
      tags: galleryItem.tags,
      featured: galleryItem.featured,
      price_range: galleryItem.priceRange,
      serves_count: galleryItem.servesCount,
      hearts_count: galleryItem.heartsCount,
      inquiries_count: galleryItem.inquiriesCount,
      created_at: galleryItem.createdAt,
      updated_at: galleryItem.updatedAt
    };
    
    res.json(responseData);
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
      where: { ...where, isActive: true },
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
      preview_image_url: theme.backgroundTextureUrl || `https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&auto=format&q=60`, // Bakery-themed fallback
      is_active: theme.isActive,
      created_at: theme.createdAt,
      updated_at: theme.updatedAt
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
    const dbData: any = {};
    
    // Only include transformed fields, not the original snake_case ones
    if (req.body.theme_name !== undefined) dbData.themeName = req.body.theme_name;
    if (req.body.description !== undefined) dbData.description = req.body.description;
    if (req.body.category !== undefined) dbData.category = req.body.category;
    if (req.body.css_variables !== undefined) dbData.cssVariables = req.body.css_variables;
    if (req.body.light_mode_variables !== undefined) dbData.lightModeVariables = req.body.light_mode_variables;
    if (req.body.dark_mode_variables !== undefined) dbData.darkModeVariables = req.body.dark_mode_variables;
    if (req.body.background_texture_url !== undefined) dbData.backgroundTextureUrl = req.body.background_texture_url;
    
    // Handle is_active with default true if not specified
    dbData.isActive = req.body.is_active !== false;
    
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
    const dbData: any = {};
    
    // Only include transformed fields, not the original snake_case ones
    if (req.body.theme_name !== undefined) dbData.themeName = req.body.theme_name;
    if (req.body.description !== undefined) dbData.description = req.body.description;
    if (req.body.category !== undefined) dbData.category = req.body.category;
    if (req.body.css_variables !== undefined) dbData.cssVariables = req.body.css_variables;
    if (req.body.light_mode_variables !== undefined) dbData.lightModeVariables = req.body.light_mode_variables;
    if (req.body.dark_mode_variables !== undefined) dbData.darkModeVariables = req.body.dark_mode_variables;
    if (req.body.background_texture_url !== undefined) dbData.backgroundTextureUrl = req.body.background_texture_url;
    if (req.body.is_active !== undefined) dbData.isActive = req.body.is_active;
    
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