# 🎬 CineMind AI – AI Entertainment Discovery Platform

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
* 💾 **MongoDB + persistent JSON fallback storage**

---

## 🚀 Core Features

### 🤖 AI Recommendation Engine

CineMind AI uses a multi-factor recommendation system to calculate how well each entertainment title matches a user's preferences.

The recommendation score considers factors such as:

* Genre preference
* Language preference
* Content type
* Rating preference
* Watch history
* Favorite content
* Mood compatibility
* Popularity
* Similarity with previously watched content

Each recommendation can also provide an explanation of **why the title was recommended**.

---

### 💬 CineMind AI Assistant

The built-in conversational assistant allows users to discover entertainment using natural-language requests.

Example queries:

```text
Recommend a thriller under 2 hours
```

```text
Suggest Tamil movies
```

```text
What should I watch if I liked Interstellar?
```

```text
Recommend anime similar to Naruto
```

```text
Suggest something directed by Christopher Nolan
```

The assistant can identify:

* Genres
* Languages
* Content types
* Runtime constraints
* Actors
* Directors
* Specific titles
* Similar-content requests
* Family-friendly content
* General recommendation requests

The system includes a local NLP-based recommendation engine and supports integration with external AI APIs.

---

### 🎭 Mood Explorer

Users can discover content based on their current mood.

Available moods include:

| Mood         | Example Content                    |
| ------------ | ---------------------------------- |
| 😊 Happy     | Comedy, Animation, Feel-good       |
| 😢 Emotional | Drama, Romance                     |
| 🔥 Excited   | Action, Sci-Fi, Thriller           |
| 😌 Relaxed   | Calm Music, Documentary            |
| 😱 Scared    | Horror, Mystery, Thriller          |
| ❤️ Romantic  | Romance, Drama                     |
| 🧠 Curious   | Mystery, Sci-Fi, Documentary       |
| ⚡ Energetic  | Action, Music, Adventure           |
| 🌙 Lonely    | Drama, Romance, Reflective content |
| 😂 Funny     | Comedy, Stand-up, Humorous content |

---

### 🏠 Personalized Dashboard

The dashboard provides a centralized view of the user's entertainment activity.

It includes:

* Continue Watching
* Recommended for You
* Trending Content
* Personalized suggestions
* Genre statistics
* Content-type statistics
* Viewing activity
* Watch progress
* Personalized entertainment insights

Interactive charts are used to visualize viewing behavior.

---

### 🔎 Discover & Search

The Discover section provides powerful content exploration tools.

Users can filter content using:

* Genre
* Language
* Release year
* Minimum rating
* Mood
* Content type
* Search keywords
* Sorting options

The platform also supports live search and categorized content discovery.

---

### 🎬 Content Details

Every entertainment title has a dedicated details page containing information such as:

* Title
* Description
* Genres
* Language
* Release year
* Runtime
* Rating
* Cast
* Director
* Trailer
* Reviews
* User rating
* Similar content

Users can also add titles to their watchlist and submit ratings/reviews.

---

### ❤️ Watchlist

Users can maintain their personal entertainment collection.

Watchlist functionality includes:

* Add content
* Remove content
* Mark as watched
* Filter watchlist
* Search saved titles
* Sort saved content

---

### 📺 Watch History

The platform tracks viewing activity and allows users to:

* Resume content
* Track viewing progress
* Mark content as completed
* Remove individual history entries
* Clear viewing history

---

### ⭐ Ratings & Reviews

Users can rate content from **1 to 5 stars** and submit reviews.

The platform supports:

* Star ratings
* Review submission
* Average rating calculation
* Community feedback
* Review moderation through the admin panel

---

### 👤 User Profile & Settings

Users can manage:

* Profile information
* Favorite genres
* Preferred languages
* Preferred content types
* Password
* Theme preference
* Privacy settings
* Account deletion

---

### 🛠️ Admin Dashboard

Administrators receive access to a dedicated management dashboard.

Admin features include:

#### 📊 Analytics

* Total users
* Active users
* Total entertainment titles
* Number of reviews
* Watchlist activity

#### 👥 User Management

* Search users
* View accounts
* Activate/deactivate users
* Delete users

#### 🎬 Content Management

* Add titles
* Edit title information
* Delete content
* Manage entertainment metadata

#### ⭐ Review Moderation

* View reviews
* Monitor community feedback
* Remove inappropriate reviews

---

# 🧠 Recommendation Architecture

CineMind AI calculates a personalized score using multiple recommendation factors.

```text
                ┌─────────────────────┐
                │   User Preferences   │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Recommendation      │
                │ Engine              │
                └──────────┬──────────┘
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
       ▼                   ▼                    ▼
   Genre Match        Language Match       Type Match
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
       ▼                   ▼                    ▼
 Watch History       Rating Preference      Mood Match
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Final AI Score  │
                  └────────┬────────┘
                           │
                           ▼
                  Personalized Results
```

This approach allows recommendations to adapt to the user's interests and entertainment behavior.

---

# 🛠️ Technology Stack

## Frontend

* **HTML5**
* **CSS3**
* **JavaScript (ES6+)**
* **Fetch API**
* **Chart.js**
* Responsive CSS
* Glassmorphism / cinematic UI design

The frontend is built using **vanilla HTML, CSS, and JavaScript without React or other frontend frameworks**.

---

## Backend

* **Node.js**
* **Express.js**
* **REST API**
* **JWT Authentication**
* **bcryptjs**
* **CORS**
* **dotenv**

---

## Database & Storage

The application supports two persistence modes:

### MongoDB

When a valid `MONGODB_URI` is provided, the application uses:

* MongoDB
* Mongoose

### JSON Persistence Fallback

When MongoDB is unavailable, CineMind AI can use its built-in persistent JSON storage system.

This allows the project to run locally without requiring a separate database installation.

---

# 📁 Project Structure

```text
AI-Entertainment-Discovery-Platform/
│
├── client/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── forgot-password.html
│   ├── about.html
│   ├── contact.html
│   ├── dashboard.html
│   ├── discover.html
│   ├── recommendations.html
│   ├── details.html
│   ├── watchlist.html
│   ├── history.html
│   ├── mood.html
│   ├── assistant.html
│   ├── profile.html
│   ├── settings.html
│   ├── admin.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── components.css
│   │   └── responsive.css
│   │
│   ├── images/
│   │   └── content/
│   │
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── common.js
│       ├── landing.js
│       ├── dashboard.js
│       ├── discover.js
│       ├── details.js
│       ├── recommendations.js
│       ├── watchlist.js
│       ├── history.js
│       ├── mood.js
│       ├── assistant.js
│       ├── profile.js
│       ├── settings.js
│       └── admin.js
│
├── server/
│   ├── server.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── storage.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── contentController.js
│   │   ├── searchController.js
│   │   ├── recommendController.js
│   │   ├── watchlistController.js
│   │   ├── historyController.js
│   │   ├── ratingController.js
│   │   ├── assistantController.js
│   │   └── adminController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── errorHandler.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Content.js
│   │   ├── Rating.js
│   │   ├── WatchHistory.js
│   │   └── SearchHistory.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── contentRoutes.js
│   │   ├── searchRoutes.js
│   │   ├── recommendRoutes.js
│   │   ├── watchlistRoutes.js
│   │   ├── historyRoutes.js
│   │   ├── ratingRoutes.js
│   │   ├── assistantRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── services/
│   │   ├── recommendationService.js
│   │   ├── aiService.js
│   │   └── contentService.js
│   │
│   ├── data/
│   │   ├── content.json
│   │   ├── users.json
│   │   ├── ratings.json
│   │   ├── search_history.json
│   │   └── watch_history.json
│   │
│   ├── seed/
│   │   └── seeder.js
│   │
│   └── test-api.js
│
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/Hariezwar/AI-Entertainment-Discovery-Platform.git
cd AI-Entertainment-Discovery-Platform
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d
AI_API_KEY=
NODE_ENV=development
```

### Configuration

| Variable      | Purpose                            |
| ------------- | ---------------------------------- |
| `PORT`        | Server port                        |
| `MONGODB_URI` | MongoDB connection string          |
| `JWT_SECRET`  | Secret used for JWT authentication |
| `JWT_EXPIRE`  | JWT expiration duration            |
| `AI_API_KEY`  | Optional external AI API key       |
| `NODE_ENV`    | Application environment            |

> Never commit your actual `.env` file or private API keys to GitHub.

---

# 🌱 Seed the Application

Populate the application with sample entertainment data and demo accounts:

```bash
npm run seed
```

The project also contains automatic startup seeding support when the content database is empty.

---

# ▶️ Run the Application

Start the backend and frontend server:

```bash
npm start
```

Open:

```text
http://localhost:5000
```

The Express server serves the frontend directly from the `client` directory.

---

# 🧪 Test the API

Run the included API verification suite:

```bash
npm test
```

The test suite verifies important platform functionality such as:

* API availability
* Authentication
* Content retrieval
* Recommendations
* Search
* User functionality
* Core backend services

---

# 🔐 Demo Accounts

For testing the application, the project includes demo accounts.

### 👤 Standard User

```text
Email: demo@cinemind.ai
Password: Demo@123
```

### 🛡️ Administrator

```text
Email: admin@cinemind.ai
Password: Admin@123
```

> These credentials are intended for local development and demonstration purposes.

---

# 🔗 API Overview

The backend exposes RESTful API endpoints under:

```text
/api
```

Main API modules include:

```text
/api/auth
/api/users
/api/content
/api/search
/api/recommendations
/api/watchlist
/api/history
/api/ratings
/api/assistant
/api/admin
```

Health check:

```text
GET /api/health
```

---

# 🔒 Security

CineMind AI includes several security mechanisms:

* JWT-based authentication
* Password hashing using bcrypt
* Protected API routes
* Admin authorization middleware
* Environment-based secret configuration
* Centralized error handling
* CORS support

---

# 🎯 Use Cases

CineMind AI can be used for:

* Personalized movie discovery
* Entertainment recommendation systems
* AI-based content discovery
* Movie and TV show catalog applications
* Recommendation system demonstrations
* AI/NLP academic projects
* Full-stack development portfolios
* Entertainment technology prototypes

---

# 📈 Future Enhancements

Potential future improvements include:

* Integration with live entertainment APIs
* Advanced machine-learning recommendation models
* Real-time streaming platform availability
* Smarter semantic search
* Voice-based entertainment assistant
* User-to-user recommendation sharing
* Social profiles and following
* Real-time notifications
* Cloud deployment and scalable database infrastructure
* Advanced external LLM integration

---

# 🌟 Why CineMind AI?

Traditional entertainment platforms often require users to browse through thousands of titles before finding something relevant.

CineMind AI focuses on a more personalized discovery experience by combining:

```text
User Preferences
       +
Viewing History
       +
Ratings
       +
Mood
       +
Content Metadata
       +
AI/NLP Understanding
       ↓
Personalized Entertainment Discovery
```

The goal is simple:

> **Spend less time searching. Spend more time enjoying.**

---

# 📌 Project Information

**Project Name:** AI Entertainment Discovery Platform
**Platform Name:** CineMind AI
**Project Type:** Full-Stack Web Application
**Domain:** Artificial Intelligence / Entertainment Technology
**Frontend:** HTML, CSS, JavaScript
**Backend:** Node.js, Express.js
**Database:** MongoDB / JSON Persistence
**Authentication:** JWT + bcrypt
**License:** ISC

---

# 👨‍💻 Author

**Sanjana Sri Y**


---

# 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">

### 🎬 CineMind AI

**Discover what you'll love next.**

⭐ Star the repository if you found this project interesting!

</p>
