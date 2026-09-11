/**
 * CineMind AI - Admin Dashboard Controller
 */

let allUsers = [];
let allContent = [];
let editingContentId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.auth.requireAdmin()) return;

  setupAdminTabs();
  loadAdminStats();
  loadUsers();
  loadContent();
  loadReviews();
  setupContentModal();
});

function setupAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  const sections = document.querySelectorAll('.admin-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('selected'));
      sections.forEach(s => s.style.display = 'none');

      tab.classList.add('selected');
      const targetId = tab.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.style.display = 'block';
    });
  });
}

async function loadAdminStats() {
  try {
    const res = await window.api.get('/admin/stats');
    if (!res.success) return;

    const s = res.stats;
    document.getElementById('admin-stat-users').textContent = s.totalUsers;
    document.getElementById('admin-stat-active-users').textContent = s.activeUsers;
    document.getElementById('admin-stat-content').textContent = s.totalContent;
    document.getElementById('admin-stat-ratings').textContent = s.totalRatings;
    document.getElementById('admin-stat-watchlist').textContent = s.totalWatchlistItems;

    // Render Popular Titles
    const popularContainer = document.getElementById('admin-popular-content');
    if (popularContainer && res.mostPopularContent) {
      popularContainer.innerHTML = res.mostPopularContent.map(item => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${item.poster}" style="width: 34px; height: 48px; object-fit: cover; border-radius: 4px;" />
            <div>
              <div style="font-weight: 600; font-size: 0.9rem;">${item.title}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${item.type} • ★ ${item.rating}</div>
            </div>
          </div>
          <span class="badge badge-primary">Score: ${item.popularity}</span>
        </div>
      `).join('');
    }

    // Render Search Trends
    const searchContainer = document.getElementById('admin-search-trends');
    if (searchContainer && res.mostSearched) {
      searchContainer.innerHTML = res.mostSearched.map(s => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.88rem;">
          <span>🔍 "${s.query}"</span>
          <span style="color: var(--accent-secondary); font-weight: 600;">${s.count} searches</span>
        </div>
      `).join('') || '<p style="color: var(--text-muted);">No search trends logged yet.</p>';
    }

    // Render Admin Charts
    if (window.Chart) {
      const typeCtx = document.getElementById('adminTypeChart');
      if (typeCtx && res.typeCounts) {
        new Chart(typeCtx, {
          type: 'pie',
          data: {
            labels: Object.keys(res.typeCounts),
            datasets: [{
              data: Object.values(res.typeCounts),
              backgroundColor: ['#6366f1', '#06b6d4', '#ec4899', '#a855f7', '#fbbf24', '#10b981'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } }
            }
          }
        });
      }

      const genreCtx = document.getElementById('adminGenreChart');
      if (genreCtx && res.topGenres) {
        new Chart(genreCtx, {
          type: 'bar',
          data: {
            labels: res.topGenres.map(g => g.genre),
            datasets: [{
              label: 'Titles in Catalog',
              data: res.topGenres.map(g => g.count),
              backgroundColor: '#6366f1',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8', font: { size: 10 } } },
              y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    }
  } catch (err) {
    console.error('Failed to load admin stats:', err);
  }
}

async function loadUsers() {
  const tableBody = document.getElementById('admin-users-table-body');
  if (!tableBody) return;

  try {
    const res = await window.api.get('/admin/users');
    if (res.success && res.users) {
      allUsers = res.users;
      renderUsersTable(allUsers);
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load users.</td></tr>`;
  }
}

function renderUsersTable(users) {
  const tableBody = document.getElementById('admin-users-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = users.map(u => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
          <div>
            <div style="font-weight: 600;">${u.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">@${u.username}</div>
          </div>
        </div>
      </td>
      <td style="padding: 12px; font-size: 0.88rem;">${u.email}</td>
      <td style="padding: 12px;"><span class="badge ${u.role === 'admin' ? 'badge-gold' : 'badge-primary'}">${u.role}</span></td>
      <td style="padding: 12px;">
        <span class="badge ${u.status === 'active' ? 'badge-cyan' : 'badge-genre'}" style="${u.status === 'disabled' ? 'color: var(--danger);' : ''}">
          ${u.status || 'active'}
        </span>
      </td>
      <td style="padding: 12px; font-size: 0.8rem; color: var(--text-muted);">${new Date(u.createdAt).toLocaleDateString()}</td>
      <td style="padding: 12px; text-align: right;">
        ${u.role !== 'admin' ? `
          <button class="btn btn-outline btn-sm" onclick="toggleUserStatus('${u._id}')" style="margin-right: 6px;">
            ${u.status === 'active' ? 'Disable' : 'Activate'}
          </button>
          <button class="btn btn-outline btn-sm" onclick="deleteUser('${u._id}')" style="color: var(--danger); border-color: rgba(239,68,68,0.3);">
            Delete
          </button>
        ` : `<span style="font-size: 0.78rem; color: var(--text-muted);">Protected</span>`}
      </td>
    </tr>
  `).join('');
}

async function toggleUserStatus(id) {
  try {
    const res = await window.api.put(`/admin/users/${id}/status`);
    showToast(res.message, 'success');
    loadUsers();
  } catch (err) {
    showToast(err.message || 'Failed to update user status.', 'error');
  }
}
window.toggleUserStatus = toggleUserStatus;

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user and all associated history?')) return;
  try {
    const res = await window.api.delete(`/admin/users/${id}`);
    showToast(res.message, 'success');
    loadUsers();
  } catch (err) {
    showToast(err.message || 'Failed to delete user.', 'error');
  }
}
window.deleteUser = deleteUser;

async function loadContent() {
  const tableBody = document.getElementById('admin-content-table-body');
  if (!tableBody) return;

  try {
    const res = await window.api.get('/content', { limit: 100 });
    if (res.success && res.items) {
      allContent = res.items;
      renderContentTable(allContent);
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load content.</td></tr>`;
  }
}

function renderContentTable(items) {
  const tableBody = document.getElementById('admin-content-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = items.map(c => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${c.poster}" style="width: 32px; height: 46px; object-fit: cover; border-radius: 4px;" />
          <span style="font-weight: 600;">${c.title}</span>
        </div>
      </td>
      <td style="padding: 10px;"><span class="badge badge-primary">${c.type}</span></td>
      <td style="padding: 10px; font-size: 0.85rem;">${(c.genres || []).slice(0, 2).join(', ')}</td>
      <td style="padding: 10px; font-size: 0.85rem;">${c.language} • ${c.releaseYear}</td>
      <td style="padding: 10px; color: var(--star-gold); font-weight: 700;">★ ${c.rating}</td>
      <td style="padding: 10px; text-align: right;">
        <button class="btn btn-outline btn-sm" onclick="openEditContentModal('${c._id}')" style="margin-right: 6px;">Edit</button>
        <button class="btn btn-outline btn-sm" onclick="deleteContentItem('${c._id}')" style="color: var(--danger);">Delete</button>
      </td>
    </tr>
  `).join('');
}

function setupContentModal() {
  const openAddBtn = document.getElementById('btn-add-content-modal');
  const form = document.getElementById('content-form');

  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      editingContentId = null;
      document.getElementById('content-modal-title').textContent = 'Add New Entertainment Title';
      form.reset();
      openModal('content-modal');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        title: document.getElementById('content-title').value.trim(),
        description: document.getElementById('content-desc').value.trim(),
        type: document.getElementById('content-type').value,
        genres: document.getElementById('content-genres').value.split(',').map(s => s.trim()),
        language: document.getElementById('content-language').value.trim(),
        releaseYear: parseInt(document.getElementById('content-year').value, 10),
        runtime: document.getElementById('content-runtime').value.trim(),
        rating: parseFloat(document.getElementById('content-rating').value),
        poster: document.getElementById('content-poster').value.trim(),
        backdrop: document.getElementById('content-backdrop').value.trim(),
        trailer: document.getElementById('content-trailer').value.trim(),
        director: document.getElementById('content-director').value.trim(),
        cast: document.getElementById('content-cast').value.split(',').map(s => s.trim()),
        popularity: parseInt(document.getElementById('content-popularity').value, 10) || 80
      };

      try {
        if (editingContentId) {
          await window.api.put(`/content/${editingContentId}`, payload);
          showToast('Content updated successfully!', 'success');
        } else {
          await window.api.post('/content', payload);
          showToast('Content created successfully!', 'success');
        }
        closeModal('content-modal');
        loadContent();
        loadAdminStats();
      } catch (err) {
        showToast(err.message || 'Failed to save content.', 'error');
      }
    });
  }
}

function openEditContentModal(id) {
  const item = allContent.find(c => String(c._id) === String(id));
  if (!item) return;

  editingContentId = id;
  document.getElementById('content-modal-title').textContent = `Edit: ${item.title}`;

  document.getElementById('content-title').value = item.title;
  document.getElementById('content-desc').value = item.description;
  document.getElementById('content-type').value = item.type;
  document.getElementById('content-genres').value = (item.genres || []).join(', ');
  document.getElementById('content-language').value = item.language;
  document.getElementById('content-year').value = item.releaseYear;
  document.getElementById('content-runtime').value = item.runtime || '120 min';
  document.getElementById('content-rating').value = item.rating;
  document.getElementById('content-poster').value = item.poster;
  document.getElementById('content-backdrop').value = item.backdrop || '';
  document.getElementById('content-trailer').value = item.trailer || '';
  document.getElementById('content-director').value = item.director || '';
  document.getElementById('content-cast').value = (item.cast || []).join(', ');
  document.getElementById('content-popularity').value = item.popularity || 80;

  openModal('content-modal');
}
window.openEditContentModal = openEditContentModal;

async function deleteContentItem(id) {
  if (!confirm('Are you sure you want to delete this title?')) return;
  try {
    await window.api.delete(`/content/${id}`);
    showToast('Content item deleted.', 'info');
    loadContent();
    loadAdminStats();
  } catch (err) {
    showToast(err.message || 'Failed to delete content.', 'error');
  }
}
window.deleteContentItem = deleteContentItem;

async function loadReviews() {
  const container = document.getElementById('admin-reviews-list');
  if (!container) return;

  try {
    const res = await window.api.get('/admin/reviews');
    if (res.success && res.reviews) {
      if (res.reviews.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); padding: 20px;">No reviews logged.</p>`;
        return;
      }

      container.innerHTML = res.reviews.map(r => `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; gap: 16px;">
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 2px;">
              ${r.contentTitle || 'Title'} • <span style="color: var(--star-gold);">★ ${r.rating}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 6px;">By ${r.userName} on ${new Date(r.createdAt).toLocaleDateString()}</div>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0;">${r.review || 'No written comment'}</p>
          </div>
          <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: rgba(239,68,68,0.3);" onclick="deleteReviewByAdmin('${r._id}')">
            Remove
          </button>
        </div>
      `).join('');
    }
  } catch (err) {
    container.innerHTML = `<p style="color: var(--danger); padding: 20px;">Failed to load reviews.</p>`;
  }
}

async function deleteReviewByAdmin(id) {
  try {
    await window.api.delete(`/admin/reviews/${id}`);
    showToast('Review removed by administrator.', 'info');
    loadReviews();
    loadAdminStats();
  } catch (err) {
    showToast('Failed to delete review.', 'error');
  }
}
window.deleteReviewByAdmin = deleteReviewByAdmin;
