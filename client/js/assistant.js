/**
 * CineMind AI - AI Entertainment Assistant Controller
 */

let chatHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  setupChat();
  setupQuickPrompts();
});

let isSubmitting = false;

function setupChat() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messagesContainer = document.getElementById('chat-messages');

  if (!form || !input || !messagesContainer) return;

  // Add initial welcome message
  const user = window.auth.getUser();
  const userName = user ? user.name?.split(' ')[0] || user.username : 'friend';

  appendBotMessage(
    `Hello ${userName}! ✨ I'm your **CineMind AI Companion**.\n\n` +
    `Tell me what you're in the mood for, specific actors or directors, duration limits, or ask me for personalized recommendations for tonight!`
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const query = input.value.trim();
    if (query) {
      submitMessage(query);
    }
    return false;
  });
}

function setupQuickPrompts() {
  const pills = document.querySelectorAll('.prompt-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = pill.textContent.trim().replace(/^"|"$/g, '');
      submitMessage(text);
    });
  });
}

async function submitMessage(query) {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  if (!query || isSubmitting) return;

  isSubmitting = true;
  if (input) input.value = '';
  if (sendBtn) sendBtn.disabled = true;

  // Append user bubble
  appendUserMessage(query);

  // Show typing animation
  const typingId = showTypingIndicator();

  try {
    const res = await window.api.post('/assistant/chat', {
      message: query,
      history: chatHistory
    });

    removeTypingIndicator(typingId);

    if (res && res.success) {
      appendBotMessage(res.message, res.recommendations);
      chatHistory.push({ role: 'user', content: query });
      chatHistory.push({ role: 'assistant', content: res.message });
    } else {
      appendBotMessage("I had trouble parsing that. Please try asking in another way!");
    }
  } catch (err) {
    console.error('Assistant error:', err);
    removeTypingIndicator(typingId);
    appendBotMessage("Sorry, I encountered an issue connecting to the recommendation service. Please try again.");
  } finally {
    isSubmitting = false;
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
  }
}

function appendUserMessage(text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-user';
  bubble.textContent = text;
  container.appendChild(bubble);
  scrollToBottom();
}

function appendBotMessage(text, recommendations = []) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bot';

  // Format simple markdown bold and bullet points
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');

  let recsHtml = '';
  if (recommendations && recommendations.length > 0) {
    recsHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-top: 16px;">
        ${recommendations.map(r => `
          <div class="content-card" style="background: rgba(15, 20, 36, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 16px rgba(0,0,0,0.4); transition: transform 0.25s ease;">
            <div style="position: relative; padding-top: 110%; overflow: hidden;">
              <img src="${r.poster}" alt="${r.title}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover;" onerror="this.onerror=null; this.src='/images/content/fallback.jpg';" />
              <div class="ai-score-ring-card" style="font-size: 0.72rem; top: 6px; right: 6px;">✨ ${r.recommendationScore}%</div>
            </div>
            <div style="padding: 12px; display: flex; flex-direction: column; flex: 1;">
              <a href="/details.html?id=${r._id}" style="font-weight: 700; font-size: 0.92rem; color: #fff; margin-bottom: 2px; text-decoration: none;">${r.title}</a>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px;">★ ${r.rating} • ${r.releaseYear} • ${r.type}</div>
              <div style="margin-top: auto; display: flex; gap: 6px;">
                <a href="/details.html?id=${r._id}" class="btn btn-secondary btn-sm" style="flex: 1; padding: 4px 8px; font-size: 0.75rem;">Details</a>
                <a href="/details.html?id=${r._id}" class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 0.75rem; text-decoration: none;">▶ ${r.type === 'Music' ? 'Listen' : 'Trailer'}</a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  bubble.innerHTML = `
    <div style="display: flex; gap: 8px; align-items: flex-start;">
      <span style="font-size: 1.2rem;">✨</span>
      <div style="flex: 1;">
        ${formattedText}
        ${recsHtml}
      </div>
    </div>
  `;

  container.appendChild(bubble);
  scrollToBottom();
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;

  const id = `typing-${Date.now()}`;
  const typing = document.createElement('div');
  typing.id = id;
  typing.className = 'chat-bubble chat-bot chat-typing';
  typing.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  container.appendChild(typing);
  scrollToBottom();
  return id;
}

function removeTypingIndicator(id) {
  if (!id) return;
  const elem = document.getElementById(id);
  if (elem) elem.remove();
}

function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}
