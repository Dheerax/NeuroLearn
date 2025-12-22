# NeuroLearn - Render Deployment Guide

## Overview

Deploy NeuroLearn on Render with 3 services:

- **Frontend**: Static Site (React/Vite)
- **Backend**: Web Service (Node.js/Express)
- **ML API**: Web Service (Python/Flask) - Optional

---

## Prerequisites

1. Push your code to GitHub
2. Create a [Render account](https://render.com)
3. Have your MongoDB Atlas connection string ready

---

## Step 1: Prepare Environment Variables

You'll need these environment variables:

### Backend (.env)

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/neurolearn
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### Frontend (.env)

```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_ML_API_URL=https://your-ml-api-url.onrender.com
```

---

## Step 2: Deploy Backend (Node.js)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:

| Setting        | Value                        |
| -------------- | ---------------------------- |
| Name           | `neurolearn-backend`         |
| Region         | Choose closest to your users |
| Branch         | `main`                       |
| Root Directory | `server`                     |
| Runtime        | `Node`                       |
| Build Command  | `npm install`                |
| Start Command  | `node index.js`              |
| Instance Type  | Free                         |

5. Add Environment Variables:

   - `MONGODB_URI` = your MongoDB Atlas URI
   - `JWT_SECRET` = generate a random secret
   - `NODE_ENV` = `production`
   - `PORT` = `3001`

6. Click **Create Web Service**

---

## Step 3: Deploy Frontend (Vite/React)

1. Click **New** → **Static Site**
2. Connect your GitHub repo
3. Configure:

| Setting           | Value                          |
| ----------------- | ------------------------------ |
| Name              | `neurolearn-frontend`          |
| Branch            | `main`                         |
| Root Directory    | `` (leave empty)               |
| Build Command     | `npm install && npm run build` |
| Publish Directory | `dist`                         |

4. Add Environment Variables:

   - `VITE_API_URL` = `https://neurolearn-backend.onrender.com/api`
   - `VITE_GEMINI_API_KEY` = your Gemini API key

5. Click **Create Static Site**

---

## Step 4: Deploy ML API (Python) - Optional

1. Click **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting        | Value                             |
| -------------- | --------------------------------- |
| Name           | `neurolearn-ml-api`               |
| Branch         | `main`                            |
| Root Directory | `ml`                              |
| Runtime        | `Python 3`                        |
| Build Command  | `pip install -r requirements.txt` |
| Start Command  | `python api_server.py`            |
| Instance Type  | Free                              |

4. Add Environment Variables:
   - `PORT` = `5000`
   - `FLASK_ENV` = `production`

---

## Step 5: Update CORS Settings

Make sure your backend allows the frontend URL. In `server/index.js`:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://neurolearn-frontend.onrender.com", // Add your frontend URL
    process.env.FRONTEND_URL,
  ],
  credentials: true,
};
```

---

## Step 6: Update Frontend API URLs

After deployment, update your `.env` with actual URLs:

```
VITE_API_URL=https://neurolearn-backend.onrender.com/api
VITE_ML_API_URL=https://neurolearn-ml-api.onrender.com
```

Then trigger a redeploy on Render.

---

## Render.yaml (Blueprint - Alternative Method)

You can also use `render.yaml` for one-click deploy. See the file in your repo.

---

## Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend.onrender.com/api/health`
- [ ] Frontend loads correctly
- [ ] Login/Register works
- [ ] MongoDB connection successful
- [ ] Gemini AI responds
- [ ] ML API (if deployed) responds

---

## Troubleshooting

### "Service unavailable" after deploy

- Free tier services spin down after 15 mins of inactivity
- First request takes ~30 seconds to wake up

### CORS errors

- Check `FRONTEND_URL` env variable in backend
- Update CORS origins in `server/index.js`

### MongoDB connection failed

- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- Check `MONGODB_URI` is correct

### Build fails

- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`

---

## Tips for Free Tier

1. **Spin-down**: Free services sleep after 15 mins. Use [cron-job.org](https://cron-job.org) to ping every 14 mins to keep alive.

2. **Upgrade when needed**: For production, use paid tier ($7/month) for:

   - No spin-down
   - Custom domains
   - Better performance

3. **Environment**: Set `NODE_ENV=production` for better performance.

---

## Quick Reference URLs

After deployment, your URLs will be:

- Frontend: `https://neurolearn-frontend.onrender.com`
- Backend API: `https://neurolearn-backend.onrender.com/api`
- ML API: `https://neurolearn-ml-api.onrender.com`

---

Good luck with your deployment! 🚀
