# 🚀 BakerLink Development Setup

## Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
3. **Git** - [Download here](https://git-scm.com/downloads)

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm run setup
```

### 2. Setup Database
Create a PostgreSQL database:
```bash
createdb bakerlink
```

### 3. Configure Environment
Update `backend/.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/bakerlink"
```

### 4. Initialize Database
```bash
npm run db:setup
```

### 5. Start Development
```bash
npm run dev:full
```

This will start:
- **Frontend** at http://localhost:3000
- **Backend** at http://localhost:3001

## 🎯 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run dev:full` | Start both frontend and backend |
| `npm run db:setup` | Setup database (migrate + seed) |
| `npm run db:reset` | Reset database (WARNING: deletes data) |
| `npm run db:studio` | Open Prisma Studio (database viewer) |

## ✅ Verify Setup

1. **Backend Health**: Visit http://localhost:3001/api/health
2. **Frontend**: Visit http://localhost:3000
3. **Login**: Use `baker@example.com` / `password123`

## 📁 Project Structure

```
baker-link/
├── src/                    # Frontend React app
├── backend/               # Express.js API server
├── .env                  # Frontend environment
└── backend/.env          # Backend environment
```

## 🔧 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `brew services start postgresql` (Mac)
- Verify database exists: `psql -l | grep bakerlink`
- Check DATABASE_URL format in `backend/.env`

### Port Already in Use
- Frontend (3000): `lsof -ti:3000 | xargs kill -9`
- Backend (3001): `lsof -ti:3001 | xargs kill -9`

### Clear Data & Start Fresh
```bash
npm run db:reset
```

## 🚀 Ready for Development!

Your BakerLink app is now running completely independently from Base44, with:
- ✅ Self-hosted backend with full control
- ✅ PostgreSQL database with sample data
- ✅ JWT authentication system
- ✅ File upload capabilities
- ✅ All original features working

Start building new features - you have complete control over your stack!