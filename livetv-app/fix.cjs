const fs = require('fs');
const lines = fs.readFileSync('src/main.js', 'utf8').split('\n');

// 각 라인을 스캔해서 ? 또는 \uFFFD 가 포함된 문자열 리터럴 부분을 수정
const knownFixes = [
  // renderCategoryTabs 내 '전체' 버튼
  [/allBtn\.textContent\s*=\s*'[^']*'/g, "allBtn.textContent = '\uC804\uCCB4'"],
  // fetchDynamicPlaylist 내 문자열
  [/currentInfo\.includes\('[^']*연합[^']*'\)/g, "currentInfo.includes('\uC5F0\uD569\uB274\uC2A4')"],
  // KBS API 에러 메시지
  [/showLoading\(true, 'KBS[^']*'\)/g, "showLoading(true, 'KBS API\uC5D0\uC11C URL\uC744 \uAC00\uC838\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.')"],
  // 모든 URL 실패 메시지
  [/showLoading\(true, '모든[^']*'\)/g, "showLoading(true, '\uC2A4\uD2B8\uB9BC\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.')"],
  // console.warn KBS
  [/console\.warn\('KBS API[^']*'\)/g, "console.warn('KBS API \uD638\uCD9C \uC2E4\uD328:', e)"],
  // Timeout 경고
  [/console\.warn\(`\[Timeout\][^`]*`\)/g, "console.warn(`[Timeout] \uB2E4\uC74C URL\uB85C \uC804\uD658`)"],
  // YouTube 관련 주석/문자열
  [/\/\/ YTN 공홈[^\n]*/g, '// YTN \uACF5\uD648 \uC2A4\uD2B8\uB9BC \uD6C4\uBCF4 \uBAA9\uB85D'],
  [/\/\/ 연합뉴스TV[^\n]*/g, '// \uC5F0\uD569\uB274\uC2A4TV \uACF5\uD648 \uC2A4\uD2B8\uB9BC \uD6C4\uBCF4 \uBAA9\uB85D'],
  // getNetworkDisplayName 내 깨진 값들
  [/'LOTTE_SHOP': '[^']*'/g, "'LOTTE_SHOP': '\uB86F\uB370'"],
  [/'TV_CHOSUN': 'TV\\n[^']*'/g, "'TV_CHOSUN': 'TV\\n\uC870\uC120'"],
  [/'YONHAP': '[^']*\\n[^']*TV'/g, "'YONHAP': '\uC5F0\uD569\\n\uB274\uC2A4TV'"],
  // overlay 텍스트
  [/<p class="title">[^<]*<\/p>/g, '<p class="title">\uC7AC\uC0DD \uC624\uB958<\/p>'],
  [/<button onclick="[^"]*">[^<]*\uB2EB[^<]*<\/button>/g, '<button onclick="this.closest(\'[id^=video-overlay]\').classList.add(\'hidden\')">\uB2EB\uAE30<\/button>'],
  // alert 메시지
  [/alert\('채널명이[^']*'\)/g, "alert('\uCC44\uB110\uBA85 \uB610\uB294 URL\uC744 \uC785\uB825\uD558\uC138\uC694.')"],
  // statusEl messages
  [/statusEl\.textContent = '[^']*검[^']*\?[^']*'/g, "statusEl.textContent = '\uD83D\uDD0D \uCC44\uB110\uC744 \uAC80\uC0C9 \uC911...'"],
  [/statusEl\.textContent = '[^']*찾을[^']*'/g, "statusEl.textContent = '\u274C \uCC44\uB110\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.'"],
  [/statusEl\.textContent = '[^']*영상[^']*'/g, "statusEl.textContent = '\uD83D\uDCE1 \uC601\uC0C1 \uBAA9\uB85D\uC744 \uAC00\uC838\uC624\uB294 \uC911...'"],
];

let content = lines.join('\n');
knownFixes.forEach(([pattern, replacement]) => {
  try { content = content.replace(pattern, replacement); } catch(e) {}
});

// statusEl template literal fix
content = content.replace(
  /statusEl\.textContent = `[^`]*\?[^`]*`/g,
  'statusEl.textContent = `\u2705 "${chName}" \uCC44\uB110\uC774 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4!`'
);

fs.writeFileSync('src/main.js', content, 'utf8');

const { execSync } = require('child_process');
try {
  execSync('node --check src/main.js', { stdio: 'pipe' });
  console.log('SUCCESS: Syntax OK - ready to test in browser');
} catch(e) {
  const out = (e.stderr || e.stdout || Buffer.alloc(0)).toString();
  const m = out.match(/main\.js:(\d+)/);
  console.log('FAIL at line', m && m[1]);
  const ls = fs.readFileSync('src/main.js','utf8').split('\n');
  if (m) {
    const idx = parseInt(m[1]);
    ls.slice(idx-2, idx+2).forEach((l,i) => console.log(idx-1+i, JSON.stringify(l)));
  }
}
