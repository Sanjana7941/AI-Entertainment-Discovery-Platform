/**
 * CineMind AI - Content Details Controller
 */

let currentContent = null;
let currentRating = 5;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const contentId = params.get('id');

  if (!contentId) {
    window.location.href = '/discover.html';
    return;
  }

  loadDetails(contentId);
  setupStarRater();
  setupReviewForm(contentId);
});

async function loadDetails(id) {
  try {
    const res = await window.api.get(`/content/${id}`);
    if (!res.success || !res.content) {
      showToast('Content not found.', 'error');
      setTimeout(() => { window.location.href = '/discover.html'; }, 1500);
      return;
    }

    currentContent = res.content;
    const item = currentContent;

    // Set page title
    document.title = `${item.title} - CineMind AI`;

    // Render Backdrop with vibrant ambient background
    const backdropElem = document.getElementById('details-backdrop');
    if (backdropElem) {
      const bg = (item.backdrop && !item.backdrop.includes('tmdb.org')) ? item.backdrop : item.poster;
      backdropElem.style.backgroundImage = `url('${bg || '/images/content/fallback.jpg'}')`;
      backdropElem.style.backgroundSize = 'cover';
      backdropElem.style.backgroundPosition = 'center';
      backdropElem.style.filter = 'blur(12px) brightness(0.55)';
    }

    // Poster & Artist Profile Picture
    const posterElem = document.getElementById('details-poster');
    const posterWrap = posterElem ? posterElem.parentElement : null;
    if (posterElem) {
      posterElem.src = item.poster;
      posterElem.onerror = () => {
        posterElem.onerror = null;
        posterElem.src = '/images/content/fallback.jpg';
      };
    }

    const heroElem = document.querySelector('.details-hero');
    if (item.type === 'Music') {
      if (heroElem) heroElem.style.alignItems = 'center';
      if (posterWrap && posterElem) {
        posterWrap.style.borderRadius = '50%';
        posterWrap.style.width = '240px';
        posterWrap.style.height = '240px';
        posterWrap.style.flex = '0 0 240px';
        posterWrap.style.overflow = 'hidden';
        posterWrap.style.border = '4px solid var(--accent-primary)';
        posterWrap.style.boxShadow = '0 0 40px rgba(99,102,241,0.5)';
        posterWrap.style.background = '#121629';
        posterElem.style.borderRadius = '50%';
        posterElem.style.width = '100%';
        posterElem.style.height = '100%';
        posterElem.style.objectFit = 'cover';
        posterElem.style.display = 'block';
      }
    } else {
      if (heroElem) heroElem.style.alignItems = 'flex-start';
      if (posterWrap && posterElem) {
        posterWrap.style.borderRadius = 'var(--radius-xl)';
        posterWrap.style.width = '';
        posterWrap.style.height = '';
        posterWrap.style.flex = '0 0 260px';
        posterWrap.style.overflow = 'hidden';
        posterWrap.style.border = '2px solid rgba(255,255,255,0.12)';
        posterWrap.style.boxShadow = 'var(--shadow-lg)';
        posterElem.style.borderRadius = '0';
        posterElem.style.width = '100%';
        posterElem.style.height = 'auto';
        posterElem.style.objectFit = 'cover';
        posterElem.style.display = 'block';
      }
    }

    // Title, Meta, Genres
    document.getElementById('details-title').textContent = item.title;
    
    const scoreBadge = document.getElementById('details-score-badge');
    const ratingBadge = document.getElementById('details-rating');
    const genresContainer = document.getElementById('details-genres');
    const metaElem = document.getElementById('details-meta');

    if (item.type === 'Music') {
      if (scoreBadge) scoreBadge.style.display = 'none';
      if (ratingBadge) ratingBadge.style.display = 'none';
      if (genresContainer) genresContainer.style.display = 'none';
      if (metaElem) {
        const songCount = (item.tracks && item.tracks.length) || 0;
        metaElem.innerHTML = `<span style="color: #c084fc; font-weight: 700; font-size: 1.05rem;">Verified Artist</span> • <span style="color: var(--text-primary); font-weight: 600;">${songCount} Full Songs & Themes</span>`;
      }
    } else {
      if (scoreBadge) {
        scoreBadge.style.display = 'inline-flex';
        scoreBadge.textContent = `✨ ${item.recommendationScore || 88}% AI Match`;
      }
      if (ratingBadge) {
        ratingBadge.style.display = 'inline-flex';
        ratingBadge.textContent = `★ ${item.rating}`;
      }
      if (genresContainer) {
        genresContainer.style.display = 'flex';
        genresContainer.innerHTML = (item.genres || []).map(g => `<span class="badge badge-primary">${g}</span>`).join('');
      }
      if (metaElem) {
        metaElem.textContent = `${item.releaseYear} • ${item.runtime || '120 min'} • ${item.language} • ${item.type}`;
      }
    }

    // Description & Cast Visibility (Hidden for Music - Artist Name & Songs Only)
    const overviewSec = document.getElementById('details-overview-container');
    const castSec = document.getElementById('details-cast-container');
    const aiReasonSec = document.getElementById('details-ai-reason-section');
    const reviewsSec = document.getElementById('details-reviews-section');
    const similarSec = document.getElementById('details-similar-section');

    if (item.type === 'Music') {
      if (overviewSec) overviewSec.style.display = 'none';
      if (castSec) castSec.style.display = 'none';
      if (aiReasonSec) aiReasonSec.style.display = 'none';
      if (reviewsSec) reviewsSec.style.display = 'none';
      if (similarSec) similarSec.style.display = 'none';
    } else {
      if (overviewSec) overviewSec.style.display = 'block';
      if (castSec) castSec.style.display = 'grid';
      if (aiReasonSec) aiReasonSec.style.display = 'block';
      if (reviewsSec) reviewsSec.style.display = 'block';
      if (similarSec) similarSec.style.display = 'block';

      // Set Description
      document.getElementById('details-desc').textContent = item.description;

      // Cast & Director labels
      const castLabel = document.getElementById('details-cast-label');
      const directorLabel = document.getElementById('details-director-label');
      if (castLabel) castLabel.textContent = 'Starring / Voices';
      if (directorLabel) directorLabel.textContent = 'Director / Creator';

      // Cast & Director values
      const castElem = document.getElementById('details-cast');
      if (castElem) castElem.textContent = (item.cast || []).join(', ') || item.creator || 'Various Artists';

      const dirElem = document.getElementById('details-director');
      if (dirElem) dirElem.textContent = item.director || item.creator || 'CineMind Curators';
    }

    // Player Sections Setup
    const playerSec = document.getElementById('details-player-section');
    const musicSec = document.getElementById('details-music-player-section');
    const trailerBtn = document.getElementById('btn-play-trailer');
    const fullscreenBtn = document.getElementById('btn-fullscreen-player');

    if (item.type === 'Music') {
      // Hide video iframe player to eliminate YouTube embedding restrictions completely
      if (playerSec) playerSec.style.display = 'none';
      if (musicSec) musicSec.style.display = 'block';

      // Setup dedicated Native HTML5 Jukebox & Theme player
      setupNativeMusicPlayer(item);

      if (trailerBtn) {
        trailerBtn.textContent = '▶ Play All Songs';
        trailerBtn.onclick = () => {
          if (musicSec) {
            musicSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          playSelectedTrack(0);
        };
      }
    } else {
      // Non-music titles: Stream full movies, series, anime with Cinema Player
      if (playerSec) playerSec.style.display = 'block';
      if (musicSec) musicSec.style.display = 'none';

      setupCinemaPlayer(item);
    }

    const watchlistBtn = document.getElementById('btn-toggle-watchlist');
    if (watchlistBtn) {
      const isMusic = item.type === 'Music';
      const activeLabel = isMusic ? '✓ Saved Artist' : '✓ In Watchlist';
      const inactiveLabel = isMusic ? '+ Save Artist' : '+ Add to Watchlist';

      if (res.userState.isInWatchlist) {
        watchlistBtn.classList.add('active');
        watchlistBtn.textContent = activeLabel;
      } else {
        watchlistBtn.textContent = inactiveLabel;
      }
      watchlistBtn.onclick = () => {
        const inList = watchlistBtn.classList.contains('active');
        window.toggleWatchlist(item._id, null);
        if (inList) {
          watchlistBtn.classList.remove('active');
          watchlistBtn.textContent = inactiveLabel;
        } else {
          watchlistBtn.classList.add('active');
          watchlistBtn.textContent = activeLabel;
        }
      };
    }

    const likeBtn = document.getElementById('btn-toggle-like');
    if (likeBtn) {
      if (res.userState.isLiked) {
        likeBtn.classList.add('active');
        likeBtn.innerHTML = '❤️ Liked';
      } else {
        likeBtn.innerHTML = '🤍 Favorite';
      }
      likeBtn.onclick = async () => {
        await window.toggleLike(item._id, null);
        likeBtn.classList.toggle('active');
        likeBtn.innerHTML = likeBtn.classList.contains('active') ? '❤️ Liked' : '🤍 Favorite';
      };
    }

    // Why We Recommend This Box
    const aiReasonElem = document.getElementById('details-ai-reason');
    if (aiReasonElem) {
      aiReasonElem.textContent = item.recommendationReason || "Matches your affinity for captivating storylines and top-tier critical acclaim.";
    }

    // Auto-record progress in watch history if user is logged in
    if (window.auth.isLoggedIn()) {
      window.api.post('/history', {
        contentId: item._id,
        progress: 10,
        durationMinutes: 10
      }).catch(() => {});
    }

    // Render Discography & Tracks (for Music)
    renderTracklistOrEpisodes(item);

    // Render Reviews and Similar Content (for Movies, Shows, Anime only)
    if (item.type !== 'Music') {
      renderReviews(res.reviews, res.userState);
      loadSimilar(item._id);
    }

  } catch (err) {
    console.error('Error loading content details:', err);
    showToast('Failed to load content information.', 'error');
  }
}

function setupStarRater() {
  const stars = document.querySelectorAll('.star-rating-widget .star-icon');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      currentRating = parseInt(star.dataset.val, 10);
      updateStarUI(currentRating);
    });
  });
}

function updateStarUI(val) {
  const stars = document.querySelectorAll('.star-rating-widget .star-icon');
  stars.forEach(s => {
    const starVal = parseInt(s.dataset.val, 10);
    s.classList.toggle('active', starVal <= val);
  });
  const label = document.getElementById('rating-val-display');
  if (label) label.textContent = `${val} / 5 Stars`;
}

function setupReviewForm(contentId) {
  const form = document.getElementById('review-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!window.auth.isLoggedIn()) {
      showToast('Please sign in to leave a review.', 'info');
      return;
    }

    const reviewText = document.getElementById('review-text-input')?.value || '';

    try {
      const res = await window.api.post('/ratings', {
        contentId,
        rating: currentRating,
        review: reviewText
      });

      if (res.success) {
        showToast(res.message, 'success');
        document.getElementById('review-text-input').value = '';
        // Reload details to refresh reviews
        loadDetails(contentId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit review.', 'error');
    }
  });
}

function renderReviews(reviews = [], userState = {}) {
  const container = document.getElementById('reviews-list');
  if (!container) return;

  if (reviews.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-muted); padding: 16px 0;">No community reviews yet. Be the first to share your thoughts!</p>
    `;
    return;
  }

  container.innerHTML = reviews.map(r => `
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; margin-bottom: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${r.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
          <div>
            <div style="font-weight: 600; font-size: 0.92rem;">${r.userName || 'Anonymous'}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(r.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <div style="color: var(--star-gold); font-weight: 700; font-size: 0.95rem;">
          ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
        </div>
      </div>
      <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
        ${r.review || 'Rated without written comment.'}
      </p>
    </div>
  `).join('');
}

async function loadSimilar(contentId) {
  const track = document.getElementById('similar-content-track');
  if (!track) return;

  try {
    const res = await window.api.get(`/recommendations/similar/${contentId}`);
    if (res.success && res.recommendations.length > 0) {
      track.innerHTML = res.recommendations.map(item => `
        <div class="carousel-item">
          ${window.renderContentCard(item)}
        </div>
      `).join('');
    } else {
      track.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">No similar titles found.</p>`;
    }
  } catch (err) {
    track.innerHTML = `<p style="color: var(--text-muted);">Failed to load recommendations.</p>`;
  }
}

let currentTrackIndex = 0;
let audioElement = null;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function setupNativeMusicPlayer(item) {
  audioElement = document.getElementById('native-music-audio');
  if (!audioElement || !item.tracks || item.tracks.length === 0) return;

  const vinyl = document.getElementById('music-vinyl-disc');
  const deckCover = document.getElementById('music-deck-cover');
  const equalizer = document.getElementById('music-equalizer');
  const playPauseBtn = document.getElementById('btn-music-play-pause');
  const prevBtn = document.getElementById('btn-music-prev');
  const nextBtn = document.getElementById('btn-music-next');
  const progressBar = document.getElementById('music-progress-bar');
  const timeCurrent = document.getElementById('music-time-current');
  const timeTotal = document.getElementById('music-time-total');
  const volumeSlider = document.getElementById('music-volume');
  const volIcon = document.getElementById('music-vol-icon');

  if (deckCover) {
    deckCover.src = item.poster || '/images/content/fallback.jpg';
  }

  // Pre-load track 0 details without autoplay
  loadTrackToPlayer(0, false);

  // Play / Pause toggle
  if (playPauseBtn) {
    playPauseBtn.onclick = () => {
      if (!audioElement.src || audioElement.src === '' || audioElement.src === window.location.href) {
        playSelectedTrack(currentTrackIndex);
        return;
      }
      if (audioElement.paused) {
        audioElement.play().catch(e => console.warn('Audio playback error:', e));
      } else {
        audioElement.pause();
      }
    };
  }

  // Previous Track
  if (prevBtn) {
    prevBtn.onclick = () => {
      const prevIdx = currentTrackIndex > 0 ? currentTrackIndex - 1 : item.tracks.length - 1;
      playSelectedTrack(prevIdx);
    };
  }

  // Next Track
  if (nextBtn) {
    nextBtn.onclick = () => {
      const nextIdx = (currentTrackIndex + 1) % item.tracks.length;
      playSelectedTrack(nextIdx);
    };
  }

  // Audio Playback Events
  audioElement.onplay = () => {
    if (playPauseBtn) playPauseBtn.innerHTML = '❚❚';
    if (vinyl) vinyl.classList.add('spinning');
    if (equalizer) equalizer.classList.add('playing');
    highlightActiveTrackRow(currentTrackIndex, true);
  };

  audioElement.onpause = () => {
    if (playPauseBtn) playPauseBtn.innerHTML = '▶';
    if (vinyl) vinyl.classList.remove('spinning');
    if (equalizer) equalizer.classList.remove('playing');
    highlightActiveTrackRow(currentTrackIndex, false);
  };

  audioElement.ontimeupdate = () => {
    if (!audioElement.duration || isNaN(audioElement.duration)) return;
    const cur = audioElement.currentTime;
    const dur = audioElement.duration;
    if (progressBar) progressBar.value = (cur / dur) * 100;
    if (timeCurrent) timeCurrent.textContent = formatTime(cur);
    if (timeTotal) timeTotal.textContent = formatTime(dur);
  };

  audioElement.onended = () => {
    // Auto-advance to next song in the discography!
    const nextIdx = (currentTrackIndex + 1) % item.tracks.length;
    playSelectedTrack(nextIdx);
  };

  audioElement.onerror = () => {
    console.warn('Audio stream preview ended or encountered network delay.');
  };

  // Scrubber Seeking
  if (progressBar) {
    progressBar.oninput = () => {
      if (audioElement.duration) {
        audioElement.currentTime = (progressBar.value / 100) * audioElement.duration;
      }
    };
  }

  // Volume
  if (volumeSlider) {
    volumeSlider.oninput = () => {
      audioElement.volume = volumeSlider.value / 100;
      if (volIcon) {
        volIcon.textContent = volumeSlider.value == 0 ? '🔇' : (volumeSlider.value < 50 ? '🔉' : '🔊');
      }
    };
  }

  if (volIcon) {
    volIcon.onclick = () => {
      if (audioElement.muted) {
        audioElement.muted = false;
        volIcon.textContent = '🔊';
        if (volumeSlider) volumeSlider.value = (audioElement.volume * 100) || 85;
      } else {
        audioElement.muted = true;
        volIcon.textContent = '🔇';
        if (volumeSlider) volumeSlider.value = 0;
      }
    };
  }
}

function loadTrackToPlayer(idx, autoplay = false) {
  if (!currentContent || !currentContent.tracks || !currentContent.tracks[idx]) return;
  currentTrackIndex = idx;
  const track = currentContent.tracks[idx];

  const activeTitle = document.getElementById('music-active-title');
  const activeSubtitle = document.getElementById('music-active-subtitle');
  const nowPlayingTag = document.getElementById('music-now-playing-tag');
  const timeTotal = document.getElementById('music-time-total');
  const progressBar = document.getElementById('music-progress-bar');
  const audio = document.getElementById('native-music-audio');

  if (activeTitle) activeTitle.textContent = track.title;
  if (activeSubtitle) activeSubtitle.textContent = `${track.subtitle || currentContent.title} • ${currentContent.creator || currentContent.director || 'Artist'}`;
  if (nowPlayingTag) nowPlayingTag.textContent = `Now Playing • Track ${idx + 1} of ${currentContent.tracks.length}`;
  if (timeTotal && track.duration) timeTotal.textContent = track.duration;
  if (progressBar) progressBar.value = 0;

  if (audio) {
    const audioSrc = track.audioUrl || track.streamUrl;
    if (audioSrc && !audio.src.endsWith(audioSrc)) {
      audio.src = audioSrc;
      audio.load();
    }
    if (autoplay) {
      audio.play().catch(err => console.warn('Playback waiting for interaction:', err));
    }
  }

  highlightActiveTrackRow(idx, autoplay);
}

function highlightActiveTrackRow(idx, isPlaying) {
  document.querySelectorAll('.track-row').forEach((row, i) => {
    const playBtn = row.querySelector('.track-play-btn');
    const titleEl = row.querySelector('.track-row-title');
    const listenBtn = row.querySelector('.track-listen-btn');
    if (i === idx) {
      row.classList.add('active-playing');
      if (playBtn) {
        playBtn.innerHTML = isPlaying ? '❚❚' : '▶';
        playBtn.style.background = isPlaying ? 'var(--accent-primary)' : 'rgba(99,102,241,0.25)';
      }
      if (titleEl) titleEl.style.color = '#c084fc';
      if (listenBtn) {
        listenBtn.textContent = isPlaying ? '❚❚ Playing' : '▶ Resume';
        listenBtn.classList.add('btn-primary');
        listenBtn.classList.remove('btn-outline');
      }
    } else {
      row.classList.remove('active-playing');
      if (playBtn) {
        playBtn.innerHTML = '▶';
        playBtn.style.background = 'rgba(99,102,241,0.25)';
      }
      if (titleEl) titleEl.style.color = 'var(--text-primary)';
      if (listenBtn) {
        listenBtn.textContent = '▶ Listen';
        listenBtn.classList.remove('btn-primary');
        listenBtn.classList.add('btn-outline');
      }
    }
  });

  const activeBanner = document.getElementById('active-track-banner');
  const activeName = document.getElementById('active-track-name');
  if (activeBanner && activeName && currentContent && currentContent.tracks && currentContent.tracks[idx]) {
    const track = currentContent.tracks[idx];
    activeBanner.style.display = 'flex';
    activeName.textContent = `${track.title} (${track.subtitle || currentContent.creator || ''})`;
  }
}

function playSelectedTrack(idx) {
  if (!currentContent || !currentContent.tracks || !currentContent.tracks[idx]) return;

  const audio = document.getElementById('native-music-audio');
  if (currentTrackIndex === idx && audio && audio.src && !audio.paused) {
    // If clicking same track currently playing, toggle pause
    audio.pause();
    return;
  }

  loadTrackToPlayer(idx, true);

  const track = currentContent.tracks[idx];
  showToast(`Now playing "${track.title}"`, 'success');

  if (window.auth && window.auth.isLoggedIn()) {
    window.api.post('/history', {
      contentId: currentContent._id,
      contentTitle: `${currentContent.title} - ${track.title}`,
      progress: 35,
      durationMinutes: 4
    }).catch(() => {});
  }
}
window.playSelectedTrack = playSelectedTrack;

function renderTracklistOrEpisodes(item) {
  const section = document.getElementById('details-tracklist-section');
  const container = document.getElementById('tracklist-container');
  const titleElem = document.getElementById('tracklist-heading-text');
  const subtitleElem = document.getElementById('tracklist-subtitle');
  const iconElem = document.getElementById('tracklist-icon');
  const countBadge = document.getElementById('tracklist-count-badge');
  if (!section || !container) return;

  const list = item.tracks;

  if (!list || list.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  if (iconElem) iconElem.textContent = '🎵';
  if (titleElem) titleElem.textContent = `Songs by ${item.title}`;
  if (subtitleElem) subtitleElem.textContent = 'Full studio tracks • Click any song to listen';
  if (countBadge) countBadge.textContent = `${list.length} Songs`;

  container.innerHTML = list.map((track, idx) => `
    <div class="track-row" id="track-row-${idx}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-radius: var(--radius-lg); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); transition: all 0.25s ease; cursor: pointer;" onclick="playSelectedTrack(${idx})">
      <div style="display: flex; align-items: center; gap: 14px; flex: 1;">
        <span class="track-index" style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); width: 22px; text-align: center;">${idx + 1}</span>
        <button type="button" class="btn-icon track-play-btn" style="width: 34px; height: 34px; font-size: 0.82rem; flex-shrink: 0; background: rgba(99,102,241,0.25); border: 1px solid rgba(99,102,241,0.4); color: #fff;">▶</button>
        <div>
          <div class="track-row-title" style="font-weight: 700; font-size: 0.98rem; color: var(--text-primary); margin-bottom: 2px;">${track.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${track.subtitle || item.creator || ''}</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span style="font-size: 0.85rem; color: var(--text-muted); font-variant-numeric: tabular-nums;">${track.duration || '3:45'}</span>
        <button type="button" class="btn btn-outline btn-sm track-listen-btn" style="padding: 5px 12px; font-size: 0.8rem; border-color: rgba(99,102,241,0.4); color: #c7d2fe;">▶ Listen</button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// OFFICIAL TRAILER PLAYER & THEATER ENGINE
// ==========================================

let isTheaterMode = false;

function setupCinemaPlayer(item) {
  const playerHeading = document.getElementById('player-heading');
  const playerSubheading = document.getElementById('player-subheading');
  const playerIcon = document.getElementById('player-icon');
  const formatBadge = document.getElementById('player-format-badge');
  const trailerBtn = document.getElementById('btn-play-trailer');
  const fullscreenBtn = document.getElementById('btn-fullscreen-player');
  const theaterBtn = document.getElementById('btn-theater-mode');
  const iframe = document.getElementById('details-media-iframe');

  const isMovie = (item.type === 'Movie');

  if (playerIcon) {
    playerIcon.textContent = isMovie ? '🎬' : (item.type === 'Anime' ? '⚔️' : '📺');
  }

  if (playerHeading) {
    playerHeading.textContent = `${item.title} - Official Trailer`;
  }

  if (playerSubheading) {
    playerSubheading.textContent = `Official cinematic trailer & high-definition preview (${item.releaseYear} • ${item.language})`;
  }

  if (formatBadge) {
    formatBadge.textContent = isMovie ? '✨ 4K UHD Trailer' : '✨ 1080p HD Trailer';
  }

  // Set trailer iframe
  if (iframe) {
    let trailerUrl = item.trailer || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    if (trailerUrl.includes('watch?v=')) {
      trailerUrl = trailerUrl.replace('watch?v=', 'embed/');
    }
    iframe.src = trailerUrl;
  }

  if (theaterBtn) {
    theaterBtn.onclick = toggleTheaterMode;
  }

  if (fullscreenBtn) {
    fullscreenBtn.onclick = () => {
      window.playMedia(item.title, item.trailer, 'Trailer');
    };
  }

  if (trailerBtn) {
    trailerBtn.textContent = '▶ Watch Trailer';
    trailerBtn.onclick = () => {
      const playerSec = document.getElementById('details-player-section');
      if (playerSec) {
        playerSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (window.auth && window.auth.isLoggedIn()) {
        window.api.post('/history', {
          contentId: item._id,
          contentTitle: `${item.title} (Trailer)`,
          progress: 100,
          durationMinutes: 3
        }).catch(() => {});
      }
    };
  }
}

function toggleTheaterMode() {
  isTheaterMode = !isTheaterMode;
  const overlay = document.getElementById('theater-backdrop-overlay');
  const playerSec = document.getElementById('details-player-section');
  const textElem = document.getElementById('theater-mode-text');
  const glow = document.getElementById('cinema-ambient-glow');

  if (overlay) {
    overlay.style.opacity = isTheaterMode ? '1' : '0';
    overlay.style.pointerEvents = isTheaterMode ? 'auto' : 'none';
  }

  if (playerSec) {
    playerSec.style.zIndex = isTheaterMode ? '950' : '1';
    if (isTheaterMode) {
      playerSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (glow) {
    glow.style.opacity = isTheaterMode ? '1' : '0.85';
    glow.style.inset = isTheaterMode ? '-35px' : '-15px';
  }

  if (textElem) {
    textElem.textContent = isTheaterMode ? 'Lights On' : 'Lights Off';
  }

  showToast(isTheaterMode ? 'Theater Mode activated. Lights dimmed.' : 'Theater Mode disabled.', 'info');
}
window.toggleTheaterMode = toggleTheaterMode;


