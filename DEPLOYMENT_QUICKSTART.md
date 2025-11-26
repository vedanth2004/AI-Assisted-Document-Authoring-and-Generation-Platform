# 🚀 Quick Deployment Guide

Choose your platform and follow the steps below.

## Option 1: Railway (Recommended - 10 minutes)

### Why Railway?
- ✅ Free tier ($5 credit/month)
- ✅ Automatic HTTPS
- ✅ PostgreSQL included
- ✅ Deploy both backend + frontend
- ✅ Auto-deploy on git push

### Steps:

#### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Deploy Backend
1. Go to [railway.app](https://railway.app) → Sign up/Login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Python → Configure:
   - **Root Directory**: `backend`
   - **Build Command**: (auto-detected)
   - **Start Command**: (auto-detected)

5. **Add PostgreSQL Database**:
   - In project → Click "+ New" → "Database" → "PostgreSQL"
   - Railway auto-creates `DATABASE_URL`

6. **Set Environment Variables**:
   - Go to backend service → Variables
   - Add:
     ```
     SECRET_KEY=<generate-random-string>
     GEMINI_API_KEY=<your-gemini-key>
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     ```
   - To generate SECRET_KEY: `openssl rand -hex 32` or use online generator

7. **Get Backend URL**:
   - Railway provides: `https://your-backend.railway.app`
   - Copy this URL

#### 3. Deploy Frontend
1. In same Railway project → "+ New" → "Empty Service"
2. Connect GitHub → Select same repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l $PORT`

4. **Set Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   ```

5. **Install `serve` package** (if not working):
   - Add to `frontend/package.json`:
     ```json
     "serve": "^14.2.1"
     ```
   - Or change Start Command to: `npx serve -s build -l $PORT`

#### 4. Update CORS (Backend)
In `backend/main.py`, set environment variable:
```
FRONTEND_URL=https://your-frontend.railway.app
```

#### 5. Test
- Frontend: `https://your-frontend.railway.app`
- Backend: `https://your-backend.railway.app/api/health`

✅ **Done!** Your app is live!

---

## Option 2: Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. "New Project" → Import GitHub repo
3. Configure:
   - **Framework Preset**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   ```

5. Deploy → Done!

### Backend on Railway
- Follow Option 1, Step 2 (Deploy Backend)

---

## Option 3: Render (Free Tier)

**📖 For detailed Render deployment guide, see [RENDER_DEPLOYMENT.md](../RENDER_DEPLOYMENT.md)**

### Quick Steps:

1. **PostgreSQL**: "New +" → "PostgreSQL" → Get Internal Database URL
2. **Backend**: "New +" → "Web Service" → Root: `backend` → Set env vars
3. **Frontend**: "New +" → "Static Site" → Root: `frontend` → Set `REACT_APP_API_URL`
4. **CORS**: Update `FRONTEND_URL` in backend after frontend deploys

**See [RENDER_DEPLOYMENT.md](../RENDER_DEPLOYMENT.md) for complete step-by-step guide.**

---

## 🔑 Generate SECRET_KEY

**Option 1: OpenSSL (Terminal)**
```bash
openssl rand -hex 32
```

**Option 2: Python**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Option 3: Online**
- Visit: https://generate-secret.vercel.app/32

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check works: `/api/health`
- [ ] Frontend loads without errors
- [ ] User can register/login
- [ ] Projects can be created
- [ ] Content generation works
- [ ] Export works
- [ ] No CORS errors in browser console
- [ ] HTTPS is enabled (automatic on Railway/Vercel/Render)

---

## 🐛 Troubleshooting

### Backend not starting
- Check logs on Railway/Render
- Verify all environment variables are set
- Ensure `DATABASE_URL` is correct

### CORS errors
- Update `FRONTEND_URL` in backend environment variables
- Check backend logs for CORS configuration

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is set correctly
- Check backend URL is accessible
- Ensure backend CORS allows frontend URL

### Database errors
- Verify PostgreSQL is running
- Check `DATABASE_URL` format is correct
- Ensure `psycopg2-binary` is installed

---

## 📊 Cost Estimates

### Free Tier (Testing/Development)
- **Railway**: $5 free credit/month (good for testing)
- **Render**: Free tier (with limitations)
- **Vercel**: Free forever for personal projects

### Production (Recommended)
- **Railway**: ~$5-20/month
- **Render**: ~$7-25/month
- **Vercel**: Free (or Pro $20/month)

**Total**: $5-20/month for full production deployment

---

## 🎯 Recommended Setup

1. **Development**: Railway free tier
2. **Production**: Railway Pro + Vercel (frontend)
3. **Database**: PostgreSQL (via Railway/Render)

**Ready to deploy?** Start with Option 1 (Railway) - it's the easiest! 🚀

