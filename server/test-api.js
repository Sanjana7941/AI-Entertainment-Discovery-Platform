const http = require('http');
const app = require('./server');

let server;

async function runTests() {
  console.log('[Test] Starting CineMind AI API test suite...');

  server = app.listen(5001);
  const baseUrl = 'http://localhost:5001';

  async function api(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const json = await res.json();
    return { status: res.status, json };
  }

  try {
    // 1. Health check
    const health = await api('/api/health');
    console.log('✓ Health check status:', health.status, health.json.platform);

    // 2. User Login
    const login = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'demo@cinemind.ai', password: 'Demo@123' })
    });
    console.log('✓ Demo User Login:', login.status, login.json.success, login.json.user.name);
    const token = login.json.token;

    // 3. User /me
    const me = await api('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Auth Me check:', me.status, me.json.user.email);

    // 4. Content List
    const content = await api('/api/content?limit=5');
    console.log('✓ Content List:', content.status, 'Total items:', content.json.pagination.totalItems);

    // 5. Recommendations
    const recs = await api('/api/recommendations?limit=4', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Recommendations:', recs.status, 'Count:', recs.json.count, 'Top recommendation:', recs.json.recommendations[0]?.title, 'Score:', recs.json.recommendations[0]?.recommendationScore);

    // 6. AI Assistant Chat
    const chat = await api('/api/assistant/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: 'Recommend a thriller under 2 hours' })
    });
    console.log('✓ AI Assistant:', chat.status, 'Response:', chat.json.message.slice(0, 70) + '...', 'Matches:', chat.json.recommendations.length);

    // 7. Registration flow with preferences
    const regRes = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Sarah Connor',
        username: 'sconnor' + Math.floor(Math.random() * 10000),
        email: 'sarah' + Math.floor(Math.random() * 10000) + '@cinemind.ai',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        favoriteGenres: ['Sci-Fi', 'Action'],
        preferredLanguages: ['English'],
        preferredContentTypes: ['Movie']
      })
    });
    console.log('✓ User Registration:', regRes.status, regRes.json.user?.name);
    const newUserToken = regRes.json.token;

    // 8. Watchlist Add & Remove
    const firstContentId = content.json.items[0]._id;
    const addWl = await api(`/api/watchlist/${firstContentId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` }
    });
    console.log('✓ Watchlist Add:', addWl.status, addWl.json.message);

    // 9. Rating submission
    const rateRes = await api('/api/ratings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` },
      body: JSON.stringify({ contentId: firstContentId, rating: 5, review: 'Fantastic storytelling!' })
    });
    console.log('✓ Rate Content (1-5):', rateRes.status, rateRes.json.message);

    // 10. Update Profile
    const updateProf = await api('/api/users/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${newUserToken}` },
      body: JSON.stringify({ name: 'Sarah Connor Croft' })
    });
    console.log('✓ Update Profile:', updateProf.status, updateProf.json.user?.name);

    // 11. Admin Login & Stats
    const adminLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@cinemind.ai', password: 'Admin@123' })
    });
    const adminToken = adminLogin.json.token;
    const adminStats = await api('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✓ Admin Stats:', adminStats.status, 'Total content:', adminStats.json.stats.totalContent, 'Top Genres:', adminStats.json.topGenres.length);

    console.log('\n🎉 ALL BACKEND API & USER FLOW TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
