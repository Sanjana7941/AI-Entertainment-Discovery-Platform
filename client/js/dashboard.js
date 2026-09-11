/**
 * CineMind AI - User Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure user is authenticated
  if (!window.auth.requireAuth()) return;

  const user = window.auth.getUser();

  // Personalize welcome text
  const welcomeText = document.getElementById('dashboard-welcome-name');
  if (welcomeText) {
    welcomeText.textContent = user.name || user.username;
  }

  // Load Dashboard feeds in parallel
  loadContinueWatching();
  loadBecauseYouLike();
  loadRecommendedForYou();
  loadTrendingNow();
  loadUserStatsAndCharts();
});

async function loadContinueWatching() {
  const container = document.getElementById('continue-watching-track');
  const section = document.getElementById('continue-watching-section');
  if (!container) return;

  try {
    const res = await window.api.get('/history');
    if (res.success && res.history.length > 0) {
      // Filter out completed ones or show items with progress
      const inProgress = res.history.filter(h => !h.completed && (h.progress || 0) < 100);
      const displayItems = inProgress.length > 0 ? inProgress : res.history.slice(0, 5);

      if (displayItems.length === 0) {
        if (section) section.style.display = 'none';
        return;
      }

      container.innerHTML = displayItems.map(item => {
        const c = item.content;
        const progress = item.progress || 25;
        const detailTitle = item.contentTitle || c.title;
        return `
          <div class="carousel-item" style="flex: 0 0 280px;">
            <div class="content-card" style="border: 1px solid var(--border-subtle); overflow: hidden; background: var(--bg-card);">
              <div class="card-poster-wrap" style="padding-top: 56.25%; position: relative; cursor: pointer;" onclick="window.location.href='/details.html?id=${c._id}'">
                <img src="${c.backdrop || c.poster || '/images/content/fallback.jpg'}" alt="${c.title}" class="card-poster-img" onerror="this.onerror=null; this.src='/images/content/fallback.jpg';" />
                <div class="card-overlay" style="opacity: 0.6; background: linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.85) 100%);"></div>
                <span class="badge" style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); font-size: 0.72rem; color: #38bdf8; border: 1px solid rgba(56,189,248,0.3);">${c.type}</span>
                <button class="btn-icon" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--accent-gradient); width: 44px; height: 44px; font-size: 1.1rem; box-shadow: 0 0 20px rgba(99,102,241,0.6);" onclick="event.stopPropagation(); window.location.href='/details.html?id=${c._id}'">
                  ▶
                </button>
              </div>
              <div style="background: rgba(255,255,255,0.08); height: 5px; width: 100%; position: relative;">
                <div style="background: linear-gradient(90deg, #6366f1, #ec4899); height: 100%; width: ${progress}%; box-shadow: 0 0 10px rgba(236,72,153,0.7);"></div>
              </div>
              <div class="card-body" style="padding: 14px;">
                <a href="/details.html?id=${c._id}" class="card-title" style="font-size: 0.96rem; font-weight: 700; margin-bottom: 2px;">${c.title}</a>
                <div style="font-size: 0.78rem; color: #c084fc; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;">${detailTitle}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
                  <span>${progress}% watched</span>
                  <a href="/details.html?id=${c._id}" class="btn btn-primary btn-sm" style="padding: 3px 10px; font-size: 0.75rem;">▶ Resume</a>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      if (section) section.style.display = 'none';
    }
  } catch (err) {
    if (section) section.style.display = 'none';
  }
}

async function loadBecauseYouLike() {
  const track = document.getElementById('because-you-like-track');
  const titleElem = document.getElementById('because-you-like-title');
  if (!track) return;

  const user = window.auth.getUser();
  const favGenre = (user && user.favoriteGenres && user.favoriteGenres.length > 0)
    ? user.favoriteGenres[0]
    : 'Sci-Fi';

  if (titleElem) {
    titleElem.textContent = `Because You Like ${favGenre}`;
  }

  try {
    const res = await window.api.get('/content', { genre: favGenre, limit: 6, sortBy: 'rating' });
    if (res.success && res.items.length > 0) {
      track.innerHTML = res.items.map(item => `
        <div class="carousel-item">
          ${window.renderContentCard(item)}
        </div>
      `).join('');
    }
  } catch (err) {
    track.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">Failed to load recommendations.</p>`;
  }
}

async function loadRecommendedForYou() {
  const grid = document.getElementById('recommended-grid');
  if (!grid) return;

  try {
    const res = await window.api.get('/recommendations', { limit: 8 });
    if (res.success && res.recommendations.length > 0) {
      grid.innerHTML = res.recommendations.map(item => window.renderContentCard(item)).join('');
    }
  } catch (err) {
    grid.innerHTML = `<p style="color: var(--text-muted);">Failed to load personalized recommendations.</p>`;
  }
}

async function loadTrendingNow() {
  const track = document.getElementById('trending-track');
  if (!track) return;

  try {
    const res = await window.api.get('/recommendations/trending', { limit: 8 });
    if (res.success && res.recommendations.length > 0) {
      track.innerHTML = res.recommendations.map(item => `
        <div class="carousel-item">
          ${window.renderContentCard(item)}
        </div>
      `).join('');
    }
  } catch (err) {
    track.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">Failed to load trending content.</p>`;
  }
}

async function loadUserStatsAndCharts() {
  try {
    const res = await window.api.get('/users/profile');
    if (!res.success) return;

    const stats = res.stats;

    // Fill counter values
    const moviesCount = document.getElementById('stat-movies');
    if (moviesCount) moviesCount.textContent = stats.moviesWatched;

    const showsCount = document.getElementById('stat-shows');
    if (showsCount) showsCount.textContent = stats.showsWatched;

    const hoursCount = document.getElementById('stat-hours');
    if (hoursCount) hoursCount.textContent = stats.hoursWatched;

    const ratingAvg = document.getElementById('stat-rating');
    if (ratingAvg) ratingAvg.textContent = `★ ${stats.averageRating}`;

    const favGenre = document.getElementById('stat-genre');
    if (favGenre) favGenre.textContent = stats.favoriteGenre;

    const streak = document.getElementById('stat-streak');
    if (streak) streak.textContent = `${stats.currentStreak} Days 🔥`;

    // Render Chart.js
    if (window.Chart) {
      // 1. Genre Breakdown Chart
      const genreCtx = document.getElementById('genreChart');
      if (genreCtx) {
        new Chart(genreCtx, {
          type: 'doughnut',
          data: {
            labels: ['Sci-Fi', 'Action', 'Thriller', 'Drama', 'Animation', 'Comedy'],
            datasets: [{
              data: [35, 25, 18, 12, 6, 4],
              backgroundColor: ['#6366f1', '#06b6d4', '#ec4899', '#a855f7', '#fbbf24', '#10b981'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'inherit', size: 11 } } }
            }
          }
        });
      }

      // 2. Format Activity Chart
      const formatCtx = document.getElementById('formatChart');
      if (formatCtx) {
        new Chart(formatCtx, {
          type: 'bar',
          data: {
            labels: ['Movies', 'TV Shows', 'Anime', 'Music & Themes'],
            datasets: [{
              label: 'Titles Explored',
              data: [stats.moviesWatched || 12, stats.showsWatched || 8, 7, 10],
              backgroundColor: 'rgba(99, 102, 241, 0.75)',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
              y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }
  } catch (err) {
    console.error('Error loading user stats:', err);
  }
}
