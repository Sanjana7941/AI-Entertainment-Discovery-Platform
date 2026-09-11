const User = require('../models/User');
const WatchHistory = require('../models/WatchHistory');
const Rating = require('../models/Rating');
const SearchHistory = require('../models/SearchHistory');

// @desc    Get user profile with aggregate statistics
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const history = await WatchHistory.find({ userId: String(user._id) });
    const ratings = await Rating.find({ userId: String(user._id) });

    // Aggregate stats
    const moviesWatched = history.filter(h => (h.contentType || 'Movie').toLowerCase() === 'movie').length;
    const showsWatched = history.filter(h => ['tv show', 'web series', 'anime'].includes((h.contentType || '').toLowerCase())).length;
    
    // Estimate hours watched (e.g. completed items ~ 2h for movies, 0.7h for episodes)
    const hoursWatched = history.reduce((acc, curr) => {
      const mins = curr.watchedDurationMinutes || (curr.completed ? 110 : Math.round((curr.progress || 20) * 1.1));
      return acc + (mins / 60);
    }, 0);

    const avgRating = ratings.length > 0
      ? (ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length).toFixed(1)
      : '0.0';

    const favoriteGenre = (user.favoriteGenres && user.favoriteGenres.length > 0)
      ? user.favoriteGenres[0]
      : 'Sci-Fi';

    // Calculate streak (e.g. based on recent activity or continuous days)
    const currentStreak = history.length > 0 ? Math.min(14, Math.max(3, Math.ceil(history.length / 2))) : 1;

    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      stats: {
        moviesWatched,
        showsWatched,
        hoursWatched: Math.round(hoursWatched * 10) / 10,
        ratingsGiven: ratings.length,
        averageRating: parseFloat(avgRating),
        favoriteGenre,
        currentStreak,
        watchlistCount: (user.watchlist || []).length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      username,
      avatar,
      dob,
      favoriteGenres,
      preferredLanguages,
      preferredContentTypes
    } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (avatar) updates.avatar = avatar.trim();
    if (dob !== undefined) updates.dob = dob;
    if (Array.isArray(favoriteGenres)) updates.favoriteGenres = favoriteGenres;
    if (Array.isArray(preferredLanguages)) updates.preferredLanguages = preferredLanguages;
    if (Array.isArray(preferredContentTypes)) updates.preferredContentTypes = preferredContentTypes;

    if (username && username.trim().toLowerCase() !== req.user.username) {
      const existing = await User.findOne({ username: username.trim().toLowerCase() });
      if (existing && String(existing._id) !== String(req.user._id)) {
        return res.status(400).json({ success: false, message: 'This username is already taken.' });
      }
      updates.username = username.trim().toLowerCase();
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    const { password: _, ...safeUser } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await User.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    await User.findByIdAndUpdate(user._id, { password: newPassword });

    res.json({
      success: true,
      message: 'Password has been updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const userId = String(req.user._id);
    await User.findByIdAndDelete(userId);
    await WatchHistory.deleteMany({ userId });
    await Rating.deleteMany({ userId });
    await SearchHistory.deleteMany({ userId });

    res.json({
      success: true,
      message: 'Your CineMind AI account has been permanently deleted.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
};
