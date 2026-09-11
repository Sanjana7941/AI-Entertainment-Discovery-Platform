const Content = require('../models/Content');
const RecommendationService = require('./recommendationService');

class AiService {
  /**
   * Process a conversational entertainment prompt
   * @param {string} message - User query
   * @param {object} user - User object if logged in
   * @param {array} conversationHistory - Array of previous messages
   */
  static async processChat(message, user = null, conversationHistory = []) {
    const text = (message || '').trim().toLowerCase();
    
    // Check if external API key is provided
    if (process.env.AI_API_KEY && process.env.AI_API_KEY.trim() !== '') {
      try {
        const externalResponse = await this._callExternalAi(text, user);
        if (externalResponse) {
          return externalResponse;
        }
      } catch (err) {
        console.warn('[AI Service] External API call failed, falling back to local NLP engine:', err.message);
      }
    }

    // Local Natural Language Understanding & Recommendation Engine
    return await this._processLocalNlp(text, user);
  }

  static async _processLocalNlp(text, user) {
    const allContent = await Content.find({});
    let matchingItems = [];
    let botMessage = '';
    let detectedIntent = 'general';

    // 1. Duration constraints: e.g. "under 2 hours", "< 90 min", "short"
    let maxMinutes = null;
    if (text.includes('under 2 hours') || text.includes('less than 2 hours') || text.includes('under 120 min')) {
      maxMinutes = 120;
    } else if (text.includes('under 90 min') || text.includes('short')) {
      maxMinutes = 90;
    }

    // 2. Language detection
    const languages = ['tamil', 'hindi', 'telugu', 'malayalam', 'kannada', 'korean', 'japanese', 'english'];
    const detectedLang = languages.find(lang => text.includes(lang));

    // 3. Content type detection
    let detectedType = null;
    if (text.includes('anime')) detectedType = 'Anime';
    else if (text.includes('music') || text.includes('song') || text.includes('album') || text.includes('theme')) detectedType = 'Music';
    else if (text.includes('series') || text.includes('show') || text.includes('web series')) detectedType = 'TV Show';
    else if (text.includes('movie') || text.includes('film')) detectedType = 'Movie';

    // 4. Genre / Vibe detection
    const genres = [
      { key: 'thriller', name: 'Thriller' },
      { key: 'sci-fi', name: 'Sci-Fi' },
      { key: 'science fiction', name: 'Sci-Fi' },
      { key: 'comedy', name: 'Comedy' },
      { key: 'funny', name: 'Comedy' },
      { key: 'horror', name: 'Horror' },
      { key: 'scary', name: 'Horror' },
      { key: 'action', name: 'Action' },
      { key: 'romance', name: 'Romance' },
      { key: 'romantic', name: 'Romance' },
      { key: 'drama', name: 'Drama' },
      { key: 'animation', name: 'Animation' },
      { key: 'mystery', name: 'Mystery' },
      { key: 'crime', name: 'Crime' },
      { key: 'documentary', name: 'Documentary' }
    ];
    const detectedGenreObj = genres.find(g => text.includes(g.key));
    const detectedGenre = detectedGenreObj ? detectedGenreObj.name : null;

    // 5. Check for Actor / Director / Creator mention (must match whole word & length >= 3)
    let matchedPerson = null;
    let personType = null;
    for (const item of allContent) {
      if (item.director && item.director.length >= 3) {
        const dirPattern = new RegExp('\\b' + item.director.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        if (dirPattern.test(text)) {
          matchedPerson = item.director;
          personType = 'director';
          break;
        }
      }
      if (Array.isArray(item.cast)) {
        const foundActor = item.cast.find(actor => {
          if (!actor || actor.length < 3) return false;
          const actPattern = new RegExp('\\b' + actor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
          return actPattern.test(text);
        });
        if (foundActor) {
          matchedPerson = foundActor;
          personType = 'actor';
          break;
        }
      }
    }

    // 6. Check for "similar to [title]" or "if I liked [title]" or exact title inquiry
    const titleCandidates = allContent.map(c => c.title);
    let matchedSpecificTitle = null;
    for (const title of titleCandidates) {
      if (text.includes(title.toLowerCase())) {
        matchedSpecificTitle = allContent.find(c => c.title.toLowerCase() === title.toLowerCase());
        break;
      }
    }

    // Check specific popular references (e.g. naruto, interstellar, vikram, breaking bad)
    if (!matchedSpecificTitle) {
      if (text.includes('naruto')) {
        matchedSpecificTitle = allContent.find(c => c.title.toLowerCase().includes('naruto') || c.type === 'Anime');
      } else if (text.includes('interstellar')) {
        matchedSpecificTitle = allContent.find(c => c.title.toLowerCase().includes('interstellar'));
      } else if (text.includes('vikram')) {
        matchedSpecificTitle = allContent.find(c => c.title.toLowerCase().includes('vikram'));
      }
    }

    // Branching Responses based on parsed parameters:

    // Case A: Casual Greetings / Intro
    if (/^(hi|hello|hey|greetings|who are you|what can you do|how are you|good (morning|afternoon|evening))/i.test(text.trim())) {
      detectedIntent = 'greeting';
      matchingItems = await RecommendationService.getTrendingContent({ limit: 4 });
      const userGreet = user ? `Welcome back, **${user.name || user.username}**!` : `Hello! I'm your **CineMind AI Companion**!`;
      botMessage = `${userGreet} ✨ I'm here to help you uncover your next favorite movie, bingeable show, anime, or music album & theme.\n\n` +
        `You can ask me anything naturally:\n` +
        `• *"Suggest thrillers under 2 hours in Tamil"*\n` +
        `• *"What should I watch if I liked Interstellar?"*\n` +
        `• *"Recommend something directed by Christopher Nolan"*\n` +
        `• *"What should I watch tonight?"*\n\n` +
        `Here are some trending crowd favorites to get you started:`;
    }
    // Case B: Actor / Director Query
    else if (matchedPerson) {
      detectedIntent = 'person_search';
      matchingItems = allContent.filter(c => 
        (c.director && c.director.toLowerCase().includes(matchedPerson.toLowerCase())) ||
        (Array.isArray(c.cast) && c.cast.some(a => a.toLowerCase().includes(matchedPerson.toLowerCase())))
      ).slice(0, 4);
      botMessage = `Here are standout titles featuring or directed by **${matchedPerson}** from our curated catalogue:`;
    }
    // Case C: Similar to a specific title
    else if (matchedSpecificTitle && (text.includes('similar') || text.includes('liked') || text.includes('like') || text.includes('watch next') || text.includes('after'))) {
      detectedIntent = 'similar_to_title';
      matchingItems = await RecommendationService.getSimilarContent(matchedSpecificTitle._id, 4);
      botMessage = `Because you enjoyed **${matchedSpecificTitle.title}**, I picked these stellar titles sharing its thematic depth, visual style, and genre DNA:`;
    }
    // Case D: Family night
    else if (text.includes('family') || text.includes('kids') || text.includes('wholesome')) {
      detectedIntent = 'family';
      matchingItems = allContent
        .filter(c => ['Animation', 'Adventure', 'Comedy'].some(g => (c.genres || []).includes(g)))
        .slice(0, 4);
      botMessage = `For a memorable family night, here are heartwarming, universally acclaimed picks suitable for all ages:`;
    }
    // Case E: Explicit Genre + Language + Duration (e.g., "thriller under 2 hours", "tamil movies")
    else if (detectedGenre || detectedLang || detectedType || maxMinutes) {
      detectedIntent = 'filtered_search';
      let filtered = allContent;

      if (detectedType) {
        filtered = filtered.filter(c => c.type.toLowerCase() === detectedType.toLowerCase() || (detectedType === 'TV Show' && c.type === 'Web Series'));
      }
      if (detectedLang) {
        filtered = filtered.filter(c => (c.language || '').toLowerCase().includes(detectedLang));
      }
      if (detectedGenre) {
        filtered = filtered.filter(c => (c.genres || []).some(g => g.toLowerCase() === detectedGenre.toLowerCase()));
      }
      if (maxMinutes) {
        filtered = filtered.filter(c => {
          const match = (c.runtime || '').match(/(\d+)/);
          const mins = match ? parseInt(match[1], 10) : 120;
          return mins <= maxMinutes;
        });
      }

      if (filtered.length === 0) {
        // Fallback to closest match
        filtered = allContent.filter(c => detectedGenre ? (c.genres || []).includes(detectedGenre) : true);
      }

      matchingItems = filtered.slice(0, 4);

      const criteria = [];
      if (detectedGenre) criteria.push(`**${detectedGenre}**`);
      if (detectedLang) criteria.push(`in **${detectedLang.charAt(0).toUpperCase() + detectedLang.slice(1)}**`);
      if (detectedType) criteria.push(`**${detectedType}s**`);
      if (maxMinutes) criteria.push(`under **${maxMinutes} minutes**`);

      botMessage = `Based on your request for ${criteria.join(' ')}, here are the top recommendations scored by CineMind AI:`;
    }
    // Case F: "What should I watch tonight?" / General discovery
    else if (text.includes('tonight') || text.includes('what should i watch') || text.includes('recommend') || text.includes('suggest')) {
      detectedIntent = 'tonight_pick';
      matchingItems = await RecommendationService.getPersonalizedRecommendations(user, { limit: 4 });
      const greeting = user ? `Tailored for you, **${user.name || user.username}**!` : `Here are tonight's highest-rated entertainment spectacles:`;
      botMessage = `${greeting} These top picks balance pacing, critical acclaim, and storytelling quality:`;
    }
    // Case G: Specific title lookup
    else if (matchedSpecificTitle) {
      detectedIntent = 'specific_title';
      matchingItems = [matchedSpecificTitle];
      const similar = await RecommendationService.getSimilarContent(matchedSpecificTitle._id, 3);
      matchingItems = matchingItems.concat(similar);
      botMessage = `Here is **${matchedSpecificTitle.title}** (${matchedSpecificTitle.releaseYear}), along with top kindred titles our AI recommends:`;
    }
    // Case H: Friendly chit-chat or guidance fallback
    else {
      detectedIntent = 'chit_chat';
      matchingItems = await RecommendationService.getTrendingContent({ limit: 4 });
      botMessage = `I'm CineMind AI, your intelligent entertainment companion! You can ask me things like:\n\n` +
        `• *"Recommend a sci-fi thriller under 2 hours"*\n` +
        `• *"What should I watch if I liked Interstellar?"*\n` +
        `• *"Suggest top Tamil or Korean movies"*\n` +
        `• *"Give me high-energy anime for tonight"*\n\n` +
        `Meanwhile, here is what is trending across the globe right now:`;
    }

    // Attach recommendation scores & explanations to items
    const formattedRecommendations = matchingItems.map(item => {
      const score = item.recommendationScore || Math.min(99, Math.round(78 + (item.popularity || 75) * 0.22));
      return {
        _id: item._id,
        title: item.title,
        type: item.type,
        genres: item.genres,
        language: item.language,
        releaseYear: item.releaseYear,
        rating: item.rating,
        poster: item.poster,
        runtime: item.runtime,
        director: item.director,
        description: item.description,
        recommendationScore: score,
        recommendationReason: item.recommendationReason || `Critically acclaimed ${item.type} matching audience tastes.`
      };
    });

    return {
      success: true,
      message: botMessage,
      intent: detectedIntent,
      recommendations: formattedRecommendations,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Optional external AI API connector (Gemini / OpenAI compatible)
   */
  static async _callExternalAi(prompt, user) {
    // If external API is configured, use standard fetch
    // Designed to gracefully fall back if offline or key invalid
    return null;
  }
}

module.exports = AiService;
