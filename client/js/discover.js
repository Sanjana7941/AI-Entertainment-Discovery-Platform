/**
 * CineMind AI - Discovery Catalog Controller
 */

let currentFilters = {
  type: 'all',
  genre: 'all',
  language: 'all',
  year: 'all',
  minRating: 0,
  mood: 'all',
  sortBy: 'popularity',
  sortOrder: 'desc',
  search: '',
  page: 1,
  limit: 12
};

document.addEventListener('DOMContentLoaded', async () => {
  // Read URL query parameters into initial filter state
  const params = new URLSearchParams(window.location.search);
  if (params.get('search')) currentFilters.search = params.get('search');
  if (params.get('type')) currentFilters.type = params.get('type');
  if (params.get('genre')) currentFilters.genre = params.get('genre');
  if (params.get('language')) currentFilters.language = params.get('language');
  if (params.get('mood')) currentFilters.mood = params.get('mood');

  // Load filter options dynamically
  await loadFilterOptions();

  // Setup event listeners
  setupFilterControls();

  // Fetch initial content
  fetchCatalog();
});

async function loadFilterOptions() {
  try {
    const res = await window.api.get('/content/meta/filters');
    if (!res.success) return;

    // Populate Genre Select
    const genreSelect = document.getElementById('filter-genre');
    if (genreSelect) {
      genreSelect.innerHTML = `<option value="all">All Genres</option>` +
        res.genres.map(g => `<option value="${g}" ${currentFilters.genre.toLowerCase() === g.toLowerCase() ? 'selected' : ''}>${g}</option>`).join('');
    }

    // Populate Language Select
    const langSelect = document.getElementById('filter-language');
    if (langSelect) {
      langSelect.innerHTML = `<option value="all">All Languages</option>` +
        res.languages.map(l => `<option value="${l}" ${currentFilters.language.toLowerCase() === l.toLowerCase() ? 'selected' : ''}>${l}</option>`).join('');
    }

    // Populate Year Select
    const yearSelect = document.getElementById('filter-year');
    if (yearSelect) {
      yearSelect.innerHTML = `<option value="all">All Years</option>` +
        res.years.map(y => `<option value="${y}" ${currentFilters.year == y ? 'selected' : ''}>${y}</option>`).join('');
    }

    // Populate Mood Select
    const moodSelect = document.getElementById('filter-mood');
    if (moodSelect) {
      moodSelect.innerHTML = `<option value="all">All Moods</option>` +
        res.moods.map(m => `<option value="${m.id}" ${currentFilters.mood.toLowerCase() === m.id ? 'selected' : ''}>${m.emoji} ${m.label}</option>`).join('');
    }
  } catch (err) {
    console.error('Failed to load filter metadata:', err);
  }
}

function setupFilterControls() {
  // Search input
  const searchInput = document.getElementById('discover-search');
  if (searchInput) {
    searchInput.value = currentFilters.search;
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        currentFilters.search = searchInput.value.trim();
        currentFilters.page = 1;
        fetchCatalog();
      }, 350);
    });
  }

  // Type pills
  const typePills = document.querySelectorAll('.type-filter-pill');
  typePills.forEach(pill => {
    if (pill.dataset.type === currentFilters.type) {
      pill.classList.add('selected');
    }
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      currentFilters.type = pill.dataset.type;
      currentFilters.page = 1;
      fetchCatalog();
    });
  });

  // Genre select
  const genreSelect = document.getElementById('filter-genre');
  if (genreSelect) {
    genreSelect.addEventListener('change', () => {
      currentFilters.genre = genreSelect.value;
      currentFilters.page = 1;
      fetchCatalog();
    });
  }

  // Language select
  const langSelect = document.getElementById('filter-language');
  if (langSelect) {
    langSelect.addEventListener('change', () => {
      currentFilters.language = langSelect.value;
      currentFilters.page = 1;
      fetchCatalog();
    });
  }

  // Year select
  const yearSelect = document.getElementById('filter-year');
  if (yearSelect) {
    yearSelect.addEventListener('change', () => {
      currentFilters.year = yearSelect.value;
      currentFilters.page = 1;
      fetchCatalog();
    });
  }

  // Min Rating slider
  const ratingSlider = document.getElementById('filter-min-rating');
  const ratingVal = document.getElementById('min-rating-val');
  if (ratingSlider) {
    ratingSlider.addEventListener('input', () => {
      currentFilters.minRating = ratingSlider.value;
      if (ratingVal) ratingVal.textContent = ratingSlider.value > 0 ? `★ ${ratingSlider.value}+` : 'Any';
      currentFilters.page = 1;
      fetchCatalog();
    });
  }

  // Mood select
  const moodSelect = document.getElementById('filter-mood');
  if (moodSelect) {
    moodSelect.addEventListener('change', () => {
      currentFilters.mood = moodSelect.value;
      currentFilters.page = 1;
      fetchCatalog();
    });
  }

  // Sort By select
  const sortSelect = document.getElementById('filter-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const [field, order] = sortSelect.value.split('-');
      currentFilters.sortBy = field;
      currentFilters.sortOrder = order || 'desc';
      currentFilters.page = 1;
      fetchCatalog();
    });
  }

  // Reset Filters Button
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentFilters = {
        type: 'all',
        genre: 'all',
        language: 'all',
        year: 'all',
        minRating: 0,
        mood: 'all',
        sortBy: 'popularity',
        sortOrder: 'desc',
        search: '',
        page: 1,
        limit: 12
      };
      if (searchInput) searchInput.value = '';
      if (genreSelect) genreSelect.value = 'all';
      if (langSelect) langSelect.value = 'all';
      if (yearSelect) yearSelect.value = 'all';
      if (ratingSlider) ratingSlider.value = 0;
      if (ratingVal) ratingVal.textContent = 'Any';
      if (moodSelect) moodSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'popularity-desc';
      typePills.forEach(p => p.classList.toggle('selected', p.dataset.type === 'all'));
      fetchCatalog();
    });
  }
}

async function fetchCatalog() {
  const grid = document.getElementById('discover-results-grid');
  const countElem = document.getElementById('discover-count');
  const paginationElem = document.getElementById('pagination-container');
  if (!grid) return;

  // Show Skeleton Loaders
  grid.innerHTML = Array(8).fill(0).map(() => `
    <div class="content-card">
      <div class="skeleton" style="padding-top: 140%; width: 100%;"></div>
      <div style="padding: 16px;">
        <div class="skeleton" style="height: 20px; width: 70%; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 14px; width: 40%; margin-bottom: 12px;"></div>
        <div class="skeleton" style="height: 12px; width: 90%;"></div>
      </div>
    </div>
  `).join('');

  try {
    const res = await window.api.get('/content', currentFilters);

    if (countElem) {
      countElem.textContent = `${res.pagination.totalItems} titles discovered`;
    }

    if (!res.items || res.items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
          <h3 style="margin-bottom: 8px;">No matching entertainment found</h3>
          <p style="color: var(--text-muted); max-width: 400px; margin: 0 auto 20px;">
            Try loosening your filters, choosing a different mood or genre, or searching with broader keywords.
          </p>
          <button class="btn btn-secondary" onclick="document.getElementById('reset-filters-btn')?.click()">Reset All Filters</button>
        </div>
      `;
      if (paginationElem) paginationElem.innerHTML = '';
      return;
    }

    grid.innerHTML = res.items.map(item => window.renderContentCard(item)).join('');

    // Render Pagination
    if (paginationElem) {
      const { currentPage, totalPages, hasNextPage, hasPrevPage } = res.pagination;
      if (totalPages <= 1) {
        paginationElem.innerHTML = '';
        return;
      }

      paginationElem.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 36px;">
          <button class="btn btn-secondary btn-sm" ${!hasPrevPage ? 'disabled style="opacity: 0.5; pointer-events: none;"' : ''} onclick="goToPage(${currentPage - 1})">
            ← Previous
          </button>
          <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">
            Page ${currentPage} of ${totalPages}
          </span>
          <button class="btn btn-secondary btn-sm" ${!hasNextPage ? 'disabled style="opacity: 0.5; pointer-events: none;"' : ''} onclick="goToPage(${currentPage + 1})">
            Next →
          </button>
        </div>
      `;
    }
  } catch (err) {
    grid.innerHTML = `<p style="color: var(--danger); text-align: center; padding: 40px;">Failed to load catalog. Please check your connection.</p>`;
  }
}

function goToPage(page) {
  currentFilters.page = page;
  fetchCatalog();
  window.scrollTo({ top: 200, behavior: 'smooth' });
}
window.goToPage = goToPage;
