const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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

function getSaavnSong(query) {
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
        fullTitle: sObj.song
      };
    }
  } catch(e) {
    // ignore
  }
  return null;
}

// Test on 3 diverse songs
console.log('Testing Vikram Title Track:');
console.log(getSaavnSong('Anirudh Vikram Title Track'));

console.log('Testing Kun Faya Kun:');
console.log(getSaavnSong('A.R. Rahman Kun Faya Kun'));

console.log('Testing Blinding Lights:');
console.log(getSaavnSong('The Weeknd Blinding Lights'));
