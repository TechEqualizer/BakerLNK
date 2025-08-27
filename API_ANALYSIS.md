# BakerLink API Analysis & Backend Migration Plan

## Current Base44 SDK Interface Analysis

Based on the existing mock implementation, here's the complete API interface we need to replicate:

### 1. Entity Operations

**Entities:**
- Baker (business profile)
- Customer (client information)
- Order (cake orders/inquiries)
- Gallery (showcase images)
- Message (communications)
- Theme (UI themes)
- GalleryInquiry (gallery interaction tracking)

**Entity Methods:**
- `create(data)` - Create new record
- `bulkCreate(dataArray)` - Create multiple records
- `findById(id)` - Find single record by ID
- `findOne(filter)` - Find single record by filter
- `list(sortOrOptions, limit)` - List records with sorting/limiting
- `filter(filterObj, options)` - Filter records with conditions
- `update(id, data)` - Update existing record
- `delete(id)` - Delete record

**Sorting/Filtering Options:**
- String sort: `'-created_date'`, `'name'`, etc.
- Object options: `{ sort, limit, filter }`
- Filter objects: `{ field: value, field_gte: value, etc. }`

### 2. Authentication System

**Auth Methods:**
- `login(email, password)` - User login
- `signup(userData)` - User registration
- `logout()` - User logout
- `me()` - Get current user info
- `isAuthenticated()` - Check auth status
- `getUser()` - Get current user object

**Auth Response:**
```js
{
  user: { id, email, name, role, created_at },
  token: "jwt-token-string"
}
```

### 3. Integration Services

**Core Integrations:**
- `InvokeLLM(prompt, options)` - AI/LLM calls
- `SendEmail(data)` - Email sending
- `UploadFile(file, options)` - File upload
- `GenerateImage(prompt, options)` - AI image generation
- `ExtractDataFromUploadedFile(fileUrl)` - Data extraction from files

### 4. Client Structure

```js
const client = createClient({
  appId: "app-id",
  requiresAuth: true
});

// Access patterns:
client.entities.Baker.list()
client.entities.Customer.create(data)
client.integrations.Core.UploadFile(file)
client.auth.login(email, password)
```

## Database Schema Design

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'baker',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Baker Table
```sql
CREATE TABLE bakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  selected_theme_id UUID,
  lead_time_days INTEGER DEFAULT 7,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Customers Table
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baker_id UUID REFERENCES bakers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baker_id UUID REFERENCES bakers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'inquiry',
  event_date DATE,
  event_type VARCHAR(50),
  serves_count INTEGER,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  cake_description TEXT,
  special_requests TEXT,
  quoted_price DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  deposit_paid BOOLEAN DEFAULT FALSE,
  baker_notes TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  pickup_delivery VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Gallery Table
```sql
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baker_id UUID REFERENCES bakers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category VARCHAR(50),
  tags TEXT[], -- Array of tags
  featured BOOLEAN DEFAULT FALSE,
  price_range VARCHAR(10),
  serves_count INTEGER,
  hearts_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Themes Table
```sql
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_name VARCHAR(255) NOT NULL,
  css_variables TEXT,
  background_texture_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baker_id UUID REFERENCES bakers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_type VARCHAR(20) NOT NULL, -- 'baker' or 'customer'
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Gallery Inquiries Table
```sql
CREATE TABLE gallery_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gallery_item_id UUID REFERENCES gallery(id) ON DELETE CASCADE,
  created_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, gallery_item_id, DATE(created_date))
);
```

### Files Table
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## RESTful API Endpoints Design

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Entity Endpoints (Pattern: `/api/{entity}`)
- `GET /api/bakers` - List bakers
- `POST /api/bakers` - Create baker
- `GET /api/bakers/:id` - Get baker by ID
- `PUT /api/bakers/:id` - Update baker
- `DELETE /api/bakers/:id` - Delete baker

**Similar patterns for:** customers, orders, gallery, themes, messages, gallery-inquiries

### Integration Endpoints
- `POST /api/integrations/llm` - LLM invocation
- `POST /api/integrations/email` - Send email
- `POST /api/integrations/upload` - File upload
- `POST /api/integrations/generate-image` - Generate image
- `POST /api/integrations/extract-data` - Extract data from file

### Query Parameters
- `?sort=field` or `?sort=-field` (descending)
- `?limit=10&offset=0` for pagination
- `?filter[field]=value` for filtering
- `?filter[field_gte]=value` for range queries

## Technical Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication
- Multer for file uploads
- bcrypt for password hashing
- cors, helmet for security
- nodemailer for emails

**Deployment:**
- Docker containers
- nginx reverse proxy
- SSL certificates
- Environment-based configuration

## Migration Strategy

1. **Phase 1:** Set up backend infrastructure
2. **Phase 2:** Implement core CRUD operations
3. **Phase 3:** Add authentication & authorization
4. **Phase 4:** Implement integration services
5. **Phase 5:** Update frontend API client
6. **Phase 6:** Test & deploy

This document will be updated as the migration progresses.