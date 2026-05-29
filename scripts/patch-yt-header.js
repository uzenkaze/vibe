const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const headerBlock = `      <a href="index.html" class="yt-logo-link flex items-center gap-2">
        <div class="w-10 h-10 bg-gradient-to-tr from-amber-400 via-yellow-400 to-yellow-500 rounded-[12px] flex items-center justify-center flex-shrink-0">
          <div class="w-7 h-7 bg-zinc-900 rounded-[8px] flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3" fill="#fbbf24"/></svg></div>
        </div>
        <span class="yt-logo-text text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-100 to-amber-300 font-extrabold text-xl">PlayTime</span>
      </a>
      <div class="yt-search">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="search-input" placeholder="검색" onkeydown="if(event.key==='Enter')doSearch()">
        <button class="yt-search-btn" onclick="doSearch()" type="button" aria-label="검색"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></button>
      </div>
      <div class="yt-header-actions">
        <button id="login-ui-btn" class="yt-icon-btn" type="button" aria-label="로그인" onclick="openLoginModal()">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
        <button class="yt-icon-btn yt-icon-btn-add" onclick="openAddModal()" type="button" aria-label="채널 추가">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>`;

for (const rel of ['livetv-app/youtube.html', 'deploy_dist/livetv/youtube.html']) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  let t = fs.readFileSync(file, 'utf8');
  const re = /      <a href="index\.html"[\s\S]*?      <\/div>\s*\n    <\/header>/;
  if (!re.test(t)) {
    console.warn('header block not found:', rel);
    continue;
  }
  t = t.replace(re, headerBlock + '\n    </header>');
  fs.writeFileSync(file, t, 'utf8');
  console.log('patched', rel);
}
