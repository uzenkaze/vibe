$ErrorActionPreference = 'Stop'
$file = 'livetv-app/src/ytmusic.js'
$content = Get-Content -Path $file -Raw -Encoding UTF8

# 1. Fix loadEl.style.display hide everywhere
$oldHide = @"
      if (loadEl) {
        if (isAppend) loadEl.style.display = 'none';
        else loadEl.classList.remove('active');
      }
"@
$newHide = @"
      if (loadEl) {
        loadEl.style.display = 'none';
        if (!isAppend) loadEl.classList.remove('active');
      }
"@
$content = $content.Replace($oldHide, $newHide)

$oldHide2 = @"
    if (loadEl) {
      if (isAppend) loadEl.style.display = 'none';
      else loadEl.classList.remove('active');
    }
"@
$newHide2 = @"
    if (loadEl) {
      loadEl.style.display = 'none';
      if (!isAppend) loadEl.classList.remove('active');
    }
"@
$content = $content.Replace($oldHide2, $newHide2)

# 2. Add AbortController to fetch in searchMusic
$oldFetch1 = @"
    let html = '';
    for (const makeProxy of proxies) {
      try {
        const res = await fetch(makeProxy(targetUrl));
"@
$newFetch1 = @"
    let html = '';
    for (const makeProxy of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(makeProxy(targetUrl), { signal: controller.signal });
        clearTimeout(timeoutId);
"@
$content = $content.Replace($oldFetch1, $newFetch1)

# 3. Fix ytInitialData Parsing in searchMusic
$oldParse1 = @"
    const prefix = 'var ytInitialData = ';
    const si = html.indexOf(prefix);
    if (si === -1) {
      if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">데이터 구조가 변경되었습니다.</div>`;
      if (loadEl) {
        loadEl.style.display = 'none';
        if (!isAppend) loadEl.classList.remove('active');
      }
      isSearchLoading = false;
      return;
    }
    const ei = html.indexOf(';</script>', si);
    const jsonStr = html.substring(si + prefix.length, ei);
"@
$newParse1 = @"
    let jsonStr = '';
    const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({.+?})\s*;</);
    if (match) {
      jsonStr = match[1];
    } else {
      if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">데이터 구조가 변경되었습니다.</div>`;
      if (loadEl) {
        loadEl.style.display = 'none';
        if (!isAppend) loadEl.classList.remove('active');
      }
      isSearchLoading = false;
      return;
    }
"@
$content = $content.Replace($oldParse1, $newParse1)

# 4. Fix ytInitialData Parsing in searchRelated
$oldParse2 = @"
    try {
      const prefix = 'var ytInitialData = ';
      const si = html.indexOf(prefix);
      const ei = html.indexOf(';</script>', si);
      const jsonStr = html.substring(si + prefix.length, ei);
"@
$newParse2 = @"
    try {
      let jsonStr = '';
      const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({.+?})\s*;</);
      if (match) jsonStr = match[1];
      else throw new Error("No ytInitialData");
"@
$content = $content.Replace($oldParse2, $newParse2)

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Patched ytmusic.js successfully"
