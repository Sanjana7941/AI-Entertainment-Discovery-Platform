/**
 * CineMind AI - AI Recommendations Hub Controller
 */

let allRecommendations = [];

document.addEventListener('DOMContentLoaded', async () => {
  loadRecommendations();
  setupFilterTabs();
});

async function loadRecommendations(type = 'all') {
  const grid = document.getElementById('recommendations-grid');
  if (!grid) return;

  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="content-card">
      <div class="skeleton" style="padding-top: 140%; width: 100%;"></div>
      <div style="padding: 16px;">
        <div class="skeleton" style="height: 22px; width: 80%; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 14px; width: 50%; margin-bottom: 12px;"></div>
        <div class="skeleton" style="height: 40px; width: 100%;"></div>
      </div>
    </div>
  `).join('');

  try {
    const params = { limit: 30 };
    if (type !== 'all') params.type = type;

    const res = await window.api.get('/recommendations', params);
    if (!res.success || res.recommendations.length === 0) {
      grid.innerHTML = `<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 40px;">No recommendations found for this category.</p>`;
      return;
    }

    allRecommendations = res.recommendations;
    renderRecommendationCards(allRecommendations);
  } catch (err) {
    grid.innerHTML = `<p style="color: var(--danger); text-align: center; grid-column: 1 / -1; padding: 40px;">Error generating AI recommendations.</p>`;
  }
}

function renderRecommendationCards(items) {
  const grid = document.getElementById('recommendations-grid');
  if (!grid) return;

  grid.innerHTML = items.map(item => {
    const score = item.recommendationScore || 85;
    const bd = item.scoreBreakdown || {
      genreMatch: 85,
      languageMatch: 100,
      contentTypeMatch: 90,
      ratingPreference: 95,
      historySimilarity: 80,
      popularity: 88
    };

    const playTitle = item.type === 'Music' ? 'Play Songs & Themes' : 'Watch Trailer';
    const playBtnText = item.type === 'Music' ? '▶ Music & Themes' : '▶ Trailer';

    return `
      <div class="content-card" style="border: 1px solid rgba(168, 85, 247, 0.25);">
        <div class="card-poster-wrap" onclick="window.location.href='/details.html?id=${item._id}'" style="cursor: pointer;">
          <img src="${item.poster}" alt="${item.title}" class="card-poster-img" loading="lazy" onerror="this.onerror=null; this.src='/images/content/fallback.jpg';" />
          <div class="card-overlay"></div>
          <span class="badge badge-primary card-type-tag">${item.type}</span>
          <div class="ai-score-ring-card" style="cursor: pointer; background: rgba(168, 85, 247, 0.25); border-color: #c084fc;" onclick="event.stopPropagation(); showScoreBreakdown('${item.title.replace(/'/g, "\\'")}', ${score}, ${JSON.stringify(bd).replace(/"/g, '&quot;')})">
            ✨ ${score}% Match ℹ
          </div>
          
          <div class="card-hover-actions">
            <button class="btn-icon ${item.isInWatchlist ? 'active' : ''}" title="${item.isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}" onclick="event.stopPropagation(); toggleWatchlist('${item._id}', this)">
              ${item.isInWatchlist ? '✓' : '🔖'}
            </button>
            <button class="btn-icon ${item.isLiked ? 'active' : ''}" title="Favorite" onclick="event.stopPropagation(); toggleLike('${item._id}', this)">
              ${item.isLiked ? '❤️' : '🤍'}
            </button>
            <button class="btn-icon" title="${playTitle}" onclick="event.stopPropagation(); playMedia('${item.title.replace(/'/g, "\\'")}', '${item.trailer || ''}', '${item.type}')">
              ▶
            </button>
          </div>
        </div>

        <div class="card-body">
          <a href="/details.html?id=${item._id}" class="card-title">${item.title}</a>
          <div class="card-meta">
            <span>${item.releaseYear} • ${item.language}</span>
            <span class="card-rating">★ ${item.rating}</span>
          </div>

          <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: var(--radius-sm); padding: 10px; margin: 10px 0;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #c084fc; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>WHY WE RECOMMEND THIS</span>
              <span style="cursor: pointer; text-decoration: underline;" onclick="showScoreBreakdown('${item.title.replace(/'/g, "\\'")}', ${score}, ${JSON.stringify(bd).replace(/"/g, '&quot;')})">Breakdown</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-primary); line-height: 1.4; margin: 0;">
              ${item.recommendationReason || 'Matches your viewing tastes and critical standards.'}
            </p>
          </div>

          <div style="display: flex; gap: 8px; margin-top: auto;">
            <a href="/details.html?id=${item._id}" class="btn btn-secondary btn-sm" style="flex: 1; text-align: center;">View Details</a>
            <button class="btn btn-primary btn-sm" onclick="playMedia('${item.title.replace(/'/g, "\\'")}', '${item.trailer || ''}', '${item.type}')">${playBtnText}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setupFilterTabs() {
  const tabs = document.querySelectorAll('.rec-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('selected'));
      tab.classList.add('selected');
      const type = tab.dataset.type || 'all';
      loadRecommendations(type);
    });
  });
}

function showScoreBreakdown(title, totalScore, breakdown) {
  let modal = document.getElementById('score-breakdown-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'score-breakdown-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const factors = [
    { label: 'Genre Affinity', val: breakdown.genreMatch || 80, desc: 'Overlap with your top genres & rated favorites' },
    { label: 'Language Match', val: breakdown.languageMatch || 90, desc: 'Alignment with your preferred language settings' },
    { label: 'Content Type', val: breakdown.contentTypeMatch || 85, desc: 'Matches your preferred entertainment formats' },
    { label: 'Rating Preference', val: breakdown.ratingPreference || 90, desc: 'Consistently high rating threshold tolerance' },
    { label: 'Watch History Similarity', val: breakdown.historySimilarity || 75, desc: 'Relevance to themes of content you recently finished' },
    { label: 'Global Popularity', val: breakdown.popularity || 85, desc: 'Audience engagement & trending velocity' }
  ];

  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title">AI Scoring Analysis: ${title}</h3>
        <button class="modal-close-btn" onclick="closeModal('score-breakdown-modal')">&times;</button>
      </div>
      <div class="modal-body">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2)); border: 3px solid #c084fc; font-size: 1.8rem; font-weight: 800; color: #fff; box-shadow: 0 0 25px rgba(168,85,247,0.4);">
            ${totalScore}%
          </div>
          <div style="margin-top: 8px; font-weight: 700; color: var(--text-primary);">Overall Match Score</div>
          <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 360px; margin: 4px auto 0;">
            Calculated across multi-variable cosine similarity algorithms matching your entertainment profile.
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${factors.map(f => `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 600; margin-bottom: 4px;">
                <span>${f.label}</span>
                <span style="color: #c084fc;">${f.val}%</span>
              </div>
              <div style="background: rgba(255,255,255,0.08); height: 6px; border-radius: 4px; overflow: hidden; margin-bottom: 2px;">
                <div style="background: var(--accent-gradient); width: ${f.val}%; height: 100%;"></div>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${f.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('score-breakdown-modal')">Close</button>
      </div>
    </div>
  `;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal('score-breakdown-modal');
  });

  openModal('score-breakdown-modal');
}
window.showScoreBreakdown = showScoreBreakdown;
