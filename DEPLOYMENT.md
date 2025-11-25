# NeuroSciRank Deployment Guide

This guide walks you through deploying NeuroSciRank to production using Render (backend) and Netlify (frontend).

## Prerequisites

- GitHub account with your NeuroSciRank repository
- Render account (https://render.com)
- Netlify account (https://netlify.com)
- Telegram Bot Token (from @BotFather)

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database

1. In Render Dashboard, click **"New"** → **"PostgreSQL"**
2. Fill in:
   - **Name:** `neurosci-db`
   - **Database:** `neurosci`
   - **User:** `neurosci_user`
   - **Region:** Choose closest to you
   - **Plan:** Free (or Starter if you want better performance)
3. Click **"Create Database"**
4. Wait for database to be created (2-3 minutes)
5. Copy the **Internal Database URL** (you'll need this)

### Step 3: Create Web Service for Backend

1. Click **"New"** → **"Web Service"**
2. Select your GitHub repository
3. Fill in:
   - **Name:** `neurosci-backend`
   - **Environment:** `Node`
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
   - **Plan:** Free (or Starter)

### Step 4: Add Environment Variables

Click **"Advanced"** and add these environment variables:

```
DATABASE_URL=<paste the Internal Database URL from Step 2>
JWT_SECRET=<generate a random string, e.g., use: openssl rand -base64 32>
VITE_APP_ID=test-app-id
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=test-owner-id
OWNER_NAME=Test Owner
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
VITE_APP_TITLE=NeuroSciRank
VITE_APP_LOGO=/logo.svg
NODE_ENV=production
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (3-5 minutes)
3. Once deployed, you'll see a URL like: `https://neurosci-backend.onrender.com`
4. **Copy this URL** - you'll need it for the frontend

### Step 6: Run Database Migrations

1. In Render, go to your web service
2. Click **"Shell"** tab
3. Run:
   ```bash
   pnpm db:push
   ```
4. Wait for migrations to complete

**Your backend is now live!** ✅

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Create Netlify Account

1. Go to https://netlify.com
2. Sign up with GitHub
3. Authorize Netlify to access your repositories

### Step 2: Connect Repository

1. Click **"Add new site"** → **"Import an existing project"**
2. Select your GitHub repository
3. Netlify will auto-detect the build settings

### Step 3: Configure Build Settings

Make sure these are set:

- **Build command:** `pnpm run build`
- **Publish directory:** `dist`
- **Node version:** 22.13.0

### Step 4: Add Environment Variables

In Netlify dashboard, go to **Site settings** → **Build & deploy** → **Environment**

Add these variables:

```
VITE_API_URL=https://neurosci-backend.onrender.com
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
VITE_APP_TITLE=NeuroSciRank
VITE_APP_LOGO=/logo.svg
```

**Replace `https://neurosci-backend.onrender.com` with your actual Render backend URL from Part 1!**

### Step 5: Deploy

1. Click **"Deploy site"**
2. Wait for deployment (2-3 minutes)
3. Once deployed, you'll see a URL like: `https://neurosci-rank.netlify.app`
4. **Copy this URL** - you'll need it for Telegram

**Your frontend is now live!** ✅

---

## Part 3: Integrate with Telegram Bot

### Step 1: Create Bot with @BotFather

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Follow the prompts:
   - **Name:** NeuroSciRank (or whatever you want)
   - **Username:** neurosci_rank_bot (must be unique)
4. You'll get a **Token** - save it!

Example token: `123456789:ABCdefGHIjklmnoPQRstuvWXYZ`

### Step 2: Set Menu Button

1. Send `/setmenubutton` to @BotFather
2. Select your bot
3. Choose **"Web App"**
4. Enter the URL: `https://neurosci-rank.netlify.app` (your Netlify URL)
5. Enter the label: `Open App`

### Step 3: Test in Telegram

1. Search for your bot in Telegram
2. Click the **"Open App"** button
3. Your NeuroSciRank app should open inside Telegram! 🎉

---

## Troubleshooting

### Backend won't deploy on Render

**Problem:** Build fails with "pnpm not found"

**Solution:** 
1. Go to Render Web Service settings
2. Add environment variable: `PNPM_VERSION=10.4.1`
3. Redeploy

### Frontend shows "Cannot connect to API"

**Problem:** Frontend can't reach backend

**Solution:**
1. Check that `VITE_API_URL` is set correctly in Netlify
2. Make sure it's the full URL: `https://neurosci-backend.onrender.com`
3. Check Render backend is running (not sleeping)
4. Redeploy frontend

### Database migrations fail

**Problem:** `pnpm db:push` fails in Render shell

**Solution:**
1. Check DATABASE_URL is correct
2. Make sure it's the **Internal Database URL** (not external)
3. Run migrations locally first: `pnpm db:push`
4. Then push to GitHub and redeploy

### Telegram WebApp shows blank page

**Problem:** App opens but shows nothing

**Solution:**
1. Check browser console for errors
2. Verify `VITE_API_URL` is set in Netlify
3. Check that backend is responding to requests
4. Try hard refresh (Ctrl+Shift+R)

---

## Monitoring & Maintenance

### Check Backend Status

1. Go to Render Dashboard
2. Click your web service
3. Check **Logs** for errors
4. Monitor **CPU** and **Memory** usage

### Check Frontend Status

1. Go to Netlify Dashboard
2. Click your site
3. Check **Deploy log** for build errors
4. Monitor **Analytics** for traffic

### Update Code

To update your app:

1. Make changes locally
2. Commit and push to GitHub
3. Both Render and Netlify will auto-deploy

---

## Performance Tips

1. **Render Free Plan:** App sleeps after 15 minutes of inactivity. Upgrade to Starter for always-on.
2. **Database:** Free PostgreSQL has limited resources. Consider upgrading for production.
3. **Caching:** Enable caching in Netlify for faster loads.
4. **CDN:** Netlify includes CDN by default.

---

## Next Steps

1. ✅ Backend deployed on Render
2. ✅ Frontend deployed on Netlify
3. ✅ Telegram Bot integrated
4. 🔄 Add test data to your database
5. 🔄 Customize branding (logo, colors)
6. 🔄 Promote your bot to users

---

## Support

If you run into issues:

1. Check the **Logs** in Render and Netlify
2. Review this guide's **Troubleshooting** section
3. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
4. Check [README.md](./README.md) for local development

Good luck! 🚀
