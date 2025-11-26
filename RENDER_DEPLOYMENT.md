# 🚀 Render Deployment Guide

Complete step-by-step guide to deploy your AI Document Authoring Platform on Render.

---

## 📋 Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))
- Your code pushed to a GitHub repository
- Gemini API key (from [Google AI Studio](https://makersuite.google.com/app/apikey))

---

## 🎯 Overview

You'll deploy:
1. **PostgreSQL Database** (separate service)
2. **Backend API** (Python/FastAPI Web Service)
3. **Frontend** (React Static Site)

**Estimated Time:** 15-20 minutes

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Ensure all files are committed

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 1.2 Verify these files exist:
- ✅ `backend/main.py`
- ✅ `backend/requirements.txt`
- ✅ `backend/Procfile` (optional, Render can auto-detect)
- ✅ `frontend/package.json`

---

## 🗄️ Step 2: Deploy PostgreSQL Database

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Sign up or log in

2. **Create PostgreSQL Database**
   - Click **"New +"** → **"PostgreSQL"**
   - Configure:
     - **Name**: `ai-document-db` (or your preferred name)
     - **Database**: `ai_document_db` (auto-generated)
     - **User**: `ai_document_user` (auto-generated)
     - **Region**: Choose closest to you
     - **PostgreSQL Version**: Latest (15 or 16)
     - **Plan**: **Free** (for testing) or **Starter** ($7/month for production)

3. **Get Database URL**
   - After creation, click on the database service
   - Go to **"Connections"** tab
   - Copy the **"Internal Database URL"** (we'll use this later)
   - Format: `postgresql://user:password@host:port/dbname`
   - **Note**: Render provides both Internal and External URLs. Use **Internal** for backend service.

4. **Save the credentials** (you'll need them for backend)

---

## ⚙️ Step 3: Deploy Backend (FastAPI)

### 3.1 Create Web Service

1. **Create New Web Service**
   - In Render Dashboard, click **"New +"** → **"Web Service"**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click **"Connect"**

2. **Configure Backend Service**
   
   Fill in the following:
   
   - **Name**: `ai-document-backend` (or your preferred name)
   - **Region**: Same region as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend` ⚠️ **IMPORTANT**: Set this!
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```
     pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: 
     - **Free** (for testing - spins down after 15 min inactivity)
     - **Starter** ($7/month - always on, recommended for production)

3. **Set Environment Variables**

   Click **"Advanced"** → **"Add Environment Variable"** and add:

   ```
   SECRET_KEY=your-random-secret-key-here
   ```
   *Generate with: `python -c "import secrets; print(secrets.token_hex(32))"`*

   ```
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
   *Your Google Gemini API key*

   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ```
   *Use the Internal Database URL from Step 2*

   ```
   FRONTEND_URL=https://your-frontend.onrender.com
   ```
   *We'll update this after frontend is deployed (for now, use a placeholder or leave as `http://localhost:3000`)*

   ```
   ENVIRONMENT=production
   ```
   *Optional: Set to production mode*

4. **Deploy**
   - Click **"Create Web Service"**
   - Render will build and deploy your backend
   - Wait for deployment to complete (3-5 minutes)
   - **Note**: First deployment takes longer due to dependency installation

5. **Get Backend URL**
   - Once deployed, you'll see: `https://ai-document-backend.onrender.com` (or your service name)
   - **Copy this URL** - you'll need it for the frontend
   - ⚠️ **Important**: On free tier, first request after inactivity takes 30-60 seconds (cold start)

6. **Test Backend**
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should return: `{"status": "healthy"}`
   - If not, check **"Logs"** tab for errors

---

## 🎨 Step 4: Deploy Frontend (React)

### 4.1 Create Static Site

1. **Create Static Site**
   - In Render Dashboard, click **"New +"** → **"Static Site"**
   - Connect your GitHub account if not already connected
   - Select the same repository
   - Click **"Connect"**

2. **Configure Frontend Service**
   
   Fill in:
   
   - **Name**: `ai-document-frontend` (or your preferred name)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT**: Set this!
   - **Build Command**: 
     ```
     npm install && npm run build
     ```
   - **Publish Directory**: `build`
   - **Node Version**: `18` or `20` (Render will auto-detect)

3. **Set Environment Variables**

   Click **"Advanced"** → **"Add Environment Variable"**:
   
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```
   *Replace `your-backend` with your actual backend service name from Step 3*
   
   ⚠️ **Important**: 
   - Don't include trailing slash: `https://backend.onrender.com` ✅ (not `/api`)
   - Don't add `/api` here - the frontend code already handles the `/api` prefix

4. **Deploy**
   - Click **"Create Static Site"**
   - Render will build and deploy your frontend (2-3 minutes)
   - Once deployed, you'll get a URL like: `https://ai-document-frontend.onrender.com`

5. **Test Frontend**
   - Visit your frontend URL
   - Should see the login/register page
   - Check browser console (F12) for any errors

---

## 🔄 Step 5: Update CORS (Backend)

After frontend is deployed, update the backend CORS settings:

1. **Go to Backend Service** in Render Dashboard
2. **Environment** tab
3. **Update `FRONTEND_URL`**:
   ```
   FRONTEND_URL=https://ai-document-frontend.onrender.com
   ```
   *Replace with your actual frontend URL*

4. **Manual Deploy**
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - This redeploys with updated CORS settings

---

## ✅ Step 6: Testing & Verification

### 6.1 Test Checklist

- [ ] **Backend Health**: Visit `https://your-backend.onrender.com/api/health` → Should return `{"status": "healthy"}`
- [ ] **Frontend Loads**: Visit frontend URL → Should show login page
- [ ] **Registration**: Create a new account
- [ ] **Login**: Log in with created account
- [ ] **Create Project**: Create a new project
- [ ] **AI Outline**: Test AI-suggested outline generation
- [ ] **Content Generation**: Generate content for sections
- [ ] **Export**: Test document export (Word/PowerPoint)
- [ ] **No CORS Errors**: Check browser console (F12) → No CORS errors

### 6.2 Common Issues

**Backend not responding:**
- Check **Logs** tab in Render for errors
- Verify all environment variables are set correctly
- Ensure `DATABASE_URL` is the Internal URL (not External)
- On free tier, wait 30-60 seconds for first request (cold start)

**Frontend can't connect to backend:**
- Verify `REACT_APP_API_URL` is set correctly (no trailing slash)
- Check backend CORS allows frontend URL
- Ensure backend URL is accessible: `https://backend.onrender.com/api/health`

**Database connection errors:**
- Verify `DATABASE_URL` uses Internal URL format
- Check database service is running
- Ensure `psycopg2-binary` is in `requirements.txt`

**CORS errors:**
- Update `FRONTEND_URL` in backend environment variables
- Redeploy backend after updating CORS
- Check browser console for exact error message

---

## 📊 Render Free Tier Limitations

⚠️ **Important Notes for Free Tier:**

1. **Spinning Down**: Services spin down after 15 minutes of inactivity
2. **Cold Starts**: First request after spin-down takes 30-60 seconds
3. **Build Minutes**: 500 build minutes/month (usually enough for testing)
4. **Database**: 
   - 90 days retention (data deleted after 90 days)
   - No backups
   - Limited to 1GB storage
5. **Bandwidth**: 100GB/month

**For Production**, consider:
- **Starter Plan** ($7/month): Always-on backend, better performance
- **Database**: Starter plan ($7/month): Persistent storage, backups

---

## 🔧 Advanced Configuration

### Custom Domain (Optional)

1. **Add Domain to Frontend**
   - Go to frontend service → **"Settings"** → **"Custom Domains"**
   - Add your domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Update `FRONTEND_URL` in backend with custom domain
   - Redeploy backend

### Health Checks

Render automatically pings your service. For backend, ensure `/api/health` endpoint works (already included).

### Logs

- **View Logs**: Click on service → **"Logs"** tab
- **Real-time**: Logs update in real-time
- **Search**: Use search box to filter logs

### Auto-Deploy

- Render auto-deploys on git push by default
- To disable: Settings → **"Auto-Deploy"** → Toggle off
- **Manual Deploy**: Available in **"Manual Deploy"** tab

---

## 🔐 Security Checklist

- [ ] Use strong `SECRET_KEY` (32+ characters, random)
- [ ] Never commit `.env` files to Git
- [ ] Use Internal Database URL (not External) for backend
- [ ] Enable HTTPS (automatic on Render)
- [ ] CORS configured to allow only your frontend domain
- [ ] Environment variables secured in Render dashboard
- [ ] Database credentials not exposed

---

## 📝 Environment Variables Summary

### Backend Environment Variables:
```
SECRET_KEY=your-random-secret-key
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=postgresql://... (Internal URL from PostgreSQL service)
FRONTEND_URL=https://your-frontend.onrender.com
ENVIRONMENT=production (optional)
```

### Frontend Environment Variables:
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## 🚀 Quick Deploy Commands

### If you need to redeploy:

1. **Backend**: 
   - Make changes → Commit → Push to GitHub
   - Render auto-deploys
   - Or: Manual Deploy → Deploy latest commit

2. **Frontend**:
   - Make changes → Commit → Push to GitHub
   - Render auto-deploys
   - Or: Manual Deploy → Deploy latest commit

### Force Redeploy:

```
# Make a small change (add comment, etc.)
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## 💰 Cost Estimate

### Free Tier (Testing/Development):
- **Backend**: Free (with limitations)
- **Frontend**: Free
- **Database**: Free (90-day retention)
- **Total**: $0/month

### Starter Plan (Production Recommended):
- **Backend**: $7/month (always-on)
- **Frontend**: Free (static sites are free)
- **Database**: $7/month (persistent storage)
- **Total**: ~$14/month

### Professional Plan (High Traffic):
- **Backend**: $25/month (better performance)
- **Frontend**: Free
- **Database**: $20/month (more storage)
- **Total**: ~$45/month

---

## 🎉 You're Live!

Your AI Document Authoring Platform is now deployed on Render!

- **Frontend**: `https://your-frontend.onrender.com`
- **Backend**: `https://your-backend.onrender.com`
- **API Health**: `https://your-backend.onrender.com/api/health`

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Render Community](https://community.render.com/)

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Logs**: Service → Logs tab
2. **Verify Environment Variables**: All required variables are set
3. **Test Endpoints**: Use curl or Postman to test backend directly
4. **Render Status**: Check [status.render.com](https://status.render.com)
5. **Community Support**: [community.render.com](https://community.render.com)

---

## ✅ Next Steps

1. ✅ Test all features end-to-end
2. ✅ Set up monitoring (optional: UptimeRobot)
3. ✅ Configure custom domain (optional)
4. ✅ Set up database backups (if using paid plan)
5. ✅ Add error tracking (optional: Sentry)
6. ✅ Monitor usage and costs

**Happy Deploying! 🚀**

