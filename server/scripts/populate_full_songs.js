const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const contentFilePath = path.join(__dirname, '..', 'data', 'content.json');
let content = JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));

function decryptUrl(enc) {
  try {
    const decipher = crypto.createDecipheriv('des-ecb', Buffer.from('38346591', 'utf8'), '');
    decipher.setAutoPadding(true);
    let dec = decipher.update(enc, 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec.replace(/_96\./, '_320.').replace(/_160\./, '_320.');
  } catch(e) {
    return null;
  }
}

function searchFullSong(query) {
  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`;
    const rawSearch = execSync(`curl.exe -s --max-time 4 "${searchUrl}"`, { encoding: 'utf8' });
    const searchData = JSON.parse(rawSearch);
    if (!searchData.songs || !searchData.songs.data || searchData.songs.data.length === 0) {
      return null;
    }
    const songId = searchData.songs.data[0].id;
    const detUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${songId}`;
    const rawDet = execSync(`curl.exe -s --max-time 4 "${detUrl}"`, { encoding: 'utf8' });
    const detData = JSON.parse(rawDet);
    const sObj = detData[songId];
    if (sObj && sObj.encrypted_media_url) {
      const fullUrl = decryptUrl(sObj.encrypted_media_url);
      const mins = Math.floor(sObj.duration / 60);
      const secs = sObj.duration % 60;
      return {
        audioUrl: fullUrl,
        duration: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
        title: sObj.song
      };
    }
  } catch(e) {
    // ignore
  }
  return null;
}

// Artist profiles with high-resolution portraits
const artistProfiles = {
  "f12ec42d0b6abc82cbf9c854": {
    name: "Anirudh Ravichander",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/9da0a547b39e99bc35c6a9724aef91bf/1000x1000-000000-80-0-0.jpg"
  },
  "39c2335a11cf99226d664835": {
    name: "A.R. Rahman",
    profilePic: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/A._R._Rahman_at_the_7th_annual_Asian_Awards_in_London.jpg/640px-A._R._Rahman_at_the_7th_annual_Asian_Awards_in_London.jpg"
  },
  "827c23368196dbe7ff35aafa": {
    name: "Hans Zimmer",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/1bd0b9f7a3cf12e01bdcc26fa69673f7/1000x1000-000000-80-0-0.jpg"
  },
  "67eb9d63f74261fee2829bff": {
    name: "The Weeknd",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/1000x1000-000000-80-0-0.jpg"
  },
  "2b512fe85219a99fe9b644f7": {
    name: "Taylor Swift",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/e528e270424103b527f8a27ac625563b/1000x1000-000000-80-0-0.jpg"
  },
  "9fc712e3aa78c5d93dc553f7": {
    name: "Daft Punk",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/f2bc007e9133c946ac3c3f5dd515d902/1000x1000-000000-80-0-0.jpg"
  },
  "1518eb0c651b98b99808114e": {
    name: "Sid Sriram",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/95a5f782e431fc3c80ffc7e3a9fa9b19/1000x1000-000000-80-0-0.jpg"
  },
  "6c19b50184fcc4e40fad6743": {
    name: "Pritam & Arijit Singh",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/8f8e02d68f237efb71f92e70c50c0587/1000x1000-000000-80-0-0.jpg"
  },
  "24675539723135f3153b96fb": {
    name: "Kendrick Lamar",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/8f64585149a4f4f2c040d6e6f1f4e1f7/1000x1000-000000-80-0-0.jpg"
  },
  "ef1d964e90156c8fac437386": {
    name: "Pink Floyd",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/0b1c03bf4e8c1f9c8d197600bbfa1f3f/1000x1000-000000-80-0-0.jpg"
  },
  "98dd29b44d4bc2ecc5b6fa11": {
    name: "BTS",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/11a5ef8c8f047df146059d481f335b7e/1000x1000-000000-80-0-0.jpg"
  },
  "5d769ad4f02938dda0b34108": {
    name: "Ludwig Göransson",
    profilePic: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Ludwig_G%C3%B6ransson_by_Gage_Skidmore_2.jpg/640px-Ludwig_G%C3%B6ransson_by_Gage_Skidmore_2.jpg"
  },
  "215ef74ae03b57259b3fe66e": {
    name: "Billie Eilish",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/77bcf7b2b733b8a1c97a55227d8db8f7/1000x1000-000000-80-0-0.jpg"
  },
  "d715258578173573a5212e46": {
    name: "Adele",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/bb8f407747cb9a9415c89895c10443fb/1000x1000-000000-80-0-0.jpg"
  },
  "ef607f5bcf8f62556207be35": {
    name: "Miles Davis",
    profilePic: "https://cdn-images.dzcdn.net/images/artist/0150d0eb30e7039a03fc5b9ad1176b6d/1000x1000-000000-80-0-0.jpg"
  }
};

async function processAllMusic() {
  console.log('Starting full song enrichment and artist profile updates...');

  for (const item of content) {
    if (item.type !== 'Music') continue;

    const profile = artistProfiles[item._id];
    if (profile) {
      console.log(`\n========================================`);
      console.log(`Processing: ${profile.name} (ID: ${item._id})`);
      console.log(`========================================`);

      // 1. Update Title to pure artist name
      item.title = profile.name;
      item.creator = profile.name;
      item.director = profile.name;
      item.remotePoster = profile.profilePic;

      // 2. Download profile picture locally
      const localImagePath = path.join(__dirname, '..', '..', 'client', 'images', 'content', `${item._id}.jpg`);
      try {
        execSync(`curl.exe -s -L --max-time 6 -o "${localImagePath}" "${profile.profilePic}"`);
        if (fs.existsSync(localImagePath) && fs.statSync(localImagePath).size > 1000) {
          item.poster = `/images/content/${item._id}.jpg`;
          console.log(`  ✓ Downloaded profile photo for ${profile.name}`);
        }
      } catch(e) {
        console.warn(`  ! Could not download profile photo: ${e.message}`);
      }

      // 3. Resolve FULL song audio URL for each track
      if (Array.isArray(item.tracks)) {
        for (let i = 0; i < item.tracks.length; i++) {
          const track = item.tracks[i];
          const query = `${profile.name} ${track.title}`;
          process.stdout.write(`  [${i + 1}/${item.tracks.length}] ${track.title} ... `);

          const fullSong = searchFullSong(query) || searchFullSong(track.title);
          if (fullSong && fullSong.audioUrl) {
            track.audioUrl = fullSong.audioUrl;
            track.duration = fullSong.duration;
            track.isFullSong = true;
            console.log(`SUCCESS (Full 320kbps: ${fullSong.duration})`);
          } else {
            console.log(`KEPT EXISTING PREVIEW`);
          }
        }
      }
    }
  }

  // Save content.json
  fs.writeFileSync(contentFilePath, JSON.stringify(content, null, 2), 'utf8');
  console.log('\n[Complete] Successfully updated content.json with full songs and artist profiles.');
}

processAllMusic();
