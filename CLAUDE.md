# Claude AI Assistant Context

This file helps maintain context across Claude sessions for the BakerLink project.

## Project Overview

BakerLink is a React + Express.js application for managing a bakery business, recently migrated from Base44 SDK to a self-hosted backend.

### Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Shadcn/ui
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT tokens with secure httpOnly cookies

## Recent Major Changes (As of 2025-08-27)

### 1. Theme System Overhaul
- Fixed field name transformation issues (camelCase ↔ snake_case)
- Added comprehensive dark mode support
- Implemented dual-mode themes with separate light/dark variables
- Created ThemeModeToggle component
- Enhanced ThemeProvider with intelligent mode switching

### 2. Database Schema Updates
```prisma
model Theme {
  lightModeVariables String? @map("light_mode_variables")
  darkModeVariables  String? @map("dark_mode_variables")
  description        String?
  category           String  @default("modern")
}
```

### 3. API Improvements
- Added field transformation in publicRoutes.ts
- Enhanced entities.ts with bidirectional transformations
- Fixed authentication flow for theme management

## Key File Locations

### Frontend
- **Theme Provider**: `/src/providers/ThemeProvider.jsx`
- **Theme Manager**: `/src/pages/ThemeManagerV2.jsx`
- **Settings Page**: `/src/pages/Settings.jsx`
- **API Client**: `/src/api/base44Client.js`

### Backend
- **Public Routes**: `/backend/src/routes/publicRoutes.ts`
- **Entity Routes**: `/backend/src/routes/entities.ts`
- **Database Schema**: `/backend/prisma/schema.prisma`

## Common Tasks

### Running the Project
```bash
# From project root
npm run dev:full  # Starts both frontend and backend
```

### Database Commands
```bash
cd backend
npx prisma migrate dev  # Run migrations
npx prisma studio       # Open database GUI
```

### Testing Authentication
- Quick Login: `baker@example.com` / `password123`
- JWT tokens stored in httpOnly cookies
- Auth state managed by base44Client.js

## Current Architecture Patterns

### 1. Field Name Transformation
Backend uses camelCase, frontend expects snake_case. Transformation happens in API routes:

```typescript
// Transform response
const transformedThemes = themes.map(theme => ({
  id: theme.id,
  theme_name: theme.themeName,
  css_variables: theme.cssVariables,
  // ... etc
}));
```

### 2. Theme Application
Themes support both legacy (single mode) and new (dual mode) formats:
- Legacy: Uses `css_variables` field
- Dual Mode: Uses `light_mode_variables` and `dark_mode_variables`

### 3. Authentication Flow
1. User logs in via `/api/auth/login`
2. Server sets httpOnly cookie with JWT
3. All API requests include cookie automatically
4. base44Client.js handles auth state

## Known Issues & Solutions

### Issue: 401 Unauthorized on theme load
**Solution**: Ensure field transformation matches frontend expectations

### Issue: Theme preview not working
**Solution**: Check for `?preview_theme=ID` URL parameter handling

### Issue: Edit buttons not working
**Solution**: User must be authenticated first (Quick Login)

## Next Steps & TODOs

1. ✅ Implement dark mode support for all themes
2. ✅ Remove unnecessary UI elements from ThemeManagerV2
3. ✅ Fix theme field name mismatches
4. Consider adding theme export/import functionality
5. Implement theme versioning system
6. Add theme marketplace integration

## Environment Setup Notes

When setting up on a new machine:
1. Clone the repository
2. Install dependencies: `npm run setup`
3. Create PostgreSQL database: `createdb bakerlink`
4. Configure `backend/.env` with database credentials
5. Run migrations: `cd backend && npx prisma migrate dev`
6. Seed database: `npm run db:seed`
7. Start development: `npm run dev:full`

## Helpful Commands

```bash
# View recent commits
git log --oneline -10

# Check current branch
git branch

# View file changes
git diff --name-only

# Database inspection
cd backend && npx prisma studio

# Clear ports if needed
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # Backend
```

## Important Context

- Always transform field names between backend (camelCase) and frontend (snake_case)
- Theme CSS variables should use HSL format for shadcn/ui compatibility
- Authentication required for most write operations
- File uploads handled by backend/uploads directory
- All dates stored as ISO strings in database

This file should be updated as the project evolves to maintain context across sessions.