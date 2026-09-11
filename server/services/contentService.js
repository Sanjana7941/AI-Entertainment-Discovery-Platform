const Content = require('../models/Content');

class ContentService {
  /**
   * Filter and paginate content
   */
  static async queryContent(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 12,
      sortBy = 'popularity',
      sortOrder = 'desc',
      search = ''
    } = options;

    let items = await Content.find({});

    // 1. Text search across title, description, cast, director, tags
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      items = items.filter(item => {
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const directorMatch = (item.director || '').toLowerCase().includes(q);
        const castMatch = (item.cast || []).some(c => c.toLowerCase().includes(q));
        const genreMatch = (item.genres || []).some(g => g.toLowerCase().includes(q));
        const tagMatch = (item.tags || []).some(t => t.toLowerCase().includes(q));
        const langMatch = (item.language || '').toLowerCase().includes(q);
        return titleMatch || descMatch || directorMatch || castMatch || genreMatch || tagMatch || langMatch;
      });
    }

    // 2. Type filter
    if (filters.type && filters.type !== 'all') {
      items = items.filter(item => item.type.toLowerCase() === filters.type.toLowerCase());
    }

    // 3. Genre filter
    if (filters.genre && filters.genre !== 'all') {
      items = items.filter(item => (item.genres || []).some(g => g.toLowerCase() === filters.genre.toLowerCase()));
    }

    // 4. Language filter
    if (filters.language && filters.language !== 'all') {
      items = items.filter(item => (item.language || '').toLowerCase() === filters.language.toLowerCase());
    }

    // 5. Release Year filter
    if (filters.year && filters.year !== 'all') {
      const yr = parseInt(filters.year, 10);
      items = items.filter(item => item.releaseYear === yr);
    }

    // 6. Rating min filter
    if (filters.minRating) {
      const minR = parseFloat(filters.minRating);
      items = items.filter(item => (item.rating || 0) >= minR);
    }

    // 7. Mood filter
    if (filters.mood && filters.mood !== 'all') {
      const targetMood = filters.mood.toLowerCase();
      items = items.filter(item => (item.moodTags || []).some(m => m.toLowerCase() === targetMood));
    }

    // 8. Sorting
    items.sort((a, b) => {
      let aVal = a[sortBy] ?? 0;
      let bVal = b[sortBy] ?? 0;

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // 9. Pagination
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    };
  }

  static async getById(id) {
    return Content.findById(id);
  }

  static async create(data) {
    return Content.create(data);
  }

  static async update(id, data) {
    return Content.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return Content.findByIdAndDelete(id);
  }
}

module.exports = ContentService;
