const User = require('../models/User');
const Content = require('../models/Content');
const WatchHistory = require('../models/WatchHistory');

// @desc    Get all items in user watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const watchlistIds = user.watchlist || [];

    if (watchlistIds.length === 0) {
      return res.json({ success: true, count: 0, items: [] });
    }

    const all = await Content.find({});
    let items = all.filter(c => watchlistIds.includes(String(c._id)));

    // Attach watched status if in history
    const history = await WatchHistory.find({ userId: String(user._id) });
    const watchedMap = {};
    history.forEach(h => {
      watchedMap[String(h.contentId)] = {
        progress: h.progress || 0,
        completed: h.completed || false
      };
    });

    items = items.map(item => ({
      ...item,
      isInWatchlist: true,
      isLiked: (user.likedContent || []).includes(String(item._id)),
      watchStatus: watchedMap[String(item._id)] || { progress: 0, completed: false }
    }));

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to watchlist
// @route   POST /api/watchlist/:contentId
// @access  Private
const addToWatchlist = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const user = await User.findById(req.user._id);
    const currentList = user.watchlist || [];

    if (!currentList.includes(String(contentId))) {
      currentList.push(String(contentId));
      await User.findByIdAndUpdate(user._id, { watchlist: currentList });
    }

    res.json({
      success: true,
      message: 'Added to Watchlist.',
      watchlist: currentList
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from watchlist
// @route   DELETE /api/watchlist/:contentId
// @access  Private
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const user = await User.findById(req.user._id);
    const currentList = (user.watchlist || []).filter(id => String(id) !== String(contentId));

    await User.findByIdAndUpdate(user._id, { watchlist: currentList });

    res.json({
      success: true,
      message: 'Removed from Watchlist.',
      watchlist: currentList
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle favorite/liked content
// @route   POST /api/watchlist/like/:contentId
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const user = await User.findById(req.user._id);
    let likedList = user.likedContent || [];
    let isLiked = false;

    if (likedList.includes(String(contentId))) {
      likedList = likedList.filter(id => String(id) !== String(contentId));
      isLiked = false;
    } else {
      likedList.push(String(contentId));
      isLiked = true;
    }

    await User.findByIdAndUpdate(user._id, { likedContent: likedList });

    res.json({
      success: true,
      message: isLiked ? 'Added to favorites.' : 'Removed from favorites.',
      isLiked,
      likedContent: likedList
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  toggleLike
};
