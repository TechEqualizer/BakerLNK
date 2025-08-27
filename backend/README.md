# BakerLink Express Backend

This is the self-hosted backend replacement for Base44 SDK, providing complete control and reliability.

## Features

- **Full API compatibility** with existing Base44 SDK interface
- **JWT Authentication** with secure user sessions
- **PostgreSQL database** with Prisma ORM for type-safe data access
- **File upload system** with image optimization
- **RESTful API** for all entities (Baker, Customer, Order, Gallery, Theme, etc.)
- **Integration services** for email, LLM, and image generation
- **Multi-tenant architecture** supporting multiple baker accounts

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Environment Setup

```bash
cd backend
cp ../.env.example .env
```

Edit `.env` file with your database credentials and configuration:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/bakerlink"
JWT_SECRET="your-super-secure-jwt-secret-here"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Create database schema
npx prisma migrate dev --name init

# Seed with sample data
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

### 5. Start Frontend

```bash
# In the main project directory
npm run dev
```

The frontend will automatically connect to the backend at `http://localhost:3001/api`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Entities (CRUD operations)
- `/api/bakers` - Baker profiles
- `/api/customers` - Customer management
- `/api/orders` - Order processing
- `/api/gallery` - Gallery items
- `/api/themes` - Theme configurations
- `/api/messages` - Messages
- `/api/gallery-inquiries` - Gallery inquiries

### Integrations
- `POST /api/integrations/upload` - File upload
- `POST /api/integrations/email` - Send emails
- `POST /api/integrations/llm` - AI text generation
- `POST /api/integrations/generate-image` - AI image generation

## Database Schema

The database includes these main entities:

- **User** - Authentication and user management
- **Baker** - Baker profiles and settings
- **Customer** - Customer information
- **Order** - Order tracking and management
- **Gallery** - Showcase items with images
- **Theme** - Visual theme configurations
- **Message** - Communication system
- **GalleryInquiry** - Interest tracking for gallery items

## Development

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate
```

### Adding New Features

1. Update Prisma schema in `prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name feature_name`
3. Update route handlers in `src/routes/`
4. Test with frontend integration

## Production Deployment

### Environment Variables

Set these in production:

```env
DATABASE_URL="postgresql://user:pass@host:5432/bakerlink"
JWT_SECRET="production-jwt-secret"
NODE_ENV="production"
PORT="3001"
```

### Deployment Steps

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations: `npx prisma migrate deploy`
4. Seed production data: `npm run seed`
5. Start production server: `npm start`

## Migration from Base44

The backend maintains full API compatibility with Base44 SDK:

1. **Entities**: Same CRUD operations and data structure
2. **Authentication**: JWT-based auth matching Base44 patterns  
3. **Integrations**: Compatible file upload, email, and AI services
4. **Frontend**: No frontend code changes required

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Authentication Problems
- Verify JWT_SECRET is set
- Check token expiration (24h default)
- Clear localStorage tokens if needed

### File Upload Issues
- Check upload directory permissions
- Verify MAX_FILE_SIZE setting
- Ensure Sharp package is installed

## Support

For issues specific to this backend implementation, check:

1. Database connection and migrations
2. Environment variable configuration
3. JWT token handling
4. API endpoint compatibility