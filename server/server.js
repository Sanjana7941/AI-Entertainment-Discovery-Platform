const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const historyRoutes = require('./routes/historyRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'CineMind AI',
    tagline: "Discover what you'll love next.",
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/recommendations', recommendRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/admin', adminRoutes);

// Fallback for client-side single page navigation
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.startsWith('/api')) {
    return res.sendFile(path.join(clientPath, 'index.html'));
  }
  next();
});

// Centralized error handler
app.use(errorHandler);

// Initialize DB and launch server
async function startServer() {
  await connectDB();

  // Run seeder automatically if content is empty
  try {
    const { seedDataIfEmpty } = require('./seed/seeder');
    await seedDataIfEmpty();
  } catch (err) {
    console.warn('[Seeder Auto-Run Warning]:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🎬 CineMind AI Server running on http://localhost:${PORT}`);
    console.log(`✨ Tagline: "Discover what you'll love next."`);
    console.log(`🚀 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================\n`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
