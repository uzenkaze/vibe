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
const backBtn = document.getElementById('backBtn');
const globalSearchBtn = document.getElementById('globalSearchBtn');

const globalSearchBtnFallback = document.getElementById('globalSearchBtnFallback');
const songCount = document.getElementById('songCount');

const tabSearch = document.getElementById('tabSearch');
const tabPlaylist = document.getElementById('tabPlaylist');
const playlistCount = document.getElementById('playlistCount');

const songListContainer = document.querySelector('.song-list-container');
const discoveryDashboard = document.getElementById('discoveryDashboard');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');

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
const currentTimeEl = document.getElementById('currentTime');
const playerControls = document.getElementById('playerControls');
const audioOnlyOverlay = document.getElementById('audioOnlyOverlay');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const togglePlayBtn = document.getElementById('togglePlayBtn');

// YouTube Player API State
let player;
let isPlayerReady = false;
let currentMode = 'audio';
let isShuffle = false;
let repeatMode = 'none'; // 'none', 'one', 'all'
let progressInterval;
let isDraggingSeek = false;
let nextDiscovery = null; // Pre-fetched next related song
let playHistory = []; // Track history for instant previous
const likeBtn = document.getElementById('likeBtn');
const audioModeThumb = document.getElementById('audioModeThumb');
const audioModeIcon = document.getElementById('audioModeIcon');
const audioModeArt = document.getElementById('audioModeArt');


// Real-time clock update
function updateTime() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

// Start app
async function init() {
    updateTime();
    setInterval(updateTime, 1000);
    
    // Periodic refresh for Home content
    updateGHStatusUI();
    updateYTStatusUI();
    setupAutoHomeRefresh();


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
        if (data.recentlyPlayed) {
            const localRecent = JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY) || '[]');
            const historyMap = new Map();
            data.recentlyPlayed.forEach(s => historyMap.set(s.youtubeId, s));
            localRecent.forEach(s => historyMap.set(s.youtubeId, s));
            const combinedRecent = Array.from(historyMap.values()).slice(0, 15);
            localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(combinedRecent));
        }
    }


    // 2. Render Discovery Home instead of simple list
    updatePlaylistBadge();
    setupEventListeners();
    await renderHome();
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
            // DEBOUNCED UPLOAD: Avoid excessive commits 
            if (window.ghUploadTimer) clearTimeout(window.ghUploadTimer);
            window.ghUploadTimer = setTimeout(async () => {
                const recentTracks = JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY) || '[]');
                const currentData = {
                    myPlaylistIds: myPlaylistIds,
                    globalSavedSongs: globalSavedSongs,
                    recentlyPlayed: recentTracks,
                    lastSync: new Date().toISOString()
                };
                const success = await uploadToGitHub(filePath, currentData, `Auto-sync: Music state update`);
                if (success) showSyncToast();
            }, 3000); // 3-second debounce
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
    const discoveryDashboard = document.getElementById('discoveryDashboard');
    const backBtn = document.getElementById('backBtn');

    // If search input is empty and we are on the search tab, show discovery dashboard
    if (query === '' && currentTab === 'search') {
        if (discoveryDashboard) discoveryDashboard.style.display = 'block';
        if (backBtn) backBtn.style.display = 'none';
        songList.style.display = 'none';
        loading.style.display = 'none';
        noResults.style.display = 'none';
        if (listIcon) listIcon.className = 'fas fa-compass';
        if (listTitleLabel) listTitleLabel.textContent = '탐색';
        return;
    }

    // If a query is present, show back button and hide discovery dashboard
    if (discoveryDashboard) discoveryDashboard.style.display = 'none';
    if (backBtn && currentTab === 'search') backBtn.style.display = 'flex';

    
    // Show loading only if a non-empty query is being processed
    if (query !== '') {
        loading.style.display = 'flex';
        songList.style.display = 'none';
        noResults.style.display = 'none';
    } else {
        loading.style.display = 'none';
        // If query is empty but not on discovery home (e.g., playlist tab), show songList
        if (currentTab !== 'search' || discoveryDashboard.style.display === 'none') {
            songList.style.display = 'block';
        }
    }

    // Update nav bar icons for search results
    if (listIcon) listIcon.className = 'fas fa-search';
    if (listTitleLabel) listTitleLabel.textContent = '검색 결과';


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
            if (globalSearchBtnFallback) globalSearchBtnFallback.style.display = 'block';
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
        let sections = [];
        try {
            sections = ytData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents;
        } catch (e) {
            sections = ytData.contents.sectionListRenderer.contents;
        }

        const results = [];
        if (sections && Array.isArray(sections)) {
            sections.forEach(section => {
                const items = section.itemSectionRenderer ? section.itemSectionRenderer.contents : [];
                if (!Array.isArray(items)) return;

                items.forEach(item => {
                    if (item.videoRenderer) {
                        const v = item.videoRenderer;
                        const videoId = v.videoId;
                        if (!videoId) return;

                        // --- 🚀 PLAYABILITY FILTER: Skip items that are historically unplayable in iframe ---
                        const durationText = v.lengthText ? v.lengthText.simpleText : null;
                        const viewCountText = (v.viewCountText && v.viewCountText.simpleText) ? v.viewCountText.simpleText : "";
                        
                        // 1. Skip Live Streams (Often unplayable in local iframe)
                        const isLive = (v.badges && v.badges.some(b => 
                            b.metadataBadgeRenderer && 
                            (b.metadataBadgeRenderer.label === "LIVE" || b.metadataBadgeRenderer.style === "BADGE_STYLE_TYPE_LIVE_NOW")
                        )) || viewCountText.toLowerCase().includes("live");

                        // 2. Skip Shorts or Very Short clips (Usually not songs, often no duration text)
                        if (!durationText || isLive) return;

                        results.push({
                            id: 'global_' + videoId,
                            title: v.title.runs[0].text,
                            artist: v.ownerText.runs[0].text,
                            youtubeId: videoId,
                            duration: durationText, // Save duration for info
                            isGlobal: true,
                            lyrics: `(유튜브 검색 결과)\n업로더: ${v.ownerText.runs[0].text}\n길이: ${durationText}`
                        });
                    }
                });
            });
        }



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

let visibleCount = 15;

// Render the song list
function renderSongs(songsToRender, resetPaging = true) {
    if (resetPaging) visibleCount = 15;
    
    songList.innerHTML = '';
    
    if (currentTab === 'search') {
        if(songCount) songCount.textContent = songsToRender.length;
    }
    
    if (songsToRender.length === 0) {
        songList.style.display = 'none';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        return;
    }
    
    songList.style.display = 'flex';
    
    // Slice only the amount we want to show
    const songsToShow = songsToRender.slice(0, visibleCount);

    songsToShow.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'song-item';
        if (String(song.id) === String(activeSongId)) li.classList.add('active');
        li.dataset.id = song.id;
        
        const isSaved = myPlaylistIds.includes(song.id);
        const actionBtn = isSaved 
            ? `<button class="icon-action-btn remove" data-action="remove" data-id="${song.id}" title="삭제"><i class="fas fa-bookmark" style="color:var(--accent-color)"></i></button>`
            : `<button class="icon-action-btn save" data-action="save" data-id="${song.id}" title="보관"><i class="far fa-bookmark"></i></button>`;

        const badge = song.isGlobal ? '<span class="badge" style="background:#ff0000; margin-left: 5px; font-size: 0.6rem;">LIVE</span>' : '';

        const videoBtn = song.youtubeId 
            ? `<button class="icon-action-btn play-video" data-action="play-video" data-id="${song.id}" title="동영상 모드로 재생"><i class="fas fa-video"></i></button>`
            : '';

        const thumbUrlBig = song.youtubeId ? `https://img.youtube.com/vi/${song.youtubeId}/default.jpg` : '';
        const thumbHtmlBig = thumbUrlBig 
            ? `<div class="song-thumbnail"><img src="${thumbUrlBig}" alt="thumb"></div>`
            : `<div class="song-thumbnail"><i class="fas fa-music"></i></div>`;

        li.innerHTML = `
            <div class="song-number">${(index + 1).toString().padStart(2, '0')}</div>
            ${thumbHtmlBig}
            <div class="song-info">
                <span class="song-title">${highlightText(song.title, searchInput.value)} ${badge}</span>
                <span class="song-artist">${highlightText(song.artist, searchInput.value)}</span>
            </div>
            <div class="song-actions">
                ${actionBtn}
                <button class="icon-action-btn play-music" data-action="play-music" data-id="${song.id}" title="음악 모드로 재생"><i class="fas fa-headphones"></i></button>
                ${videoBtn}
            </div>
        `;

        
        li.addEventListener('click', (e) => {
            const btn = e.target.closest('.icon-action-btn');
            if (btn) {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                if (action === 'save') {
                    togglePlaylist(id, true, song);
                } else if (action === 'remove') {
                    togglePlaylist(id, false);
                } else if (action === 'play-music') {
                    handleSongClick(song, 'audio');
                } else if (action === 'play-video') {
                    handleSongClick(song, 'video');
                }
            } else {
                handleSongClick(song, 'audio'); // Default to music
            }
        });
        songList.appendChild(li);
    });

    // 🔄 Show/Hide the 'Load More' button correctly
    if (loadMoreContainer && loadMoreBtn) {
        if (songsToRender.length > visibleCount) {
            loadMoreContainer.style.display = 'block';
            loadMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> 결과 15개 더보기 (${visibleCount}/${songsToRender.length})`;
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }
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
    if (currentTab === 'playlist') performSearch(); // Only refresh playlist view if on playlist tab

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
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            searchInput.value = '';
            renderHome();
        });
    }

    searchInput.addEventListener('input', () => {

        performSearch();
    });
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleGlobalSearch();
        }
    });

    if (globalSearchBtnFallback) {
        globalSearchBtnFallback.addEventListener('click', () => handleGlobalSearch());
    }


    if (globalSearchBtn) {
        globalSearchBtn.addEventListener('click', () => handleGlobalSearch());
    }

    // Settings listeners
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    // --- Side Menu Handle ---
    const menuBtn = document.getElementById('menuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    if (menuBtn && sideMenu && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            sideMenu.classList.add('active');
            menuOverlay.classList.add('active');
        });
    }

    if (closeMenuBtn && sideMenu && menuOverlay) {
        closeMenuBtn.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
    }


    // Close menu when clicking outside or on a menu item
    document.addEventListener('click', (e) => {
        if (sideMenu && sideMenu.classList.contains('active')) {
            // Check if the click is outside the menu and not on the menu button itself
            if (!sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                sideMenu.classList.remove('active');
                if (menuOverlay) menuOverlay.classList.remove('active');
            } else if (e.target.closest('.menu-item')) { // Check if a menu item was clicked
                sideMenu.classList.remove('active');
            }
        }
    });

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (sideMenu) sideMenu.classList.remove('active');
            if (menuOverlay) menuOverlay.classList.remove('active');
            openSettings();
        });
    }

    const ytLoginBtn = document.getElementById('ytLoginBtn');
    if (ytLoginBtn) {
        ytLoginBtn.addEventListener('click', () => {
            if (sideMenu) sideMenu.classList.remove('active');
            if (menuOverlay) menuOverlay.classList.remove('active');
            // Updated to the most stable Google Login URL for YouTube
            const loginUrl = 'https://accounts.google.com/ServiceLogin?service=youtube&continue=https://www.youtube.com/&hl=ko';
            window.open(loginUrl, '_blank');
            
            // Show custom layer modal instead of alert
            const loginInfoModal = document.getElementById('loginInfoModal');
            if (loginInfoModal) {
                setTimeout(() => loginInfoModal.classList.add('active'), 500);
            }
        });
    }




    const ghStatus = document.getElementById('ghStatus');
    if (ghStatus) {
        ghStatus.addEventListener('click', openSettings);
    }

    function openSettings() {
        document.getElementById('ghToken').value = ghConfig.token || '';
        document.getElementById('ghRepo').value = ghConfig.repo || 'uzenkaze/vibe';
        document.getElementById('ghBranch').value = ghConfig.branch || 'main';
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) settingsModal.classList.add('active');
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
            updateGHStatusUI();
            alert('GitHub 설정이 저장되었습니다.');
            init(); // Re-initialize to load from new config
        });
    }


    const toggleTokenBtn = document.getElementById('toggleTokenBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount += 15;
            renderSongs(currentResults, false);
        });
    }

    const ghTokenInput = document.getElementById('ghToken');

    if (toggleTokenBtn && ghTokenInput) {
        toggleTokenBtn.addEventListener('click', () => {
            const type = ghTokenInput.getAttribute('type') === 'password' ? 'text' : 'password';
            ghTokenInput.setAttribute('type', type);
            toggleTokenBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    if (tabSearch) {

        tabSearch.addEventListener('click', () => {
            currentTab = 'search';
            tabSearch.classList.add('active');
            tabPlaylist.classList.remove('active');
            performSearch(); // This will now correctly show discovery if query is empty
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

    // Player Controls
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');

    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            isShuffle = !isShuffle;
            shuffleBtn.classList.toggle('active', isShuffle);
        });
    }

    if (repeatBtn) {
        repeatBtn.addEventListener('click', () => {
            if (repeatMode === 'none') {
                repeatMode = 'all';
                repeatBtn.classList.add('active');
                repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
                repeatBtn.title = "전체 반복";
            } else if (repeatMode === 'all') {
                repeatMode = 'one';
                repeatBtn.classList.add('active');
                repeatBtn.innerHTML = '<i class="fas fa-redo-alt"></i>';
                repeatBtn.title = "한곡 반복";
            } else {
                repeatMode = 'none';
                repeatBtn.classList.remove('active');
                repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
                repeatBtn.title = "반복 안함";
            }
        });
    }

    if (togglePlayBtn) {
        togglePlayBtn.addEventListener('click', () => {
            if (!player) return;
            const state = player.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Use the smart navigation function that prioritizes current list
            playNext();
        });
    }



    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (playHistory.length > 1) {
                playHistory.pop(); // Remove current
                const lastSong = playHistory.pop(); // Get previous
                handleSongClick(lastSong, currentMode);
            } else {
                playPrevious(); // Fallback to list-based previous
            }
        });
    }


    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            if (!currentPlayingSong) return;
            const isSaved = myPlaylistIds.includes(currentPlayingSong.id);
            togglePlaylist(currentPlayingSong.id, !isSaved, currentPlayingSong);
            updateLikeBtnUI(!isSaved);
        });
    }

    // Seekbar Interactions
    const seekbarTrack = document.getElementById('seekbarTrack');
    if (seekbarTrack) {
        seekbarTrack.addEventListener('mousedown', (e) => {
            isDraggingSeek = true;
            handleSeekAction(e);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDraggingSeek) handleSeekAction(e);
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingSeek) isDraggingSeek = false;
        });

        // Touch support for mobile
        seekbarTrack.addEventListener('touchstart', (e) => {
            isDraggingSeek = true;
            handleSeekAction(e.touches[0]);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (isDraggingSeek) {
                e.preventDefault();
                handleSeekAction(e.touches[0]);
            }
        }, { passive: false });

        window.addEventListener('touchend', () => {
            if (isDraggingSeek) isDraggingSeek = false;
        });
    }

    if (document.getElementById('exportPlaylistBtn')) {
        document.getElementById('exportPlaylistBtn').addEventListener('click', exportPlaylistToJson);
    }

    closeLyricsBtn.addEventListener('click', () => {
        lyricsContainer.style.display = 'none';
    });

    const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
    if (toggleFullscreenBtn) {
        toggleFullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    const discoveryDashboard = document.getElementById('discoveryDashboard');
    if (discoveryDashboard) {
        discoveryDashboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('more-btn')) {
                const titleEl = e.target.closest('.section-header').querySelector('h2');
                if (titleEl) {
                    const sectionTitle = titleEl.textContent;
                    handleMoreClick(sectionTitle);
                }
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            renderHome();
        });
    }

    const appTitle = document.getElementById('appTitle');

    if (appTitle) {
        appTitle.addEventListener('click', () => {
            searchInput.value = '';
            currentTab = 'search';
            tabSearch.classList.add('active');
            tabPlaylist.classList.remove('active');
            if (player) player.stopVideo();
            stopProgressUpdate();
            youtubePlayerContainer.style.display = 'none';
            audioOnlyOverlay.style.display = 'none';
            seekbarContainer.style.display = 'none';
            playerControls.style.display = 'none';
            currentSongInfo.style.display = 'none';
            playerEmptyState.style.display = 'flex';
            equalizer.style.display = 'none';
            activeSongId = null;
            currentPlayingSong = null;
            if (toggleLyricsBtn) toggleLyricsBtn.style.display = 'none';
            if (toggleFullscreenBtn) toggleFullscreenBtn.style.display = 'none';
            lyricsContainer.style.display = 'none';
            renderHome();
        });
    }

    const tLyricsBtn = document.getElementById('toggleLyricsBtn');
    if (tLyricsBtn) {
        tLyricsBtn.addEventListener('click', () => {
            if (lyricsContainer.style.display === 'none') {
                lyricsContainer.style.display = 'flex';
                if (window.innerWidth < 900) lyricsContainer.scrollIntoView({ behavior: 'smooth' });

                // 가사 패널을 열 때 가사가 없거나 placeholder이면 즉시 fetch 재시도
                if (currentPlayingSong) {
                    const curLyrics = lyricsContent.innerHTML;
                    const isPlaceholder = !curLyrics
                        || curLyrics.includes('⏳')
                        || curLyrics.includes('😔')
                        || curLyrics.includes('유튜브 검색')
                        || curLyrics.includes('연관 추천곡')
                        || curLyrics.trim().length < 50;

                    if (isPlaceholder) {
                        lyricsContent.innerHTML = '<span style="color:var(--text-secondary); font-size:0.9rem;">⏳ 가사를 불러오는 중...</span>';
                        fetchRealLyrics(currentPlayingSong.title, currentPlayingSong.artist).then(lyrics => {
                            if (lyrics) {
                                currentPlayingSong.lyrics = lyrics;
                                lyricsContent.innerHTML = lyrics.replace(/\n/g, '<br>');
                            } else {
                                lyricsContent.innerHTML = '<span style="color:var(--text-secondary); font-size:0.9rem;">😔 가사 정보를 찾을 수 없습니다.</span>';
                            }
                        });
                    }
                }
            } else {
                lyricsContainer.style.display = 'none';
            }
        });
    }
}

function handleMoreClick(title) {
    let query = '';
    const titleClean = title.trim();
    if (titleClean.includes('실시간 인기 차트')) query = "실시간 인기 음악 차트 TOP 50";
    else if (titleClean.includes('잔잔한 음악')) query = "잔잔하고 편안한 수면 명상 음악";
    else if (titleClean.includes('최신 발매 음악')) query = new Date().getFullYear() + " 최신 발매 신곡";
    else if (titleClean.includes('다시 듣기')) {
        const history = JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY) || '[]');
        if (history.length > 0) {
            currentTab = 'search';
            if (tabSearch) tabSearch.classList.add('active');
            if (tabPlaylist) tabPlaylist.classList.remove('active');
            
            const listTitleLabel = document.getElementById('listTitleLabel');
            if (listTitleLabel) listTitleLabel.textContent = "최근 재생 목록";
            
            renderSongs(history);
            
            // Switch view from dashboard to list
            if (backBtn) backBtn.style.display = 'flex';
            if (discoveryDashboard) discoveryDashboard.style.display = 'none';
            if (songListContainer) songListContainer.style.display = 'flex';
            return;
        }
        return;
    }

    if (query) {
        const sInput = document.getElementById('searchInput');
        if (sInput) {
            sInput.value = query;
            // Switch view before global search
            if (backBtn) backBtn.style.display = 'flex';
            if (discoveryDashboard) discoveryDashboard.style.display = 'none';
            if (songListContainer) songListContainer.style.display = 'flex';
            
            currentTab = 'search';
            if (tabSearch) tabSearch.classList.add('active');
            if (tabPlaylist) tabPlaylist.classList.remove('active');

            const listTitleLabel = document.getElementById('listTitleLabel');
            if (listTitleLabel) listTitleLabel.textContent = titleClean;

            // Trigger GLOBAL search directly
            handleGlobalSearch(query, 100);
        }
    }
}


function setupMediaSession(song) {
    if (!('mediaSession' in navigator)) return;

    // 아트워크: YouTube 썸네일 우선 사용
    const artSrc = song.youtubeId
        ? `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`
        : (song.thumbnail || 'music_placeholder.png');

    navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: 'Vibe Music Player',
        artwork: [
            { src: artSrc, sizes: '480x360', type: 'image/jpeg' }
        ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
        if (player && typeof player.playVideo === 'function') player.playVideo();
        resumeAudioKeepAlive();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
        if (player && typeof player.pauseVideo === 'function') player.pauseVideo();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (typeof playPrevious === 'function') playPrevious();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (typeof playNext === 'function') playNext();
    });
    // 잠금화면 시크 핸들러
    try {
        navigator.mediaSession.setActionHandler('seekforward', (d) => {
            if (player) player.seekTo((player.getCurrentTime() || 0) + (d.seekOffset || 10), true);
        });
        navigator.mediaSession.setActionHandler('seekbackward', (d) => {
            if (player) player.seekTo(Math.max(0, (player.getCurrentTime() || 0) - (d.seekOffset || 10)), true);
        });
        navigator.mediaSession.setActionHandler('seekto', (d) => {
            if (player && d.seekTime != null) player.seekTo(d.seekTime, true);
        });
    } catch(e) { /* 일부 구형 브라우저 미지원 */ }
}

// Handle Song Selection
async function handleSongClick(songOrId, mode = null) {
    let song;
    if (typeof songOrId === 'object') {
        song = songOrId;
    } else {
        song = [...songs, ...globalSavedSongs].find(s => String(s.id) === String(songOrId));
    }
    
    if (!song) return;

    activeSongId = song.id;
    if (mode) currentMode = mode;

    // ⚡ INSTANT PLAY: Start loading the video as the high-priority first step
    if (isPlayerReady && player && song.youtubeId) {
        player.loadVideoById(song.youtubeId);
    } else if (song.youtubeId) {
        setTimeout(() => handleSongClick(song, mode), 500);
    }

    // 📱 UX: Robust Scroll to top for all layout types
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        // Explicitly scroll the internal container (Crucial for mobile view)
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Also scroll window as a universal fallback
    window.scrollTo({ top: 0, behavior: 'smooth' });




    // Update UI    // Mini Player Sync
    setupMediaSession(song);
    syncMiniPlayer(song);    // Update active UI (Non-blocking)

    document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.song-item[data-id="${song.id}"]`);
    if(activeItem) activeItem.classList.add('active');

    // Update Lyrics Metadata (Don't force open the panel)
    lyricsTitle.textContent = `${song.title} - 가사`;

    // 가사 패널 초기 표시: 저장된 가사 우선, 없으면 로딩 표시
    const hasRealLyrics = song.lyrics && song.lyrics.length > 80
        && !song.lyrics.includes('유튜브 검색') && !song.lyrics.includes('연관 추천곡');

    if (hasRealLyrics) {
        lyricsContent.innerHTML = song.lyrics.replace(/\n/g, '<br>');
    } else {
        lyricsContent.innerHTML = '<span style="color:var(--text-secondary); font-size:0.9rem;">⏳ 가사를 불러오는 중...</span>';
        // 실제 API로 전체 가사 fetch (검색 탭 관계없이 전모든 곡)
        fetchRealLyrics(song.title, song.artist).then(fullLyrics => {
            if (fullLyrics) {
                song.lyrics = fullLyrics;
                // 현재 표시 중인 곡과 동일한 경우만 업데이트
                if (currentPlayingSong && currentPlayingSong.youtubeId === song.youtubeId) {
                    lyricsContent.innerHTML = fullLyrics.replace(/\n/g, '<br>');
                }
            } else {
                if (currentPlayingSong && currentPlayingSong.youtubeId === song.youtubeId) {
                    lyricsContent.innerHTML = '<span style="color:var(--text-secondary); font-size:0.9rem;">😔 가사 정보를 찾을 수 없습니다.</span>';
                }
            }
        });
    }

    // Update Player UI
    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;
    currentSongInfo.style.display = 'flex';
    playerEmptyState.style.display = 'none';
    playerControls.style.display = 'flex';
    document.getElementById('seekbarContainer').style.display = 'flex';

    // Update Heart State
    updateLikeBtnUI(myPlaylistIds.includes(song.id));

    // Instant Play Optimization: Add to history & pre-fetch next
    if (playHistory.length === 0 || playHistory[playHistory.length - 1].youtubeId !== song.youtubeId) {
        playHistory.push(song);
        if (playHistory.length > 50) playHistory.shift(); // Keep history manageable
    }
    
    // Clear and Pre-fetch next related song for "Instant Next"
    nextDiscovery = null; 
    setTimeout(() => prefetchNextDiscovery(song), 1000);

    if (currentMode === 'video') {

        youtubePlayerContainer.style.display = 'block';
        audioOnlyOverlay.style.display = 'none';
        equalizer.style.display = 'none';
    } else {
        youtubePlayerContainer.style.display = 'none';
        audioOnlyOverlay.style.display = 'flex';
        equalizer.style.display = 'flex';
        
        // Show Thumbnail as spinning art
        if (song.youtubeId) {
            audioModeThumb.src = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
            audioModeThumb.style.display = 'block';
            audioModeIcon.style.display = 'none'; // Optional: hide icon if thumb is enough
        } else {
            audioModeThumb.style.display = 'none';
            audioModeIcon.style.display = 'block';
        }
    }

    // Store state
    currentPlayingSong = song;
    const toggleLyricsBtn = document.getElementById('toggleLyricsBtn');
    const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
    
    if (toggleLyricsBtn) toggleLyricsBtn.style.display = 'flex';
    // Show Fullscreen only in video mode
    if (toggleFullscreenBtn) {
        toggleFullscreenBtn.style.display = (currentMode === 'video') ? 'flex' : 'none';
    }

    // Add to Recently Played
    addRecentSong(song);
}



// --- DISCOVERY DASHBOARD LOGIC ---
const HOME_CACHE_KEY = 'vibe_home_cache_v2';
const RECENTLY_PLAYED_KEY = 'vibe_recently_played_v2';

function addRecentSong(song) {
    if (!song || !song.youtubeId) return;
    let history = JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY) || '[]');
    // Remove if exists to move to top
    history = history.filter(s => s.youtubeId !== song.youtubeId);
    // Add to top
    history.unshift(song);
    // Limit to 15
    if (history.length > 15) history = history.slice(0, 15);
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(history));

    // Auto-sync to GitHub
    syncWithGitHub('upload');
}


async function renderHome() {
    const discoveryDashboard = document.getElementById('discoveryDashboard');
    const songList = document.getElementById('songList');
    const searchInput = document.getElementById('searchInput');
    const listIcon = document.getElementById('listIcon');
    const listTitleLabel = document.getElementById('listTitleLabel');

    if (!discoveryDashboard) return;

    if (searchInput) searchInput.value = '';
    songList.style.display = 'none';
    discoveryDashboard.style.display = 'block';
    if (backBtn) backBtn.style.display = 'none';
    if (listIcon) listIcon.className = 'fas fa-compass';
    if (listTitleLabel) listTitleLabel.textContent = '탐색';


    // 1. Try Local Cache First for Instant Loading
    const cached = localStorage.getItem(HOME_CACHE_KEY);
    if (cached) {
        const { timestamp, sections } = JSON.parse(cached);
        const ageInMin = (Date.now() - timestamp) / 60000;
        if (ageInMin < 15) { // Reduced to 15 minutes for fresher content
            renderDiscoveryFromData(sections);
            return;
        }
    }


    // 2. Prepare Structure (Including Recently Played)
    const recentSongs = JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY) || '[]');
    let recentSectionHtml = '';
    
    if (recentSongs.length > 0) {
        recentSectionHtml = `
            <div class="home-section" id="sectionRecently">
                <div class="section-header"><h2>다시 듣기 🕒</h2> <span class="more-btn">모두 보기</span></div>
                <div class="card-scroller">${renderCardList(recentSongs)}</div>
            </div>
        `;
    }

    discoveryDashboard.innerHTML = `
        ${recentSectionHtml}
        <div class="home-section">
            <div class="section-header"><h2>실시간 인기 차트 🔥</h2> <span class="more-btn">더보기</span></div>
            <div class="card-scroller" id="scrollerTrending"><div class="loading-state small"><div class="spinner"></div></div></div>
        </div>
        <div class="home-section">
            <div class="section-header"><h2>잔잔한 음악 🌿</h2> <span class="more-btn">더보기</span></div>
            <div class="card-scroller" id="scrollerSuggested"><div class="loading-state small"><div class="spinner"></div></div></div>
        </div>
        <div class="home-section">
            <div class="section-header"><h2>최신 발매 음악 🆕</h2> <span class="more-btn">더보기</span></div>
            <div class="card-scroller" id="scrollerLatest"><div class="loading-state small"><div class="spinner"></div></div></div>
        </div>
    `;


    // 3. Fetch from Network in Parallel
    try {
        const [trending, suggested, latest] = await Promise.all([
            fetchCategorySongs("실시간 인기 차트 TOP 20", "scrollerTrending", 12),
            fetchCategorySongs("잔잔하고 편안한 수면 명상 음악", "scrollerSuggested", 12),
            fetchCategorySongs(new Date().getFullYear() + " 신곡 최신 발매", "scrollerLatest", 12)
        ]);


        if (trending && suggested && latest) {
            const cacheData = {
                timestamp: Date.now(),
                sections: { trending, suggested, latest }
            };
            localStorage.setItem(HOME_CACHE_KEY, JSON.stringify(cacheData));
        }
    } catch (e) {
        console.warn("Network discovery failed, showing fallbacks.", e);
        // If everything fails, pick from the first few hardcoded songs
        const fallback = songs.slice(0, 10).map(s => ({...s, youtubeId: s.youtubeId || 'dQw4w9WgXcQ'}));
        renderDiscoveryFromData({ trending: fallback, suggested: fallback, latest: fallback });
    }
}

// PERIODIC AUTO-REFRESH (Every 30 mins)
function setupAutoHomeRefresh() {
    setInterval(() => {
        const discoveryDashboard = document.getElementById('discoveryDashboard');
        // Refresh only if the dashboard is active and visible
        if (discoveryDashboard && discoveryDashboard.style.display !== 'none' && currentTab === 'search') {
            console.log("Auto-refreshing Home contents for fresh music...");
            // Force refresh by ignoring cache inside the call if needed, 
            // but simply re-calling renderHome with the 15-min TTL is often enough.
            // If we want a guaranteed "latest" refresh, we can clear the cache first.
            localStorage.removeItem(HOME_CACHE_KEY);
            renderHome();
        }
    }, 30 * 60000); // 30 mins
}


function renderDiscoveryFromData(sections) {
    const discoveryDashboard = document.getElementById('discoveryDashboard');
    const recentSongs = JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY) || '[]');
    let recentSectionHtml = '';

    if (recentSongs.length > 0) {
        recentSectionHtml = `
            <div class="home-section" id="sectionRecently">
                <div class="section-header"><h2>다시 듣기 🕒</h2> <span class="more-btn">모두 보기</span></div>
                <div class="card-scroller">${renderCardList(recentSongs)}</div>
            </div>
        `;
    }

    discoveryDashboard.innerHTML = `
        ${recentSectionHtml}
        <div class="home-section">
            <div class="section-header"><h2>실시간 인기 차트 🔥</h2> <span class="more-btn">더보기</span></div>
            <div class="card-scroller">${renderCardList(sections.trending)}</div>
        </div>
        <div class="home-section">
            <div class="section-header"><h2>잔잔한 음악 🌿</h2> <span class="more-btn">더보기</span></div>
            <div class="card-scroller">${renderCardList(sections.suggested)}</div>
        </div>
        <div class="home-section">
            <div class="section-header"><h2>최신 발매 음악 🆕</h2> <span class="more-btn">더보기</span></div>
            <div class="card-scroller">${renderCardList(sections.latest)}</div>
        </div>
    `;
}



function renderCardList(songsList) {
    if (!songsList) return '';
    return songsList.map(song => `
        <div class="music-card" onclick="handleSongClick(${JSON.stringify(song).replace(/"/g, '&quot;')}, 'audio')">
            <div class="card-thumb-wrapper">
                <img src="https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg" loading="lazy">
                <div class="card-play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="card-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
        </div>
    `).join('');
}

async function fetchCategorySongs(query, scrollerId, limit = 12) {
    try {
        const results = await fetchRelatedSongs(query);
        const scroller = document.getElementById(scrollerId);
        if (results && results.length > 0 && scroller) {
            const list = results.slice(0, limit);
            scroller.innerHTML = renderCardList(list);
            return list;
        }
    } catch(e) {
        const scroller = document.getElementById(scrollerId);
        if (scroller) scroller.innerHTML = '<p style="font-size:0.8rem; opacity:0.5; padding:20px;">정보를 불러올 수 없습니다.</p>';
    }
    return null;
}



async function fetchRealLyrics(title, artist) {
    // 제목/아티스트 정제: 불필요한 태그/키워드 제거
    let cleanTitle = title.split(/[|│\/\[\(]/)[0].trim();
    cleanTitle = cleanTitle
        .replace(/\(.*?\)|\{.*?\}|\[.*?\]/g, '')
        .replace(/M\/V|MV|Official|Lyrics|Audio|Live|모음|Playlist|영상|가사|자막|feat\..*/gi, '')
        .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
        .trim();

    let cleanArtist = (artist || '').split(/[|│\/]/)[0].trim();
    cleanArtist = cleanArtist.replace(/\(.*?\)|\[.*?\]/g, '').trim();

    if (!cleanTitle || cleanTitle.length < 2) return null;

    console.log(`[Lyrics] 검색: "${cleanTitle}" / "${cleanArtist}"`);

    // ─── API 1: lrclib.net (무료, CORS 보유, 프록시 불필요) ─────────────────
    try {
        // 정확한 매칭 시도
        const lrcUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}&album_name=`;
        const lrcRes = await fetch(lrcUrl, { headers: { 'Lrclib-Client': 'VibeMusicPlayer/2.5' } });
        if (lrcRes.ok) {
            const lrcData = await lrcRes.json();
            const lyric = lrcData.plainLyrics || lrcData.syncedLyrics?.replace(/\[.*?\]/g, '').trim();
            if (lyric && lyric.length > 50) {
                console.log('[Lyrics] lrclib.net 성공');
                return lyric;
            }
        }
        // 검색 폴백: 제목만으로 검색
        const lrcSearch = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle + ' ' + cleanArtist)}`;
        const lrcSearchRes = await fetch(lrcSearch, { headers: { 'Lrclib-Client': 'VibeMusicPlayer/2.5' } });
        if (lrcSearchRes.ok) {
            const lrcList = await lrcSearchRes.json();
            const match = Array.isArray(lrcList) && lrcList.find(r => r.plainLyrics && r.plainLyrics.length > 50);
            if (match) {
                console.log('[Lyrics] lrclib.net search 성공:', match.trackName);
                return match.plainLyrics;
            }
        }
    } catch (e) {
        console.warn('[Lyrics] lrclib.net 실패:', e.message);
    }

    // ─── API 2: lyrics.ovh (무료, REST, CORS 부분 지원) ────────────────────────────
    if (cleanArtist && cleanTitle) {
        try {
            const ovhRes = await fetch(
                `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`,
                { signal: AbortSignal.timeout(4000) }
            );
            if (ovhRes.ok) {
                const ovhData = await ovhRes.json();
                if (ovhData.lyrics && ovhData.lyrics.length > 50) {
                    console.log('[Lyrics] lyrics.ovh 성공');
                    return ovhData.lyrics;
                }
            }
        } catch (e) {
            console.warn('[Lyrics] lyrics.ovh 실패:', e.message);
        }
    }

    // ─── API 3: lyrist.vercel.app (corsproxy.io 통해) ──────────────────────────────
    try {
        const lyristUrl = `https://lyrist.vercel.app/api/${encodeURIComponent(cleanTitle)}/${encodeURIComponent(cleanArtist)}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(lyristUrl)}`;
        const lyristRes = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
        if (lyristRes.ok) {
            const lyristData = await lyristRes.json();
            if (lyristData.lyrics && lyristData.lyrics.length > 50) {
                console.log('[Lyrics] lyrist.vercel.app 성공');
                return lyristData.lyrics;
            }
        }
    } catch (e) {
        console.warn('[Lyrics] lyrist.vercel.app 실패:', e.message);
    }

    console.log('[Lyrics] 모든 API 실패, 가사를 찾을 수 없습니다.');
    return null;
}




// RELATED SONG AUTO-PLAY LOGIC (Continuous Play / Discovery)
async function playNextRelated() {
    // Optimization: If we already have a pre-fetched song, play it INSTANTLY
    if (nextDiscovery) {
        const songToPlay = nextDiscovery;
        nextDiscovery = null; // Use it once
        handleSongClick(songToPlay, currentMode);
        return;
    }

    if (!currentPlayingSong) {
        if (currentResults.length > 0) handleSongClick(currentResults[0], currentMode);
        return;
    }
    
    // Fallback: If clicked too fast before pre-fetch finishes
    const originalIcon = nextBtn.innerHTML;
    nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    nextBtn.disabled = true;

    try {
        console.log(`Discovering related music for: ${currentPlayingSong.title}`);
        
        // Use Artist + Title + Related keywords for YouTube context search
        const query = `${currentPlayingSong.artist} ${currentPlayingSong.title} 관련 추천 노래`;
        const results = await fetchRelatedSongs(query);
        
        if (results && results.length > 0) {
            // Pick a random one from the first 5 results to keep it fresh
            const topResults = results.slice(0, 5);
            const nextSong = topResults.find(r => r.youtubeId !== currentPlayingSong.youtubeId) || topResults[0];
            handleSongClick(nextSong, currentMode);
        } else {
            // Fallback: just go to next in current list if discovery fails
            playNextInList();
        }
    } catch (e) {
        console.warn("Discovery failed:", e);
        playNextInList();
    } finally {
        nextBtn.innerHTML = originalIcon;
        nextBtn.disabled = false;
    }
}


function playNext() {
    if (repeatMode === 'one' && currentPlayingSong) {
        if (player) {
            player.seekTo(0);
            player.playVideo();
            return;
        }
    }

    const currentIndex = currentResults.findIndex(s => String(s.id) === String(activeSongId));
    let nextIndex = -1;

    if (isShuffle && currentResults.length > 1) {
        do {
            nextIndex = Math.floor(Math.random() * currentResults.length);
        } while (nextIndex === currentIndex && currentResults.length > 1);
    } else {
        nextIndex = currentIndex + 1;
    }

    if (nextIndex >= 0 && nextIndex < currentResults.length) {
        handleSongClick(currentResults[nextIndex], currentMode);
    } else if (repeatMode === 'all' && currentResults.length > 0) {
        handleSongClick(currentResults[0], currentMode);
    } else {
        // Only if we reach the end of the current playback list, we search for related (Radio mode)
        playNextRelated();
    }
}

function playPrevious() {
    const currentIndex = currentResults.findIndex(s => String(s.id) === String(activeSongId));
    if (currentIndex > 0) {
        handleSongClick(currentResults[currentIndex - 1], currentMode);
    } else if (repeatMode === 'all' && currentResults.length > 0) {
        handleSongClick(currentResults[currentResults.length - 1], currentMode);
    }
}


async function fetchRelatedSongs(query, timeoutMs = 7000) {
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    
    const fetchFromProxy = async (proxyUrl) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error('Proxy failed');
            
            let html;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('json')) {
                const json = await response.json();
                html = json.contents || json;
            } else { html = await response.text(); }
            
            const jsonMatch = html.match(/ytInitialData\s*=\s*({.+?});/);
            if (!jsonMatch) throw new Error('No ytInitialData');
            const ytData = JSON.parse(jsonMatch[1]);
            
            let contents = [];
            try {
                contents = ytData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
            } catch(e) {
                contents = ytData.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
            }
            
            return contents.filter(item => item.videoRenderer).map(item => {
                const v = item.videoRenderer;
                return {
                    id: 'related_' + v.videoId,
                    title: v.title.runs[0].text,
                    artist: v.ownerText.runs[0].text,
                    youtubeId: v.videoId,
                    isGlobal: true,
                    lyrics: `(연관 추천곡) - ${v.ownerText.runs[0].text}`
                };
            });
        } catch (e) {
            clearTimeout(timeoutId);
            throw e;
        }
    };

    const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(ytUrl)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(ytUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(ytUrl)}`
    ];

    return await Promise.any(proxyUrls.map(url => fetchFromProxy(url)));
}


async function prefetchNextDiscovery(song) {
    if (!song) return;
    try {
        const query = `${song.artist} ${song.title} 관련 추천 노래`;
        const results = await fetchRelatedSongs(query);
        if (results && results.length > 0) {
            const topResults = results.slice(0, 5);
            nextDiscovery = topResults.find(r => r.youtubeId !== song.youtubeId) || topResults[0];
            console.log("Pre-fetch complete for next track:", nextDiscovery.title);
        }
    } catch(e) {
        console.warn("Pre-fetch discovery failed:", e);
    }
}


function playNextInList() {
    const currentIndex = currentResults.findIndex(s => String(s.id) === String(activeSongId));
    if (currentIndex !== -1 && currentIndex < currentResults.length - 1) {
        handleSongClick(currentResults[currentIndex + 1], currentMode);
    }
}


// YouTube IFrame API Callback
function onYouTubeIframeAPIReady() {
    player = new YT.Player('ytPlayer', {
        height: '100%',
        width: '100%',
        playerVars: {
            'autoplay': 1,
            'rel': 0,
            'showinfo': 0,
            'iv_load_policy': 3,
            'cc_load_policy': 0, // ❌ Disable auto subtitles/captions
            'hl': 'ko',
            'origin': window.location.origin
        },

        events: {
            'onReady': (event) => { isPlayerReady = true; },
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    // When song ends
    if (event.data === YT.PlayerState.ENDED) {
        stopProgressUpdate();
        playNext();
    }
    
    // Update Play/Pause button UI
    if (togglePlayBtn) {
        const audioModeIcon = document.getElementById('audioModeIcon');
        const audioModeArt = document.getElementById('audioModeArt');
        const bgAudio = document.getElementById('bgAudio');

        if (event.data === YT.PlayerState.PLAYING) {
            togglePlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            updateMiniIcons(true);
            if (currentMode === 'audio') equalizer.style.display = 'flex';
            if (audioModeIcon) audioModeIcon.classList.remove('paused');
            if (audioModeArt) audioModeArt.classList.remove('paused');
            if (bgAudio) bgAudio.play().catch(e => console.log('Silent audio blocked', e));
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
            startProgressUpdate();
            // 백그라운드 재생 유지 keepalive 활성화
            if (typeof startAudioKeepAlive === 'function') startAudioKeepAlive();
        } else {
            togglePlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            updateMiniIcons(false);
            equalizer.style.display = 'none';
            if (audioModeIcon) audioModeIcon.classList.add('paused');
            if (audioModeArt) audioModeArt.classList.add('paused');
            if (bgAudio) bgAudio.pause();
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        }
    }
}

// Global Manual Controls for Mini Player & Fallbacks
window.togglePlay = function() {
    if (!player || !player.getPlayerState) return;
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
};

window.playPrevious = function() {
    if (!currentPlayingSong) {
        showToast("이전 곡이 없습니다.");
        return;
    }
    if (typeof playHistory !== 'undefined' && playHistory.length > 1) {
        playHistory.pop();
        const lastSong = playHistory.pop();
        handleSongClick(lastSong, currentMode || 'video');
        return;
    }
    showToast("이전 곡이 없습니다.");
};

window.showToast = function(msg) {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMsg';
        toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:10px 20px;border-radius:20px;z-index:9999;transition:opacity 0.3s;';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = 1;
    setTimeout(() => { toast.style.opacity = 0; }, 2000);
};

// SEEKBAR LOGIC
function startProgressUpdate() {
    stopProgressUpdate();
    progressInterval = setInterval(() => {
        if (!player || !isPlayerReady || isDraggingSeek) return;
        const current = player.getCurrentTime();
        const duration = player.getDuration();
        
        if (duration > 0) {
            const percent = (current / duration) * 100;
            updateSeekUI(percent, current, duration);
        }
    }, 500);
}

function stopProgressUpdate() {
    if (progressInterval) clearInterval(progressInterval);
}

function updateSeekUI(percent, current, duration) {
    const seekbarFill = document.getElementById('seekbarFill');
    const seekbarThumb = document.getElementById('seekbarThumb');
    const currentEl = document.getElementById('currentTrackTime');
    const totalEl = document.getElementById('totalTrackTime');

    if (seekbarFill) seekbarFill.style.width = `${percent}%`;
    if (seekbarThumb) seekbarThumb.style.left = `${percent}%`;
    if (currentEl) currentEl.textContent = formatTrackTime(current);
    if (totalEl) totalEl.textContent = formatTrackTime(duration);

    // SMART AUTO-SCROLL LYRICS
    if (lyricsContainer && lyricsContainer.style.display !== 'none') {
        const lyricsContent = document.getElementById('lyricsContent');
        if (lyricsContent && lyricsContent.scrollHeight > lyricsContent.clientHeight) {
            // Calculate proportional scroll (with a small buffer/offset)
            const scrollRange = lyricsContent.scrollHeight - lyricsContent.clientHeight;
            const targetScroll = (percent / 100) * scrollRange;
            
            // Apply smooth scroll to the lyrics content
            lyricsContent.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    }
}


function formatTrackTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function handleSeekAction(e) {
    if (!player || !isPlayerReady) return;
    const seekbarTrack = document.getElementById('seekbarTrack');
    const rect = seekbarTrack.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const percent = x / rect.width;
    const duration = player.getDuration();
    
    if (duration > 0) {
        const targetTime = percent * duration;
        updateSeekUI(percent * 100, targetTime, duration);
        player.seekTo(targetTime, true);
    }
}

function updateLikeBtnUI(isLiked) {
    if (!likeBtn) return;
    if (isLiked) {
        likeBtn.classList.add('active');
        likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        likeBtn.classList.remove('active');
        likeBtn.innerHTML = '<i class="far fa-heart"></i>';
    }
}



// Inject YouTube API Script
(function() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

// Start app
init();

async function toggleFullscreen() {
    const playerContainer = document.getElementById('youtubePlayerContainer');
    if (!playerContainer) return;

    if (!document.fullscreenElement) {
        try {
            if (playerContainer.requestFullscreen) {
                await playerContainer.requestFullscreen();
            } else if (playerContainer.webkitRequestFullscreen) {
                await playerContainer.webkitRequestFullscreen();
            }

            // Attempt Orientation Lock (Mobile Chrome/Firefox/Safari 16.4+)
            if (screen.orientation && screen.orientation.lock) {
                const titleLower = (currentPlayingSong && currentPlayingSong.title) ? currentPlayingSong.title.toLowerCase() : '';
                const isShorts = titleLower.includes('shorts') || titleLower.includes('쇼츠') || titleLower.includes('tiktok');
                
                // standard: landscape, vertical (Shorts): portrait
                const lockMode = isShorts ? 'portrait' : 'landscape';
                await screen.orientation.lock(lockMode).catch(e => console.warn("Orientation lock denied:", e));
            }
        } catch (e) {
            console.error("Fullscreen error:", e);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }

        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }
}

// Handle Fullscreen UI updates (Icon change)
document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('toggleFullscreenBtn');
    if (!btn) return;
    if (document.fullscreenElement) {
        btn.innerHTML = '<i class="fas fa-compress"></i> 축소';
        // Add a class for specific fullscreen styles if needed
        document.getElementById('youtubePlayerContainer').classList.add('is-fullscreen');
    } else {
        btn.innerHTML = '<i class="fas fa-expand"></i> 전체화면';
        document.getElementById('youtubePlayerContainer').classList.remove('is-fullscreen');
    }
});

function updateGHStatusUI() {
    const ghStatus = document.getElementById('ghStatus');
    const ghStatusText = document.getElementById('ghStatusText');
    if (!ghStatus || !ghStatusText) return;

    if (ghConfig.token && ghConfig.repo) {
        ghStatus.classList.add('connected');
        ghStatus.classList.remove('disconnected');
        ghStatusText.textContent = '연결';
    } else {
        ghStatus.classList.add('disconnected');
        ghStatus.classList.remove('connected');
        ghStatusText.textContent = '미 연결';
    }
}

function updateYTStatusUI() {
    const ytLoginBtn = document.getElementById('ytLoginBtn');
    const ytStatusText = document.getElementById('ytStatusText');
    if (!ytLoginBtn || !ytStatusText) return;

    const isLoggedIn = (localStorage.getItem('vibe_yt_logged_in') === 'true');
    if (isLoggedIn) {
        ytLoginBtn.classList.add('logged-in');
        ytLoginBtn.classList.remove('logged-out');
        ytStatusText.textContent = '로그인 됨';
        ytStatusText.style.color = '#22c55e'; // For safe fallback
    } else {
        ytLoginBtn.classList.add('logged-out');
        ytLoginBtn.classList.remove('logged-in');
        ytStatusText.textContent = '로그인 안됨';
        ytStatusText.style.color = '#ef4444'; // For safe fallback
    }
}


// --- 🎵 MINI PLAYER LOGIC (Scroll Integration) ---
function syncMiniPlayer(song) {
    if (!song) return;
    const miniPlayerImg = document.getElementById('miniPlayerImg');
    const miniPlayerTitle = document.getElementById('miniPlayerTitle');
    const miniPlayerArtist = document.getElementById('miniPlayerArtist');
    if (miniPlayerImg) {
        if (song.youtubeId || song.thumbnail) {
            miniPlayerImg.src = song.youtubeId ? 'https://i.ytimg.com/vi/' + song.youtubeId + '/mqdefault.jpg' : (song.thumbnail || 'music_placeholder.png');
        } else {
            miniPlayerImg.src = 'music_placeholder.png';
        }
    }
    if (miniPlayerTitle) miniPlayerTitle.textContent = song.title;
    if (miniPlayerArtist) miniPlayerArtist.textContent = song.artist;
    
    // Initial sync of icons
    if (player && player.getPlayerState) {
        updateMiniIcons(player.getPlayerState() === YT.PlayerState.PLAYING);
    }
}

function updateMiniIcons(isPlaying) {
    const togglePlayBtnMini = document.getElementById('togglePlayBtnMini');
    if (togglePlayBtnMini) {
        togglePlayBtnMini.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
}

// 📱 SCROLL EVENT: Show/Hide Mini Player on Mobile
function initMiniPlayer() {
    const mainContent = document.querySelector('.main-content');
    const miniPlayer = document.getElementById('miniPlayer');
    const togglePlayBtnMini = document.getElementById('togglePlayBtnMini');
    const nextBtnMini = document.getElementById('nextBtnMini');
    const prevBtnMini = document.getElementById('prevBtnMini');

    if (!miniPlayer) return;
    
    // Always keep it flex so transitions work, hide via opacity/transform in CSS
    miniPlayer.style.display = 'flex';

    const checkScroll = (e) => {
        let scrollTop = 0;
        if (mainContent) scrollTop = mainContent.scrollTop;
        if (scrollTop === 0) scrollTop = window.scrollY; // fallback
        
        // Show if scrolled down more than 50px
        if (window.innerWidth <= 850) {
            if (scrollTop > 50) {
                miniPlayer.classList.add('visible');
            } else {
                miniPlayer.classList.remove('visible');
            }
        } else {
            miniPlayer.classList.remove('visible');
        }
    };

    if (mainContent) {
        mainContent.addEventListener('scroll', checkScroll, { passive: true });
    }
    window.addEventListener('scroll', checkScroll, { passive: true });

    if (togglePlayBtnMini) {
        togglePlayBtnMini.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });
    }

    if (nextBtnMini) {
        nextBtnMini.addEventListener('click', (e) => {
            e.stopPropagation();
            playNext(); /* assuming you have playNext() globally */
        });
    }

    if (prevBtnMini) {
        prevBtnMini.addEventListener('click', (e) => {
            e.stopPropagation();
            playPrevious(); 
        });
    }

    // Check initially just in case page is already scrolled
    setTimeout(checkScroll, 500);
}

// DOM 생성이 완료된 후 미니 플레이어 이벤트 활성화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMiniPlayer);
} else {
    initMiniPlayer();
}

// ============================================================
// 📱 모바일 백그라운드 재생 유지 모듈
// Web Audio API 무음 스트림으로 브라우저 오디오 세션을 활성 상태로 유지
// → 다른 앱 전환 / 화면 내림 시에도 유튜브 음악이 계속 재생됨
// ============================================================
let _audioCtx = null;
let _keepAliveSource = null;
let _userPaused = false; // 사용자가 의도적으로 일시정지했는지 추적

function startAudioKeepAlive() {
    try {
        if (!_audioCtx) {
            _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (_audioCtx.state === 'suspended') {
            _audioCtx.resume();
        }
        if (_keepAliveSource) return; // 이미 실행 중

        // Oscillator로 볼륨 0에 가까운 무음 신호 생성 → OS가 오디오 세션 종료 안 함
        const oscillator = _audioCtx.createOscillator();
        const gainNode = _audioCtx.createGain();
        gainNode.gain.value = 0.0001; // 거의 0 (완전 무음은 세션 끊길 수 있어 미미하게 유지)
        oscillator.type = 'sine';
        oscillator.frequency.value = 1; // 1Hz 극저주파 (들릴 수 없음)
        oscillator.connect(gainNode);
        gainNode.connect(_audioCtx.destination);
        oscillator.start();
        _keepAliveSource = oscillator;
        console.log('[KeepAlive] 백그라운드 오디오 세션 시작');
    } catch(e) {
        console.warn('[KeepAlive] Web Audio API 사용 불가:', e);
    }
}

function stopAudioKeepAlive() {
    if (_keepAliveSource) {
        try { _keepAliveSource.stop(); } catch(e) {}
        _keepAliveSource = null;
    }
}

function resumeAudioKeepAlive() {
    if (_audioCtx && _audioCtx.state === 'suspended') {
        _audioCtx.resume().then(() => console.log('[KeepAlive] AudioContext 재개'));
    }
}

// 재생 상태 변화 시 keepalive 연동은 기존 onPlayerStateChange 내부에서 직접 처리됨
// (위의 PLAYING 브랜치에 startAudioKeepAlive() 호출 추가됨)

// 사용자 의도적 일시정지 감지 (재생 버튼, 미니 플레이어 버튼)
function _markUserPause() {
    if (player && player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING) {
        _userPaused = true;
    }
}
document.getElementById('togglePlayBtn')?.addEventListener('click', _markUserPause, true);
document.getElementById('togglePlayBtnMini')?.addEventListener('click', _markUserPause, true);

// 앱 전환 복귀 시 재생 자동 복원
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('[Visibility] 화면 복귀 감지');
        resumeAudioKeepAlive();
        // 사용자가 의도적으로 멈추지 않았는데 일시정지 상태라면 자동 재개
        if (!_userPaused && player && typeof player.getPlayerState === 'function') {
            const state = player.getPlayerState();
            if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.BUFFERING) {
                setTimeout(() => {
                    if (!_userPaused && player && player.playVideo) {
                        player.playVideo();
                        console.log('[Visibility] 음악 자동 재개');
                    }
                }, 800);
            }
        }
    } else {
        // 백그라운드 진입: keepalive 계속 유지
        resumeAudioKeepAlive();
    }
});

console.log('[Vibe] 백그라운드 재생 모듈 로드 완료');

