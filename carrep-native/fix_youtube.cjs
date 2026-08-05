const fs = require('fs');
const cp = require('child_process');

try {
  // 1. Get pristine modern version (58ad8e86)
  const modern = cp.execSync('git show 58ad8e86:livetv-app/src/youtube.js', {encoding: 'utf8'});
  
  // 2. Get pristine old version (9d3570bd)
  const old = cp.execSync('git show 9d3570bd:livetv-app/src/youtube.js', {encoding: 'utf8'});

  // Helper to extract a function's code
  function extractFunction(source, funcName) {
    const regex = new RegExp(\`async function \${funcName}\\\\(.*?\\\\)\\\s*\\\\{[\\\\s\\\\S]*?\\n\\\\}\`, 'g');
    const match = source.match(regex);
    if (!match) {
      const regexSync = new RegExp(\`function \${funcName}\\\\(.*?\\\\)\\\s*\\\\{[\\\\s\\\\S]*?\\n\\\\}\`, 'g');
      const matchSync = source.match(regexSync);
      return matchSync ? matchSync[0] : null;
    }
    return match[0];
  }

  // Extract old functions
  const oldMakeProxies = extractFunction(old, 'makeProxies');
  const oldFetchOneProxy = extractFunction(old, 'fetchOneProxy');
  const oldParseRss = extractFunction(old, 'parseRss');
  const oldFetchChannelInvidious = extractFunction(old, 'fetchChannelInvidious');
  const oldFetchChannelBySearch = extractFunction(old, 'fetchChannelBySearch');
  const oldFetchNextPage = extractFunction(old, 'fetchNextPage');

  // We need to replace the modern functions.
  // The modern version also has makeRssProxies and fetchRssRace which we should remove or ignore.
  // Let's just do text replacements on the modern file.
  
  let newContent = modern;

  // Replace fetchNextPage
  const modernFetchNextPage = extractFunction(modern, 'fetchNextPage');
  newContent = newContent.replace(modernFetchNextPage, oldFetchNextPage);

  // Apply the priority logic to the newly replaced fetchNextPage
  const catKeywordLogic = \`  const CAT_KEYWORDS = {
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
    console.log(\\\`[Category Search] Fetching keyword: "\${st.query}" for category: \${filter}, page: \${p}\\\`);
    const items = await searchInvidious(st.query, p);
    if (items && items.length > 0) {
      return items.map(v => ({
        ...v,
        channelCat: filter
      }));
    }
    return items || [];
  }

  // 일반 카테고리 (RSS 채널 로드)\`;

  newContent = newContent.replace(/\\/\\/\\s*일반\\s*카테고리\\s*\\(RSS\\s*채널\\s*로드\\)/, catKeywordLogic);
  newContent = newContent.replace(
    /const defaultList = DEFAULT_CHANNELS\\.filter\\(c => c\\.cat !== 'music'\\);/,
    \`const defaultList = DEFAULT_CHANNELS.filter(c => c.cat !== 'music' && c.cat !== 'entertainment');\`
  );

  // Replace proxy and rss functions
  newContent = newContent.replace(extractFunction(modern, 'makeProxies'), oldMakeProxies);
  newContent = newContent.replace(extractFunction(modern, 'fetchOneProxy'), oldFetchOneProxy);
  newContent = newContent.replace(extractFunction(modern, 'parseRss'), oldParseRss);
  newContent = newContent.replace(extractFunction(modern, 'fetchChannelInvidious'), oldFetchChannelInvidious);
  newContent = newContent.replace(extractFunction(modern, 'fetchChannelBySearch'), oldFetchChannelBySearch);

  // Update DEFAULT_CHANNELS
  newContent = newContent.replace(
    /{ id: 'UCQhSqy2fVQMhXJv1oMLKlXA', name: 'JYP Entertainment', cat: 'music' },\\s*\\];/,
    \`{ id: 'UCQhSqy2fVQMhXJv1oMLKlXA', name: 'JYP Entertainment', cat: 'music' },
  // 교양
  { id: 'UC-mOecNEMHGAE-3U1TzQpEQ', name: 'EBS 교양', cat: 'documentary' },
  { id: 'UCW_oMms-7eJ_zW7VjBte9bA', name: 'KBS 교양', cat: 'documentary' },
  { id: 'UCbYmH6LdD4L-sBqMhC40B8Q', name: '지식채널e', cat: 'documentary' },
  { id: 'UC7Fv2yCQrBUvCXBCaRV12Iw', name: '사물궁이', cat: 'documentary' },
];\`
  );

  // Update CAT_MAP
  newContent = newContent.replace(
    /movie: '영화',\\s*entertainment: '오락\\/예능',/,
    \`movie: '영화',
  documentary: '교양',
  entertainment: '오락/예능',\`
  );

  // Add 10-second timer to playVideo
  newContent = newContent.replace(
    /saveToWatchHistory\\((existingVideo \\|\\| fallbackVideo)\\);/,
    \`window.currentlyPlayingVideo = $1;
  if (window.watchTimer) clearTimeout(window.watchTimer);
  window.watchTimer = setTimeout(() => {
    if (window.currentlyPlayingVideo && window.currentlyPlayingVideo.videoId === videoId) {
      saveToWatchHistory(window.currentlyPlayingVideo);
    }
  }, 10000);\`
  );

  // Add removeHistoryVideo
  newContent += \`\\n
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
\`;

  // Update closePlayer
  newContent = newContent.replace(
    /function closePlayer\\(avoidPop = false\\) \\{/,
    \`function closePlayer(avoidPop = false) {
  if (window.watchTimer) { clearTimeout(window.watchTimer); window.watchTimer = null; }
  window.currentlyPlayingVideo = null;\`
  );

  // Add X button
  newContent = newContent.replace(
    /<div class="yt-play-btn">\\s*<svg.*?<\\/svg>\\s*<\\/div>/,
    \`$&
      \\\${currentFilter === 'recent' ? \\\`
        <button class="yt-card-delete-btn" title="삭제" onclick="event.stopPropagation(); window.removeHistoryVideo('\\\${v.videoId}')" style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.6);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;color:#fff;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      \\\` : ''}\`
  );

  fs.writeFileSync('src/youtube.js', newContent, 'utf8');
  console.log('Rebuild successful!');
} catch (e) {
  console.error(e);
}
