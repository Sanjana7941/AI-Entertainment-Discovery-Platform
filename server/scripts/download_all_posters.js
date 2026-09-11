const fs = require('fs');
const path = require('path');

const contentFilePath = path.join(__dirname, '..', 'data', 'content.json');
const outputDir = path.join(__dirname, '..', '..', 'client', 'images', 'content');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Fallback high-res Unsplash image if all else fails
const DEFAULT_FALLBACKS = {
  'Movie': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
  'TV Show': 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&q=80',
  'Web Series': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&q=80',
  'Anime': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
  'Music': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
  'Podcast': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80'
};

async function fetchWithTimeout(url, timeoutMs = 8000, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...(options.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    return null;
  }
}

async function checkUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return false;
  if (url.includes('upload.wikimedia.org')) return false; // Wikimedia sends 429
  try {
    const res = await fetchWithTimeout(url, 5000);
    return res && res.ok && res.headers.get('content-type')?.includes('image');
  } catch (e) {
    return false;
  }
}

async function resolvePoster(item) {
  // First check if current poster works and is not wikimedia
  if (await checkUrl(item.poster)) {
    return item.poster;
  }

  // 1. Music - iTunes Album Search
  if (item.type === 'Music') {
    try {
      const q = encodeURIComponent(`${item.title} ${item.creator || item.director || ''}`.trim());
      const res = await fetchWithTimeout(`https://itunes.apple.com/search?term=${q}&entity=album&limit=1`, 6000);
      if (res && res.ok) {
        const j = await res.json();
        if (j.results && j.results[0] && j.results[0].artworkUrl100) {
          const art = j.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          if (await checkUrl(art)) return art;
        }
      }
    } catch (e) {}
  }

  // 2. Podcast - iTunes Podcast Search
  if (item.type === 'Podcast') {
    try {
      const q = encodeURIComponent(item.title.trim());
      const res = await fetchWithTimeout(`https://itunes.apple.com/search?term=${q}&entity=podcast&limit=1`, 6000);
      if (res && res.ok) {
        const j = await res.json();
        if (j.results && j.results[0]) {
          const art = j.results[0].artworkUrl600 || j.results[0].artworkUrl100?.replace('100x100bb', '600x600bb');
          if (art && await checkUrl(art)) return art;
        }
      }
    } catch (e) {}
  }

  // 3. TV Show or Web Series - TVMaze Search
  if (item.type === 'TV Show' || item.type === 'Web Series') {
    try {
      const res = await fetchWithTimeout(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(item.title)}`, 6000);
      if (res && res.ok) {
        const j = await res.json();
        if (j.image?.original && await checkUrl(j.image.original)) {
          return j.image.original;
        }
      }
    } catch (e) {}
  }

  // 4. Anime - Kitsu Search
  if (item.type === 'Anime') {
    try {
      const res = await fetchWithTimeout(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(item.title)}`, 6000, {
        headers: { 'Accept': 'application/vnd.api+json' }
      });
      if (res && res.ok) {
        const j = await res.json();
        if (j.data && j.data[0] && j.data[0].attributes?.posterImage?.large) {
          const art = j.data[0].attributes.posterImage.large;
          if (await checkUrl(art)) return art;
        }
      }
    } catch (e) {}
  }

  // 5. Movie - OMDB Search
  if (item.type === 'Movie') {
    try {
      const res = await fetchWithTimeout(`https://www.omdbapi.com/?t=${encodeURIComponent(item.title)}&apikey=trilogy`, 6000);
      if (res && res.ok) {
        const j = await res.json();
        if (j.Poster && j.Poster !== 'N/A' && await checkUrl(j.Poster)) {
          return j.Poster;
        }
      }
    } catch (e) {}
  }

  // 6. Fallback
  return DEFAULT_FALLBACKS[item.type] || DEFAULT_FALLBACKS['Movie'];
}

async function downloadImage(url, destPath) {
  try {
    const res = await fetchWithTimeout(url, 10000);
    if (!res || !res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 500) return false;
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('--- Starting Content Poster Sync & Local Cache ---');
  const data = JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));

  // Ensure default fallback image exists
  const fallbackPath = path.join(outputDir, 'fallback.jpg');
  if (!fs.existsSync(fallbackPath)) {
    console.log('Downloading master fallback image...');
    await downloadImage(DEFAULT_FALLBACKS['Movie'], fallbackPath);
  }

  let successCount = 0;
  let fallbackCount = 0;

  const batchSize = 5;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await Promise.all(batch.map(async (item, batchIdx) => {
      const idx = i + batchIdx;
      const localFileName = `${item._id}.jpg`;
      const localFilePath = path.join(outputDir, localFileName);
      const localUrl = `/images/content/${localFileName}`;

      console.log(`[${idx + 1}/${data.length}] Processing [${item.type}] ${item.title}...`);

      let validUrl = await resolvePoster(item);
      let downloaded = false;

      if (validUrl) {
        downloaded = await downloadImage(validUrl, localFilePath);
      }

      if (!downloaded) {
        console.log(`  ⚠ Direct download failed for ${item.title}, using category fallback`);
        const fbUrl = DEFAULT_FALLBACKS[item.type] || DEFAULT_FALLBACKS['Movie'];
        await downloadImage(fbUrl, localFilePath);
        validUrl = fbUrl;
        fallbackCount++;
      } else {
        successCount++;
      }

      item.poster = localUrl;
      item.remotePoster = validUrl;
      try {
        console.log(`  ✓ Saved: ${localFileName} (${fs.statSync(localFilePath).size} bytes)`);
      } catch(e) {}
    }));
  }

  console.log('\n--- Sync Complete ---');
  console.log(`Total items processed: ${data.length}`);
  console.log(`Direct API downloads: ${successCount}`);
  console.log(`Category fallbacks: ${fallbackCount}`);

  // Save updated content.json
  fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('✓ Successfully updated server/data/content.json');

  // Verify all files on disk
  let verified = 0;
  for (const item of data) {
    const p = path.join(outputDir, `${item._id}.jpg`);
    if (fs.existsSync(p) && fs.statSync(p).size > 1000) {
      verified++;
    }
  }
  console.log(`Verified local image files (>1KB): ${verified} / ${data.length}`);
}

main().catch(console.error);
