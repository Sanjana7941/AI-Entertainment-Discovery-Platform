const RecommendationService = require('../services/recommendationService');

// @desc    Get AI personalized recommendations
// @route   GET /api/recommendations
// @access  Public (Enhanced if authenticated)
const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const { limit = 20, type, mood, excludeWatched } = req.query;

    const recommendations = await RecommendationService.getPersonalizedRecommendations(
      req.user || null,
      {
        limit: parseInt(limit, 10),
        type,
        mood,
        excludeWatched: excludeWatched === 'true'
      }
    );

    // Annotate user state
    const formatted = recommendations.map(item => ({
      ...item,
      isInWatchlist: req.user ? (req.user.watchlist || []).includes(String(item._id)) : false,
      isLiked: req.user ? (req.user.likedContent || []).includes(String(item._id)) : false
    }));

    res.json({
      success: true,
      count: formatted.length,
      recommendations: formatted
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get trending content
// @route   GET /api/recommendations/trending
// @access  Public
const getTrending = async (req, res, next) => {
  try {
    const { limit = 15, type } = req.query;
    const trending = await RecommendationService.getTrendingContent({
      limit: parseInt(limit, 10),
      type
    });

    const formatted = trending.map(item => ({
      ...item,
      isInWatchlist: req.user ? (req.user.watchlist || []).includes(String(item._id)) : false,
      isLiked: req.user ? (req.user.likedContent || []).includes(String(item._id)) : false
    }));

    res.json({
      success: true,
      count: formatted.length,
      recommendations: formatted
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recommendations by mood
// @route   GET /api/recommendations/mood/:mood
// @access  Public (Enhanced if authenticated)
const getByMood = async (req, res, next) => {
  try {
    const { mood } = req.params;
    const { limit = 15 } = req.query;

    const recommendations = await RecommendationService.getMoodRecommendations(
      mood,
      req.user || null,
      parseInt(limit, 10)
    );

    const formatted = recommendations.map(item => ({
      ...item,
      isInWatchlist: req.user ? (req.user.watchlist || []).includes(String(item._id)) : false,
      isLiked: req.user ? (req.user.likedContent || []).includes(String(item._id)) : false
    }));

    res.json({
      success: true,
      mood,
      count: formatted.length,
      recommendations: formatted
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get similar content items
// @route   GET /api/recommendations/similar/:id
// @access  Public
const getSimilar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 8 } = req.query;

    const similar = await RecommendationService.getSimilarContent(id, parseInt(limit, 10));

    const formatted = similar.map(item => ({
      ...item,
      isInWatchlist: req.user ? (req.user.watchlist || []).includes(String(item._id)) : false,
      isLiked: req.user ? (req.user.likedContent || []).includes(String(item._id)) : false
    }));

    res.json({
      success: true,
      count: formatted.length,
      recommendations: formatted
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getTrending,
  getByMood,
  getSimilar
};
