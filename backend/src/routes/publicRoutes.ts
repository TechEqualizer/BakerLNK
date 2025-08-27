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
    res.json([baker]);
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
    
    res.json(gallery);
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