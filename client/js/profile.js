/**
 * CineMind AI - User Profile Controller
 */

let userProfileData = null;

const ALL_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Romance', 'Horror',
  'Thriller', 'Sci-Fi', 'Fantasy', 'Mystery', 'Animation', 'Documentary',
  'Crime', 'Musical'
];

const ALL_LANGUAGES = [
  'English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'Korean', 'Japanese', 'Spanish', 'German'
];

const ALL_TYPES = [
  'Movie', 'TV Show', 'Web Series', 'Anime', 'Music'
];

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.auth.requireAuth()) return;
  loadUserProfile();
  setupEditProfileModal();
});

async function loadUserProfile() {
  try {
    const res = await window.api.get('/users/profile');
    if (!res.success) return;

    userProfileData = res.user;
    const stats = res.stats;

    // Set Profile Header
    const avatar = document.getElementById('profile-avatar');
    if (avatar) avatar.src = userProfileData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';

    document.getElementById('profile-name').textContent = userProfileData.name;
    document.getElementById('profile-username').textContent = `@${userProfileData.username}`;
    document.getElementById('profile-email').textContent = userProfileData.email;
    document.getElementById('profile-role').textContent = userProfileData.role.toUpperCase();

    // Stats
    document.getElementById('profile-stat-movies').textContent = stats.moviesWatched;
    document.getElementById('profile-stat-shows').textContent = stats.showsWatched;
    document.getElementById('profile-stat-hours').textContent = stats.hoursWatched;
    document.getElementById('profile-stat-ratings').textContent = stats.ratingsGiven;
    document.getElementById('profile-stat-streak').textContent = `${stats.currentStreak} Days`;

    // Preferences Display
    const genresContainer = document.getElementById('profile-genres');
    if (genresContainer) {
      genresContainer.innerHTML = (userProfileData.favoriteGenres || []).map(g => `
        <span class="badge badge-primary" style="font-size: 0.85rem; padding: 6px 14px;">${g}</span>
      `).join('') || '<span style="color: var(--text-muted);">None specified</span>';
    }

    const langsContainer = document.getElementById('profile-languages');
    if (langsContainer) {
      langsContainer.innerHTML = (userProfileData.preferredLanguages || []).map(l => `
        <span class="badge badge-cyan" style="font-size: 0.85rem; padding: 6px 14px;">${l}</span>
      `).join('') || '<span style="color: var(--text-muted);">None specified</span>';
    }

    const typesContainer = document.getElementById('profile-types');
    if (typesContainer) {
      typesContainer.innerHTML = (userProfileData.preferredContentTypes || []).map(t => `
        <span class="badge badge-gold" style="font-size: 0.85rem; padding: 6px 14px;">${t}</span>
      `).join('') || '<span style="color: var(--text-muted);">None specified</span>';
    }

    // Load Favorite Content Row
    loadLikedContent(userProfileData.likedContent || []);

  } catch (err) {
    showToast('Failed to load user profile.', 'error');
  }
}

async function loadLikedContent(ids = []) {
  const track = document.getElementById('profile-favorites-track');
  const section = document.getElementById('profile-favorites-section');
  if (!track) return;

  if (ids.length === 0) {
    if (section) section.style.display = 'none';
    return;
  }

  try {
    const res = await window.api.get('/content');
    if (res.success && res.items) {
      const favorites = res.items.filter(c => ids.includes(String(c._id)));
      if (favorites.length > 0) {
        track.innerHTML = favorites.map(f => `
          <div class="carousel-item">
            ${window.renderContentCard(f)}
          </div>
        `).join('');
      } else {
        if (section) section.style.display = 'none';
      }
    }
  } catch {
    if (section) section.style.display = 'none';
  }
}

function setupEditProfileModal() {
  const openBtn = document.getElementById('open-edit-profile-btn');
  const form = document.getElementById('edit-profile-form');
  if (!openBtn || !form) return;

  openBtn.addEventListener('click', () => {
    if (!userProfileData) return;

    document.getElementById('edit-name').value = userProfileData.name;
    document.getElementById('edit-username').value = userProfileData.username;
    document.getElementById('edit-avatar').value = userProfileData.avatar;

    // Populate multi-select chips
    populateChips('edit-genres-chips', ALL_GENRES, userProfileData.favoriteGenres || []);
    populateChips('edit-languages-chips', ALL_LANGUAGES, userProfileData.preferredLanguages || []);
    populateChips('edit-types-chips', ALL_TYPES, userProfileData.preferredContentTypes || []);

    openModal('edit-profile-modal');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('edit-name').value.trim();
    const username = document.getElementById('edit-username').value.trim();
    const avatar = document.getElementById('edit-avatar').value.trim();

    const favoriteGenres = getSelectedChips('edit-genres-chips');
    const preferredLanguages = getSelectedChips('edit-languages-chips');
    const preferredContentTypes = getSelectedChips('edit-types-chips');

    try {
      const res = await window.api.put('/users/profile', {
        name,
        username,
        avatar,
        favoriteGenres,
        preferredLanguages,
        preferredContentTypes
      });

      if (res.success) {
        showToast('Profile updated successfully!', 'success');
        window.auth.api.setUser(res.user);
        closeModal('edit-profile-modal');
        loadUserProfile();
        window.renderGlobalNav(); // Refresh avatar in navbar
      }
    } catch (err) {
      showToast(err.message || 'Error updating profile.', 'error');
    }
  });
}

function populateChips(containerId, options, selected = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const selSet = new Set(selected.map(s => s.toLowerCase()));
  container.innerHTML = options.map(opt => `
    <span class="chip-option ${selSet.has(opt.toLowerCase()) ? 'selected' : ''}" data-val="${opt}" onclick="this.classList.toggle('selected')">
      ${opt}
    </span>
  `).join('');
}

function getSelectedChips(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const selected = container.querySelectorAll('.chip-option.selected');
  return Array.from(selected).map(el => el.dataset.val);
}
