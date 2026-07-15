# ConnectX 🎓

> A social networking and dating web app built for college students in Maharashtra.
> Find study partners, project teammates, friends, or something more — all within your campus.
> Link for ConnectX: https://connect-x-blond.vercel.app/

---

## What is ConnectX?

ConnectX is a full-stack web application inspired by Tinder, designed specifically for college students. It has two core modes:

- **Social Connect** — find study partners, project teammates, hackathon collaborators, or just friends
- **Dating** — swipe-based matching for students looking for something more

Discovery is scoped to your college — you only see people from your own campus, keeping it safe and relevant. When two people swipe right on each other, they match and can chat in real-time.

---

## Features

- 🔐 **JWT Auth** — secure register/login with bcrypt password hashing
- 🃏 **Swipe UI** — Tinder-style card swiping with like and pass buttons
- ✨ **Dual Mode** — toggle between Social Connect and Dating discovery
- 💬 **Real-time Chat** — Socket.io powered messaging with typing indicators
- 📸 **Photo Uploads** — up to 6 profile photos via Cloudinary
- 🎯 **Profile Tags** — interests, skills, and "looking for" labels (study partner, project team, dating, etc.)
- 🏫 **College-scoped** — users only discover others from their own college
- 🚩 **Report & Block** — safety system that auto-deactivates accounts after 5 reports
- 📱 **Mobile-first** — responsive design built for phones

---

## Tech Stack

| Layer | Technology | Hosting (Free Tier) |
|---|---|---|
| Frontend | React.js | Vercel |
| Backend | Node.js + Express | Render |
| Database | MongoDB + Mongoose | MongoDB Atlas |
| Real-time | Socket.io | — (included in backend) |
| Photos | Cloudinary | Cloudinary (25 GB free) |
| Auth | JWT + bcryptjs | — |

---

## Project Structure

```
connectx/
├── client/                        ← React frontend → deploy to Vercel
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js                 ← All routes
│   │   ├── index.js               ← Entry point
│   │   ├── styles/
│   │   │   └── global.css         ← CSS variables + global styles
│   │   ├── utils/
│   │   │   └── api.js             ← Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.js     ← Global user auth state
│   │   │   └── SocketContext.js   ← Socket.io connection + events
│   │   ├── pages/
│   │   │   ├── LandingPage.js     ← Public homepage
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js    ← Includes Maharashtra college list
│   │   │   ├── SetupProfilePage.js ← 3-step onboarding wizard
│   │   │   ├── SwipePage.js       ← Main swipe/discover screen
│   │   │   ├── MatchesPage.js     ← All matches + last message preview
│   │   │   ├── ChatPage.js        ← Real-time 1-on-1 chat
│   │   │   ├── ProfilePage.js     ← View own or other user's profile
│   │   │   └── EditProfilePage.js ← Edit bio, photos, preferences
│   │   └── components/
│   │       ├── Layout.js          ← App shell + bottom navigation bar
│   │       └── MatchModal.js      ← "It's a Match!" celebration popup
│   ├── .env.example
│   ├── package.json
│   └── vercel.json                ← SPA routing fix for Vercel
│
├── server/                        ← Node.js backend → deploy to Render
│   ├── index.js                   ← Express app + Socket.io server
│   ├── models/
│   │   ├── User.js                ← User schema (auth, profile, swipes, matches)
│   │   ├── Match.js               ← Match schema (roomId, matchType)
│   │   └── Message.js             ← Message schema (roomId, sender, content)
│   ├── routes/
│   │   ├── auth.js                ← POST /api/auth/register, /login, GET /me
│   │   ├── users.js               ← GET /discover, POST /swipe, /report, /block
│   │   ├── matches.js             ← GET /matches, DELETE /:id
│   │   ├── messages.js            ← GET + POST /messages/:roomId
│   │   └── upload.js              ← POST + DELETE /upload/photo (Cloudinary)
│   ├── middleware/
│   │   └── auth.js                ← JWT protect middleware
│   ├── .env.example
│   └── package.json
│
├── render.yaml                    ← Render auto-deploy config
├── .gitignore
├── package.json                   ← Root scripts (runs both with concurrently)
└── SETUP_AND_DEPLOY.md            ← Full deployment walkthrough
```

---

## Local Setup

### Prerequisites

- Node.js v18 or higher — download from [nodejs.org](https://nodejs.org)
- A free [MongoDB Atlas](https://cloud.mongodb.com) account
- A free [Cloudinary](https://cloudinary.com) account

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/connectx.git
cd connectx
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Set up environment variables

**Server** — create `server/.env` (copy from `server/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/connectx?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Client** — create `client/.env` (copy from `client/.env.example`):

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Run the app

```bash
# From the root folder — starts both frontend and backend
npm run dev
```

- Backend runs at `http://localhost:5000`
- Frontend runs at `http://localhost:3000`

### 5. Test the full flow

1. Register an account at `http://localhost:3000/register`
2. Complete the 3-step profile setup (photo, bio, preferences)
3. Open an incognito tab and register a second account from the same college
4. Swipe right on each other from both accounts → match popup appears
5. Open chat and send a message — it arrives in real-time

---

## Deployment

### Backend → Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Region:** Singapore *(closest free-tier region to India)*
4. Add all variables from `server/.env` under **Environment**
5. Set `CLIENT_URL` to your Vercel URL (after the next step)
6. Deploy — your API will be live at `https://connectx-api.onrender.com`

> **Free tier note:** Render spins down idle servers after 15 minutes. The first request after sleep takes ~30 seconds. Fine for testing; upgrade to the $7/month plan before a real launch.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo
2. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Create React App
3. Add environment variables:
   ```
   REACT_APP_API_URL = https://connectx-api.onrender.com/api
   REACT_APP_SOCKET_URL = https://connectx-api.onrender.com
   ```
4. Deploy — your app will be live at `https://connectx.vercel.app`

### Final step — update CORS

Go back to Render → your service → **Environment** → set:
```
CLIENT_URL = https://connectx.vercel.app
```
Render will auto-redeploy. Your app is now fully live. 🎉

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (auth required) |
| PUT | `/api/auth/change-password` | Change password (auth required) |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/discover` | Get swipeable users (filters: mode, branch, year) |
| POST | `/api/users/swipe` | Swipe left or right on a user |
| GET | `/api/users/profile/:id` | Get a user's public profile |
| PUT | `/api/users/profile` | Update own profile |
| POST | `/api/users/report` | Report a user |
| POST | `/api/users/block` | Block a user |

### Matches & Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/matches` | Get all matches for current user |
| DELETE | `/api/matches/:id` | Unmatch |
| GET | `/api/messages/:roomId` | Get messages for a chat room |
| POST | `/api/messages/:roomId` | Send a message |

### Upload
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload/photo` | Upload a profile photo to Cloudinary |
| DELETE | `/api/upload/photo/:publicId` | Delete a profile photo |

### Socket Events
| Event | Direction | Description |
|---|---|---|
| `user:online` | Client → Server | Register user as online |
| `users:online` | Server → Client | Broadcast online user list |
| `room:join` | Client → Server | Join a chat room |
| `message:send` | Client → Server | Send a message |
| `message:receive` | Server → Client | Receive a message |
| `typing:start` | Client → Server | User started typing |
| `typing:stop` | Client → Server | User stopped typing |

---

## Troubleshooting

**"Cannot connect to MongoDB"**
→ Check `MONGODB_URI` in Render. Make sure Atlas Network Access allows `0.0.0.0/0`.

**Photos not uploading**
→ Double-check all three Cloudinary values (`CLOUD_NAME`, `API_KEY`, `API_SECRET`) in Render env vars.

**"CORS error" in browser**
→ `CLIENT_URL` in Render must exactly match your Vercel URL — no trailing slash.

**Socket.io not connecting**
→ `REACT_APP_SOCKET_URL` in Vercel must point to your Render URL, not `localhost`.

**Render server not responding**
→ Free tier sleeps after 15 min. Wait 30 seconds and try again.

**"Network error" on all API calls**
→ Check `REACT_APP_API_URL` in Vercel environment variables. Redeploy after any change.

---

## Roadmap

- [ ] Email OTP verification via Nodemailer
- [ ] Push notifications (PWA)
- [ ] Profile photo ordering (drag to reorder)
- [ ] Super Like feature
- [ ] Group discovery (find a full hackathon team in one go)
- [ ] Expand college list to all Maharashtra colleges
- [ ] "Explore outside my college" opt-in toggle
- [ ] Admin moderation dashboard

---

## Expanding to More Maharashtra Colleges

The app is already built for this. The `college` field supports any value, and discovery is automatically scoped per college — so each campus is its own isolated pool.

To expand:
1. Open `client/src/pages/RegisterPage.js`
2. Add more colleges to the `MAHARASHTRA_COLLEGES` array
3. Redeploy — done

When user count grows:
- Upgrade MongoDB Atlas from M0 → M2/M5 (around 500+ users)
- Upgrade Render from Free → Starter ($7/month) to eliminate the sleep issue

---

## License

This project is open source under the [MIT License](LICENSE).
