const WatchHistory = require('../models/WatchHistory');
const Content = require('../models/Content');

// @desc    Get user's watch history
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const history = await WatchHistory.find({ userId: String(req.user._id) });
    history.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

    const contentIds = history.map(h => String(h.contentId));
    const allContent = await Content.find({});
    const contentMap = {};
    allContent.forEach(c => {
      contentMap[String(c._id)] = c;
    });

    const populated = history.map(item => {
      const c = contentMap[String(item.contentId)] || {};
      return {
        ...item,
        content: {
          _id: c._id || item.contentId,
          title: c.title || item.contentTitle || 'Untitled',
          poster: c.poster || item.contentPoster || '',
          type: c.type || item.contentType || 'Movie',
          rating: c.rating || 8.0,
          genres: c.genres || [],
          runtime: c.runtime || '120 min',
          releaseYear: c.releaseYear || 2024
        }
      };
    });

    res.json({
      success: true,
      count: populated.length,
      history: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record or update watch progress
// @route   POST /api/history
// @access  Private
const trackProgress = async (req, res, next) => {
  try {
    const { contentId, progress = 0, completed = false, durationMinutes = 10 } = req.body;

    if (!contentId) {
      return res.status(400).json({ success: false, message: 'contentId is required.' });
    }

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content item not found.' });
    }

    const numericProgress = Math.min(100, Math.max(0, parseInt(progress, 10) || 0));
    const isCompleted = completed || numericProgress >= 90;

    // Check existing record
    const existing = await WatchHistory.findOne({
      userId: String(req.user._id),
      contentId: String(contentId)
    });

    let record;
    if (existing) {
      record = await WatchHistory.findByIdAndUpdate(existing._id, {
        progress: numericProgress,
        completed: isCompleted,
        watchedDurationMinutes: (existing.watchedDurationMinutes || 0) + durationMinutes,
        watchedAt: new Date().toISOString()
      }, { new: true });
    } else {
      record = await WatchHistory.create({
        userId: String(req.user._id),
        contentId: String(contentId),
        contentTitle: content.title,
        contentPoster: content.poster,
        contentType: content.type,
        progress: numericProgress,
        completed: isCompleted,
        watchedDurationMinutes: durationMinutes,
        watchedAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Watch progress saved.',
      historyItem: record
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove single history item
// @route   DELETE /api/history/:id
// @access  Private
const removeHistoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await WatchHistory.deleteOne({
      _id: id,
      userId: String(req.user._id)
    });

    res.json({
      success: true,
      message: 'Removed from watch history.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire watch history
// @route   DELETE /api/history
// @access  Private
const clearHistory = async (req, res, next) => {
  try {
    await WatchHistory.deleteMany({ userId: String(req.user._id) });
    res.json({
      success: true,
      message: 'Watch history cleared successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHistory,
  trackProgress,
  removeHistoryItem,
  clearHistory
};
