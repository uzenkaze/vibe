const songs = [
    {
        id: 1,
        title: "Supernova",
        artist: "aespa(에스파)",
        youtubeId: "JmD8_t0IuGg", 
        lyrics: `I'm like some kind of Supernova
Watch out...
I'm like some kind of Supernova
머릿속은 Bang Bang 너는 내 안의 Universe

달을 삼킨 채 번지는 소문
이것은 내게로 오는 신호
너를 비추는 빛을 따라가
어둠을 뚫고서 나를 불러
I'm like some kind of Supernova
Watch out!`
    },
    {
        id: 2,
        title: "Ditto",
        artist: "NewJeans",
        youtubeId: "km_OnhPjD0o",
        lyrics: `Stay in the middle
Like you a little
Don't want no riddle
말해줘 say it back, oh, say it ditto

아침은 너무 멀어
나를 깨우지 마
꿈속의 네 모습은
더는 낯설지 않아
Stay in the middle...`
    },
    {
        id: 3,
        title: "고민중독",
        artist: "QWER",
        youtubeId: "X_P3-X_v_U",
        lyrics: `머리가 핑핑 돌아가는 지금
너에게로 달려가고 싶은 내 마음

어느새 너에게 중독되어 버린 걸까
내 하루는 너로 시작해 너로 끝나
고민은 이제 그만
내 진심을 받아주겠니?

머리가 핑핑 돌아가는 지금
너에게로 달려가고 있나 봐!`
    },
    {
        id: 4,
        title: "밤양갱",
        artist: "비비 (BIBI)",
        youtubeId: "v9gGfQy7-C4",
        lyrics: `떠나는 길에 니가 내게 말했지
'너는 바라는 게 너무나 많아'
잠깐만 거기 멈춰봐
나는 바라는 게 단 하나뿐이야

달디달고 달디달고 달디단 밤양갱 밤양갱
내가 먹고 싶었던 건 달디단 밤양갱 밤양갱이야`
    },
    {
        id: 5,
        title: "Love wins all",
        artist: "아이유 (IU)",
        youtubeId: "vG8NbeR_L_k",
        lyrics: `나의 이 가난한 마음으로
그대에게 줄 것이 없지만
그럼에도 불구하고
옆에 있어 줄 수 있겠니?

Love wins all
우리의 사랑이 모든 걸 이길 거야...`
    },
    {
        id: 6,
        title: "밤편지",
        artist: "아이유 (IU)",
        youtubeId: "XvS07O0S0u0",
        lyrics: `이 밤 그날의 반딧불을 
당신의 창 가까이 보낼게요
음 사랑한다는 말이에요

나 우리의 첫 입맞춤을 떠올려
그럼 언제든 눈을 감고
음 가장 먼 곳으로 가요`
    },
    {
        id: 7,
        title: "에잇(eight)",
        artist: "아이유 (IU)",
        youtubeId: "D1PvIWdJ8xo",
        lyrics: `So are you happy now?
Finally happy now, are you?
뭐 그대로야 난
다 잃어버린 것 같아

이대로는 무엇도 사랑하고 싶지 않아
다 가버린 것 같아
우리는 오렌지 태양 아래...`
    }
];

// UI References for title update
const listTitleLabel = document.getElementById('listTitleLabel');
const listIcon = document.getElementById('listIcon');

let currentResults = [];
let activeSongId = null;
let currentTab = 'search'; // 'search' or 'playlist'
let myPlaylistIds = JSON.parse(localStorage.getItem('vibe_playlist')) || [];
let globalSavedSongs = JSON.parse(localStorage.getItem('vibe_global_songs')) || [];
let ghConfig = JSON.parse(localStorage.getItem('vibeGitHubConfig') || '{"repo":"uzenkaze/vibe","branch":"main","autoSync":true}');
let currentPlayingSong = null;
const searchCache = new Map(); // Simple memory cache for search results

// DOM Elements
const searchInput = document.getElementById('searchInput');
const songList = document.getElementById('songList');
const noResults = document.getElementById('noResults');
const loading = document.getElementById('loading');
const globalSearchBtn = document.getElementById('globalSearchBtn');
const songCount = document.getElementById('songCount');
const tabSearch = document.getElementById('tabSearch');
const tabPlaylist = document.getElementById('tabPlaylist');
const playlistCount = document.getElementById('playlistCount');

const lyricsContainer = document.getElementById('lyricsContainer');
const lyricsTitle = document.getElementById('lyricsTitle');
const lyricsContent = document.getElementById('lyricsContent');
const closeLyricsBtn = document.getElementById('closeLyricsBtn');

const playerEmptyState = document.getElementById('playerEmptyState');
const youtubePlayerContainer = document.getElementById('youtubePlayerContainer');
const youtubeIframe = document.getElementById('youtubeIframe');
const currentSongInfo = document.getElementById('currentSongInfo');
const currentTitle = document.getElementById('currentTitle');
const currentArtist = document.getElementById('currentArtist');
const equalizer = document.getElementById('equalizer');
const currentTimeEl = document.getElementById('currentTime');

// Real-time clock update
function updateTime() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

// Start app
async function init() {
    updateTime();
    setInterval(updateTime, 1000);

    // 1. Try to load from GitHub first, else fallback to playlist.json
    let data = null;
    if (ghConfig.token && ghConfig.repo) {
        try {
            data = await syncWithGitHub('download');
            if (data) console.log('✅ GitHub 데이터 동기화 완료');
        } catch (e) { console.warn('GitHub 동기화 로드 실패. 로컬 데이터 사용.'); }
    }

    if (!data) {
        try {
            const response = await fetch('playlist.json');
            if (response.ok) data = await response.json();
        } catch (e) { console.log('No playlist.json found. Reading localStorage...'); }
    }

    if (data) {
        if (data.myPlaylistIds) {
            const localIds = JSON.parse(localStorage.getItem('vibe_playlist') || '[]');
            const combinedIds = [...new Set([...data.myPlaylistIds, ...localIds])];
            localStorage.setItem('vibe_playlist', JSON.stringify(combinedIds));
            myPlaylistIds = combinedIds;
        }
        if (data.globalSavedSongs) {
            const localSongs = JSON.parse(localStorage.getItem('vibe_global_songs') || '[]');
            const songMap = new Map();
            data.globalSavedSongs.forEach(s => songMap.set(s.id, s));
            localSongs.forEach(s => songMap.set(s.id, s));
            const combinedSongs = Array.from(songMap.values());
            localStorage.setItem('vibe_global_songs', JSON.stringify(combinedSongs));
            globalSavedSongs = combinedSongs;
        }
    }

    // 2. Load latest trend music (Only first 10 for performance)
    await handleGlobalSearch("최신 인기 트렌드 음악", 10);

    // 3. Render initial state
    updatePlaylistBadge();
    performSearch(); 

    // Setup listeners
    setupEventListeners();
}

async function syncWithGitHub(action = 'upload') {
    if (!ghConfig.token || !ghConfig.repo) return null;
    const filePath = `hobby/playlist.json`;
    const url = `https://api.github.com/repos/${ghConfig.repo}/contents/${filePath}?ref=${ghConfig.branch}`;
    const headers = {
        'Authorization': `token ${ghConfig.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };

    try {
        if (action === 'download') {
            const res = await fetch(url, { headers });
            if (res.status === 404) return null;
            const json = await res.json();
            const content = decodeURIComponent(escape(atob(json.content)));
            return JSON.parse(content);
        } else {
            const currentData = {
                myPlaylistIds: myPlaylistIds,
                globalSavedSongs: globalSavedSongs
            };
            const success = await uploadToGitHub(filePath, currentData, `Update vibe playlist: playlist.json`);
            if (success) showSyncToast();
        }
    } catch (e) { console.error("GitHub Sync Error:", e); }
}

async function uploadToGitHub(filePath, data, message) {
    const url = `https://api.github.com/repos/${ghConfig.repo}/contents/${filePath}?ref=${ghConfig.branch}`;
    const headers = {
        'Authorization': `token ${ghConfig.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };

    try {
        let sha = null;
        const checkRes = await fetch(url, { headers });
        if (checkRes.ok) {
            const checkJson = await checkRes.json();
            sha = checkJson.sha;
        }

        const body = {
            message: message,
            content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
            branch: ghConfig.branch
        };
        if (sha) body.sha = sha;

        const putRes = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
        return putRes.ok;
    } catch (e) {
        console.error("Upload Error:", e);
        return false;
    }
}

function showSyncToast() {
    const toast = document.createElement('div');
    toast.className = 'glass-panel sync-toast';
    toast.innerHTML = `<i class="fas fa-cloud"></i> GitHub 동기화 완료`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

function updatePlaylistBadge() {
    if(playlistCount) playlistCount.textContent = myPlaylistIds.length;
}

async function performSearch(queryOverride = null) {
    const query = (queryOverride || searchInput.value).toLowerCase().trim();
    
    // Show loading only if a non-empty query is being processed
    if (query !== '') {
        loading.style.display = 'flex';
        songList.style.display = 'none';
        noResults.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }

    // Handle different tab logic
    if (currentTab === 'search') {
        const localSource = [...songs, ...globalSavedSongs.map(s => ({...s, isGlobal: true}))];
        const filteredSongs = localSource.filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query) ||
            (song.lyrics && song.lyrics.toLowerCase().includes(query))
        );

        currentResults = filteredSongs;
        renderSongs(currentResults);

        // Show nudge if searching but no local results
        if (query !== '' && filteredSongs.length === 0) {
            noResults.style.display = 'flex';
            noResults.querySelector('p').textContent = '내 데이터베이스에 노래가 없습니다.';
            if (globalSearchBtn) globalSearchBtn.style.display = 'flex';
        } else {
            noResults.style.display = 'none';
        }
        
        if (document.getElementById('exportPlaylistBtn')) document.getElementById('exportPlaylistBtn').style.display = 'none';
    } else {
        const playlistSource = [...songs, ...globalSavedSongs]
            .filter(s => myPlaylistIds.some(id => String(id) === String(s.id)));
            
        const queryFilteredPlaylist = playlistSource.filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query)
        );

        currentResults = queryFilteredPlaylist;
        renderSongs(currentResults);
        
        // Custom empty state for playlist tab (NO global search nudge)
        if (queryFilteredPlaylist.length === 0) {
            noResults.style.display = 'flex';
            noResults.querySelector('p').textContent = query ? '검색 결과와 일치하는 보관곡이 없습니다.' : '보관함이 비어있습니다.';
            if (globalSearchBtn) globalSearchBtn.style.display = 'none'; // Hide global search in playlist tab
        } else {
            noResults.style.display = 'none';
        }
        
        if (document.getElementById('exportPlaylistBtn')) document.getElementById('exportPlaylistBtn').style.display = 'inline-block';
    }
    loading.style.display = 'none'; // Hide loading after search is complete
}

async function handleGlobalSearch(customQuery = null, limit = 100) {
    const query = (typeof customQuery === 'string') ? customQuery : searchInput.value.trim();
    if (!query) return;

    // 1. Check Cache first (Instant)
    if (searchCache.has(query)) {
        renderSongsFromCache(query, limit);
        return;
    }

    songList.style.display = 'none';
    noResults.style.display = 'none';
    loading.style.display = 'flex';

    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    
    // Proxy functions that return a promise
    const fetchFromProxy = async (proxyUrl) => {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Proxy failed');
        
        let html;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('json')) {
            const json = await response.json();
            html = json.contents || json;
        } else {
            html = await response.text();
        }
        
        if (!html || typeof html !== 'string') throw new Error('Invalid HTML');
        
        const jsonMatch = html.match(/ytInitialData\s*=\s*({.+?});/);
        if (!jsonMatch) throw new Error('No ytInitialData');
        
        const ytData = JSON.parse(jsonMatch[1]);
        let contents = [];
        try {
            contents = ytData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
        } catch (e) {
            contents = ytData.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
        }

        const results = [];
        contents.forEach(item => {
            if (item.videoRenderer) {
                const v = item.videoRenderer;
                results.push({
                    id: 'global_' + v.videoId,
                    title: v.title.runs[0].text,
                    artist: v.ownerText.runs[0].text,
                    youtubeId: v.videoId,
                    isGlobal: true,
                    lyrics: `(유튜브 검색 결과)\n업로더: ${v.ownerText.runs[0].text}`
                });
            }
        });

        if (results.length === 0) throw new Error('No videos found');
        return results;
    };

    // Parallel Proxy Requests (The fastest winning one returns first)
    const proxyUrls = [
        // 1. CORSProxy.io (Highly reliable)
        `https://corsproxy.io/?${encodeURIComponent(ytUrl)}`,
        // 2. AllOrigins (JSON wrapper)
        `https://api.allorigins.win/get?url=${encodeURIComponent(ytUrl)}`,
        // 3. CodeTabs (Fast but sometimes limited)
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(ytUrl)}`,
        // 4. ThingProxy (Fallback)
        `https://thingproxy.freeboard.io/fetch/${ytUrl}`
    ];

    try {
        // Promise.any takes the first one that SUCCEEDS.
        // We wrap fetchFromProxy to ensure slow but failing results don't block.
        const fastestResults = await Promise.any(proxyUrls.map(url => fetchFromProxy(url)));
        
        // Save to cache
        searchCache.set(query, fastestResults);
        renderSongsFromCache(query, limit);
    } catch (err) {
        console.warn("All proxies failed or blocked. Trying local database fallback...");
        loading.style.display = 'none';

        // Critical Fallback: If network is out, show local library results
        const localSource = [...songs, ...globalSavedSongs];
        const searchFiltered = localSource.filter(s => 
            s.title.toLowerCase().includes(query.toLowerCase()) || 
            s.artist.toLowerCase().includes(query.toLowerCase())
        );
        
        if (searchFiltered.length > 0) {
            currentResults = searchFiltered;
            renderSongs(currentResults);
        } else {
            noResults.style.display = 'flex';
            noResults.innerHTML = `
                <i class="fas fa-wifi-slash"></i>
                <p>네트워크 프록시 서버가 현재 응답하지 않습니다 (CORS/520 오류).</p>
                <div style="display:flex; gap:10px;">
                    <button onclick="location.reload()" class="glass-btn"><i class="fas fa-sync"></i> 새로고침</button>
                    <button onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(query)}', '_blank')" class="glass-btn">YouTube 직접이동</button>
                </div>
            `;
        }
    }
}

function renderSongsFromCache(query, limit) {
    const results = searchCache.get(query);
    currentResults = results.slice(0, limit); 
    
    if (listTitleLabel && listIcon) {
        // Keep it as '플레이' (Play) as requested by the user
        listTitleLabel.textContent = "플레이";
        
        if (query === "최신 인기 트렌드 음악" || query === "실시간 인기 급상승 음악") {
            listIcon.className = "fas fa-play-circle";
            listIcon.style.color = "var(--accent-color)";
        } else {
            listIcon.className = "fas fa-search";
            listIcon.style.color = "inherit";
        }
    }

    renderSongs(currentResults);
    loading.style.display = 'none';
    songList.style.display = 'flex';
}

// Render the song list
function renderSongs(songsToRender) {
    songList.innerHTML = '';
    
    if (currentTab === 'search') {
        if(songCount) songCount.textContent = songsToRender.length;
    }
    
    if (songsToRender.length === 0) {
        songList.style.display = 'none';
        return;
    }
    
    songList.style.display = 'flex';

    songsToRender.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'song-item';
        if (song.id === activeSongId) li.classList.add('active');
        li.dataset.id = song.id;
        
        const isSaved = myPlaylistIds.includes(song.id);
        const actionBtn = isSaved 
            ? `<button class="icon-action-btn remove" data-action="remove" data-id="${song.id}" title="삭제"><i class="fas fa-bookmark" style="color:var(--accent-color)"></i></button>`
            : `<button class="icon-action-btn save" data-action="save" data-id="${song.id}" title="보관"><i class="far fa-bookmark"></i></button>`;

        const badge = song.isGlobal ? '<span class="badge" style="background:#ff0000; margin-left: 5px; font-size: 0.6rem;">LIVE</span>' : '';

        li.innerHTML = `
            <div class="song-number">${(index + 1).toString().padStart(2, '0')}</div>
            <div class="song-info">
                <span class="song-title">${highlightText(song.title, searchInput.value)} ${badge}</span>
                <span class="song-artist">${highlightText(song.artist, searchInput.value)}</span>
            </div>
            <div class="song-actions">
                ${actionBtn}
                <button class="icon-action-btn play" data-action="play" data-id="${song.id}" title="재생"><i class="fas fa-play"></i></button>
            </div>
        `;
        
        li.addEventListener('click', (e) => {
            const btn = e.target.closest('.icon-action-btn');
            if (btn) {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = btn.dataset.id; // String ID for global
                if (action === 'save') {
                    togglePlaylist(id, true, song);
                } else if (action === 'remove') {
                    togglePlaylist(id, false);
                } else {
                    handleSongClick(song);
                }
            } else {
                handleSongClick(song);
            }
        });
        songList.appendChild(li);
    });
}

function togglePlaylist(id, isSave, songObj = null) {
    if (isSave) {
        if (!myPlaylistIds.some(savedId => String(savedId) === String(id))) {
            myPlaylistIds.push(id.toString().startsWith('global_') ? id : Number(id));
        }
        if (songObj && songObj.isGlobal && !globalSavedSongs.find(s => s.id === id)) {
            globalSavedSongs.push(songObj);
            localStorage.setItem('vibe_global_songs', JSON.stringify(globalSavedSongs));
        }
    } else {
        myPlaylistIds = myPlaylistIds.filter(savedId => String(savedId) !== String(id));
    }
    localStorage.setItem('vibe_playlist', JSON.stringify(myPlaylistIds));
    updatePlaylistBadge();
    performSearch();

    // GitHub AutoSync
    if (ghConfig.token && ghConfig.autoSync) {
        syncWithGitHub('upload').catch(console.error);
    }
}



// Highlight search query
function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: rgba(96, 165, 250, 0.5); color: white; border-radius: 2px;">$1</mark>');
}

// Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', () => {
        performSearch();
    });
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    if (globalSearchBtn) {
        globalSearchBtn.addEventListener('click', () => handleGlobalSearch());
    }

    // Settings listeners
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            document.getElementById('ghToken').value = ghConfig.token || '';
            document.getElementById('ghRepo').value = ghConfig.repo || 'uzenkaze/vibe';
            document.getElementById('ghBranch').value = ghConfig.branch || 'main';
            settingsModal.classList.add('active');
        });
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('active'));
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            ghConfig.token = document.getElementById('ghToken').value.trim();
            ghConfig.repo = document.getElementById('ghRepo').value.trim();
            ghConfig.branch = document.getElementById('ghBranch').value.trim();
            localStorage.setItem('vibeGitHubConfig', JSON.stringify(ghConfig));
            settingsModal.classList.remove('active');
            alert('GitHub 설정이 저장되었습니다.');
            init(); // Re-initialize to load from new config
        });
    }

    if (tabSearch) {
        tabSearch.addEventListener('click', () => {
            currentTab = 'search';
            tabSearch.classList.add('active');
            tabPlaylist.classList.remove('active');
            performSearch();
        });
    }

    if (tabPlaylist) {
        tabPlaylist.addEventListener('click', () => {
            currentTab = 'playlist';
            tabPlaylist.classList.add('active');
            tabSearch.classList.remove('active');
            performSearch();
        });
    }

    if (document.getElementById('exportPlaylistBtn')) {
        document.getElementById('exportPlaylistBtn').addEventListener('click', exportPlaylistToJson);
    }

    closeLyricsBtn.addEventListener('click', () => {
        lyricsContainer.style.display = 'none';
    });

    // Home / Initial State Click (Full Reset including Player)
    const appTitle = document.getElementById('appTitle');
    if (appTitle) {
        appTitle.addEventListener('click', () => {
            // 1. Reset Search & Tabs
            searchInput.value = '';
            currentTab = 'search';
            tabSearch.classList.add('active');
            tabPlaylist.classList.remove('active');
            
            // 2. Stop & Reset Player
            youtubeIframe.src = '';
            youtubePlayerContainer.style.display = 'none';
            currentSongInfo.style.display = 'none';
            playerEmptyState.style.display = 'flex';
            equalizer.style.display = 'none';
            activeSongId = null;
            currentPlayingSong = null;
            if (toggleLyricsBtn) toggleLyricsBtn.style.display = 'none';

            // 3. Hide Lyrics
            lyricsContainer.style.display = 'none';

            // 4. Reload Trends (Instant from cache)
            handleGlobalSearch("최신 인기 트렌드 음악", 10);
        });
    }

    // Toggle Lyrics Button (Inside Player Header)
    const toggleLyricsBtn = document.getElementById('toggleLyricsBtn');
    if (toggleLyricsBtn) {
        toggleLyricsBtn.addEventListener('click', () => {
            if (lyricsContainer.style.display === 'none') {
                lyricsContainer.style.display = 'flex';
                // Scroll if mobile
                if (window.innerWidth < 900) {
                    lyricsContainer.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                lyricsContainer.style.display = 'none';
            }
        });
    }
}

// Handle Song Selection
async function handleSongClick(songOrId) {
    let song;
    if (typeof songOrId === 'object') {
        song = songOrId;
    } else {
        song = [...songs, ...globalSavedSongs].find(s => s.id === songOrId);
    }
    
    if (!song) return;

    activeSongId = song.id;

    // Update UI state for active item
    document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.song-item[data-id="${song.id}"]`);
    if(activeItem) activeItem.classList.add('active');

    // Update Lyrics (Pre-fill with existing then try to fetch fuller ones)
    lyricsTitle.textContent = `${song.title} - 가사`;
    lyricsContent.innerHTML = (song.lyrics || "(가사 검색 중)").replace(/\n/g, '<br>');
    lyricsContainer.style.display = 'flex';

    // If it's a global search item with minimal lyrics, try to fetch real ones
    if (song.isGlobal && (song.lyrics.includes("유튜브 검색") || song.lyrics.includes("가사 정보가 없습니다"))) {
        fetchRealLyrics(song.title, song.artist).then(fullLyrics => {
            if (fullLyrics) {
                song.lyrics = fullLyrics;
                lyricsContent.innerHTML = fullLyrics.replace(/\n/g, '<br>');
            }
        });
    }

    // Update Player UI
    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;
    currentSongInfo.style.display = 'flex';
    playerEmptyState.style.display = 'none';
    equalizer.style.display = 'flex';
    youtubePlayerContainer.style.display = 'block';

    // Play YouTube Video
    youtubeIframe.src = `https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&rel=0&showinfo=0&iv_load_policy=3&hl=ko`;

    // Store state
    currentPlayingSong = song;
    const toggleLyricsBtn = document.getElementById('toggleLyricsBtn');
    if (toggleLyricsBtn) toggleLyricsBtn.style.display = 'flex';
}

async function fetchRealLyrics(title, artist) {
    // Basic cleaning of titles (remove M/V, MV, (..), etc.)
    const cleanTitle = title.replace(/\(.*\)|\[.*\]|M\/V|MV|Official|Lyrics/gi, '').trim();
    const cleanArtist = artist.replace(/\(.*\)|\[.*\]/gi, '').trim();

    try {
        // Multi-source lyrics searching
        const response = await fetch(`https://lyrist.vercel.app/api/${encodeURIComponent(cleanTitle)}/${encodeURIComponent(cleanArtist)}`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.lyrics) return data.lyrics;
        }
    } catch (e) {
        console.warn("Lyrics fetch failed:", e);
    }
    return null;
}

// Start app
init();
