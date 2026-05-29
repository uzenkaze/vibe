/**
 * Restore Korean text in livetv HTML/JS files (UTF-8).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const youtubeHtmlReplacements = [
  ['placeholder="??"', 'placeholder="검색"'],
  ['aria-label="??"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"', 'aria-label="닫기"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"'],
  ['aria-label="??"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"', 'aria-label="검색"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"'],
  ['type="button">???</button>', 'type="button">로그인</button>'],
  ['type="button">?? ??</button>', 'type="button">채널 추가</button>'],
  ["filterCat('all',this)\" type=\"button\">??</button>", "filterCat('all',this)\" type=\"button\">전체</button>"],
  ["filterCat('custom',this)\" type=\"button\">? ??</button>", "filterCat('custom',this)\" type=\"button\">내 채널</button>"],
  ["filterCat('news',this)\" type=\"button\">??</button>", "filterCat('news',this)\" type=\"button\">뉴스</button>"],
  ["filterCat('opinion',this)\" type=\"button\">??</button>", "filterCat('opinion',this)\" type=\"button\">시사</button>"],
  ["filterCat('movie',this)\" type=\"button\">??</button>", "filterCat('movie',this)\" type=\"button\">영화</button>"],
  ['type="button">??/??</button>', 'type="button">오락/예능</button>'],
  ["filterCat('music',this)\" type=\"button\">??</button>", "filterCat('music',this)\" type=\"button\">음악</button>"],
  ['<span>?? ??? ???? ?...</span>', '<span>채널 영상을 불러오는 중...</span>'],
  ['aria-label="??"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"', 'aria-label="닫기"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"'],
  ['<h3>YouTube ?? ??</h3>', '<h3>YouTube 채널 추가</h3>'],
  ['<p>???, @??, ?? YouTube ?? URL? ?????</p>', '<p>채널명, @핸들, 또는 YouTube 채널 URL을 입력하세요</p>'],
  ['placeholder="?: @JTBC_news ?? UCxxxxxxxx"', 'placeholder="예: @JTBC_news 또는 UCxxxxxxxx"'],
  ['placeholder="?: @JTBC_news"', 'placeholder="예: @JTBC_news 또는 UCxxxxxxxx"'],
  ['onclick="closeAddModal()" type="button">??</button><button class="btn-add" onclick="addChannel()"', 'onclick="closeAddModal()" type="button">취소</button><button class="btn-add" onclick="addChannel()"'],
  ['onclick="addChannel()" type="button">????</button>', 'onclick="addChannel()" type="button">추가하기</button>'],
  ['<h3>YouTube ??? ??</h3>', '<h3>YouTube 로그인 안내</h3>'],
  ['<p>???? ??(?? ??) ? ? ?? ??? ?? ??? ???? ??????.</p>', '<p>프리미엄 혜택(광고 제거) 및 내 채널 연동을 위해 유튜브 계정으로 로그인합니다.</p>'],
  ['<p>???? ??(?? ??)? ?? ??? ???? ??????.</p>', '<p>프리미엄 혜택(광고 제거) 및 내 채널 연동을 위해 유튜브 계정으로 로그인합니다.</p>'],
  ['onclick="closeLoginModal()" type="button">??</button><button class="btn-add" onclick="proceedYouTubeLogin()"', 'onclick="closeLoginModal()" type="button">취소</button><button class="btn-add" onclick="proceedYouTubeLogin()"'],
  ['type="button">??? ????</button>', 'type="button">로그인 하러가기</button>'],
  ['font-weight:700">?</span></button>', 'font-weight:700">홈</span></button>'],
  ['font-weight:700">???</span></button>', 'font-weight:700">유튜브</span></button>'],
  ['font-weight:700">????</span></button>', 'font-weight:700">즐겨찾기</span></button>'],
  ['/* Home header (glass-nav) ? same safe-area / status bar spacing */', '/* Home header (glass-nav) - same safe-area / status bar spacing */'],
];

function applyReplacements(filePath, pairs) {
  if (!fs.existsSync(filePath)) {
    console.warn('skip (missing):', filePath);
    return;
  }
  let text = fs.readFileSync(filePath, 'utf8');
  let changed = 0;
  for (const [from, to] of pairs) {
    if (text.includes(from)) {
      text = text.split(from).join(to);
      changed++;
    }
  }
  fs.writeFileSync(filePath, text, 'utf8');
  console.log(path.relative(root, filePath), `(${changed} rules applied)`);
}

const targets = [
  path.join(root, 'livetv-app', 'youtube.html'),
  path.join(root, 'deploy_dist', 'livetv', 'youtube.html'),
];

for (const f of targets) {
  applyReplacements(f, youtubeHtmlReplacements);
}

// youtube.js channel count label
const jsPath = path.join(root, 'livetv-app', 'src', 'youtube.js');
if (fs.existsSync(jsPath)) {
  let js = fs.readFileSync(jsPath, 'utf8');
  js = js.replace(
    /<span style="font-size:11px;color:#666;font-weight:normal">\? \$\{customChannels\.length\}\?<\/span>/,
    '<span style="font-size:11px;color:#666;font-weight:normal">총 ${customChannels.length}개</span>'
  );
  js = js.replace(
    /\\ucd1d \$\{customChannels\.length\}\\uac1c/,
    '총 ${customChannels.length}개'
  );
  if (!js.includes('총 ${customChannels.length}개')) {
    js = js.replace(
      '? ${customChannels.length}?',
      '총 ${customChannels.length}개'
    );
  }
  fs.writeFileSync(jsPath, js, 'utf8');
  fs.writeFileSync(path.join(root, 'deploy_dist', 'livetv', 'src', 'youtube.js'), js, 'utf8');
  console.log('livetv-app/src/youtube.js');
}

// Sync good ytmusic + index from livetv-app to deploy_dist
for (const name of ['ytmusic.html', 'index.html']) {
  const src = path.join(root, 'livetv-app', name);
  const dest = path.join(root, 'deploy_dist', 'livetv', name);
  if (fs.existsSync(src) && fs.existsSync(path.dirname(dest))) {
    fs.copyFileSync(src, dest);
    console.log('copied', name, '-> deploy_dist');
  }
}

console.log('done');
