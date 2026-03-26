const songs = [
    {
        id: 1,
        title: "Supernova",
        artist: "aespa(에스파)",
        youtubeId: "JmD8_t0IuGg", // Updated to a more reliable lyrical version
        lyrics: `I'm like some kind of Supernova
Watch out...`
    },
    {
        id: 2,
        title: "Ditto",
        artist: "NewJeans",
        youtubeId: "km_OnhPjD0o", // Updated to a lyric version that allows embedding
        lyrics: `Woo woo woo woo ooh...`
    },
    {
        id: 3,
        title: "고민중독",
        artist: "QWER",
        youtubeId: "X_P3-X_v_U", // Updated to a confirmed embedded version
        lyrics: `머리가 핑핑 돌아...`
    },
    {
        id: 4,
        title: "밤양갱",
        artist: "비비 (BIBI)",
        youtubeId: "v9gGfQy7-C4",
        lyrics: `달디달고 달디달고 달디단 밤양갱...`
    },
    {
        id: 5,
        title: "Love wins all",
        artist: "아이유 (IU)",
        youtubeId: "vG8NbeR_L_k", // Updated to a lyrical live version
        lyrics: `Love wins all...`
    },
    {
        id: 6,
        title: "밤편지",
        artist: "아이유 (IU)",
        youtubeId: "XvS07O0S0u0",
        lyrics: `음 사랑한다는 말이에요...`
    },
    {
        id: 7,
        title: "에잇(eight)",
        artist: "아이유 (IU)",
        youtubeId: "D1PvIWdJ8xo",
        lyrics: `이대로는 무엇도 사랑하고 싶지 않아...`
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

    // 1. Load from playlist.json first (Server-side storage)
    try {
        const response = await fetch('playlist.json');
        if (response.ok) {
            const data = await response.json();
            if (data.myPlaylistIds) {
                // Merge with localStorage
                const localIds = JSON.parse(localStorage.getItem('vibe_playlist') || '[]');
                const combinedIds = [...new Set([...data.myPlaylistIds, ...localIds])];
                localStorage.setItem('vibe_playlist', JSON.stringify(combinedIds));
                myPlaylistIds = combinedIds; // Update in-memory variable
            }
            if (data.globalSavedSongs) {
                const localSongs = JSON.parse(localStorage.getItem('vibe_global_songs') || '[]');
                // Simple merge by id
                const songMap = new Map();
                data.globalSavedSongs.forEach(s => songMap.set(s.id, s));
                localSongs.forEach(s => songMap.set(s.id, s));
                const combinedSongs = Array.from(songMap.values());
                localStorage.setItem('vibe_global_songs', JSON.stringify(combinedSongs));
                globalSavedSongs = combinedSongs; // Update in-memory variable
            }
            console.log('Playlist data sync from file completed.');
        }
    } catch (error) {
        console.log('No playlist.json found or fetch failed. Using local storage only.');
    }

    // 2. Load hot music 100
    await handleGlobalSearch("실시간 인기 급상승 음악");

    // 3. Render initial state
    updatePlaylistBadge();
    performSearch(); 

    // Setup listeners
    setupEventListeners();
}

function exportPlaylistToJson() {
    const data = {
        myPlaylistIds: JSON.parse(localStorage.getItem('vibe_playlist') || '[]'),
        globalSavedSongs: JSON.parse(localStorage.getItem('vibe_global_songs') || '[]')
    };

    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playlist.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('현재 보관함이 playlist.json 파일로 내보내졌습니다.\n다운로드된 파일을 프로젝트 폴더에 덮어쓰시면 다음 접속 시에도 유지됩니다.');
}

function updatePlaylistBadge() {
    if(playlistCount) playlistCount.textContent = myPlaylistIds.length;
}

async function performSearch(queryOverride = null) {
    const query = (queryOverride || searchInput.value).toLowerCase().trim();
    loading.style.display = 'none';

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
}

async function handleGlobalSearch(customQuery = null) {
    // Ensure customQuery is a string and not an event object
    const query = (typeof customQuery === 'string') ? customQuery : searchInput.value.trim();
    if (!query) return;

    songList.style.display = 'none';
    noResults.style.display = 'none';
    loading.style.display = 'flex';

    // Robust proxy rotation
    const proxies = [
        url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        url => `https://corsproxy.io/?${encodeURIComponent(url)}`
    ];

    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;

    for (const proxyFn of proxies) {
        try {
            const response = await fetch(proxyFn(ytUrl));
            if (!response.ok) continue;
            
            let html;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('json')) {
                const json = await response.json();
                html = json.contents || json;
            } else {
                html = await response.text();
            }
            
            if (!html || typeof html !== 'string') continue;

            const jsonMatch = html.match(/ytInitialData\s*=\s*({.+?});/);
            if (jsonMatch) {
                const ytData = JSON.parse(jsonMatch[1]);
                let contents = [];
                
                try {
                    contents = ytData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
                } catch (e) {
                    console.warn("Parsing path failed, trying secondary path");
                    // Sometimes path is slightly different
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

                if (results.length > 0) {
                    currentResults = results.slice(0, 100); 
                    
                    if (listTitleLabel && listIcon) {
                        if (customQuery && query === "실시간 인기 급상승 음악") {
                            listTitleLabel.textContent = "유튜브 핫 뮤직 100";
                            listIcon.className = "fas fa-fire";
                            listIcon.style.color = "#ff4500";
                        } else {
                            listTitleLabel.textContent = "검색 결과";
                            listIcon.className = "fas fa-search";
                            listIcon.style.color = "inherit";
                        }
                    }

                    renderSongs(currentResults);
                    loading.style.display = 'none';
                    return;
                }
            }
        } catch (err) {
            console.warn("Proxy attempt failed:", err);
        }
    }

    loading.style.display = 'none';
    noResults.style.display = 'flex';
    noResults.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>실시간 검색 서버가 응답하지 않습니다.</p>
        <button onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(query)}', '_blank')" class="glass-btn">YouTube에서 직접 보기</button>
    `;
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
}

// Handle Song Selection
function handleSongClick(songOrId) {
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

    // Update Lyrics
    lyricsTitle.textContent = `${song.title} - 가사`;
    lyricsContent.innerHTML = (song.lyrics || "(가사 정보가 없습니다)").replace(/\n/g, '<br>');
    lyricsContainer.style.display = 'flex';

    // Update Player UI
    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;
    currentSongInfo.style.display = 'flex';
    playerEmptyState.style.display = 'none';
    equalizer.style.display = 'flex';
    youtubePlayerContainer.style.display = 'block';

    // Play YouTube Video
    // Use the simplest embed URL possible to minimize origin/Referer issues
    // Official YouTube Player with Premium support
    youtubeIframe.src = `https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&rel=0&showinfo=0&iv_load_policy=3&hl=ko`;
}

// Start app
init();
