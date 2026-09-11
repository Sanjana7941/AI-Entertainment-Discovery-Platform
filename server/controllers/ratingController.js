const Rating = require('../models/Rating');
const Content = require('../models/Content');

// @desc    Get ratings & reviews for a content item
// @route   GET /api/ratings/:contentId
// @access  Public
const getContentRatings = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const reviews = await Rating.find({ contentId: String(contentId) });
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    reviews.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
      sum += r.rating;
    });

    const averageRating = reviews.length > 0 ? (sum / reviews.length).toFixed(1) : 0;

    res.json({
      success: true,
      count: reviews.length,
      averageRating: parseFloat(averageRating),
      distribution,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit or update a rating & review
// @route   POST /api/ratings
// @access  Private
const rateContent = async (req, res, next) => {
  try {
    const { contentId, rating, review = '' } = req.body;

    if (!contentId || rating === undefined) {
      return res.status(400).json({ success: false, message: 'contentId and rating (1-5) are required.' });
    }

    const numRating = Math.max(1, Math.min(5, parseFloat(rating)));
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content item not found.' });
    }

    // Check if user already rated this content
    const existing = await Rating.findOne({
      userId: String(req.user._id),
      contentId: String(contentId)
    });

    let savedRating;
    if (existing) {
      savedRating = await Rating.findByIdAndUpdate(existing._id, {
        rating: numRating,
        review: review.trim(),
        updatedAt: new Date().toISOString()
      }, { new: true });
    } else {
      savedRating = await Rating.create({
        userId: String(req.user._id),
        userName: req.user.name || req.user.username,
        userAvatar: req.user.avatar || '',
        contentId: String(contentId),
        contentTitle: content.title,
        rating: numRating,
        review: review.trim(),
        createdAt: new Date().toISOString()
      });
    }

    // Recalculate average rating for content
    const allRatings = await Rating.find({ contentId: String(contentId) });
    const avg = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;
    // Normalized to 10-point scale for content rating display
    const normalizedTenScale = Math.round((avg * 2) * 10) / 10;
    await Content.findByIdAndUpdate(contentId, {
      rating: normalizedTenScale,
      ratingCount: allRatings.length
    });

    res.json({
      success: true,
      message: existing ? 'Review updated successfully.' : 'Rating and review submitted.',
      rating: savedRating
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's ratings
// @route   GET /api/ratings/user/me
// @access  Private
const getUserRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ userId: String(req.user._id) });
    ratings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a rating
// @route   DELETE /api/ratings/:id
// @access  Private
const deleteRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rating = await Rating.findById(id);

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found.' });
    }

    // Check ownership or admin
    if (String(rating.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
    }

    await Rating.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getContentRatings,
  rateContent,
  getUserRatings,
  deleteRating
};
