const fs = require('fs');

let content = fs.readFileSync('src/youtube.js', 'utf8');

const replacements = {
  // CAT_MAP
  "all: '.*',": "all: '전체',",
  "recent: '.*',": "recent: '최근 재생',",
  "custom: '.*',": "custom: '내 채널',",
  "news: '.*',": "news: '뉴스',",
  "opinion: '.*',": "opinion: '시사',",
  "movie: '.*',": "movie: '영화',",
  "documentary: '.*',": "documentary: '교양',",
  "entertainment: '.*',": "entertainment: '오락/예능',",
  "music: '.*',": "music: '음악',",
  
  // CAT_KEYWORDS
  "news: '.*',\\s*opinion: '.*',\\s*movie: '.*',\\s*documentary: '.*',\\s*entertainment: '.*'": 
  "news: '뉴스',\\n    opinion: '시사',\\n    movie: '영화',\\n    documentary: '교양',\\n    entertainment: '예능'",
  
  // Other text
  "title:\\s*v\\.title\\?\\.runs\\?\\[0\\]\\?\\.text \\|\\| '\\(\\?.*\\)',": "title: v.title?.runs?.[0]?.text || '(제목 없음)',",
  "channelName:\\s*v\\.ownerText\\?\\.runs\\?\\[0\\]\\?\\.text \\|\\| 'Unknown',": "channelName: v.ownerText?.runs?.[0]?.text || 'Unknown',",
  "title:\\s*item\\.title \\|\\| '\\(\\?.*\\)',": "title: item.title || '(제목 없음)',",
  
  "grid\\.innerHTML = '<div style=\"grid-column:1/-1;text-align:center;padding:40px;color:#666\">.*<\\\\/div>';": 
  "grid.innerHTML = '<div style=\"grid-column:1/-1;text-align:center;padding:40px;color:#666\">최근 시청한 영상이 없습니다.</div>';",
  
  "if \\(!confirm\\('.*'\\)\\) return;": "if (!confirm('최근 재생 목록에서 이 영상을 삭제하시겠습니까?')) return;",
  
  "status\\.textContent = '.*'; return; \\}": "status.textContent = '채널명을 입력하세요.'; return; }",
  "status\\.textContent = '.*중\\.\\.\\.';": "status.textContent = '검색 중...';",
  "status\\.textContent = '\\\"\\$\\{newCh\\.name\\}\\\" .*!';": "status.textContent = `\\\"\\\${newCh.name}\\\" 채널 추가 완료!`;",
  
  "resultBox\\.innerHTML = `<div style=\"text-align:center;padding:20px;color:#555\"><div class=\"yt-spinner\" style=\"margin:0 auto 8px\"></div>.*</div>`;": 
  "resultBox.innerHTML = `<div style=\"text-align:center;padding:20px;color:#555\"><div class=\"yt-spinner\" style=\"margin:0 auto 8px\"></div>검색 중...</div>`;",
  
  "status\\.textContent = '.*결과가 없습니다\\..*';": "status.textContent = '검색 결과가 없습니다. 다른 검색어로 시도해보세요.';",
  "status\\.textContent = `\\$\\{channels\\.length\\}개.*선택.*`;": "status.textContent = `\\\${channels.length}개의 채널을 찾았습니다. 추가할 채널을 선택하세요.`;",
  "status\\.textContent = '.*오류.*';": "status.textContent = '검색 중 오류가 발생했습니다.';",
  
  "title=\"삭제\"": "title=\"삭제\"", // Just in case
  
  // Sentinel messages
  "el\\.innerHTML = `<span style=\"font-size:13px;color:#666\">.*<\\\\/span>`;": 
  "el.innerHTML = `<span style=\"font-size:13px;color:#666\">스크롤하여 더보기</span>`;"
};

for (const [pattern, replacement] of Object.entries(replacements)) {
  const regex = new RegExp(pattern, 'g');
  content = content.replace(regex, replacement.replace(/\\\\n/g, '\\n').replace(/\\\\/g, ''));
}

// Fix empty string logic for regex issues
content = content.replace(/all:\s*'.*',/g, "all: '전체',");
content = content.replace(/recent:\s*'.*',/g, "recent: '최근 재생',");
content = content.replace(/custom:\s*'.*',/g, "custom: '내 채널',");
content = content.replace(/news:\s*'.*',/g, "news: '뉴스',");
content = content.replace(/opinion:\s*'.*',/g, "opinion: '시사',");
content = content.replace(/movie:\s*'.*',/g, "movie: '영화',");
content = content.replace(/documentary:\s*'.*',/g, "documentary: '교양',");
content = content.replace(/entertainment:\s*'.*',/g, "entertainment: '오락/예능',");
content = content.replace(/music:\s*'.*',/g, "music: '음악',");

fs.writeFileSync('src/youtube.js', content, 'utf8');
console.log("Fixed corrupted Korean strings.");
