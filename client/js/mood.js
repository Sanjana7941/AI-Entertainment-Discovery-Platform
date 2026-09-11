/**
 * CineMind AI - Mood Explorer Controller
 */

const MOOD_DATA = [
  { id: 'happy', emoji: '😊', title: 'Happy', tag: 'Comedy / Feel-Good', desc: 'Uplifting stories, bright comedies, and joyous music to elevate your spirits.', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)' },
  { id: 'emotional', emoji: '😢', title: 'Emotional', tag: 'Drama / Romance', desc: 'Heartfelt, poignant cinema and melodies that move the deepest parts of your soul.', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.45)' },
  { id: 'excited', emoji: '🔥', title: 'Excited', tag: 'Action / Sci-Fi', desc: 'High-octane spectacles, electrifying thrillers, and adrenaline-pumping anime.', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.45)' },
  { id: 'relaxed', emoji: '😌', title: 'Relaxed', tag: 'Chill / Ambient', desc: 'Easygoing music, calming ambient themes, and comforting slice-of-life journeys.', color: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
  { id: 'scared', emoji: '😱', title: 'Scared', tag: 'Horror / Thriller', desc: 'Chilling psychological horrors, dark mysteries, and jump-scare masterclasses.', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.45)' },
  { id: 'romantic', emoji: '❤️', title: 'Romantic', tag: 'Romance / Music', desc: 'Warm love stories, sweet romantic comedies, and heartfelt musical serenades.', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.45)' },
  { id: 'curious', emoji: '🧠', title: 'Curious', tag: 'Mystery / Sci-Fi', desc: 'Mind-bending quantum puzzles, thought-provoking mysteries, and sci-fi epics.', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)' },
  { id: 'energetic', emoji: '⚡', title: 'Energetic', tag: 'Action / Dance', desc: 'Pumping basslines, dynamic anime battles, and fast-paced adventure sagas.', color: '#eab308', glow: 'rgba(234, 179, 8, 0.45)' },
  { id: 'lonely', emoji: '🌙', title: 'Lonely', tag: 'Introspective', desc: 'Soulful late-night companions, contemplative dramas, and comforting voices.', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.45)' },
  { id: 'funny', emoji: '😂', title: 'Funny', tag: 'Comedy / Satire', desc: 'Witty satires, stand-up gold, and hilarious escapades to guarantee continuous laughter.', color: '#f97316', glow: 'rgba(249, 115, 22, 0.45)' }
];

let selectedMood = 'happy';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const requestedMood = params.get('mood');
  if (requestedMood && MOOD_DATA.some(m => m.id === requestedMood.toLowerCase())) {
    selectedMood = requestedMood.toLowerCase();
  }

  renderMoodGrid();
  loadMoodRecommendations(selectedMood);
});

function renderMoodGrid() {
  const grid = document.getElementById('mood-buttons-grid');
  if (!grid) return;

  grid.innerHTML = MOOD_DATA.map(m => {
    const isSelected = m.id === selectedMood;
    return `
      <div class="mood-card ${isSelected ? 'selected' : ''}" onclick="selectMood('${m.id}')" style="cursor: pointer; background: ${isSelected ? `linear-gradient(145deg, rgba(20,25,45,0.9), rgba(10,14,28,0.95))` : 'var(--bg-card)'}; border: 2px solid ${isSelected ? m.color : 'rgba(255,255,255,0.08)'}; border-radius: var(--radius-xl); padding: 22px 18px; text-align: center; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: ${isSelected ? `0 12px 30px rgba(0,0,0,0.6), 0 0 25px ${m.glow}` : '0 4px 16px rgba(0,0,0,0.2)'}; transform: ${isSelected ? 'translateY(-6px)' : 'none'};">
        <div style="font-size: 2.8rem; margin-bottom: 10px; transition: transform 0.3s ease; display: inline-block;">${m.emoji}</div>
        <h4 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px; color: ${isSelected ? m.color : '#fff'};">${m.title}</h4>
        <span class="badge" style="font-size: 0.72rem; margin-bottom: 8px; background: rgba(255,255,255,0.06); border: 1px solid ${isSelected ? m.color : 'rgba(255,255,255,0.1)'}; color: ${isSelected ? m.color : 'var(--text-secondary)'};">${m.tag}</span>
        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">${m.desc}</p>
      </div>
    `;
  }).join('');
}

function selectMood(moodId) {
  selectedMood = moodId;
  renderMoodGrid();
  loadMoodRecommendations(moodId);

  // Update URL without page refresh
  const url = new URL(window.location);
  url.searchParams.set('mood', moodId);
  window.history.pushState({}, '', url);
}
window.selectMood = selectMood;

async function loadMoodRecommendations(moodId) {
  const grid = document.getElementById('mood-results-grid');
  const banner = document.getElementById('mood-active-banner');
  const moodObj = MOOD_DATA.find(m => m.id === moodId) || MOOD_DATA[0];

  if (banner) {
    banner.innerHTML = `
      <div style="background: linear-gradient(135deg, ${moodObj.glow.replace('0.45', '0.18')}, rgba(10,14,28,0.85)); border: 1px solid ${moodObj.color}66; border-radius: var(--radius-xl); padding: 24px 28px; margin-bottom: 32px; display: flex; align-items: center; gap: 20px; box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 30px ${moodObj.glow.replace('0.45', '0.2')};">
        <div style="font-size: 3.4rem; filter: drop-shadow(0 0 14px ${moodObj.glow});">${moodObj.emoji}</div>
        <div style="flex: 1;">
          <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; color: ${moodObj.color}; letter-spacing: 0.08em; margin-bottom: 2px;">Active Atmosphere</div>
          <h3 style="margin-bottom: 4px; font-size: 1.45rem; font-weight: 800;">Immersing You in ${moodObj.title.toUpperCase()}</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin: 0; line-height: 1.5;">${moodObj.desc}</p>
        </div>
      </div>
    `;
  }

  if (!grid) return;

  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="content-card">
      <div class="skeleton" style="padding-top: 140%; width: 100%;"></div>
      <div style="padding: 16px;">
        <div class="skeleton" style="height: 20px; width: 70%; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 14px; width: 40%;"></div>
      </div>
    </div>
  `).join('');

  try {
    const res = await window.api.get(`/recommendations/mood/${moodId}`, { limit: 12 });
    if (!res.success || !res.recommendations || res.recommendations.length === 0) {
      grid.innerHTML = `<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1; padding: 40px;">No titles found for this mood.</p>`;
      return;
    }

    grid.innerHTML = res.recommendations.map(item => window.renderContentCard(item)).join('');
  } catch (err) {
    grid.innerHTML = `<p style="color: var(--danger); text-align: center; grid-column: 1 / -1; padding: 40px;">Failed to load mood picks.</p>`;
  }
}
