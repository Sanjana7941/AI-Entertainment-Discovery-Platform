const Content = require('../models/Content');
const SearchHistory = require('../models/SearchHistory');

// @desc    Universal search across title, cast, director, genre, language
// @route   GET /api/search
// @access  Public
const search = async (req, res, next) => {
  try {
    const { q, type } = req.query;
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        query: '',
        results: { movies: [], shows: [], anime: [], music: [] },
        total: 0
      });
    }

    const queryStr = q.trim().toLowerCase();

    // Log to search history if authenticated
    if (req.user) {
      await SearchHistory.create({
        userId: String(req.user._id),
        query: q.trim()
      });
    }

    const all = await Content.find({});

    const matches = all.filter(item => {
      if (type && type !== 'all' && item.type.toLowerCase() !== type.toLowerCase()) {
        return false;
      }
      const titleMatch = (item.title || '').toLowerCase().includes(queryStr);
      const descMatch = (item.description || '').toLowerCase().includes(queryStr);
      const directorMatch = (item.director || '').toLowerCase().includes(queryStr);
      const castMatch = (item.cast || []).some(c => c.toLowerCase().includes(queryStr));
      const genreMatch = (item.genres || []).some(g => g.toLowerCase().includes(queryStr));
      const langMatch = (item.language || '').toLowerCase().includes(queryStr);
      const tagMatch = (item.tags || []).some(t => t.toLowerCase().includes(queryStr));
      return titleMatch || descMatch || directorMatch || castMatch || genreMatch || langMatch || tagMatch;
    });

    // Segment by type for rich structured presentation
    const results = {
      movies: matches.filter(m => m.type === 'Movie'),
      shows: matches.filter(m => ['TV Show', 'Web Series'].includes(m.type)),
      anime: matches.filter(m => m.type === 'Anime'),
      music: matches.filter(m => m.type === 'Music')
    };

    res.json({
      success: true,
      query: q,
      total: matches.length,
      allMatches: matches,
      results
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get instant search suggestions
// @route   GET /api/search/suggestions
// @access  Public
const getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const queryStr = q.trim().toLowerCase();
    const all = await Content.find({});

    const suggestions = [];
    for (const item of all) {
      if ((item.title || '').toLowerCase().includes(queryStr)) {
        suggestions.push({
          id: item._id,
          title: item.title,
          type: item.type,
          year: item.releaseYear,
          poster: item.poster
        });
      }
      if (suggestions.length >= 7) break;
    }

    res.json({
      success: true,
      suggestions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user search history
// @route   GET /api/search/history
// @access  Private
const getSearchHistory = async (req, res, next) => {
  try {
    const history = await SearchHistory.find({ userId: String(req.user._id) });
    history.sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt));

    // Deduplicate queries
    const unique = [];
    const seen = new Set();
    for (const item of history) {
      const q = item.query.toLowerCase();
      if (!seen.has(q)) {
        seen.add(q);
        unique.push(item);
      }
      if (unique.length >= 10) break;
    }

    res.json({
      success: true,
      history: unique
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear search history
// @route   DELETE /api/search/history
// @access  Private
const clearSearchHistory = async (req, res, next) => {
  try {
    await SearchHistory.deleteMany({ userId: String(req.user._id) });
    res.json({
      success: true,
      message: 'Search history cleared successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  search,
  getSuggestions,
  getSearchHistory,
  clearSearchHistory
};
