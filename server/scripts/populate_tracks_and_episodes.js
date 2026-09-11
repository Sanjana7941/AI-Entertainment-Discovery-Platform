const fs = require('fs');
const path = require('path');

const contentFilePath = path.join(__dirname, '..', 'data', 'content.json');
const data = JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));

const musicTracks = {
  "Discovery": [
    { title: "One More Time", subtitle: "Discovery (2001)", duration: "5:20", streamUrl: "https://www.youtube.com/embed/FGBhQbmPwH8" },
    { title: "Harder, Better, Faster, Stronger", subtitle: "Discovery (2001)", duration: "3:45", streamUrl: "https://www.youtube.com/embed/gAjR4_CbPpQ" },
    { title: "Aerodynamic", subtitle: "Discovery (2001)", duration: "3:27", streamUrl: "https://www.youtube.com/embed/L93-7vRfxNs" },
    { title: "Digital Love", subtitle: "Discovery (2001)", duration: "4:58", streamUrl: "https://www.youtube.com/embed/FxzBmqZVIf0" },
    { title: "Something About Us", subtitle: "Discovery (2001)", duration: "3:51", streamUrl: "https://www.youtube.com/embed/em0MknB6wFo" }
  ],
  "Hans Zimmer - Live in Prague": [
    { title: "Time (Inception Suite)", subtitle: "Live in Prague", duration: "4:35", streamUrl: "https://www.youtube.com/embed/1kQZ2uLp4r0" },
    { title: "Cornfield Chase (Interstellar)", subtitle: "Live in Prague", duration: "2:06", streamUrl: "https://www.youtube.com/embed/UDVtMYqUAyw" },
    { title: "Gladiator Suite - Now We Are Free", subtitle: "Live in Prague", duration: "4:14", streamUrl: "https://www.youtube.com/embed/NBE-uBgtINg" },
    { title: "The Dark Knight Medley", subtitle: "Live in Prague", duration: "6:05", streamUrl: "https://www.youtube.com/embed/1yKq1PRvPJQ" },
    { title: "Pirates of the Caribbean Suite", subtitle: "Live in Prague", duration: "6:57", streamUrl: "https://www.youtube.com/embed/cR_QK93Z3fE" }
  ],
  "A.R. Rahman: Best of Pure Soundtracks": [
    { title: "Chaiyya Chaiyya", subtitle: "Dil Se.. (1998)", duration: "6:54", streamUrl: "https://www.youtube.com/embed/9g_hKov_p1Q" },
    { title: "Kun Faya Kun", subtitle: "Rockstar (2011)", duration: "7:53", streamUrl: "https://www.youtube.com/embed/T94PHkuydcw" },
    { title: "Jai Ho", subtitle: "Slumdog Millionaire (2008)", duration: "5:19", streamUrl: "https://www.youtube.com/embed/xwwAVRyNmgQ" },
    { title: "Maa Tujhe Salaam", subtitle: "Vande Mataram (1997)", duration: "6:12", streamUrl: "https://www.youtube.com/embed/e_Z6X_vA_8g" },
    { title: "Tere Bina", subtitle: "Guru (2007)", duration: "5:09", streamUrl: "https://www.youtube.com/embed/v9Ym3L3N6m8" },
    { title: "Aaromale", subtitle: "Vinnaithaandi Varuvaayaa (2010)", duration: "5:45", streamUrl: "https://www.youtube.com/embed/zHj23HlQ_lY" }
  ],
  "Anirudh: The Rock-Star Symphony": [
    { title: "Vikram Title Track", subtitle: "Vikram (2022)", duration: "3:36", streamUrl: "https://www.youtube.com/embed/OKBMCL-frPU" },
    { title: "Badass", subtitle: "Leo (2023)", duration: "3:49", streamUrl: "https://www.youtube.com/embed/Po3jStA673E" },
    { title: "Hukum - Thalaivar Alappara", subtitle: "Jailer (2023)", duration: "3:27", streamUrl: "https://www.youtube.com/embed/1F3hm6MfR1k" },
    { title: "Arabic Kuthu - Halamithi Habibo", subtitle: "Beast (2022)", duration: "4:40", streamUrl: "https://www.youtube.com/embed/KUN5Uf9mObQ" },
    { title: "Why This Kolaveri Di", subtitle: "3 (2012)", duration: "4:06", streamUrl: "https://www.youtube.com/embed/YR12Z8f1Dh8" }
  ],
  "After Hours": [
    { title: "Blinding Lights", subtitle: "After Hours (2020)", duration: "3:20", streamUrl: "https://www.youtube.com/embed/4NRXx6U8ABQ" },
    { title: "Save Your Tears", subtitle: "After Hours (2020)", duration: "3:35", streamUrl: "https://www.youtube.com/embed/XXYlFuWEuKI" },
    { title: "In Your Eyes", subtitle: "After Hours (2020)", duration: "3:57", streamUrl: "https://www.youtube.com/embed/dqRZDebPIGs" },
    { title: "After Hours", subtitle: "After Hours (2020)", duration: "6:01", streamUrl: "https://www.youtube.com/embed/ygTZZpVkm3o" },
    { title: "Heartless", subtitle: "After Hours (2020)", duration: "3:18", streamUrl: "https://www.youtube.com/embed/1DpH-icPpl0" }
  ],
  "Folklore": [
    { title: "Cardigan", subtitle: "Folklore (2020)", duration: "3:59", streamUrl: "https://www.youtube.com/embed/K-a8s8OLBSE" },
    { title: "Exile (feat. Bon Iver)", subtitle: "Folklore (2020)", duration: "4:45", streamUrl: "https://www.youtube.com/embed/osdoLjUNFnA" },
    { title: "The 1", subtitle: "Folklore (2020)", duration: "3:30", streamUrl: "https://www.youtube.com/embed/KsZ6tROaVOQ" },
    { title: "August", subtitle: "Folklore (2020)", duration: "4:21", streamUrl: "https://www.youtube.com/embed/nn_0zPAfyo8" },
    { title: "My Tears Ricochet", subtitle: "Folklore (2020)", duration: "4:15", streamUrl: "https://www.youtube.com/embed/OWbDJFtHl3w" }
  ],
  "To Pimp a Butterfly": [
    { title: "Alright", subtitle: "To Pimp a Butterfly (2015)", duration: "3:39", streamUrl: "https://www.youtube.com/embed/Z-48u_BlwkE" },
    { title: "King Kunta", subtitle: "To Pimp a Butterfly (2015)", duration: "3:54", streamUrl: "https://www.youtube.com/embed/hRK7PVJFbS8" },
    { title: "The Blacker the Berry", subtitle: "To Pimp a Butterfly (2015)", duration: "5:28", streamUrl: "https://www.youtube.com/embed/6AhXSoKa8gk" },
    { title: "i", subtitle: "To Pimp a Butterfly (2015)", duration: "3:51", streamUrl: "https://www.youtube.com/embed/s0QtdISwioc" },
    { title: "Wesley's Theory", subtitle: "To Pimp a Butterfly (2015)", duration: "4:47", streamUrl: "https://www.youtube.com/embed/d3s1G1s1d2Q" }
  ],
  "The Dark Side of the Moon": [
    { title: "Time", subtitle: "The Dark Side of the Moon (1973)", duration: "6:53", streamUrl: "https://www.youtube.com/embed/rL3AgkwbYgo" },
    { title: "Money", subtitle: "The Dark Side of the Moon (1973)", duration: "6:22", streamUrl: "https://www.youtube.com/embed/cpbbuaIA3Ds" },
    { title: "Us and Them", subtitle: "The Dark Side of the Moon (1973)", duration: "7:50", streamUrl: "https://www.youtube.com/embed/DLOth-BuCNY" },
    { title: "The Great Gig in the Sky", subtitle: "The Dark Side of the Moon (1973)", duration: "4:44", streamUrl: "https://www.youtube.com/embed/T13se_2A7c8" },
    { title: "Brain Damage / Eclipse", subtitle: "The Dark Side of the Moon (1973)", duration: "5:58", streamUrl: "https://www.youtube.com/embed/DVQ3Ku34hj8" }
  ],
  "Pritam & Arijit Singh - Soulful Serenades": [
    { title: "Kesariya", subtitle: "Brahmastra (2022)", duration: "4:28", streamUrl: "https://www.youtube.com/embed/BddP6PYo2gs" },
    { title: "Channa Mereya", subtitle: "Ae Dil Hai Mushkil (2016)", duration: "4:49", streamUrl: "https://www.youtube.com/embed/284Ov7ysmfA" },
    { title: "Tum Hi Ho", subtitle: "Aashiqui 2 (2013)", duration: "4:22", streamUrl: "https://www.youtube.com/embed/Umqb9KENgmk" },
    { title: "Shayad", subtitle: "Love Aaj Kal (2020)", duration: "4:07", streamUrl: "https://www.youtube.com/embed/VNdPX_xWfEQ" },
    { title: "Gerua", subtitle: "Dilwale (2015)", duration: "5:45", streamUrl: "https://www.youtube.com/embed/AEIVhBS6baE" }
  ],
  "Map of the Soul: 7": [
    { title: "ON", subtitle: "Map of the Soul: 7 (2020)", duration: "4:06", streamUrl: "https://www.youtube.com/embed/mPVDGOVjRQ0" },
    { title: "Black Swan", subtitle: "Map of the Soul: 7 (2020)", duration: "3:18", streamUrl: "https://www.youtube.com/embed/0lapF49Z0sw" },
    { title: "Boy With Luv (feat. Halsey)", subtitle: "Map of the Soul: 7 (2020)", duration: "3:49", streamUrl: "https://www.youtube.com/embed/XsX3ATc3FbA" },
    { title: "Filter", subtitle: "Map of the Soul: 7 (2020)", duration: "3:00", streamUrl: "https://www.youtube.com/embed/q_G2b41hMvA" },
    { title: "My Time", subtitle: "Map of the Soul: 7 (2020)", duration: "3:54", streamUrl: "https://www.youtube.com/embed/3vM_0K-8m1g" }
  ],
  "Ludwig Göransson: Oppenheimer Score": [
    { title: "Can You Hear the Music", subtitle: "Oppenheimer OST (2023)", duration: "1:50", streamUrl: "https://www.youtube.com/embed/t9tQ7e8dK4w" },
    { title: "Destroyer of Worlds", subtitle: "Oppenheimer OST (2023)", duration: "2:54", streamUrl: "https://www.youtube.com/embed/P6M6q0nOQeA" },
    { title: "Oppenheimer", subtitle: "Oppenheimer OST (2023)", duration: "2:16", streamUrl: "https://www.youtube.com/embed/F4qH34iR2_s" },
    { title: "Fusion", subtitle: "Oppenheimer OST (2023)", duration: "3:55", streamUrl: "https://www.youtube.com/embed/ZzE-uB_R8cQ" },
    { title: "Quantum Mechanics", subtitle: "Oppenheimer OST (2023)", duration: "3:00", streamUrl: "https://www.youtube.com/embed/9g_hKov_p1Q" }
  ],
  "Happier Than Ever": [
    { title: "Happier Than Ever", subtitle: "Happier Than Ever (2021)", duration: "4:58", streamUrl: "https://www.youtube.com/embed/5GJWxDKyk3A" },
    { title: "bad guy", subtitle: "When We All Fall Asleep (2019)", duration: "3:14", streamUrl: "https://www.youtube.com/embed/DyDfgMOUjCI" },
    { title: "Therefore I Am", subtitle: "Happier Than Ever (2021)", duration: "2:54", streamUrl: "https://www.youtube.com/embed/RUQl6YcMalg" },
    { title: "ocean eyes", subtitle: "Don't Smile at Me (2017)", duration: "3:20", streamUrl: "https://www.youtube.com/embed/viimfQi_pDA" },
    { title: "everything i wanted", subtitle: "Single (2019)", duration: "4:05", streamUrl: "https://www.youtube.com/embed/egVU042Tqcw" }
  ],
  "Sid Sriram: Soul & Classical Vibrations": [
    { title: "Ennodu Nee Irundhaal", subtitle: "I (2015)", duration: "5:52", streamUrl: "https://www.youtube.com/embed/0Q2fW6qL0x8" },
    { title: "Srivalli", subtitle: "Pushpa: The Rise (2021)", duration: "3:41", streamUrl: "https://www.youtube.com/embed/hcMzwMrr1tE" },
    { title: "Inkem Inkem Inkem Kaavaale", subtitle: "Geetha Govindam (2018)", duration: "4:28", streamUrl: "https://www.youtube.com/embed/fXWqG92p-1w" },
    { title: "Kadhaippoma", subtitle: "Oh My Kadavule (2020)", duration: "4:20", streamUrl: "https://www.youtube.com/embed/uE4eE5j-p5U" },
    { title: "Marakkuma Nenjam", subtitle: "Vendhu Thanindhathu Kaadu (2022)", duration: "4:16", streamUrl: "https://www.youtube.com/embed/UeGvA621j9A" }
  ],
  "21": [
    { title: "Rolling in the Deep", subtitle: "21 (2011)", duration: "3:48", streamUrl: "https://www.youtube.com/embed/rYEDA3JcQqw" },
    { title: "Someone Like You", subtitle: "21 (2011)", duration: "4:45", streamUrl: "https://www.youtube.com/embed/hLQl3WQQoQ0" },
    { title: "Set Fire to the Rain", subtitle: "21 (2011)", duration: "4:02", streamUrl: "https://www.youtube.com/embed/Ri7-vnrJD3k" },
    { title: "Rumour Has It", subtitle: "21 (2011)", duration: "3:43", streamUrl: "https://www.youtube.com/embed/u_Fv0d77kF4" },
    { title: "Turning Tables", subtitle: "21 (2011)", duration: "4:10", streamUrl: "https://www.youtube.com/embed/bsUrYgf7v30" }
  ],
  "Kind of Blue": [
    { title: "So What", subtitle: "Kind of Blue (1959)", duration: "9:22", streamUrl: "https://www.youtube.com/embed/kbxtYqA6ypM" },
    { title: "Freddie Freeloader", subtitle: "Kind of Blue (1959)", duration: "9:46", streamUrl: "https://www.youtube.com/embed/RPfFhfSuUZ4" },
    { title: "Blue in Green", subtitle: "Kind of Blue (1959)", duration: "5:37", streamUrl: "https://www.youtube.com/embed/PoPL7BExSQU" },
    { title: "All Blues", subtitle: "Kind of Blue (1959)", duration: "11:33", streamUrl: "https://www.youtube.com/embed/c0A-r327_8Q" },
    { title: "Flamenco Sketches", subtitle: "Kind of Blue (1959)", duration: "9:26", streamUrl: "https://www.youtube.com/embed/kY1yU3e7jX0" }
  ]
};

const podcastEpisodes = {
  "The Joe Rogan Experience": [
    { title: "Ep. #1309 - Naval Ravikant on Happiness, Tech & Wealth", duration: "2h 11m", subtitle: "Naval Ravikant", streamUrl: "https://www.youtube.com/embed/3qHkcs3kG44" },
    { title: "Ep. #1169 - Elon Musk on AI, Simulation & Electric Future", duration: "2h 37m", subtitle: "Elon Musk", streamUrl: "https://www.youtube.com/embed/ycPr5-FLMQg" },
    { title: "Ep. #1757 - Dr. Robert Malone on Medical Innovation", duration: "3h 06m", subtitle: "Dr. Robert Malone", streamUrl: "https://www.youtube.com/embed/k-x_p_2bE3U" },
    { title: "Ep. #1994 - Mark Zuckerberg on Quest, Meta & VR", duration: "2h 45m", subtitle: "Mark Zuckerberg", streamUrl: "https://www.youtube.com/embed/5D3v5Xp3fEw" }
  ],
  "Huberman Lab": [
    { title: "Master Your Sleep & Enhance Daytime Alertness", duration: "1h 58m", subtitle: "Sleep Architecture & Protocols", streamUrl: "https://www.youtube.com/embed/gX73f3gR5X0" },
    { title: "How to Focus & Beat Distraction", duration: "2h 14m", subtitle: "Attention & Neurobiology", streamUrl: "https://www.youtube.com/embed/hFL6qEC03l8" },
    { title: "Leverage Dopamine for Motivation & Grit", duration: "2h 16m", subtitle: "Dopamine Chemistry & Drive", streamUrl: "https://www.youtube.com/embed/QmOF0crdyRU" },
    { title: "Optimize Brain Chemistry & Physical Energy", duration: "2h 05m", subtitle: "Nootropics & Physical Protocols", streamUrl: "https://www.youtube.com/embed/DkS1pkKpY74" }
  ],
  "Lex Fridman Podcast": [
    { title: "Ep. #367 - Sam Altman: OpenAI, GPT-4, and Future of AGI", duration: "2h 25m", subtitle: "Sam Altman", streamUrl: "https://www.youtube.com/embed/L_Guz73e6fw" },
    { title: "Ep. #400 - Elon Musk: War, AI, Aliens, and Truth", duration: "8h 18m", subtitle: "Elon Musk", streamUrl: "https://www.youtube.com/embed/JN3KPFbWCy8" },
    { title: "Ep. #388 - Jeff Bezos: Blue Origin, Amazon, and Humanity", duration: "2h 11m", subtitle: "Jeff Bezos", streamUrl: "https://www.youtube.com/embed/dcUX_aDO0-c" },
    { title: "Ep. #371 - Max Tegmark: The AI Revolution", duration: "3h 40m", subtitle: "Max Tegmark", streamUrl: "https://www.youtube.com/embed/rGQZl3w176c" }
  ],
  "Dan Carlin's Hardcore History": [
    { title: "Wrath of the Khans I - The Rise of Genghis Khan", duration: "1h 53m", subtitle: "Mongol Empire & Conquests", streamUrl: "https://www.youtube.com/embed/Y0Z9gX82_1c" },
    { title: "Blueprint for Armageddon I - Outbreak of World War I", duration: "3h 07m", subtitle: "The July Crisis 1914", streamUrl: "https://www.youtube.com/embed/cO3z_gW6Y-0" },
    { title: "Supernova in the East I - The Pacific Theatre", duration: "4h 29m", subtitle: "Asia-Pacific Campaigns", streamUrl: "https://www.youtube.com/embed/j_1O83E-w6w" }
  ],
  "Serial": [
    { title: "Ep. 01 - The Alibi: Where Were You at 2:36 PM?", duration: "53m", subtitle: "Adnan Syed Investigation", streamUrl: "https://www.youtube.com/embed/rVv0j1wM7bA" },
    { title: "Ep. 02 - The Breakup: Motive and Suspicion", duration: "44m", subtitle: "Witness Interviews", streamUrl: "https://www.youtube.com/embed/W9x1W8Uj7bM" },
    { title: "Ep. 03 - Leakin Park: The Forensic Evidence", duration: "47m", subtitle: "Cell Tower Geolocation", streamUrl: "https://www.youtube.com/embed/P6M6q0nOQeA" }
  ],
  "Conan O'Brien Needs a Friend": [
    { title: "Stephen Colbert: Late Night Brotherhood", duration: "1h 05m", subtitle: "Stephen Colbert", streamUrl: "https://www.youtube.com/embed/1v_4G0Y1c0c" },
    { title: "Tina Fey: Improvisation & 30 Rock Secrets", duration: "58m", subtitle: "Tina Fey", streamUrl: "https://www.youtube.com/embed/d3s1G1s1d2Q" },
    { title: "Tom Hanks: Stories From The Set", duration: "1h 12m", subtitle: "Tom Hanks", streamUrl: "https://www.youtube.com/embed/Po3jStA673E" }
  ],
  "The Ranveer Show (TRS)": [
    { title: "Dr. S. Jaishankar on Global Geopolitics & India's Rise", duration: "1h 22m", subtitle: "Dr. S. Jaishankar", streamUrl: "https://www.youtube.com/embed/xL1G_b5L9vM" },
    { title: "Deepak Chopra on Consciousness & Quantum Healing", duration: "1h 08m", subtitle: "Deepak Chopra", streamUrl: "https://www.youtube.com/embed/9g_hKov_p1Q" },
    { title: "Gaur Gopal Das on Finding Inner Peace & Purpose", duration: "1h 15m", subtitle: "Gaur Gopal Das", streamUrl: "https://www.youtube.com/embed/1F3hm6MfR1k" }
  ],
  "SmartLess": [
    { title: "Bradley Cooper: Directing Maestro & Oscar Ambitions", duration: "56m", subtitle: "Bradley Cooper", streamUrl: "https://www.youtube.com/embed/k-x_p_2bE3U" },
    { title: "George Clooney: Hollywood, Storytelling & Pranks", duration: "54m", subtitle: "George Clooney", streamUrl: "https://www.youtube.com/embed/XXYlFuWEuKI" },
    { title: "Ryan Reynolds: Comedy, Deadpool & Business", duration: "58m", subtitle: "Ryan Reynolds", streamUrl: "https://www.youtube.com/embed/4NRXx6U8ABQ" }
  ],
  "The Daily": [
    { title: "The Looming Battle Over Artificial Intelligence", duration: "27m", subtitle: "Tech & Society Investigation", streamUrl: "https://www.youtube.com/embed/rVv0j1wM7bA" },
    { title: "The Global Economy at a Crossroads", duration: "31m", subtitle: "Market Shifts & Inflation", streamUrl: "https://www.youtube.com/embed/L_Guz73e6fw" },
    { title: "Inside the High-Stakes Space Race", duration: "28m", subtitle: "Artemis & Commercial Spaceflight", streamUrl: "https://www.youtube.com/embed/zSWdZVtXT7E" }
  ],
  "Darknet Diaries": [
    { title: "Ep. 132 - The Xbox Underground Heist", duration: "1h 08m", subtitle: "Game Development Cyber Espionage", streamUrl: "https://www.youtube.com/embed/L_Guz73e6fw" },
    { title: "Ep. 99 - The Olympic Destroyer Malware", duration: "54m", subtitle: "State-Sponsored Cyberattacks", streamUrl: "https://www.youtube.com/embed/JN3KPFbWCy8" },
    { title: "Ep. 86 - The NotPetya Ransomware Outbreak", duration: "1h 02m", subtitle: "Global Infrastructure Disruption", streamUrl: "https://www.youtube.com/embed/rGQZl3w176c" }
  ]
};

let musicUpdated = 0;
let podcastUpdated = 0;

data.forEach(item => {
  if (item.type === 'Music') {
    if (musicTracks[item.title]) {
      item.tracks = musicTracks[item.title];
      musicUpdated++;
    } else {
      // Default artist tracklist
      const artist = item.creator || item.director || 'Artist';
      item.tracks = [
        { title: `${item.title} (Main Version)`, subtitle: artist, duration: "3:45", streamUrl: item.trailer },
        { title: `${item.title} (Acoustic Unplugged)`, subtitle: artist, duration: "4:12", streamUrl: item.trailer },
        { title: `${item.title} (Live Symphony Edition)`, subtitle: artist, duration: "5:30", streamUrl: item.trailer }
      ];
      musicUpdated++;
    }
  } else if (item.type === 'Podcast') {
    if (podcastEpisodes[item.title]) {
      item.episodes = podcastEpisodes[item.title];
      podcastUpdated++;
    } else {
      const host = item.creator || item.director || 'Host';
      item.episodes = [
        { title: `${item.title} - Episode 01: Premier Feature`, duration: "1h 15m", subtitle: host, streamUrl: item.trailer },
        { title: `${item.title} - Episode 02: Deep Dive Session`, duration: "1h 30m", subtitle: host, streamUrl: item.trailer },
        { title: `${item.title} - Episode 03: Exclusive Q&A`, duration: "52m", subtitle: host, streamUrl: item.trailer }
      ];
      podcastUpdated++;
    }
  }
});

fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`✓ Updated ${musicUpdated} music items with playable artist tracklists.`);
console.log(`✓ Updated ${podcastUpdated} podcast items with playable episode guides.`);
