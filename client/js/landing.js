/**
 * CineMind AI - Landing Page Controller
 */

let allLoadedContent = [];
let heroSpotlightList = [];
let activeHeroIndex = 0;
let heroTimer = null;
let currentSimMood = 'Excited';
let currentSimType = 'All';

document.addEventListener('DOMContentLoaded', async () => {
  // Load initial content for spotlight & simulator
  await initLandingData();

  // Load Trending Carousel
  loadTrending();

  // Load Top Movies
  loadTopMovies();

  // Load Top Shows & Anime
  loadTopShows();

  // Setup interactive simulator listeners
  setupSimulatorControls();
});

async function initLandingData() {
  try {
    const res = await window.api.get('/content', { limit: 60, sortBy: 'popularity' });
    if (res && res.success && res.items) {
      allLoadedContent = res.items;

      // Select standout hero spotlight candidates
      const candidates = ['Interstellar', 'Dune: Part Two', 'Vikram', 'Breaking Bad', 'Attack on Titan', 'RRR'];
      heroSpotlightList = allLoadedContent.filter(c => candidates.includes(c.title));

      if (heroSpotlightList.length === 0) {
        heroSpotlightList = allLoadedContent.slice(0, 5);
      }

      setupHeroSpotlight();
      runLiveSimulator();
    }
  } catch (err) {
    console.error('Failed to init landing data:', err);
  }
}

function setupHeroSpotlight() {
  if (heroSpotlightList.length === 0) return;

  const dotsContainer = document.getElementById('hero-dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = heroSpotlightList.map((item, idx) => `
      <button type="button" class="hero-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" style="width: ${idx === 0 ? '28px' : '10px'}; height: 8px; border-radius: 4px; border: none; background: ${idx === 0 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.3)'}; cursor: pointer; transition: all 0.3s ease;"></button>
    `).join('');

    dotsContainer.querySelectorAll('.hero-dot').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        switchHeroSpotlight(idx);
        restartHeroTimer();
      });
    });
  }

  // Initial render
  renderHeroItem(heroSpotlightList[0]);

  // Start auto-rotation
  restartHeroTimer();
}

function renderHeroItem(item) {
  if (!item) return;

  const backdrop = document.getElementById('hero-backdrop');
  const title = document.getElementById('hero-title');
  const type = document.getElementById('hero-type');
  const rating = document.getElementById('hero-rating');
  const year = document.getElementById('hero-year');
  const runtime = document.getElementById('hero-runtime');
  const genres = document.getElementById('hero-genres');
  const desc = document.getElementById('hero-desc');
  const trailerBtn = document.getElementById('hero-trailer-btn');
  const detailsBtn = document.getElementById('hero-details-btn');
  const match = document.getElementById('hero-match');

  const posterImg = document.getElementById('hero-poster-img');
  const posterCard = document.getElementById('hero-poster-card');
  const posterBadge = document.getElementById('hero-poster-badge');
  const posterScore = document.getElementById('hero-poster-score');

  if (backdrop) {
    // Atmospheric ambient backdrop using the locally verified poster
    const bgUrl = item.poster || '/images/content/fallback.jpg';
    backdrop.style.backgroundImage = `linear-gradient(to right, rgba(11,15,25,0.96) 20%, rgba(11,15,25,0.82) 55%, rgba(11,15,25,0.5) 100%), url('${bgUrl}')`;
    backdrop.style.filter = 'blur(10px) brightness(0.7)';
  }

  if (posterImg) {
    posterImg.src = item.poster || '/images/content/fallback.jpg';
    posterImg.alt = item.title;
  }
  if (posterCard) {
    posterCard.onclick = () => {
      window.location.href = `/details.html?id=${item._id}`;
    };
  }
  if (posterBadge) posterBadge.textContent = item.type;
  if (posterScore) posterScore.textContent = `★ ${item.rating}`;

  if (title) title.textContent = item.title;
  if (type) type.textContent = item.type;
  if (rating) rating.textContent = item.rating;
  if (year) year.textContent = item.releaseYear;
  if (runtime) runtime.textContent = item.runtime || 'Feature';
  if (genres) genres.textContent = (item.genres || []).join(', ');
  if (desc) desc.textContent = item.description;

  const score = item.popularity ? Math.min(99, Math.round(item.popularity * 0.98)) : 98;
  if (match) match.textContent = `✨ ${score}% AI Match`;

  if (trailerBtn) {
    trailerBtn.onclick = () => {
      window.playMedia(item.title, item.trailer || '', item.type);
    };
  }

  if (detailsBtn) {
    detailsBtn.href = `/details.html?id=${item._id}`;
  }

  // Update dots
  const dots = document.querySelectorAll('.hero-dot');
  dots.forEach((dot, idx) => {
    const isActive = idx === activeHeroIndex;
    dot.style.width = isActive ? '28px' : '10px';
    dot.style.background = isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.3)';
  });
}

function switchHeroSpotlight(index) {
  if (index < 0 || index >= heroSpotlightList.length) return;
  activeHeroIndex = index;
  renderHeroItem(heroSpotlightList[activeHeroIndex]);
}

function restartHeroTimer() {
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(() => {
    activeHeroIndex = (activeHeroIndex + 1) % heroSpotlightList.length;
    renderHeroItem(heroSpotlightList[activeHeroIndex]);
  }, 6500);
}

// ---------------- LIVE SIMULATOR ----------------
function setupSimulatorControls() {
  // Mood pills
  const moodBtns = document.querySelectorAll('#sim-moods button');
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSimMood = btn.dataset.mood;
      runLiveSimulator();
    });
  });

  // Type pills
  const typeBtns = document.querySelectorAll('#sim-types button');
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSimType = btn.dataset.type;
      runLiveSimulator();
    });
  });
}

function runLiveSimulator() {
  const grid = document.getElementById('sim-cards-grid');
  const scoreBadge = document.getElementById('sim-score-badge');
  if (!grid || allLoadedContent.length === 0) return;

  // Filter content matching mood and type
  let matches = allLoadedContent.filter(item => {
    const matchesMood = (item.moodTags || []).some(m => m.toLowerCase() === currentSimMood.toLowerCase());
    const matchesType = currentSimType === 'All' || item.type === currentSimType;
    return matchesMood && matchesType;
  });

  if (matches.length < 3) {
    // Fallback by type or mood
    const secondary = allLoadedContent.filter(item => currentSimType === 'All' || item.type === currentSimType);
    matches = [...matches, ...secondary].slice(0, 3);
  }

  const topThree = matches.slice(0, 3);

  // Simulated score calculation
  const baseScore = currentSimMood === 'Excited' ? 98 : (currentSimMood === 'Curious' ? 99 : 96);
  if (scoreBadge) {
    scoreBadge.textContent = `✨ ${baseScore}% AI Congruence`;
  }

  grid.innerHTML = topThree.map((item, idx) => {
    const itemScore = baseScore - idx * 2;
    return `
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s ease;">
        <div style="position: relative; height: 160px; overflow: hidden;">
          <img src="${item.poster}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; top: 10px; right: 10px; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); border: 1px solid rgba(99,102,241,0.4); border-radius: var(--radius-full); padding: 3px 8px; font-size: 0.72rem; font-weight: 800; color: #4ade80;">
            ✨ ${itemScore}% Match
          </div>
          <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.6); padding: 2px 8px; border-radius: var(--radius-sm); font-size: 0.72rem; color: #fff;">
            ${item.type}
          </div>
        </div>
        <div style="padding: 14px; display: flex; flex-direction: column; flex: 1;">
          <a href="/details.html?id=${item._id}" style="font-weight: 700; font-size: 0.95rem; color: #fff; margin-bottom: 4px; text-decoration: none;">${item.title}</a>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 12px;">★ ${item.rating} • ${item.releaseYear} • ${(item.genres || []).slice(0, 2).join(', ')}</div>
          <div style="margin-top: auto; display: flex; gap: 8px;">
            <a href="/details.html?id=${item._id}" class="btn btn-secondary btn-sm" style="flex: 1; text-align: center; padding: 6px; font-size: 0.78rem;">Details</a>
            <button type="button" class="btn btn-primary btn-sm" style="padding: 6px 10px; font-size: 0.78rem;" onclick="window.playTrailer('${item.title.replace(/'/g, "\\'")}', '${item.trailer || ''}')">▶ Trailer</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ---------------- EXISTING CATEGORY CAROUSELS ----------------
async function loadTrending() {
  const track = document.getElementById('trending-carousel');
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
    track.innerHTML = `<p style="color: var(--text-muted); padding: 20px;">Could not load trending titles.</p>`;
  }
}

async function loadTopMovies() {
  const grid = document.getElementById('popular-movies-grid');
  if (!grid) return;

  try {
    const res = await window.api.get('/content', { type: 'Movie', limit: 4, sortBy: 'rating' });
    if (res.success && res.items.length > 0) {
      grid.innerHTML = res.items.map(item => window.renderContentCard(item)).join('');
    }
  } catch (err) {
    grid.innerHTML = `<p style="color: var(--text-muted);">Failed to load movies.</p>`;
  }
}

async function loadTopShows() {
  const grid = document.getElementById('popular-shows-grid');
  if (!grid) return;

  try {
    const res = await window.api.get('/content', { type: 'TV Show', limit: 4, sortBy: 'popularity' });
    if (res.success && res.items.length > 0) {
      grid.innerHTML = res.items.map(item => window.renderContentCard(item)).join('');
    }
  } catch (err) {
    grid.innerHTML = `<p style="color: var(--text-muted);">Failed to load shows.</p>`;
  }
}

function scrollCarousel(trackId, direction) {
  const track = document.getElementById(trackId);
  if (track) {
    const scrollAmount = track.clientWidth * 0.75 * direction;
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}
window.scrollCarousel = scrollCarousel;

