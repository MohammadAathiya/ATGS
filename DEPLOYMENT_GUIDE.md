# Deployment Guide for ATGS (Automated Timetable Generation System)

## Overview
This project consists of:
- **Frontend**: React + Vite (deployed to Vercel)
- **Backend**: Node.js + Express (deployed to Render)
- **Database**: MongoDB Atlas (cloud database)

---

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/atgs`)
5. Replace `<password>` with your actual password
6. Keep this connection string for Step 3

---

## Step 2: Deploy Backend to Render

1. Go to [Render](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `https://github.com/MohammadAathiya/ATGS`
4. Configure the service:
   - **Name**: `atgs-backend`
   - **Region**: Singapore (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=4000
   MONGO_URI=<your-mongodb-atlas-connection-string-from-step-1>
   JWT_SECRET=<generate-a-random-secret-key>
   ```
   
   To generate JWT_SECRET, run in terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

6. Click **"Create Web Service"**
7. Wait for deployment to complete (5-10 minutes)
8. Copy your backend URL (e.g., `https://atgs-backend.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `https://github.com/MohammadAathiya/ATGS`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `timetable genrator`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   - Click **"Environment Variables"**
   - Add: `VITE_API_URL` = `<your-backend-url-from-step-2>/api`
   - Example: `https://atgs-backend.onrender.com/api`

6. Click **"Deploy"**
7. Wait for deployment (2-3 minutes)
8. Your app will be live at: `https://your-project.vercel.app`

---

## Step 4: Update Backend CORS (Important!)

After deploying the frontend, you need to update the backend to allow requests from your Vercel domain.

1. Go to your Render dashboard
2. Select your `atgs-backend` service
3. Go to **"Environment"** tab
4. Add a new environment variable:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```

5. Update `backend/server.js` CORS configuration (already done in this deployment):
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || '*',
     credentials: true
   }))
   ```

---

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Try to sign up/login
3. Test timetable generation features
4. Check if data is being saved to MongoDB Atlas

---

## Troubleshooting

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel environment variables
- Check backend URL is correct and includes `/api`
- Ensure backend is running (check Render logs)

### Database connection errors
- Verify MongoDB Atlas connection string
- Ensure IP whitelist includes `0.0.0.0/0` (allow all) in MongoDB Atlas
- Check database user has read/write permissions

### Backend crashes on Render
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

---

## Free Tier Limitations

- **Render Free**: Backend may sleep after 15 minutes of inactivity (first request takes ~30s to wake up)
- **Vercel Free**: 100GB bandwidth/month
- **MongoDB Atlas Free**: 512MB storage

---

## Cost Optimization

To avoid backend sleep on Render:
- Upgrade to Render's paid plan ($7/month)
- Or use a cron job to ping your backend every 10 minutes

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
3. Check MongoDB Atlas: Clusters → Metrics

---

## Quick Reference

- **GitHub Repo**: https://github.com/MohammadAathiya/ATGS
- **Frontend Tech**: React, Vite, TailwindCSS
- **Backend Tech**: Node.js, Express, MongoDB
- **Deployment**: Vercel (Frontend) + Render (Backend) + MongoDB Atlas (Database)
