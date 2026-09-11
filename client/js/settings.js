/**
 * CineMind AI - User Settings Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.auth.requireAuth()) return;

  setupPasswordForm();
  setupAppearanceTheme();
  setupPrivacyActions();
});

function setupPasswordForm() {
  const form = document.getElementById('change-password-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    try {
      const res = await window.api.put('/users/password', { currentPassword, newPassword });
      if (res.success) {
        showToast('Password updated successfully!', 'success');
        form.reset();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update password.', 'error');
    }
  });
}

function setupAppearanceTheme() {
  const themeSelect = document.getElementById('theme-select');
  if (!themeSelect) return;

  const currentTheme = localStorage.getItem('cinemind_theme') || 'dark';
  themeSelect.value = currentTheme;

  themeSelect.addEventListener('change', () => {
    const selected = themeSelect.value;
    localStorage.setItem('cinemind_theme', selected);
    document.documentElement.setAttribute('data-theme', selected);
    showToast(`Appearance changed to ${selected} mode.`, 'success');
  });
}

function setupPrivacyActions() {
  // Clear search history
  const clearSearchBtn = document.getElementById('btn-clear-search-history');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', async () => {
      try {
        await window.api.delete('/search/history');
        showToast('Search history cleared.', 'success');
      } catch (err) {
        showToast('Failed to clear search history.', 'error');
      }
    });
  }

  // Clear watch history
  const clearWatchBtn = document.getElementById('btn-clear-watch-history');
  if (clearWatchBtn) {
    clearWatchBtn.addEventListener('click', async () => {
      try {
        await window.api.delete('/history');
        showToast('Watch history cleared.', 'success');
      } catch (err) {
        showToast('Failed to clear watch history.', 'error');
      }
    });
  }

  // Delete account modal & confirmation
  const openDeleteBtn = document.getElementById('btn-open-delete-modal');
  const confirmDeleteBtn = document.getElementById('btn-confirm-delete-account');

  if (openDeleteBtn) {
    openDeleteBtn.addEventListener('click', () => {
      openModal('delete-account-modal');
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      try {
        const res = await window.api.delete('/users/account');
        if (res.success) {
          showToast('Account permanently deleted. Goodbye!', 'info');
          window.auth.logout();
        }
      } catch (err) {
        showToast(err.message || 'Failed to delete account.', 'error');
      }
    });
  }
}
