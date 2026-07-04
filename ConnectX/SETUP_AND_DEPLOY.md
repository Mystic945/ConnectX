# CampusConnect — Complete Setup & Deployment Guide

> Built by a student, for students. Unofficial, independent project.

---

## What This App Does

- College students sign up and create a profile
- They can swipe in **Social mode** (find friends, study partners, project teams) or **Dating mode**
- Mutual right-swipes create a **Match**
- Matched users can **chat in real-time**
- Built-in **report/block** system auto-deactivates accounts with 5+ reports
- College-scoped: users only see people from their own college

---

## Tech Stack

| Layer        | Tech                          | Free tier?    |
|--------------|-------------------------------|---------------|
| Frontend     | React.js                      | Yes (Vercel)  |
| Backend      | Node.js + Express             | Yes (Render)  |
| Database     | MongoDB Atlas                 | Yes (512 MB)  |
| Photos       | Cloudinary                    | Yes (25 GB)   |
| Real-time    | Socket.io                     | Included      |

---

## Step 1 — Install Node.js

Download and install **Node.js v18+** from https://nodejs.org

Check it works:
```bash
node --version   # should print v18.x.x or higher
npm --version    # should print 9.x.x or higher
```

---

## Step 2 — Set Up MongoDB Atlas (Free Database)

1. Go to https://cloud.mongodb.com and create a free account
2. Click **"Build a Database"** → choose **M0 Free** tier → region: **Mumbai (ap-south-1)**
3. Set a username + password (save these!)
4. Under **Network Access** → Add IP Address → **Allow access from anywhere** (0.0.0.0/0)
5. Click **"Connect"** on your cluster → **"Connect your application"**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://yourname:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Change `/?retryWrites` to `/campusconnect?retryWrites` in the string

---

## Step 3 — Set Up Cloudinary (Free Photo Storage)

1. Go to https://cloudinary.com and sign up free
2. On your dashboard, note down:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## Step 4 — Set Up the Project Locally

```bash
# 1. Open terminal, go to your project folder
cd campusconnect

# 2. Install root dependencies
npm install

# 3. Install server dependencies
cd server
npm install
cd ..

# 4. Install client dependencies
cd client
npm install
cd ..
```

---

## Step 5 — Configure Environment Variables

### Server (.env)
```bash
# In the server/ folder, create a file named .env
# Copy from .env.example and fill in your values:

PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://yourname:yourpassword@cluster0.xxxxx.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=paste_a_long_random_string_here_at_least_64_chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

To generate a strong JWT secret, run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Client (.env)
```bash
# In the client/ folder, create a file named .env:

REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## Step 6 — Run Locally

```bash
# From the root campusconnect/ folder:
npm run dev
```

This starts:
- Backend at http://localhost:5000
- Frontend at http://localhost:3000

Open http://localhost:3000 in your browser — you should see the landing page!

**Test the flow:**
1. Register an account
2. Complete profile setup (add a photo, bio, interests)
3. Register a second account in another browser/incognito tab
4. Swipe right on each other → you'll get a match
5. Open chat and send a message

---

## Step 7 — Push to GitHub

```bash
# One-time setup
git init
git add .
git commit -m "Initial commit: CampusConnect"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/campusconnect.git
git branch -M main
git push -u origin main
```

---

## Step 8 — Deploy Backend to Render (Free)

1. Go to https://render.com → sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name:** campusconnect-api
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Region:** Singapore (closest to India, free tier)
5. Click **"Advanced"** → **Add Environment Variables** — add ALL variables from your server `.env`:
   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = (your Atlas string)
   JWT_SECRET = (your secret)
   CLOUDINARY_CLOUD_NAME = (from Cloudinary)
   CLOUDINARY_API_KEY = (from Cloudinary)
   CLOUDINARY_API_SECRET = (from Cloudinary)
   CLIENT_URL = https://your-app.vercel.app   ← update this after step 9
   ```
6. Click **"Create Web Service"**
7. Wait ~3-5 minutes for the first deploy
8. Copy your Render URL — it looks like `https://campusconnect-api.onrender.com`

> **Note:** On Render free tier, the server "sleeps" after 15 minutes of inactivity. First request after sleep takes ~30 seconds. This is fine for testing. Upgrade to $7/month plan when you launch to fix this.

---

## Step 9 — Deploy Frontend to Vercel (Free)

1. Go to https://vercel.com → sign up with GitHub
2. Click **"New Project"** → import your GitHub repo
3. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `client`
4. Click **"Environment Variables"** → add:
   ```
   REACT_APP_API_URL = https://campusconnect-api.onrender.com/api
   REACT_APP_SOCKET_URL = https://campusconnect-api.onrender.com
   ```
5. Click **"Deploy"**
6. Wait ~2 minutes → you'll get a URL like `https://campusconnect.vercel.app`

---

## Step 10 — Update CORS on Backend

Go back to Render → your service → **Environment** → update:
```
CLIENT_URL = https://campusconnect.vercel.app
```

Then redeploy (Render auto-deploys on env changes).

---

## Your App is Live! 🎉

Share the Vercel URL with your friends from college.

---

## Troubleshooting

**"Cannot connect to MongoDB"**
→ Check your MONGODB_URI in Render environment variables. Make sure your Atlas cluster allows all IPs (0.0.0.0/0).

**Photos not uploading**
→ Verify Cloudinary credentials are correct in Render env vars.

**"CORS error" in browser console**
→ Make sure CLIENT_URL in Render exactly matches your Vercel URL (no trailing slash).

**Render backend not waking up**
→ First request after sleep takes 30s. Refresh after 30 seconds.

**Socket.io not connecting**
→ Make sure REACT_APP_SOCKET_URL points to your Render URL, not localhost.

**"Network error" from React**
→ Check REACT_APP_API_URL in your Vercel environment — redeploy if you changed it.

---

## Day-by-Day 15-Day Build Plan

| Day | Focus |
|-----|-------|
| 1-2 | Set up project, install everything, get backend + MongoDB running |
| 3   | Auth working (register/login/JWT) |
| 4   | Profile setup page + Cloudinary photo upload |
| 5   | Swipe/Discover page with TinderCard |
| 6   | Swipe logic on backend, match detection |
| 7   | Matches list page |
| 8   | Real-time chat with Socket.io |
| 9   | Edit profile, polish UI on mobile |
| 10  | Report/block system |
| 11  | Testing — find and fix bugs |
| 12  | Push to GitHub, deploy backend to Render |
| 13  | Deploy frontend to Vercel, end-to-end test |
| 14  | Share with 5-10 classmates for feedback |
| 15  | Fix issues from feedback, launch to your college |

---

## How to Expand to More Maharashtra Colleges (Phase 2)

When you're ready to scale beyond your college:

1. The `college` field on users already supports any college name
2. Update `RegisterPage.js` → `MAHARASHTRA_COLLEGES` array — it already has 15+ colleges listed
3. Add more colleges to that list
4. In `SwipePage.js`, the discovery filter already scopes by `college` — so each college pool is automatically isolated
5. Add a "Discover outside my college" toggle option later

You'll also want to:
- Upgrade MongoDB Atlas to M2/M5 when you hit 500+ users
- Upgrade Render to $7/month Starter plan to remove the sleep issue
- Add email OTP verification (Nodemailer + Gmail SMTP) for account security

---

## File Structure Reference

```
campusconnect/
├── client/                    ← React frontend (deploy to Vercel)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js             ← Routes
│   │   ├── index.js           ← Entry point
│   │   ├── styles/
│   │   │   └── global.css     ← All global styles + CSS variables
│   │   ├── utils/
│   │   │   └── api.js         ← Axios with JWT interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.js ← User auth state
│   │   │   └── SocketContext.js ← Real-time socket
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── SetupProfilePage.js
│   │   │   ├── SwipePage.js   ← Main swipe UI
│   │   │   ├── MatchesPage.js
│   │   │   ├── ChatPage.js    ← Real-time chat
│   │   │   ├── ProfilePage.js
│   │   │   └── EditProfilePage.js
│   │   └── components/
│   │       ├── Layout.js      ← Bottom nav
│   │       └── MatchModal.js  ← "It's a Match!" popup
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
│
├── server/                    ← Node.js backend (deploy to Render)
│   ├── index.js               ← Express + Socket.io server
│   ├── models/
│   │   ├── User.js
│   │   ├── Match.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js            ← /api/auth/*
│   │   ├── users.js           ← /api/users/*  (discover, swipe, report)
│   │   ├── matches.js         ← /api/matches/*
│   │   ├── messages.js        ← /api/messages/*
│   │   └── upload.js          ← /api/upload/*  (Cloudinary)
│   ├── middleware/
│   │   └── auth.js            ← JWT protect middleware
│   ├── .env.example
│   └── package.json
│
├── render.yaml                ← Render deployment config
├── .gitignore
├── package.json               ← Root (runs both with concurrently)
└── SETUP_AND_DEPLOY.md        ← This file
```

---

*This is an unofficial, independent student project. Not affiliated with any college, university, or institution.*
