# Deployment Guide

This guide covers multiple deployment options for the AI Document Authoring Platform. Choose the option that best fits your needs.

## 🎯 Recommended Deployment Strategy

**Best for Quick Deployment:**
- **Frontend**: Vercel (Free, Easy, Optimized for React)
- **Backend**: Railway or Render (Free tier available, Easy setup)

**Best for Production:**
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or DigitalOcean App Platform
- **Database**: PostgreSQL (Railway/Neon/Render PostgreSQL)

---

## 📦 Option 1: Railway (Recommended - Easiest)

Railway can deploy both frontend and backend, and provides PostgreSQL.

### Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))

### Backend Deployment on Railway

1. **Prepare Backend for Railway**
   - Railway auto-detects Python projects
   - Add `Procfile` (already created if needed)

2. **Deploy Backend**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the backend folder
   - Or select "Empty Project" and add service:
     - Root Directory: `backend`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add PostgreSQL Database**
   - In Railway project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will auto-create `DATABASE_URL` variable

4. **Set Environment Variables**
   - Go to backend service → Variables
   - Add:
     ```
     SECRET_KEY=your-random-secret-key-here
     GEMINI_API_KEY=your-gemini-api-key
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     ```
   - Railway auto-provides `$PORT` variable

5. **Update Backend for PostgreSQL**
   - Replace SQLite with PostgreSQL (see Database Migration section)

### Frontend Deployment on Railway

1. **Prepare Frontend**
   - Build command: `npm install && npm run build`
   - Start command: `npx serve -s build -l $PORT`

2. **Deploy Frontend**
   - Add new service to same Railway project
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s build -l $PORT`
   - Install `serve` package or use npx

3. **Set Environment Variables**
   - `REACT_APP_API_URL=https://your-backend-url.railway.app`

4. **Get URLs**
   - Railway provides HTTPS URLs automatically
   - Frontend: `https://your-frontend.railway.app`
   - Backend: `https://your-backend.railway.app`

---

## 🌐 Option 2: Render (Great Free Tier)

**📖 For detailed step-by-step Render deployment instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)**

### Quick Summary:

1. **Deploy PostgreSQL Database** → Get Internal Database URL
2. **Deploy Backend** (Web Service) → Set environment variables
3. **Deploy Frontend** (Static Site) → Set `REACT_APP_API_URL`
4. **Update CORS** → Set `FRONTEND_URL` in backend

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete instructions.

---

## ⚡ Option 3: Vercel (Frontend) + Railway/Render (Backend)

### Frontend on Vercel (Best for React)

1. **Deploy Frontend**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Root Directory: `frontend`
   - Framework Preset: React
   - Build Command: `npm run build`
   - Output Directory: `build`

2. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add: `REACT_APP_API_URL=https://your-backend-url.railway.app`

3. **Deploy**
   - Vercel auto-deploys on git push
   - Provides HTTPS URL: `https://your-app.vercel.app`

### Backend on Railway/Render
   - Follow Option 1 or 2 for backend deployment

---

## 🐳 Option 4: Docker Deployment

### Create Dockerfile for Backend

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Create Dockerfile for Frontend

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker

1. **Build and Push Images**
   ```bash
   docker build -t your-registry/backend ./backend
   docker build -t your-registry/frontend ./frontend
   docker push your-registry/backend
   docker push your-registry/frontend
   ```

2. **Deploy to Railway/Render/Fly.io**
   - Use Dockerfile deployment option
   - Set environment variables
   - Configure ports

---

## 🗄️ Database Migration: SQLite → PostgreSQL

### Update `backend/database.py`

Replace SQLite connection with PostgreSQL:

```python
# Old (SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///./documents.db"

# New (PostgreSQL)
import os
from urllib.parse import quote_plus

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./documents.db")

# Handle both SQLite and PostgreSQL
if DATABASE_URL.startswith("postgresql"):
    # For PostgreSQL (production)
    SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://")
else:
    # For SQLite (local development)
    SQLALCHEMY_DATABASE_URL = DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)
```

### Update `backend/requirements.txt`

Add PostgreSQL driver:
```
psycopg2-binary>=2.9.0
```

### Migration Steps

1. **Export Data** (if you have existing data)
   ```bash
   python export_data.py  # Create this script if needed
   ```

2. **Deploy with PostgreSQL**
   - Database auto-creates tables on first run
   - Or run migrations manually

---

## 🔧 Required Changes for Production

### 1. Update CORS in `backend/main.py`

```python
# Get frontend URL from environment
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        FRONTEND_URL,  # Production frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Update Frontend API URL

Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

Update `frontend/src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### 3. Security Checklist

- [ ] Use strong `SECRET_KEY` (generate with: `openssl rand -hex 32`)
- [ ] Set `ALLOWED_ORIGINS` environment variable
- [ ] Enable HTTPS (automatic on Railway/Render/Vercel)
- [ ] Use PostgreSQL for production (not SQLite)
- [ ] Set proper database connection limits
- [ ] Add rate limiting (optional but recommended)
- [ ] Enable logging and monitoring

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Test locally with production settings
- [ ] Generate strong `SECRET_KEY`
- [ ] Verify `GEMINI_API_KEY` is set
- [ ] Update CORS settings
- [ ] Build frontend: `npm run build`
- [ ] Test frontend build locally

### Backend Deployment
- [ ] Deploy backend service
- [ ] Set all environment variables
- [ ] Configure database (PostgreSQL)
- [ ] Test health endpoint: `/api/health`
- [ ] Verify API is accessible
- [ ] Check logs for errors

### Frontend Deployment
- [ ] Set `REACT_APP_API_URL` environment variable
- [ ] Build and deploy frontend
- [ ] Verify frontend loads correctly
- [ ] Test login/registration
- [ ] Test API connectivity
- [ ] Check browser console for errors

### Post-Deployment
- [ ] Test complete user flow
- [ ] Verify document generation works
- [ ] Test export functionality
- [ ] Check mobile responsiveness
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts (optional)

---

## 🚀 Quick Start: Railway Deployment

### Backend (5 minutes)

```bash
# 1. Push code to GitHub
git add .
git commit -m "Prepare for deployment"
git push

# 2. On Railway:
# - New Project → Deploy from GitHub
# - Select repository
# - Root Directory: backend
# - Add PostgreSQL database
# - Set environment variables:
#   SECRET_KEY=...
#   GEMINI_API_KEY=...
#   DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Frontend (5 minutes)

```bash
# 1. On Railway:
# - Add new service to same project
# - Root Directory: frontend
# - Build Command: npm install && npm run build
# - Start Command: npx serve -s build -l $PORT
# - Set environment variable:
#   REACT_APP_API_URL=https://your-backend.railway.app
```

---

## 🔍 Troubleshooting

### Backend Issues

**"Application failed to respond"**
- Check `Start Command` is correct
- Verify port uses `$PORT` variable
- Check logs for Python errors

**"Database connection error"**
- Verify `DATABASE_URL` is set correctly
- Check database service is running
- Ensure `psycopg2-binary` is installed

**"CORS errors"**
- Add frontend URL to `allow_origins`
- Check `FRONTEND_URL` environment variable

### Frontend Issues

**"API calls failing"**
- Verify `REACT_APP_API_URL` is set
- Check backend is accessible
- Verify CORS is configured

**"Build failing"**
- Check Node.js version (18+)
- Clear `node_modules` and reinstall
- Check for syntax errors

---

## 📊 Monitoring & Maintenance

### Recommended Tools

- **Logs**: Railway/Render provide built-in logs
- **Monitoring**: UptimeRobot (free) for uptime checks
- **Error Tracking**: Sentry (free tier available)
- **Analytics**: Google Analytics or Plausible

### Maintenance Tasks

- Update dependencies regularly
- Monitor API usage (Gemini quotas)
- Review error logs weekly
- Backup database regularly
- Update security patches

---

## 💰 Cost Estimates

### Free Tier (Development/Testing)
- **Railway**: $5 free credit/month, ~500 hours
- **Render**: Free tier with limitations
- **Vercel**: Free forever for personal projects

### Production (Recommended)
- **Railway**: ~$5-20/month (backend + database)
- **Render**: ~$7-25/month (backend + database)
- **Vercel**: Free for frontend (or Pro $20/month)

---

## 🎯 Recommended Production Setup

1. **Backend**: Railway or Render (PostgreSQL included)
2. **Frontend**: Vercel (optimized for React)
3. **Database**: PostgreSQL (via Railway/Render)
4. **Monitoring**: UptimeRobot + Sentry
5. **Domain**: Custom domain (optional, $10-15/year)

**Total Cost**: $5-20/month for production use

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)

---

## ✅ Next Steps

1. Choose your deployment platform
2. Update database configuration for PostgreSQL
3. Set up environment variables
4. Deploy backend first
5. Deploy frontend with backend URL
6. Test everything end-to-end
7. Set up monitoring
8. Share your deployed app! 🎉

