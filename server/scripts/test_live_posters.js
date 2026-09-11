const fs = require('fs');
const path = require('path');

(async () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'content.json'), 'utf8'));
  console.log('Total items in content.json:', data.length);

  // Check sample items across all categories
  const testIndices = [0, 10, 25, 35, 45, 55, 65, 75, 85, 92];
  for (const idx of testIndices) {
    const item = data[idx];
    const res = await fetch('http://localhost:5000' + item.poster);
    console.log(`[${item.type}] "${item.title}": HTTP ${res.status}, Type: ${res.headers.get('content-type')}, Size: ${res.headers.get('content-length')} bytes`);
  }

  // Check details endpoint for Music, Podcast, Movie, Anime
  const categories = ['Movie', 'Anime', 'Music', 'Podcast', 'TV Show', 'Web Series'];
  console.log('\n--- Checking Details API for all 6 categories ---');
  for (const cat of categories) {
    const item = data.find(i => i.type === cat);
    const res = await fetch('http://localhost:5000/api/content/' + item._id);
    const json = await res.json();
    console.log(`✓ [${cat}] "${item.title}": success=${json.success}, poster=${json.content?.poster}, trailer=${json.content?.trailer ? 'OK' : 'MISSING'}`);
  }
})();
