# 🎬 CineMind AI

## 🤖 AI-Powered Entertainment Discovery Platform

> **Discover what you'll love next.**

**CineMind AI** is a full-stack AI-powered entertainment discovery platform designed to help users discover personalized **movies, TV shows, web series, anime, music, and podcasts** based on their interests, viewing behavior, preferred languages, moods, ratings, and content preferences.

The platform combines an intelligent recommendation engine with a conversational AI assistant, mood-based discovery, personalized dashboards, watchlists, viewing history, ratings, reviews, and an administrative content management system.

---

## ✨ Highlights

* 🤖 **AI-powered personalized recommendations**
* 💬 **Conversational CineMind AI Assistant**
* 🎭 **Mood-based entertainment discovery**
* 🔎 **Advanced search and multi-factor filtering**
* 🎯 **Personalized user dashboard**
* ❤️ **Watchlist and favorites**
* 📺 **Watch history and progress tracking**
* ⭐ **Ratings and reviews**
* 📊 **Viewing and platform analytics**
* 🛠️ **Admin dashboard and content management**
* 🔐 **JWT-based authentication**
* 🌙 **Dark / Light theme support**
* 📱 **Responsive cinematic user interface**

---

## 🚀 Core Features

### 🤖 AI Recommendation Engine

CineMind AI uses a multi-factor recommendation system to calculate how well each entertainment title matches a user's preferences.

The recommendation score considers:

* 🎭 Genre preference
* 🌍 Language preference
* 📺 Content type
* ⭐ Rating preference
* 📚 Watch history
* ❤️ Favorite content
* 😊 Mood compatibility
* 🔥 Popularity
* 🔗 Similarity with previously watched content

---

### 💬 CineMind AI Assistant

The built-in conversational assistant allows users to discover entertainment using natural-language requests.

```text
🎬 Recommend a thriller under 2 hours

🌌 Suggest movies similar to Interstellar

😂 I want something funny

🇮🇳 Suggest some good Tamil movies

🧠 Recommend some mind-bending sci-fi

❤️ Give me some romantic movies
```

---

### 🎭 Mood Explorer

Not sure what to watch?
**Choose your mood and let CineMind AI handle the rest! 😎🍿**

| 😊 Happy  | 😢 Emotional | 🔥 Excited |
| --------- | ------------ | ---------- |
| Comedy    | Drama        | Action     |
| Animation | Romance      | Adventure  |
| Feel-Good | Emotional    | Thriller   |

| 😌 Relaxed   | 😱 Scared | 🧠 Curious  |
| ------------ | --------- | ----------- |
| Documentary  | Horror    | Mystery     |
| Calm Content | Thriller  | Sci-Fi      |
| Music        | Mystery   | Documentary |

> 💡 **Your mood → AI understands → Personalized recommendations 🎬**

---

### 🔎 Discover & Search

Explore entertainment using powerful filters:

* 🔍 Search
* 🎭 Genre
* 🌍 Language
* 📅 Release Year
* ⭐ Rating
* 😊 Mood
* 📺 Content Type
* ↕️ Sorting

---

### ❤️ Personalized Watchlist

Save the entertainment you don't want to forget.

* 📌 Add titles
* ❌ Remove titles
* 🔎 Search saved content
* ↕️ Sort watchlist
* ✅ Manage watched content

---

### 📺 Watch History

Keep track of your entertainment journey.

* ▶️ Continue Watching
* 📈 Track Progress
* ✅ Mark as Watched
* 🗑️ Remove History
* 🧹 Clear Viewing History

---

### ⭐ Ratings & Reviews

Share your experience and help improve the community.

* ⭐ **1–5 star ratings**
* 📝 **Write reviews**
* 📊 **Average rating calculation**
* 💬 **Community feedback**

---

### 📊 Personalized Dashboard

Everything you need in one place:

| 🎯 Recommendations |
🔥 Trending Content
▶️ Continue Watching
❤️ Watchlist
📺 Watch History
📈 Viewing Statistics
🧠 Personalized Insights

---

### 🛡️ Admin Dashboard

Administrators can manage the entire platform.

#### 📊 Analytics

* 👥 User statistics
* 🎬 Content statistics
* ⭐ Review statistics
* 📈 Platform activity

#### 👥 User Management

* 🔎 Search users
* 👁️ View user accounts
* ✅ Activate / deactivate accounts
* 🗑️ Delete users

#### 🎬 Content Management

* ➕ Add content
* ✏️ Edit content
* 🗑️ Delete content
* 📚 Manage metadata

#### ⭐ Review Moderation

* 👀 View reviews
* 🛡️ Moderate reviews
* 🗑️ Remove inappropriate reviews

---

## 🧠 How CineMind AI Works

```text
                 👤 USER
                    │
                    ▼
        ┌─────────────────────┐
        │ User Preferences    │
        │ Genre • Language    │
        │ Mood • Content Type │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ 🤖 Recommendation   │
        │      Engine         │
        └──────────┬──────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
      🎭 Mood    ⭐ Rating   📺 History
        │          │          │
        └──────────┼──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ 🧠 AI Personalization│
        └──────────┬──────────┘
                   │
                   ▼
          🎬 PERSONALIZED
             RESULTS
```

---

## 🛠️ Technology Stack

### 🎨 Frontend

| Technology   | Purpose                 |
| ------------ | ----------------------- |
| 🌐 HTML5     | Structure               |
| 🎨 CSS3      | Styling & responsive UI |
| ⚡ JavaScript | Dynamic functionality   |
| 📊 Chart.js  | Data visualization      |
| 🔗 Fetch API | Backend communication   |

### ⚙️ Backend

| Technology    | Purpose                   |
| ------------- | ------------------------- |
| 🟢 Node.js    | Runtime                   |
| 🚀 Express.js | Backend framework         |
| 🔐 JWT        | Authentication            |
| 🔒 bcryptjs   | Password security         |
| 🌍 CORS       | API communication         |
| ⚙️ dotenv     | Environment configuration |

### 🗄️ Database

🍃 **MongoDB + Mongoose**

💾 **JSON Persistence Fallback**

---

## 📁 Project Structure

```text
🎬 AI-Entertainment-Discovery-Platform/
│
├── 📂 client/
│   ├── 🏠 index.html
│   ├── 🔐 login.html
│   ├── 📝 register.html
│   ├── 📊 dashboard.html
│   ├── 🔎 discover.html
│   ├── 🤖 assistant.html
│   ├── 🎭 mood.html
│   ├── 🎬 details.html
│   ├── ❤️ watchlist.html
│   ├── 📺 history.html
│   ├── 👤 profile.html
│   ├── ⚙️ settings.html
│   └── 🛡️ admin.html
│
├── 📂 server/
│   ├── 🚀 server.js
│   ├── 📂 config/
│   ├── 📂 controllers/
│   ├── 📂 middleware/
│   ├── 📂 models/
│   ├── 📂 routes/
│   ├── 📂 services/
│   ├── 📂 data/
│   └── 📂 seed/
│
├── ⚙️ package.json
├── 🔐 .env.example
├── 🚫 .gitignore
├── 📄 LICENSE
└── 📖 README.md
```

---

## ⚡ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Hariezwar/AI-Entertainment-Discovery-Platform.git
cd AI-Entertainment-Discovery-Platform
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d
AI_API_KEY=
NODE_ENV=development
```

⚠️ **Never commit your `.env` file or API keys to GitHub.**

### 4️⃣ Seed Demo Data 🌱

```bash
npm run seed
```

### 5️⃣ Start the Application 🚀

```bash
npm start
```

Open:

```text
🌐 http://localhost:5000
```

---

## 🧪 Testing

Run:

```bash
npm test
```

The tests verify important backend functionality such as:

✅ API availability
✅ Authentication
✅ Content APIs
✅ Recommendations
✅ Search
✅ User functionality

---

## 🔐 Security

CineMind AI includes:

🔑 JWT authentication
🔒 bcrypt password hashing
🛡️ Protected API routes
👮 Admin authorization
⚙️ Environment-based secrets
🌐 CORS support
🚨 Centralized error handling

---

## 🎯 Use Cases

🎬 Movie recommendation systems
📺 TV & web-series discovery
🤖 AI/NLP applications
🧠 Personalized content platforms
🎓 Academic projects
💼 Portfolio projects
🚀 AI product prototypes
🔎 Intelligent search applications

---

## 🔮 Future Enhancements

🚀 Live entertainment API integration
🧠 Advanced machine-learning recommendations
🎙️ Voice-based AI assistant
🔍 Semantic search
📱 Mobile application
👥 Social recommendations
🔔 Real-time notifications
☁️ Cloud deployment
🧠 Advanced LLM integration
📊 Advanced behavioral analytics

---

## 💡 Project Vision

Traditional entertainment platforms can make users spend a lot of time searching for something interesting.

**CineMind AI aims to change that.**

```text
👤 User
   ↓
❤️ Preferences
   ↓
📺 Viewing History
   ↓
⭐ Ratings
   ↓
🎭 Mood
   ↓
💬 Natural Language Request
   ↓
🤖 AI Understanding
   ↓
🎬 Personalized Discovery
```

> 🍿 **Less searching. Less scrolling. More watching.**

---

## 👨‍💻 Author

### **Sanjana Sri Y **


---

## ⭐ Support

If you found this project interesting:

⭐ Star the repository
🍴 Fork the project
🐛 Report issues
💡 Share suggestions
🤝 Contribute

---

<p align="center">

# 🎬 CineMind AI

### 🤖 Discover What You'll Love Next.

**Built with ❤️, AI & JavaScript**

🍿 🎬 🤖 🎭 ⭐ 🎵 📺 ❤️

</p>

<p align="center">
<i>✨ Turning entertainment discovery into an intelligent experience. ✨</i>
</p>
