import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';

const router = Router();

// Helper function to get the first baker (for public showcase)
const getPublicBaker = async () => {
  const baker = await prisma.baker.findFirst({
    include: {
      user: true,
      theme: true
    }
  });
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
      'theme_name': 'themeName'
    };
    
    const actualField = fieldMap[field] || field;
    orderBy = { [actualField]: desc ? 'desc' : 'asc' };
  }
  
  return { orderBy, limit, offset };
};

// PUBLIC BAKER ROUTES
router.get('/bakers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const baker = await getPublicBaker();
    if (!baker) {
      return res.json([]);
    }
    
    // Transform field names from camelCase to snake_case for frontend compatibility
    const transformedBaker = {
      id: baker.id,
      user_id: baker.userId,
      business_name: baker.businessName,
      tagline: baker.tagline,
      description: baker.description,
      email: baker.email,
      phone: baker.phone,
      location: baker.location,
      logo_url: baker.logoUrl,
      hero_image_url: baker.heroImageUrl,
      selected_theme_id: baker.selectedThemeId,
      lead_time_days: baker.leadTimeDays,
      max_orders_per_day: baker.maxOrdersPerDay,
      deposit_percentage: baker.depositPercentage,
      created_date: baker.createdAt,
      updated_date: baker.updatedAt,
      user: baker.user,
      theme: baker.theme
    };
    
    res.json([transformedBaker]);
  } catch (error) {
    next(error);
  }
});

// PUBLIC GALLERY ROUTES
router.get('/gallery', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const baker = await getPublicBaker();
    if (!baker) {
      return res.json([]);
    }

    const { orderBy, limit, offset } = parseQueryParams(req.query);
    
    const gallery = await prisma.gallery.findMany({
      where: { bakerId: baker.id },
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

// PUBLIC THEME ROUTES (read-only)
router.get('/themes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderBy, limit, offset } = parseQueryParams(req.query);
    
    const themes = await prisma.theme.findMany({
      where: { isActive: true },
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

// PUBLIC ORDER ROUTES (read-only, for showcase stats)
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const baker = await getPublicBaker();
    if (!baker) {
      return res.json([]);
    }

    const { orderBy, limit, offset } = parseQueryParams(req.query);
    
    const orders = await prisma.order.findMany({
      where: { bakerId: baker.id },
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

// PUBLIC CUSTOMER ROUTES (for order form submissions)
router.post('/customers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const baker = await getPublicBaker();
    if (!baker) {
      return res.status(404).json({ error: 'Baker not found' });
    }

    const customer = await prisma.customer.create({
      data: {
        ...req.body,
        bakerId: baker.id
      }
    });
    
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// PUBLIC ORDER SUBMISSION (for consultation requests)
router.post('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const baker = await getPublicBaker();
    if (!baker) {
      return res.status(404).json({ error: 'Baker not found' });
    }

    // Ensure customer exists
    let customer = await prisma.customer.findUnique({
      where: { id: req.body.customer_id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const order = await prisma.order.create({
      data: req.body,
      include: {
        customer: true
      }
    });
    
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

export default router;