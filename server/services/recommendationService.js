const Content = require('../models/Content');
const WatchHistory = require('../models/WatchHistory');
const Rating = require('../models/Rating');

// Mood to genre & theme mapping
const MOOD_MAP = {
  happy: {
    genres: ['Comedy', 'Animation', 'Adventure', 'Musical'],
    keywords: ['feel-good', 'fun', 'uplifting', 'joyful', 'humor'],
    types: ['Movie', 'Music', 'TV Show']
  },
  emotional: {
    genres: ['Drama', 'Romance'],
    keywords: ['heartfelt', 'touching', 'tearjerker', 'moving', 'deep'],
    types: ['Movie', 'TV Show', 'Music']
  },
  excited: {
    genres: ['Action', 'Sci-Fi', 'Thriller', 'Adventure'],
    keywords: ['action-packed', 'adrenaline', 'fast-paced', 'epic', 'explosive'],
    types: ['Movie', 'Anime', 'TV Show']
  },
  relaxed: {
    genres: ['Documentary', 'Animation', 'Comedy'],
    keywords: ['chill', 'calm', 'peaceful', 'comfort', 'easygoing'],
    types: ['Music', 'Movie', 'TV Show']
  },
  scared: {
    genres: ['Horror', 'Thriller', 'Mystery'],
    keywords: ['spooky', 'jump-scare', 'creepy', 'dark', 'eerie', 'suspense'],
    types: ['Movie', 'TV Show', 'Web Series']
  },
  romantic: {
    genres: ['Romance', 'Drama', 'Comedy'],
    keywords: ['love', 'passion', 'relationship', 'heartwarming', 'sweet'],
    types: ['Movie', 'Music', 'TV Show']
  },
  curious: {
    genres: ['Mystery', 'Sci-Fi', 'Documentary', 'Crime'],
    keywords: ['mind-bending', 'intellectual', 'thought-provoking', 'puzzle', 'investigation'],
    types: ['Movie', 'TV Show', 'Web Series']
  },
  energetic: {
    genres: ['Action', 'Musical', 'Adventure'],
    keywords: ['high-energy', 'workout', 'pumping', 'dynamic', 'vibrant'],
    types: ['Music', 'Movie', 'Anime']
  },
  lonely: {
    genres: ['Drama', 'Romance', 'Documentary'],
    keywords: ['companion', 'solitude', 'melancholic', 'comforting', 'reflective'],
    types: ['Music', 'Movie', 'TV Show']
  },
  funny: {
    genres: ['Comedy'],
    keywords: ['hilarious', 'laugh', 'satire', 'standup', 'witty', 'humorous'],
    types: ['Movie', 'TV Show', 'Web Series']
  }
};

class RecommendationService {
  /**
   * Calculate detailed scoring breakdown between a content item and a user
   */
  static calculateScore(content, user = null, currentMood = null, context = {}) {
    const { watchedContentIds = new Set(), userRatings = {} } = context;

    // Default factors
    let genreMatch = 50;
    let languageMatch = 60;
    let contentTypeMatch = 60;
    let ratingPreference = Math.min(100, Math.round((content.rating || 7.0) * 10));
    let historySimilarity = 40;
    let favoriteSimilarity = 40;
    let popularity = Math.min(100, Math.round(content.popularity || 70));
    let moodMatch = 50;

    const matchedReasons = [];

    // 1. Genre match calculation
    const contentGenres = (content.genres || []).map(g => g.toLowerCase());
    if (user && user.favoriteGenres && user.favoriteGenres.length > 0) {
      const userFavGenres = user.favoriteGenres.map(g => g.toLowerCase());
      const commonGenres = contentGenres.filter(g => userFavGenres.includes(g));
      if (commonGenres.length > 0) {
        genreMatch = Math.min(100, Math.round(65 + (commonGenres.length / Math.max(1, contentGenres.length)) * 35));
        matchedReasons.push(`Matches your favorite genre: ${commonGenres.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`);
      } else {
        genreMatch = 35;
      }
    }

    // 2. Language match calculation
    if (user && user.preferredLanguages && user.preferredLanguages.length > 0) {
      const userLangs = user.preferredLanguages.map(l => l.toLowerCase());
      if (userLangs.includes((content.language || '').toLowerCase())) {
        languageMatch = 100;
        matchedReasons.push(`Available in your preferred language: ${content.language}`);
      } else {
        languageMatch = 30;
      }
    }

    // 3. Content Type match
    if (user && user.preferredContentTypes && user.preferredContentTypes.length > 0) {
      const userTypes = user.preferredContentTypes.map(t => t.toLowerCase());
      if (userTypes.includes((content.type || '').toLowerCase())) {
        contentTypeMatch = 100;
      } else {
        contentTypeMatch = 40;
      }
    }

    // 4. Rating preference & User's past ratings
    if (userRatings[content._id]) {
      const userGiven = userRatings[content._id];
      ratingPreference = Math.round((userGiven / 5) * 100);
    } else if (content.rating >= 8.5) {
      matchedReasons.push(`Critically acclaimed with a stellar ${content.rating}/10 rating`);
    }

    // 5. Watch history similarity
    if (watchedContentIds.has(String(content._id))) {
      historySimilarity = 85;
    } else if (context.watchedGenres && context.watchedGenres.length > 0) {
      const commonWatched = contentGenres.filter(g => context.watchedGenres.includes(g));
      if (commonWatched.length > 0) {
        historySimilarity = Math.min(100, Math.round(60 + commonWatched.length * 15));
        matchedReasons.push(`Consistent with your recent viewing history`);
      }
    }

    // 6. Favorite content similarity
    if (user && user.likedContent && user.likedContent.includes(String(content._id))) {
      favoriteSimilarity = 100;
      matchedReasons.push(`Included in your favorites list`);
    }

    // 7. Mood match
    if (currentMood) {
      const normalizedMood = currentMood.toLowerCase();
      const moodConfig = MOOD_MAP[normalizedMood];
      if (moodConfig) {
        let moodHits = 0;
        // Check genres
        const genreHits = contentGenres.filter(g => moodConfig.genres.map(x => x.toLowerCase()).includes(g)).length;
        moodHits += genreHits * 2;

        // Check content tags / moodTags
        const itemMoodTags = (content.moodTags || []).map(m => m.toLowerCase());
        if (itemMoodTags.includes(normalizedMood)) {
          moodHits += 3;
        }

        // Check keywords in description/tags
        const desc = (content.description || '').toLowerCase();
        for (const kw of moodConfig.keywords) {
          if (desc.includes(kw)) moodHits += 1;
        }

        if (moodHits > 0) {
          moodMatch = Math.min(100, 70 + moodHits * 10);
          matchedReasons.push(`Perfect match for your "${currentMood.toUpperCase()}" mood`);
        } else {
          moodMatch = 30;
        }
      }
    }

    // Weighted composite score (0-100)
    // Genre: 22%, Language: 15%, ContentType: 10%, Rating: 15%, History: 13%, Mood: 10%, Popularity: 10%, Favorite: 5%
    const weights = {
      genre: 0.22,
      language: 0.15,
      contentType: 0.10,
      rating: 0.15,
      history: 0.13,
      mood: currentMood ? 0.15 : 0.05,
      popularity: 0.10,
      favorite: currentMood ? 0.00 : 0.10
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

    const rawScore = (
      genreMatch * weights.genre +
      languageMatch * weights.language +
      contentTypeMatch * weights.contentType +
      ratingPreference * weights.rating +
      historySimilarity * weights.history +
      moodMatch * weights.mood +
      popularity * weights.popularity +
      favoriteSimilarity * weights.favorite
    ) / totalWeight;

    const overallScore = Math.min(99, Math.max(50, Math.round(rawScore)));

    // Generate human-like explanation
    let explanation = '';
    if (matchedReasons.length > 0) {
      explanation = matchedReasons.slice(0, 2).join('. ') + '.';
    } else {
      explanation = `Highly trending ${content.type} recommended based on global audience engagement.`;
    }

    return {
      overallScore,
      breakdown: {
        genreMatch,
        languageMatch,
        contentTypeMatch,
        ratingPreference,
        historySimilarity,
        popularity,
        moodMatch,
        favoriteSimilarity
      },
      explanation
    };
  }

  /**
   * Get personalized recommendations for user
   */
  static async getPersonalizedRecommendations(user, options = {}) {
    const { limit = 20, type, mood, excludeWatched = false } = options;

    let query = {};
    if (type && type !== 'all') {
      query.type = type;
    }

    const allContent = await Content.find(query);

    // Fetch user watch history & ratings context if user exists
    let watchedContentIds = new Set();
    let watchedGenres = [];
    let userRatings = {};

    if (user && user._id) {
      const history = await WatchHistory.find({ userId: String(user._id) });
      history.forEach(h => watchedContentIds.add(String(h.contentId)));

      const ratings = await Rating.find({ userId: String(user._id) });
      ratings.forEach(r => { userRatings[String(r.contentId)] = r.rating; });

      // Gather watched genres from watched content
      const watchedItems = allContent.filter(c => watchedContentIds.has(String(c._id)));
      watchedItems.forEach(item => {
        (item.genres || []).forEach(g => watchedGenres.push(g.toLowerCase()));
      });
    }

    const context = { watchedContentIds, watchedGenres, userRatings };

    // Score all items
    const scoredList = allContent
      .filter(item => {
        if (excludeWatched && watchedContentIds.has(String(item._id))) return false;
        return true;
      })
      .map(item => {
        const scoreInfo = this.calculateScore(item, user, mood, context);
        return {
          ...item,
          recommendationScore: scoreInfo.overallScore,
          scoreBreakdown: scoreInfo.breakdown,
          recommendationReason: scoreInfo.explanation
        };
      });

    // Sort descending by recommendationScore, then popularity
    scoredList.sort((a, b) => b.recommendationScore - a.recommendationScore || b.popularity - a.popularity);

    return scoredList.slice(0, limit);
  }

  /**
   * Get trending content
   */
  static async getTrendingContent(options = {}) {
    const { limit = 15, type } = options;
    const query = {};
    if (type && type !== 'all') query.type = type;

    const allContent = await Content.find(query);
    allContent.sort((a, b) => (b.popularity || 0) - (a.popularity || 0) || (b.rating || 0) - (a.rating || 0));

    return allContent.slice(0, limit).map(item => ({
      ...item,
      recommendationScore: Math.min(99, Math.round(75 + (item.popularity || 80) * 0.24)),
      recommendationReason: `Trending worldwide with an impressive ${item.rating}/10 viewer rating.`
    }));
  }

  /**
   * Get mood-based recommendations
   */
  static async getMoodRecommendations(mood, user = null, limit = 15) {
    return this.getPersonalizedRecommendations(user, { mood, limit });
  }

  /**
   * Get similar content based on genre, cast, director, and tags
   */
  static async getSimilarContent(contentId, limit = 8) {
    const target = await Content.findById(contentId);
    if (!target) return [];

    const allContent = await Content.find({});
    const targetGenres = (target.genres || []).map(g => g.toLowerCase());
    const targetTags = (target.tags || []).map(t => t.toLowerCase());
    const candidates = allContent.filter(item => String(item._id) !== String(contentId));

    const scored = candidates.map(item => {
      let simScore = 0;
      if (item.type === target.type) simScore += 25;
      if (item.language === target.language) simScore += 15;

      const itemGenres = (item.genres || []).map(g => g.toLowerCase());
      const commonGenres = itemGenres.filter(g => targetGenres.includes(g));
      simScore += commonGenres.length * 15;

      if (target.director && item.director && target.director === item.director) {
        simScore += 20;
      }

      const itemTags = (item.tags || []).map(t => t.toLowerCase());
      const commonTags = itemTags.filter(t => targetTags.includes(t));
      simScore += commonTags.length * 10;

      const normScore = Math.min(99, Math.max(50, Math.round(simScore)));
      return {
        ...item,
        recommendationScore: normScore,
        recommendationReason: `Shares similar genre (${commonGenres.slice(0, 2).join(', ')}) and creative style with ${target.title}.`
      };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
    return scored.slice(0, limit);
  }
}

module.exports = RecommendationService;
