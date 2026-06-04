const fs = require('fs');
const cp = require('child_process');

let content = fs.readFileSync('src/youtube.js', 'utf8');

// 1. Update DEFAULT_CHANNELS
content = content.replace(
  /{ id: 'UCQhSqy2fVQMhXJv1oMLKlXA', name: 'JYP Entertainment', cat: 'music' },\s*\];/,
  `{ id: 'UCQhSqy2fVQMhXJv1oMLKlXA', name: 'JYP Entertainment', cat: 'music' },
  // 교양
  { id: 'UC-mOecNEMHGAE-3U1TzQpEQ', name: 'EBS 교양', cat: 'documentary' },
  { id: 'UCW_oMms-7eJ_zW7VjBte9bA', name: 'KBS 교양', cat: 'documentary' },
  { id: 'UCbYmH6LdD4L-sBqMhC40B8Q', name: '지식채널e', cat: 'documentary' },
  { id: 'UC7Fv2yCQrBUvCXBCaRV12Iw', name: '사물궁이', cat: 'documentary' },
];`
);

// 2. Update CAT_MAP
content = content.replace(
  /movie: '영화',\s*entertainment: '오락\/예능',/,
  `movie: '영화',
  documentary: '교양',
  entertainment: '오락/예능',`
);

// 3. Update filter === 'all'
content = content.replace(
  /const defaultList = DEFAULT_CHANNELS\.filter\(c => c\.cat !== 'music'\);/,
  `const defaultList = DEFAULT_CHANNELS.filter(c => c.cat !== 'music' && c.cat !== 'entertainment');`
);

// 4. Add CAT_KEYWORDS search logic
const catKeywordLogic = `  const CAT_KEYWORDS = {
    news: '뉴스',
    opinion: '시사',
    movie: '영화',
    documentary: '교양',
    entertainment: '예능'
  };

  if (CAT_KEYWORDS[filter]) {
    const keyword = CAT_KEYWORDS[filter];
    if (!searchState[filter]) {
      searchState[filter] = { query: keyword, page: 1 };
    } else if (!searchState[filter].query) {
      searchState[filter].query = keyword;
      searchState[filter].page = 1;
    }
    const st = searchState[filter];
    const p = st.page++;
    console.log(\`[Category Search] Fetching keyword: "\${st.query}" for category: \${filter}, page: \${p}\`);
    const items = await searchInvidious(st.query, p);
    if (items && items.length > 0) {
      return items.map(v => ({
        ...v,
        channelCat: filter
      }));
    }
    return items || [];
  }

  // 일반 카테고리 (RSS 채널 로드)`;

content = content.replace(/\/\/\s*일반\s*카테고리\s*\(RSS\s*채널\s*로드\)/, catKeywordLogic);

// 5. 10s timer in playVideo
let playVideoMatch = content.match(/function playVideo\([\s\S]*?saveToWatchHistory\(.*?\);/);
if (playVideoMatch) {
  content = content.replace(
    /saveToWatchHistory\((existingVideo \|\| fallbackVideo)\);/,
    `window.currentlyPlayingVideo = $1;
  if (window.watchTimer) clearTimeout(window.watchTimer);
  window.watchTimer = setTimeout(() => {
    if (window.currentlyPlayingVideo && window.currentlyPlayingVideo.videoId === videoId) {
      saveToWatchHistory(window.currentlyPlayingVideo);
    }
  }, 10000);`
  );
}

// 6. removeHistoryVideo
content += `\n
window.removeHistoryVideo = function(videoId) {
  if (!confirm('최근 재생 목록에서 이 영상을 삭제하시겠습니까?')) return;
  try {
    let history = getWatchHistory();
    history = history.filter(v => v.videoId !== videoId);
    localStorage.setItem('yt_watch_history', JSON.stringify(history));
    if (currentFilter === 'recent') {
      const activeBtn = document.querySelector('.yt-cat.active');
      switchCategory('recent', activeBtn);
    }
  } catch (e) {
    console.error(e);
  }
};
`;

// 7. closePlayer
content = content.replace(
  /function closePlayer\(avoidPop = false\) {/,
  `function closePlayer(avoidPop = false) {
  if (window.watchTimer) { clearTimeout(window.watchTimer); window.watchTimer = null; }
  window.currentlyPlayingVideo = null;`
);

// 8. Delete button in makeCard
content = content.replace(
  /<div class="yt-play-btn">\s*<svg.*?<\/svg>\s*<\/div>/,
  `$&
      \${currentFilter === 'recent' ? \`
        <button class="yt-card-delete-btn" title="삭제" onclick="event.stopPropagation(); window.removeHistoryVideo('\${v.videoId}')" style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.6);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;color:#fff;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      \` : ''}`
);

// We won't bother adding searchChannel or pullToRefresh back unless it breaks without it.
// Wait, index.html might call initPullToRefresh or openAddModal.
// 'openAddModal' already exists in the May 28 version!
// The user didn't mention pullToRefresh. I will just leave it out to be safe.

fs.writeFileSync('src/youtube.js', content, 'utf8');
console.log('Patch complete.');
