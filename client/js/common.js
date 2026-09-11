/**
 * CineMind AI - Common UI Components, Navigation, Modals & Toast Utilities
 */

// Initialize Theme & Favicon
(function initTheme() {
  const savedTheme = localStorage.getItem('cinemind_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Dynamic SVG Favicon Injection
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = '/images/favicon.svg';
})();

// Toast Notification Manager
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-weight: 800; font-size: 1.1rem;">${iconMap[type] || '•'}</span>
    <div style="flex: 1; line-height: 1.4;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutToast 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
window.showToast = showToast;

// Modal Manager
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // If modal contains an iframe (e.g. trailer), clear src to stop playback
    const iframe = modal.querySelector('iframe');
    if (iframe) {
      const src = iframe.src;
      iframe.src = '';
      iframe.src = src;
    }
  }
}
window.openModal = openModal;
window.closeModal = closeModal;

// Universal Video Trailer & Media Stream Launcher
function playMedia(title, trailerUrl, type = 'Movie') {
  let trailerModal = document.getElementById('universal-trailer-modal');
  if (!trailerModal) {
    trailerModal = document.createElement('div');
    trailerModal.id = 'universal-trailer-modal';
    trailerModal.className = 'modal-backdrop';
    trailerModal.innerHTML = `
      <div class="modal-dialog modal-dialog-large">
        <div class="modal-header">
          <h3 class="modal-title" id="trailer-title">Media Stream</h3>
          <button class="modal-close-btn" onclick="closeModal('universal-trailer-modal')">&times;</button>
        </div>
        <div class="modal-body" style="padding: 0;">
          <div class="video-responsive">
            <iframe id="trailer-iframe" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(trailerModal);

    // Close on backdrop click
    trailerModal.addEventListener('click', (e) => {
      if (e.target === trailerModal) closeModal('universal-trailer-modal');
    });
  }

  let titlePrefix = '🎬';
  let titleSuffix = 'Official Trailer';
  if (type === 'Music') {
    titlePrefix = '🎵';
    titleSuffix = 'Music Track & Video';
  } else if (type === 'TV Show' || type === 'Web Series' || type === 'Anime') {
    titlePrefix = '📺';
    titleSuffix = 'Official Trailer & Teaser';
  }

  document.getElementById('trailer-title').textContent = `${titlePrefix} ${title} - ${titleSuffix}`;
  
  // Format embed url
  let embedUrl = trailerUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  if (embedUrl.includes('watch?v=')) {
    embedUrl = embedUrl.replace('watch?v=', 'embed/');
  }
  if (!embedUrl.includes('autoplay=1')) {
    embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
  }

  document.getElementById('trailer-iframe').src = embedUrl;
  openModal('universal-trailer-modal');

  // Auto-record progress in watch history if user is logged in
  if (window.auth && window.auth.isLoggedIn()) {
    window.api.post('/history', {
      contentTitle: title,
      progress: 20,
      durationMinutes: 12
    }).catch(() => {});
  }
}
window.playMedia = playMedia;
window.playTrailer = playMedia;

// Global Watchlist & Like Actions
async function toggleWatchlist(contentId, buttonElement) {
  if (!window.auth.isLoggedIn()) {
    showToast('Please sign in to manage your watchlist.', 'info');
    setTimeout(() => {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 1000);
    return;
  }

  try {
    const isCurrentlyAdded = buttonElement ? buttonElement.classList.contains('active') : false;
    if (isCurrentlyAdded) {
      await window.api.delete(`/watchlist/${contentId}`);
      showToast('Removed from Watchlist.', 'info');
      if (buttonElement) {
        buttonElement.classList.remove('active');
        buttonElement.innerHTML = '🔖';
        buttonElement.title = 'Add to Watchlist';
      }
    } else {
      await window.api.post(`/watchlist/${contentId}`);
      showToast('✓ Added to Watchlist.', 'success');
      if (buttonElement) {
        buttonElement.classList.add('active');
        buttonElement.innerHTML = '✓';
        buttonElement.title = 'In Watchlist';
      }
    }
  } catch (err) {
    showToast(err.message || 'Error updating watchlist.', 'error');
  }
}
window.toggleWatchlist = toggleWatchlist;

async function toggleLike(contentId, buttonElement) {
  if (!window.auth.isLoggedIn()) {
    showToast('Please sign in to save your favorites.', 'info');
    return;
  }

  try {
    const res = await window.api.post(`/watchlist/like/${contentId}`);
    if (buttonElement) {
      if (res.isLiked) {
        buttonElement.classList.add('active');
        buttonElement.innerHTML = '❤️';
      } else {
        buttonElement.classList.remove('active');
        buttonElement.innerHTML = '🤍';
      }
    }
    showToast(res.message, 'success');
  } catch (err) {
    showToast(err.message || 'Error saving favorite.', 'error');
  }
}
window.toggleLike = toggleLike;

// Universal Navbar & Footer Generator
function renderGlobalNav() {
  const navContainer = document.getElementById('navbar-container');
  if (!navContainer) return;

  const currentPath = window.location.pathname;
  const user = window.auth.getUser();
  const isLoggedIn = window.auth.isLoggedIn();

  navContainer.innerHTML = `
    <nav class="navbar">
      <div class="container navbar-inner">
        <!-- Logo -->
        <a href="/" class="brand-logo" aria-label="CineMind AI">
          <img src="/images/cinemind-logo.svg" alt="CineMind AI" class="brand-logo-img" />
        </a>

        <!-- Desktop Navigation Links -->
        <ul class="nav-links">
          <li class="nav-item"><a href="${isLoggedIn ? '/dashboard.html' : '/'}" class="${currentPath === '/' || currentPath.includes('dashboard') ? 'active' : ''}">Home</a></li>
          <li class="nav-item"><a href="/discover.html" class="${currentPath.includes('discover') ? 'active' : ''}">Discover</a></li>
          <li class="nav-item"><a href="/recommendations.html" class="${currentPath.includes('recommendations') ? 'active' : ''}">AI Picks</a></li>
          <li class="nav-item"><a href="/mood.html" class="${currentPath.includes('mood') ? 'active' : ''}">Mood Explorer</a></li>
          <li class="nav-item"><a href="/assistant.html" class="${currentPath.includes('assistant') ? 'active' : ''}">AI Assistant</a></li>
          ${isLoggedIn ? `
            <li class="nav-item"><a href="/watchlist.html" class="${currentPath.includes('watchlist') ? 'active' : ''}">Watchlist</a></li>
            <li class="nav-item"><a href="/history.html" class="${currentPath.includes('history') ? 'active' : ''}">History</a></li>
          ` : ''}
        </ul>

        <!-- Global Search Bar with Live Suggestions -->
        <div class="nav-search">
          <span class="nav-search-icon">🔍</span>
          <input type="text" id="global-search-input" class="nav-search-input" placeholder="Search movies, shows, anime..." autocomplete="off" />
          <kbd class="kbd-shortcut">Ctrl K</kbd>
          <div id="search-suggestions-dropdown" class="search-suggestions-box"></div>
        </div>

        <!-- Nav Right Actions -->
        <div class="nav-actions">
          ${isLoggedIn ? `
            <div class="user-profile-menu">
              <button class="user-avatar-btn" id="user-menu-btn">
                <img src="${user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" alt="${user?.name || 'User'}" class="user-avatar-img" />
                <span style="font-size: 0.85rem; font-weight: 600; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user?.name?.split(' ')[0] || user?.username}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">▼</span>
              </button>
              <div class="user-dropdown-menu" id="user-dropdown">
                <div class="dropdown-header">
                  <div class="name">${user?.name || 'User'}</div>
                  <div class="email">${user?.email || ''}</div>
                </div>
                ${user?.role === 'admin' ? `
                  <a href="/admin.html" class="dropdown-item"><span>👑</span> Admin Dashboard</a>
                  <div class="dropdown-divider"></div>
                ` : ''}
                <a href="/profile.html" class="dropdown-item"><span>👤</span> My Profile</a>
                <a href="/watchlist.html" class="dropdown-item"><span>🔖</span> Watchlist</a>
                <a href="/history.html" class="dropdown-item"><span>⏱️</span> Watch History</a>
                <a href="/settings.html" class="dropdown-item"><span>⚙️</span> Settings</a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item" id="logout-btn" style="color: var(--danger);"><span>🚪</span> Sign Out</a>
              </div>
            </div>
          ` : `
            <a href="/login.html" class="btn btn-outline btn-sm">Sign In</a>
            <a href="/register.html" class="btn btn-primary btn-sm">Get Started</a>
          `}

          <!-- Mobile Hamburger -->
          <button class="mobile-menu-btn" id="mobile-menu-toggle">☰</button>
        </div>
      </div>
    </nav>

    <!-- Mobile Drawer -->
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    <div class="mobile-drawer" id="mobile-drawer">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <a href="/" class="brand-logo" aria-label="CineMind AI" style="text-decoration: none;">
          <img src="/images/cinemind-logo.svg" alt="CineMind AI" class="brand-logo-img" style="height: 36px;" />
        </a>
        <button class="modal-close-btn" id="drawer-close">&times;</button>
      </div>

      <div style="margin-bottom: 20px;">
        <input type="text" id="mobile-search-input" class="form-input" placeholder="Search entertainment..." />
      </div>

      <ul style="list-style: none; display: flex; flex-direction: column; gap: 14px;">
        <li><a href="${isLoggedIn ? '/dashboard.html' : '/'}" style="font-weight: 600; font-size: 1rem; color: var(--text-primary); display: block; padding: 6px 0;">🏠 Home</a></li>
        <li><a href="/discover.html" style="font-weight: 600; font-size: 1rem; color: var(--text-primary); display: block; padding: 6px 0;">🧭 Discover</a></li>
        <li><a href="/recommendations.html" style="font-weight: 600; font-size: 1rem; color: var(--text-primary); display: block; padding: 6px 0;">🎯 AI Recommendations</a></li>
        <li><a href="/mood.html" style="font-weight: 600; font-size: 1rem; color: var(--text-primary); display: block; padding: 6px 0;">🎭 Mood Explorer</a></li>
        <li><a href="/assistant.html" style="font-weight: 600; font-size: 1rem; color: var(--text-primary); display: block; padding: 6px 0;">🤖 AI Assistant</a></li>
        ${isLoggedIn ? `
          <li><a href="/watchlist.html" style="font-weight: 600; font-size: 1rem; color: var(--text-primary); display: block; padding: 6px 0;">🔖 Watchlist</a></li>
          <li><a href="/history.html" style="font-weight: 600; font-size: 1rem; color: var(--text-primary); display: block; padding: 6px 0;">⏱️ Watch History</a></li>
          <li><a href="/profile.html" style="font-weight: 600; font-size: 1rem; color: var(--text-primary); display: block; padding: 6px 0;">👤 Profile</a></li>
          <li><a href="/settings.html" style="font-weight: 600; font-size: 1rem; color: var(--text-primary); display: block; padding: 6px 0;">⚙️ Settings</a></li>
          ${user?.role === 'admin' ? `<li><a href="/admin.html" style="font-weight: 600; font-size: 1rem; color: #fbbf24; display: block; padding: 6px 0;">👑 Admin Panel</a></li>` : ''}
          <li style="margin-top: 10px;"><button class="btn btn-outline btn-sm" id="mobile-logout-btn" style="width: 100%; color: var(--danger);">Sign Out</button></li>
        ` : `
          <li style="margin-top: 16px; display: flex; flex-direction: column; gap: 10px;">
            <a href="/login.html" class="btn btn-outline" style="width: 100%;">Sign In</a>
            <a href="/register.html" class="btn btn-primary" style="width: 100%;">Register Free</a>
          </li>
        `}
      </ul>
    </div>
  `;

  // Attach User Menu Toggle
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.remove('active');
    });
  }

  // Logout Handlers
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.auth.logout();
    });
  }
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', () => window.auth.logout());
  }

  // Mobile Drawer Toggles
  const drawerToggle = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const drawerClose = document.getElementById('drawer-close');

  if (drawerToggle && drawer && backdrop) {
    const openDrawer = () => {
      drawer.classList.add('open');
      backdrop.classList.add('active');
    };
    const closeDrawer = () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('active');
    };

    drawerToggle.addEventListener('click', openDrawer);
    backdrop.addEventListener('click', closeDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  }

  // Live Search Suggestions
  const searchInput = document.getElementById('global-search-input');
  const suggestionsBox = document.getElementById('search-suggestions-dropdown');

  if (searchInput && suggestionsBox) {
    let debounceTimer;

    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const val = searchInput.value.trim();

      if (val.length < 2) {
        suggestionsBox.classList.remove('active');
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const res = await window.api.get('/search/suggestions', { q: val });
          if (res.success && res.suggestions.length > 0) {
            suggestionsBox.innerHTML = res.suggestions.map(item => `
              <div class="suggestion-item" onclick="window.location.href='/details.html?id=${item.id}'">
                <img src="${item.poster}" alt="${item.title}" onerror="this.onerror=null; this.src='/images/content/fallback.jpg';" />
                <div>
                  <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${item.title}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">${item.type} • ${item.year}</div>
                </div>
              </div>
            `).join('') + `
              <div class="suggestion-item" style="justify-content: center; color: var(--accent-secondary); font-weight: 600;" onclick="window.location.href='/discover.html?search=${encodeURIComponent(val)}'">
                View all results for "${val}" →
              </div>
            `;
            suggestionsBox.classList.add('active');
          } else {
            suggestionsBox.classList.remove('active');
          }
        } catch {
          suggestionsBox.classList.remove('active');
        }
      }, 250);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = searchInput.value.trim();
        if (val) {
          window.location.href = `/discover.html?search=${encodeURIComponent(val)}`;
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.remove('active');
      }
    });
  }

  // Mobile search input
  const mobileSearchInput = document.getElementById('mobile-search-input');
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = mobileSearchInput.value.trim();
        if (val) {
          window.location.href = `/discover.html?search=${encodeURIComponent(val)}`;
        }
      }
    });
  }
}

// Universal Footer Generator
function renderGlobalFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <div class="brand-logo">
              <img src="/images/cinemind-logo.svg" alt="CineMind AI" class="brand-logo-img" style="height: 44px;" />
            </div>
            <p class="brand-tagline">
              Discover what you'll love next. The premier AI-powered entertainment companion for movies, series, anime, and music.
            </p>
          </div>

          <div class="footer-col">
            <h4 class="footer-title">Explore</h4>
            <ul class="footer-links">
              <li><a href="/discover.html">Discover Catalog</a></li>
              <li><a href="/recommendations.html">AI Recommendations</a></li>
              <li><a href="/mood.html">Mood Explorer</a></li>
              <li><a href="/assistant.html">AI Entertainment Bot</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-title">Platform</h4>
            <ul class="footer-links">
              <li><a href="/about.html">About CineMind AI</a></li>
              <li><a href="/contact.html">Contact & Support</a></li>
              <li><a href="/settings.html">Theme & Preferences</a></li>
              <li><a href="/admin.html">Admin Portal</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-title">Demo Accounts</h4>
            <ul class="footer-links" style="font-size: 0.85rem; color: var(--text-muted);">
              <li><strong>User:</strong> demo@cinemind.ai</li>
              <li><strong>Pass:</strong> Demo@123</li>
              <li style="margin-top: 8px;"><strong>Admin:</strong> admin@cinemind.ai</li>
              <li><strong>Pass:</strong> Admin@123</li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <div>© ${new Date().getFullYear()} CineMind AI Platform. All rights reserved.</div>
          <div>Built with Vanilla JS, HTML5, CSS3, Express & Node.js</div>
        </div>
      </div>
    </footer>
  `;
}

// Render Entertainment Card HTML Helper
function renderContentCard(item) {
  const isMusic = item.type === 'Music';

  if (isMusic) {
    const songCount = (item.tracks && item.tracks.length) || 0;
    const songListStr = (item.tracks || []).slice(0, 4).map(t => t.title).join(' • ');

    return `
      <div class="content-card music-artist-card" data-id="${item._id}" style="text-align: center;">
        <div class="card-poster-wrap" onclick="window.location.href='/details.html?id=${item._id}'" style="cursor: pointer; padding: 20px 0 10px 0; background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); display: flex; justify-content: center; align-items: center; position: relative;">
          <div style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden; border: 3px solid var(--accent-primary); box-shadow: 0 0 24px rgba(99,102,241,0.4); position: relative; z-index: 1;">
            <img src="${item.poster}" alt="${item.title}" class="card-poster-img" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='/images/content/fallback.jpg';" />
          </div>
          <span class="badge badge-primary card-type-tag" style="background: linear-gradient(135deg, #a855f7, #6366f1); position: absolute; top: 12px; left: 12px; z-index: 3;">Artist</span>
          
          <div class="card-hover-actions">
            <button class="btn-icon ${item.isInWatchlist ? 'active' : ''}" title="${item.isInWatchlist ? 'In Library' : 'Save Artist'}" onclick="event.stopPropagation(); toggleWatchlist('${item._id}', this)">
              ${item.isInWatchlist ? '✓' : '🔖'}
            </button>
            <button class="btn-icon ${item.isLiked ? 'active' : ''}" title="Favorite" onclick="event.stopPropagation(); toggleLike('${item._id}', this)">
              ${item.isLiked ? '❤️' : '🤍'}
            </button>
            <button class="btn-icon" title="Play Songs" onclick="event.stopPropagation(); window.location.href='/details.html?id=${item._id}';">
              ▶
            </button>
          </div>
        </div>

        <div class="card-body" style="text-align: center; padding: 14px 16px;">
          <a href="/details.html?id=${item._id}" class="card-title" title="${item.title}" style="font-size: 1.15rem; font-weight: 800; justify-content: center; display: block; margin-bottom: 4px;">${item.title}</a>
          <div class="card-meta" style="justify-content: center; margin-bottom: 8px;">
            <span style="color: #c084fc; font-weight: 600; font-size: 0.85rem;">🎵 ${songCount} Full Songs</span>
          </div>
          <p class="card-desc" style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; max-height: 40px; overflow: hidden; margin-bottom: 12px;" title="${songListStr}">
            ${songListStr ? `<strong style="color: #a5b4fc;">Songs:</strong> ${songListStr}...` : 'Full studio tracks available'}
          </p>
          <a href="/details.html?id=${item._id}" class="btn btn-primary btn-sm" style="width: 100%; justify-content: center; font-size: 0.82rem; padding: 6px 0;">
            ▶ Play Songs
          </a>
        </div>
      </div>
    `;
  }

  const score = item.recommendationScore || Math.min(99, Math.round(75 + (item.popularity || 75) * 0.23));
  const genres = (item.genres || []).slice(0, 2);
  const isSeries = item.type === 'TV Show' || item.type === 'Web Series' || item.type === 'Anime';
  const qualityTag = item.type === 'Movie' ? '4K Trailer' : 'HD Trailer';
  const playTitle = 'Watch Trailer';

  return `
    <div class="content-card" data-id="${item._id}">
      <div class="card-poster-wrap" onclick="window.location.href='/details.html?id=${item._id}'" style="cursor: pointer;">
        <img src="${item.poster}" alt="${item.title}" class="card-poster-img" loading="lazy" onerror="this.onerror=null; this.src='/images/content/fallback.jpg';" />
        <div class="card-overlay"></div>
        <span class="badge badge-primary card-type-tag">${item.type}</span>
        <span class="quality-tag-pill">${qualityTag}</span>
        <div class="ai-score-ring-card">✨ ${score}%</div>
        
        <div class="card-hover-actions">
          <button class="btn-icon ${item.isInWatchlist ? 'active' : ''}" title="${item.isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}" onclick="event.stopPropagation(); toggleWatchlist('${item._id}', this)">
            ${item.isInWatchlist ? '✓' : '🔖'}
          </button>
          <button class="btn-icon ${item.isLiked ? 'active' : ''}" title="Favorite" onclick="event.stopPropagation(); toggleLike('${item._id}', this)">
            ${item.isLiked ? '❤️' : '🤍'}
          </button>
          <button class="btn-icon" title="${playTitle}" onclick="event.stopPropagation(); window.location.href='/details.html?id=${item._id}';">
            ▶
          </button>
        </div>
      </div>

      <div class="card-body">
        <a href="/details.html?id=${item._id}" class="card-title" title="${item.title}">${item.title}</a>
        <div class="card-meta">
          <span>${item.releaseYear} • ${item.language}</span>
          <span class="card-rating">★ ${item.rating}</span>
        </div>
        <div class="card-genres">
          ${genres.map(g => `<span class="badge badge-genre">${g}</span>`).join('')}
        </div>
        <p class="card-desc">${item.description}</p>
        
        ${item.recommendationReason ? `
          <div class="card-footer-ai" title="${item.recommendationReason}">
            <span>💡</span>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.recommendationReason}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
window.renderContentCard = renderContentCard;

// Global shortcut (Ctrl + K) & Back to Top Setup
function setupGlobalUIEnhancements() {
  // Ctrl + K / Cmd + K to focus search
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // Floating Back to Top Button
  let backToTopBtn = document.getElementById('back-to-top-btn');
  if (!backToTopBtn) {
    backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top-btn';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.title = 'Back to top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });
  }
}

// Universal Interactive Starlight & Constellation Canvas Engine
function initCosmicCanvas() {
  let canvas = document.getElementById('cosmic-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'cosmic-canvas';
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let animationFrameId = null;
  let isVisible = true;

  const PARTICLE_COUNT = 65;
  const CONNECT_DISTANCE = 110;
  const MOUSE_RADIUS = 135;
  let particles = [];
  const mouse = { x: null, y: null };

  const colorPalettes = [
    '0, 229, 255',    // Luminescent Cyan
    '168, 85, 247',   // Cosmic Violet
    '99, 102, 241',   // Indigo
    '244, 114, 182',  // Pink nebula
    '226, 232, 240'   // Pure starlight
  ];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.75,
        baseAlpha: Math.random() * 0.5 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseAngle: Math.random() * Math.PI * 2,
        rgb: colorPalettes[Math.floor(Math.random() * colorPalettes.length)]
      });
    }
  }

  function animate() {
    if (!isVisible) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];

      p1.x += p1.vx;
      p1.y += p1.vy;
      p1.pulseAngle += p1.pulseSpeed;

      if (p1.x < -10) p1.x = width + 10;
      else if (p1.x > width + 10) p1.x = -10;
      if (p1.y < -10) p1.y = height + 10;
      else if (p1.y > height + 10) p1.y = -10;

      // Mouse gentle interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = p1.x - mouse.x;
        const dy = p1.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.45;
          p1.x += (dx / dist) * force;
          p1.y += (dy / dist) * force;
        }
      }

      const alpha = Math.max(0.1, Math.min(0.95, p1.baseAlpha + Math.sin(p1.pulseAngle) * 0.2));

      // Draw particle
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p1.rgb}, ${alpha})`;
      ctx.shadowColor = `rgba(${p1.rgb}, 0.6)`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connect with neighbor particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DISTANCE) {
          const lineAlpha = (1 - dist / CONNECT_DISTANCE) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // Draw subtle connection to pointer
      if (mouse.x !== null && mouse.y !== null) {
        const dx = p1.x - mouse.x;
        const dy = p1.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const pointerLineAlpha = (1 - dist / 100) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${pointerLineAlpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      createParticles();
    }, 150);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isVisible = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
      isVisible = true;
      animationFrameId = requestAnimationFrame(animate);
    }
  });

  resize();
  createParticles();
  animationFrameId = requestAnimationFrame(animate);
}
window.initCosmicCanvas = initCosmicCanvas;

// Execute Shell initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initCosmicCanvas();
  renderGlobalNav();
  renderGlobalFooter();
  setupGlobalUIEnhancements();
});

