const User = require('../models/User');
const Content = require('../models/Content');
const Rating = require('../models/Rating');
const WatchHistory = require('../models/WatchHistory');
const SearchHistory = require('../models/SearchHistory');

// @desc    Get complete administrative metrics & dashboard statistics
// @route   GET /api/admin/stats
// @access  Private / Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalContent = await Content.countDocuments({});
    const totalRatings = await Rating.countDocuments({});
    const totalHistory = await WatchHistory.countDocuments({});

    const allUsers = await User.find({});
    const totalWatchlistItems = allUsers.reduce((sum, u) => sum + (u.watchlist ? u.watchlist.length : 0), 0);

    // Most popular content
    const allContent = await Content.find({});
    const sortedByPopularity = [...allContent].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    const mostPopularContent = sortedByPopularity.slice(0, 6);

    // Most popular genres
    const genreCounts = {};
    allContent.forEach(item => {
      (item.genres || []).forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Content by type breakdown
    const typeCounts = {};
    allContent.forEach(item => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });

    // Most searched queries
    const searches = await SearchHistory.find({});
    const searchCounts = {};
    searches.forEach(s => {
      const q = (s.query || '').toLowerCase().trim();
      if (q) searchCounts[q] = (searchCounts[q] || 0) + 1;
    });
    const mostSearched = Object.entries(searchCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalContent,
        totalRatings,
        totalWatchlistItems,
        totalHistory
      },
      mostPopularContent,
      topGenres,
      typeCounts,
      mostSearched
    });
  } catch (err) {
    next(err);
  }
};

// @desc    List all users with search & pagination
// @route   GET /api/admin/users
// @access  Private / Admin
const getUsers = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 15 } = req.query;
    let users = await User.find({});

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      users = users.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    }

    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = users.length;
    const startIndex = (page - 1) * limit;
    const paginated = users.slice(startIndex, startIndex + limit);

    // Omit passwords
    const safeUsers = paginated.map(u => {
      const { password, ...safe } = u;
      return safe;
    });

    res.json({
      success: true,
      total,
      users: safeUsers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user status (active / disabled)
// @route   PUT /api/admin/users/:id/status
// @access  Private / Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate an administrator account.' });
    }

    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    await User.findByIdAndUpdate(id, { status: newStatus });

    res.json({
      success: true,
      message: `User account is now ${newStatus}.`,
      status: newStatus
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account as admin
// @route   DELETE /api/admin/users/:id
// @access  Private / Admin
const deleteUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an administrator account.' });
    }

    await User.findByIdAndDelete(id);
    await WatchHistory.deleteMany({ userId: String(id) });
    await Rating.deleteMany({ userId: String(id) });
    await SearchHistory.deleteMany({ userId: String(id) });

    res.json({
      success: true,
      message: 'User and all related records deleted.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    List all reviews with moderation capabilities
// @route   GET /api/admin/reviews
// @access  Private / Admin
const getReviewsForModeration = async (req, res, next) => {
  try {
    const reviews = await Rating.find({});
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review as admin
// @route   DELETE /api/admin/reviews/:id
// @access  Private / Admin
const deleteReviewByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Rating.findByIdAndDelete(id);
    res.json({
      success: true,
      message: 'Review removed by administrator.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed analytics
// @route   GET /api/admin/analytics
// @access  Private / Admin
const getAnalytics = async (req, res, next) => {
  try {
    // Generate data series for user growth, engagement, and catalog distribution
    const allContent = await Content.find({});
    const allRatings = await Rating.find({});
    const allHistory = await WatchHistory.find({});

    const genresMap = {};
    allContent.forEach(c => {
      (c.genres || []).forEach(g => {
        genresMap[g] = (genresMap[g] || 0) + 1;
      });
    });

    const typeMap = {};
    allContent.forEach(c => {
      typeMap[c.type] = (typeMap[c.type] || 0) + 1;
    });

    const ratingsDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allRatings.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      ratingsDist[star] = (ratingsDist[star] || 0) + 1;
    });

    res.json({
      success: true,
      analytics: {
        genres: genresMap,
        types: typeMap,
        ratingsDistribution: ratingsDist,
        activityMetrics: {
          totalWatches: allHistory.length,
          completedWatches: allHistory.filter(h => h.completed).length,
          totalRatings: allRatings.length
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  toggleUserStatus,
  deleteUserByAdmin,
  getReviewsForModeration,
  deleteReviewByAdmin,
  getAnalytics
};
