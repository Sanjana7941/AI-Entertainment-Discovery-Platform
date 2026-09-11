/**
 * CineMind AI - Watchlist Controller
 */

let watchlistItems = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.auth.requireAuth()) return;
  loadWatchlist();
  setupWatchlistFilters();
});

async function loadWatchlist() {
  const grid = document.getElementById('watchlist-grid');
  const countElem = document.getElementById('watchlist-count');
  if (!grid) return;

  grid.innerHTML = Array(4).fill(0).map(() => `
    <div class="content-card">
      <div class="skeleton" style="padding-top: 140%; width: 100%;"></div>
      <div style="padding: 16px;">
        <div class="skeleton" style="height: 20px; width: 70%; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 14px; width: 40%;"></div>
      </div>
    </div>
  `).join('');

  try {
    const res = await window.api.get('/watchlist');
    if (!res.success || !res.items || res.items.length === 0) {
      if (countElem) countElem.textContent = '0 items';
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔖</div>
          <h3 style="margin-bottom: 8px;">Your Watchlist is empty</h3>
          <p style="color: var(--text-muted); max-width: 400px; margin: 0 auto 20px;">
            Save movies, shows, anime, and music you want to explore later.
          </p>
          <a href="/discover.html" class="btn btn-primary">Browse Discover Catalog</a>
        </div>
      `;
      return;
    }

    watchlistItems = res.items;
    if (countElem) countElem.textContent = `${watchlistItems.length} items`;
    renderWatchlist(watchlistItems);
  } catch (err) {
    grid.innerHTML = `<p style="color: var(--danger); text-align: center; grid-column: 1 / -1; padding: 40px;">Failed to load watchlist.</p>`;
  }
}

function renderWatchlist(items) {
  const grid = document.getElementById('watchlist-grid');
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <p style="color: var(--text-muted);">No items match your filter criteria.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => {
    const isWatched = item.watchStatus && item.watchStatus.completed;
    return `
      <div class="content-card">
        <div class="card-poster-wrap" onclick="window.location.href='/details.html?id=${item._id}'" style="cursor: pointer;">
          <img src="${item.poster}" alt="${item.title}" class="card-poster-img" onerror="this.onerror=null; this.src='/images/content/fallback.jpg';" />
          <div class="card-overlay"></div>
          <span class="badge badge-primary card-type-tag">${item.type}</span>
          ${isWatched ? `<span class="badge badge-cyan" style="position: absolute; top: 12px; right: 12px; z-index: 5;">✓ Watched</span>` : ''}

          <div class="card-hover-actions">
            <button class="btn-icon" title="${item.type === 'Music' ? 'Play Music & Themes' : 'Watch Trailer'}" onclick="event.stopPropagation(); playMedia('${item.title.replace(/'/g, "\\'")}', '${item.trailer || ''}', '${item.type || 'Movie'}')">
              ▶
            </button>
            <button class="btn-icon" title="Remove from Watchlist" onclick="event.stopPropagation(); removeWatchlistItem('${item._id}')" style="color: var(--danger);">
              🗑️
            </button>
          </div>
        </div>

        <div class="card-body">
          <a href="/details.html?id=${item._id}" class="card-title">${item.title}</a>
          <div class="card-meta">
            <span>${item.releaseYear} • ${item.language}</span>
            <span class="card-rating">★ ${item.rating}</span>
          </div>
          
          <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 12px;">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="toggleWatchedStatus('${item._id}', ${!isWatched})">
              ${isWatched ? 'Mark Unwatched' : 'Mark as Watched'}
            </button>
            <button class="btn btn-outline btn-sm" onclick="removeWatchlistItem('${item._id}')">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setupWatchlistFilters() {
  const searchInput = document.getElementById('watchlist-search');
  const typeFilter = document.getElementById('watchlist-filter-type');
  const statusFilter = document.getElementById('watchlist-filter-status');
  const sortFilter = document.getElementById('watchlist-sort');

  const applyFilters = () => {
    let filtered = [...watchlistItems];

    if (searchInput && searchInput.value.trim()) {
      const q = searchInput.value.trim().toLowerCase();
      filtered = filtered.filter(i => (i.title || '').toLowerCase().includes(q));
    }

    if (typeFilter && typeFilter.value !== 'all') {
      filtered = filtered.filter(i => i.type.toLowerCase() === typeFilter.value.toLowerCase());
    }

    if (statusFilter && statusFilter.value !== 'all') {
      const wantWatched = statusFilter.value === 'watched';
      filtered = filtered.filter(i => {
        const isWatched = i.watchStatus && i.watchStatus.completed;
        return wantWatched ? isWatched : !isWatched;
      });
    }

    if (sortFilter) {
      if (sortFilter.value === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sortFilter.value === 'title') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      }
    }

    renderWatchlist(filtered);
  };

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (typeFilter) typeFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
  if (sortFilter) sortFilter.addEventListener('change', applyFilters);
}

async function removeWatchlistItem(contentId) {
  try {
    await window.api.delete(`/watchlist/${contentId}`);
    showToast('Removed from Watchlist.', 'info');
    watchlistItems = watchlistItems.filter(i => String(i._id) !== String(contentId));
    renderWatchlist(watchlistItems);
    const countElem = document.getElementById('watchlist-count');
    if (countElem) countElem.textContent = `${watchlistItems.length} items`;
  } catch (err) {
    showToast(err.message || 'Error removing item.', 'error');
  }
}
window.removeWatchlistItem = removeWatchlistItem;

async function toggleWatchedStatus(contentId, markWatched) {
  try {
    await window.api.post('/history', {
      contentId,
      progress: markWatched ? 100 : 0,
      completed: markWatched
    });
    showToast(markWatched ? 'Marked as Watched.' : 'Marked as Unwatched.', 'success');
    loadWatchlist();
  } catch (err) {
    showToast('Failed to update status.', 'error');
  }
}
window.toggleWatchedStatus = toggleWatchedStatus;
