const Content = require('../models/Content');
const ContentService = require('../services/contentService');
const RecommendationService = require('../services/recommendationService');
const Rating = require('../models/Rating');

// @desc    Get paginated & filtered content
// @route   GET /api/content
// @access  Public
const getContentList = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      genre,
      language,
      year,
      minRating,
      mood,
      sortBy = 'popularity',
      sortOrder = 'desc',
      search = ''
    } = req.query;

    const filters = { type, genre, language, year, minRating, mood };
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy,
      sortOrder,
      search
    };

    const result = await ContentService.queryContent(filters, options);

    // If user is logged in, augment with recommendation scores
    if (req.user) {
      result.items = result.items.map(item => {
        const scoreInfo = RecommendationService.calculateScore(item, req.user);
        return {
          ...item,
          recommendationScore: scoreInfo.overallScore,
          recommendationReason: scoreInfo.explanation,
          isInWatchlist: (req.user.watchlist || []).includes(String(item._id)),
          isLiked: (req.user.likedContent || []).includes(String(item._id))
        };
      });
    }

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single content item by ID with AI analysis & reviews
// @route   GET /api/content/:id
// @access  Public (Enhanced if authenticated)
const getContentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content item not found.' });
    }

    // Get score & explanation
    const scoreInfo = RecommendationService.calculateScore(content, req.user || null);

    // Get reviews & ratings for this item
    const reviews = await Rating.find({ contentId: String(content._id) });
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
    });

    const userState = {
      isInWatchlist: req.user ? (req.user.watchlist || []).includes(String(content._id)) : false,
      isLiked: req.user ? (req.user.likedContent || []).includes(String(content._id)) : false,
      userRating: null
    };

    if (req.user) {
      const myRating = reviews.find(r => String(r.userId) === String(req.user._id));
      if (myRating) {
        userState.userRating = myRating.rating;
        userState.userReview = myRating.review;
      }
    }

    res.json({
      success: true,
      content: {
        ...content,
        recommendationScore: scoreInfo.overallScore,
        scoreBreakdown: scoreInfo.breakdown,
        recommendationReason: scoreInfo.explanation
      },
      reviews,
      ratingDistribution: distribution,
      userState
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get catalog metadata (genres, languages, types, moods)
// @route   GET /api/content/meta/filters
// @access  Public
const getMetadata = async (req, res, next) => {
  try {
    const all = await Content.find({});
    const genresSet = new Set();
    const languagesSet = new Set();
    const typesSet = new Set();
    const yearsSet = new Set();

    all.forEach(item => {
      (item.genres || []).forEach(g => genresSet.add(g));
      if (item.language) languagesSet.add(item.language);
      if (item.type) typesSet.add(item.type);
      if (item.releaseYear) yearsSet.add(item.releaseYear);
    });

    const moods = [
      { id: 'happy', label: 'Happy', emoji: '😊', desc: 'Feel-good, comedies & uplifting journeys' },
      { id: 'emotional', label: 'Emotional', emoji: '😢', desc: 'Heartfelt dramas & touching stories' },
      { id: 'excited', label: 'Excited', emoji: '🔥', desc: 'High-octane action, thrillers & sci-fi' },
      { id: 'relaxed', label: 'Relaxed', emoji: '😌', desc: 'Soothing music, ambient themes & slice-of-life' },
      { id: 'scared', label: 'Scared', emoji: '😱', desc: 'Chilling horror & psychological thrillers' },
      { id: 'romantic', label: 'Romantic', emoji: '❤️', desc: 'Love stories, rom-coms & melodious tracks' },
      { id: 'curious', label: 'Curious', emoji: '🧠', desc: 'Mind-bending mysteries & documentaries' },
      { id: 'energetic', label: 'Energetic', emoji: '⚡', desc: 'Pumping music & fast-paced spectacles' },
      { id: 'lonely', label: 'Lonely', emoji: '🌙', desc: 'Soulful melodies, introspective dramas' },
      { id: 'funny', label: 'Funny', emoji: '😂', desc: 'Non-stop laughs, stand-up & comedy' }
    ];

    res.json({
      success: true,
      genres: Array.from(genresSet).sort(),
      languages: Array.from(languagesSet).sort(),
      types: Array.from(typesSet).sort(),
      years: Array.from(yearsSet).sort((a, b) => b - a),
      moods
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new content item
// @route   POST /api/content
// @access  Private / Admin
const createContent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      genres,
      language,
      releaseYear,
      runtime,
      rating,
      poster,
      backdrop,
      trailer,
      cast,
      director,
      popularity,
      tags,
      moodTags
    } = req.body;

    if (!title || !description || !type || !poster) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, type, and poster URL are required.'
      });
    }

    const newContent = await Content.create({
      title: title.trim(),
      description: description.trim(),
      type,
      genres: Array.isArray(genres) ? genres : (genres ? genres.split(',').map(s => s.trim()) : []),
      language: language || 'English',
      releaseYear: parseInt(releaseYear, 10) || new Date().getFullYear(),
      runtime: runtime || '120 min',
      rating: parseFloat(rating) || 8.0,
      poster: poster.trim(),
      backdrop: backdrop ? backdrop.trim() : poster.trim(),
      trailer: trailer ? trailer.trim() : '',
      cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map(s => s.trim()) : []),
      director: director ? director.trim() : '',
      popularity: parseInt(popularity, 10) || 80,
      tags: Array.isArray(tags) ? tags : [],
      moodTags: Array.isArray(moodTags) ? moodTags : []
    });

    res.status(201).json({
      success: true,
      message: 'Content created successfully.',
      content: newContent
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update content item
// @route   PUT /api/content/:id
// @access  Private / Admin
const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Content.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Content item not found.' });
    }

    const updated = await Content.findByIdAndUpdate(id, req.body, { new: true });

    res.json({
      success: true,
      message: 'Content updated successfully.',
      content: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete content item
// @route   DELETE /api/content/:id
// @access  Private / Admin
const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = await Content.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Content item not found.' });
    }

    // Clean up associated ratings
    await Rating.deleteMany({ contentId: String(id) });

    res.json({
      success: true,
      message: 'Content deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getContentList,
  getContentById,
  getMetadata,
  createContent,
  updateContent,
  deleteContent
};
