/**
 * CineMind AI - Watch History Controller
 */

let historyList = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.auth.requireAuth()) return;
  loadHistory();
  setupClearHistoryModal();
});

async function loadHistory() {
  const container = document.getElementById('history-timeline');
  const countElem = document.getElementById('history-count');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="skeleton" style="height: 60px; margin-bottom: 12px;"></div>
      <div class="skeleton" style="height: 60px; margin-bottom: 12px;"></div>
      <div class="skeleton" style="height: 60px;"></div>
    </div>
  `;

  try {
    const res = await window.api.get('/history');
    if (!res.success || !res.history || res.history.length === 0) {
      if (countElem) countElem.textContent = '0 items';
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">⏱️</div>
          <h3 style="margin-bottom: 8px;">No Viewing History Yet</h3>
          <p style="color: var(--text-muted); max-width: 400px; margin: 0 auto 20px;">
            Titles you open, preview, or watch will be intelligently logged here to refine your AI recommendation feed.
          </p>
          <a href="/discover.html" class="btn btn-primary">Start Exploring</a>
        </div>
      `;
      return;
    }

    historyList = res.history;
    if (countElem) countElem.textContent = `${historyList.length} items logged`;
    renderHistory(historyList);
  } catch (err) {
    container.innerHTML = `<p style="color: var(--danger); text-align: center; padding: 40px;">Failed to load watch history.</p>`;
  }
}

function renderHistory(items) {
  const container = document.getElementById('history-timeline');
  if (!container) return;

  container.innerHTML = items.map(item => {
    const c = item.content || {};
    const progress = item.progress || 0;
    const isCompleted = item.completed || progress >= 90;
    const dateFormatted = new Date(item.watchedAt || item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px; gap: 18px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 16px; flex: 1 1 300px;">
          <img src="${c.poster || '/images/content/fallback.jpg'}" alt="${c.title}" style="width: 65px; height: 95px; object-fit: cover; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);" onerror="this.onerror=null; this.src='/images/content/fallback.jpg';" />
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="badge badge-primary">${c.type || 'Movie'}</span>
              ${isCompleted ? `<span class="badge badge-cyan">Completed</span>` : `<span class="badge badge-gold">${progress}% in progress</span>`}
            </div>
            <a href="/details.html?id=${c._id}" style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${c.title}</a>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
              Watched on ${dateFormatted}
            </div>

            <!-- Progress bar -->
            <div style="background: rgba(255,255,255,0.08); height: 5px; border-radius: 4px; overflow: hidden; width: 100%; max-width: 280px; margin-top: 8px;">
              <div style="background: ${isCompleted ? 'var(--success)' : 'var(--accent-gradient)'}; width: ${progress}%; height: 100%;"></div>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <a href="/details.html?id=${c._id}" class="btn btn-primary btn-sm">
            ${isCompleted ? 'Watch Again' : 'Resume'}
          </a>
          <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: rgba(239,68,68,0.3);" onclick="removeHistoryRecord('${item._id}')" title="Delete record">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function removeHistoryRecord(id) {
  try {
    await window.api.delete(`/history/${id}`);
    showToast('Removed from history.', 'info');
    historyList = historyList.filter(h => String(h._id) !== String(id));
    renderHistory(historyList);
    const countElem = document.getElementById('history-count');
    if (countElem) countElem.textContent = `${historyList.length} items logged`;
  } catch (err) {
    showToast('Failed to delete history item.', 'error');
  }
}
window.removeHistoryRecord = removeHistoryRecord;

function setupClearHistoryModal() {
  const clearBtn = document.getElementById('clear-all-history-btn');
  const confirmBtn = document.getElementById('confirm-clear-history');

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      openModal('clear-history-modal');
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      try {
        await window.api.delete('/history');
        showToast('Watch history cleared completely.', 'info');
        closeModal('clear-history-modal');
        loadHistory();
      } catch (err) {
        showToast('Failed to clear history.', 'error');
      }
    });
  }
}
