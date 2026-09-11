# CineMind AI – AI Entertainment Discovery Platform

> *"Discover what you'll love next."*

CineMind AI is a modern, realistic, fully functional full-stack web application designed to help users discover **movies, TV shows, web series, anime, music, and podcasts** using an advanced multi-factor AI recommendation engine.

Built with a cinematic dark glassmorphic design, zero frontend frameworks (pure vanilla HTML5, CSS3, and modern JavaScript), and an Express.js backend with dual-mode persistent database abstraction (MongoDB with seamless zero-config embedded JSON file store fallback).

---

## 🌟 Key Platform Features

### 1. 9-Factor AI Recommendation Engine
Calculates normalized match scores (0–100%) for every title relative to each user's taste profile:
* **Genre Vector Overlap (22%)**: Overlap between title genres and user's favorite & watched genres.
* **Language Match (15%)**: Alignment with user's preferred languages (English, Tamil, Hindi, Korean, Japanese, etc.).
* **Content Format Match (10%)**: Movies, TV Shows, Anime, Music, Podcasts.
* **Rating Preference (15%)**: Weighted against high community consensus and user rating history.
* **Watch History Similarity (13%)**: Cosine similarity against themes and genres of recently finished titles.
* **Mood Match (10%)**: Dynamic alignment with user's selected emotional vibe.
* **Global Popularity (10%)**: Audience engagement velocity and critical acclaim.
* **Score Breakdown Modal**: Visual insight into why every percentage point was awarded.
* **"Why We Recommend This" Explanations**: Human-like justifications generated dynamically.

### 2. Conversational AI Assistant
* Natural language prompt understanding ("Recommend a thriller under 2 hours", "Suggest Tamil movies", "Anime similar to Naruto", "What should I watch if I liked Interstellar?").
* Constraint parsing: duration filters, language detection, intent matching, title similarity.
* Interactive chat interface with typing animation and rich interactive title cards inside bot responses.
* Zero-dependency local NLP engine with plug-and-play support for external LLM APIs (OpenAI/Gemini).

### 3. Emotional Mood Explorer
* 10 distinct interactive mood states:
  * 😊 **Happy**: Feel-good comedies, bright animated journeys, joyful music.
  * 😢 **Emotional**: Heartfelt dramas, poignant cinema, moving soundtracks.
  * 🔥 **Excited**: High-octane action, mind-bending sci-fi, intense anime.
  * 😌 **Relaxed**: Soothing music, calm podcasts, peaceful slice-of-life.
  * 😱 **Scared**: Chilling horror, jump-scares, psychological thrillers.
  * ❤️ **Romantic**: Heartwarming love stories and romantic serenades.
  * 🧠 **Curious**: Quantum mysteries, true-crime investigations, documentaries.
  * ⚡ **Energetic**: High-tempo club anthems and fast-paced spectacles.
  * 🌙 **Lonely**: Solitary late-night companion podcasts and introspective cinema.
  * 😂 **Funny**: Non-stop laughs, witty satires, and stand-up specials.

### 4. Complete User Experience & Dashboard
* **Personalized Dashboard**: "Continue Watching" progress row, "Because you like [Genre]", "Trending Now", "Recommended for You".
* **Viewing Analytics Charts**: Rendered with Chart.js (Genre breakdown donut chart, Format distribution bar chart, streaks).
* **Discover Catalog**: Multi-facet filter sidebar (Genre, Language, Year, Min Rating, Mood, Type) + live debounced search + sorting.
* **Rich Content Details**: Full backdrop banner, trailer modal (YouTube embed), 1–5 star interactive rater, review submission, and "More Like This" carousel.
* **Persistent Watchlist**: Add/remove, mark as watched, filter by status, sort, and search.
* **Watch History Tracking**: Automatic progress logging, resume playback, remove single record, clear all history.
* **User Profile & Settings**: Working profile editor, theme switcher (Dark / Light mode), password updater, and account deletion.

### 5. Secure Admin Dashboard & CMS
* **Real-time Analytics**: Total users, active accounts, total titles, review count, watchlist saves.
* **User Management**: Search user accounts, toggle active/disabled status, delete accounts.
* **Content Management CMS**: Add new titles, edit existing metadata, delete titles.
* **Review Moderation**: View all community reviews and remove inappropriate comments.

---

## 🔑 Demo Accounts

For immediate testing, two fully seeded accounts are provided out of the box:

| Role | Email | Username | Password |
| :--- | :--- | :--- | :--- |
| **Standard User** | `demo@cinemind.ai` | `demouser` | `Demo@123` |
| **Administrator** | `admin@cinemind.ai` | `admin` | `Admin@123` |

*(Quick-fill buttons are also embedded directly on the login page for 1-click access!)*

---

## 🛠️ Technology Stack

### Frontend
* **HTML5**: Clean semantic markup across 17 responsive views.
* **CSS3**: Modern CSS variables, glassmorphism, responsive breakpoints (360px, 480px, 768px, 1024px, 1440px, 1920px), CSS animations.
* **Vanilla JavaScript**: Modular ES6 classes, Fetch API client, JWT session handling, toast notifications.
* **Chart.js**: Interactive canvas charts for viewing habits and administrative analytics.

### Backend
* **Node.js & Express.js (v5)**: RESTful API architecture.
* **JWT (JSON Web Tokens)**: Secure token-based authentication.
* **bcryptjs**: Password hashing (salt rounds = 10).
* **CORS & dotenv**: Cross-origin resource sharing and environment management.

### Database & Persistence
* **Dual-Mode Data Architecture**:
  1. **MongoDB / Mongoose ODM**: Automatically used when `MONGODB_URI` is supplied and reachable.
  2. **Embedded JSON Persistence Store**: Automatically active when MongoDB is not running, ensuring 100% data persistence in `server/data/*.json` without requiring external database installation.

---

## 📁 Project Structure

```text
AI Entertainment Discovery Platform/
│
├── client/
│   ├── index.html                # Public Landing Page
│   ├── login.html                # Login Page (with 1-click demo fill)
│   ├── register.html             # Multi-step Preference Registration
│   ├── forgot-password.html      # Password Recovery Flow
│   ├── about.html                # Platform & AI Technology Overview
│   ├── contact.html              # Contact & Support Form
│   ├── dashboard.html            # User Dashboard with Chart.js Stats
│   ├── discover.html             # Multi-Facet Filter Catalog
│   ├── recommendations.html      # AI Scoring Hub & Breakdown Modal
│   ├── details.html              # Content Details, Trailer Modal & Reviews
│   ├── watchlist.html            # Watchlist Management
│   ├── history.html              # Watch History with Progress Tracking
│   ├── mood.html                 # 10-Mood Emotion Explorer
│   ├── assistant.html            # CineMind AI Conversational Chat
│   ├── profile.html              # User Profile & Preference Editor
│   ├── settings.html             # Password, Themes & Privacy
│   ├── admin.html                # Admin Panel, CMS & Analytics
│   │
│   ├── css/
│   │   ├── style.css             # Base styles, cinematic dark theme, typography
│   │   ├── components.css        # Cards, modals, buttons, toasts, skeletons
│   │   └── responsive.css        # Media queries (360px to 1920px)
│   │
│   └── js/
│       ├── api.js                # Centralized Fetch API client with JWT
│       ├── auth.js               # Auth manager, route guards, demo auto-fill
│       ├── common.js             # Shared navbar, mobile drawer, toasts, trailer
│       ├── landing.js            # Landing page carousels and previews
│       ├── dashboard.js          # Dashboard feeds and Chart.js charts
│       ├── discover.js           # Multi-facet filters, search, pagination
│       ├── recommendations.js    # AI score badges & breakdown modal
│       ├── details.js            # Content renderer, star rater, reviews
│       ├── watchlist.js          # Watchlist CRUD & mark-watched
│       ├── history.js            # History CRUD & timeline
│       ├── mood.js               # Mood grid and dynamic query engine
│       ├── assistant.js          # AI conversational assistant logic
│       ├── profile.js            # Profile rendering & preference updates
│       ├── settings.js           # Theme toggle, password update, privacy
│       └── admin.js              # CMS, user management, and metrics
│
├── server/
│   ├── server.js                 # Express server & static serving
│   ├── config/
│   │   ├── db.js                 # Dual-mode DB connector
│   │   └── storage.js            # Embedded persistent JSON database engine
│   ├── models/
│   │   ├── User.js               # User model & auth methods
│   │   ├── Content.js            # Entertainment content model
│   │   ├── Rating.js             # Ratings & reviews model
│   │   ├── WatchHistory.js       # Watch history model
│   │   └── SearchHistory.js      # Search history model
│   ├── controllers/
│   │   ├── authController.js     # Auth endpoints
│   │   ├── userController.js     # User profile & preferences
│   │   ├── contentController.js  # Catalog filtering & details
│   │   ├── searchController.js   # Universal search & suggestions
│   │   ├── recommendController.js# AI recommendations & mood
│   │   ├── watchlistController.js# Watchlist management
│   │   ├── historyController.js  # History tracking
│   │   ├── ratingController.js   # Star rating & reviews
│   │   ├── assistantController.js# Conversational assistant
│   │   └── adminController.js    # Admin CMS & analytics
│   ├── middleware/
│   │   ├── auth.js               # JWT protection & optional auth
│   │   ├── admin.js              # Admin authorization guard
│   │   └── errorHandler.js       # Centralized error handler
│   ├── services/
│   │   ├── recommendationService.js # 9-factor AI algorithm
│   │   ├── aiService.js          # NLP intent processor & fallback
│   │   └── contentService.js     # Unified query abstraction
│   ├── seed/
│   │   └── seeder.js             # Database populator (93 titles + demo users)
│   └── test-api.js               # Automated API verification test suite
│
├── .env                          # Environment variables
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Installation & Running

### Prerequisites
* **Node.js**: v18.0.0 or later installed on your system.
* *(Optional)* MongoDB running locally or a MongoDB Atlas URI. If not available, the application automatically uses the embedded persistent JSON database.

### 1. Install Dependencies
```bash
cd "E:\Projects\AI Entertainment Discovery Platform"
npm install
```

### 2. Configure Environment Variables
Verify `.env` has the desired configuration:
```env
PORT=5000
MONGODB_URI=
JWT_SECRET=cinemind_super_secret_jwt_key_2026_entertainment_discovery
JWT_EXPIRE=7d
AI_API_KEY=
NODE_ENV=development
```
*(Leave `MONGODB_URI` blank to use the embedded JSON store, or provide your MongoDB connection string to use MongoDB).*

### 3. Seed Database
Populate the 93 curated titles, demo accounts, ratings, and watch history:
```bash
npm run seed
```

### 4. Run Automated Test Suite
Verify that all core REST APIs, JWT authentication, recommendations, and search work properly:
```bash
npm test
```

### 5. Launch Application
Start the CineMind AI server:
```bash
npm start
```
Then open your web browser at:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🧪 Comprehensive Verification Checklist

| Test Flow | Expected Behavior | Status |
| :--- | :--- | :--- |
| **Health API** | Returns `200 OK` with CineMind platform metadata | ✅ Passed |
| **User Login** | `demo@cinemind.ai` / `Demo@123` returns JWT token & user profile | ✅ Passed |
| **Admin Login** | `admin@cinemind.ai` / `Admin@123` unlocks Admin Portal | ✅ Passed |
| **Registration** | Creates account with favorite genres, languages & formats | ✅ Passed |
| **AI Scoring** | Calculates composite score and factor breakdown | ✅ Passed |
| **AI Assistant** | "Recommend a thriller under 2 hours" returns filtered titles | ✅ Passed |
| **Mood Explorer** | Clicking 😊 Happy, 😢 Emotional, 🔥 Excited returns mood titles | ✅ Passed |
| **Watchlist** | Adding / removing titles updates state in database | ✅ Passed |
| **Watch History** | Tracks percentage progress and completion | ✅ Passed |
| **Ratings & Reviews**| 1 to 5 star rating submission recalculates averages | ✅ Passed |
| **Admin Panel** | Displays real-time metrics, user status toggles, and content CMS | ✅ Passed |

---

## 💡 License
This project is created for evaluation and demonstration of advanced AI entertainment discovery architecture.
