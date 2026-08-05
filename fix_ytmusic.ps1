$ErrorActionPreference = 'Stop'
$jsFile = 'livetv-app/src/ytmusic.js'
$jsContent = Get-Content $jsFile -Raw

# 1. Fix loading indicator show
$oldLoadShow = @"
    if (loadEl) {
      if (isAppend) loadEl.style.display = 'block';
      else loadEl.classList.add('active');
    }
"@
$newLoadShow = @"
    if (loadEl) {
      loadEl.style.display = 'block';
      if (!isAppend) loadEl.classList.add('active');
    }
"@
$jsContent = $jsContent.Replace($oldLoadShow, $newLoadShow)

# 2. Fix loading indicator hide
$oldLoadHide = @"
    if (loadEl) {
      if (isAppend) loadEl.style.display = 'none';
      else loadEl.classList.remove('active');
    }
"@
$newLoadHide = @"
    if (loadEl) {
      loadEl.style.display = 'none';
      if (!isAppend) loadEl.classList.remove('active');
    }
"@
# Replace all instances of hiding
$jsContent = $jsContent.Replace($oldLoadHide, $newLoadHide)
# There's another variation with more indentation
$oldLoadHide2 = @"
      if (loadEl) {
        if (isAppend) loadEl.style.display = 'none';
        else loadEl.classList.remove('active');
      }
"@
$newLoadHide2 = @"
      if (loadEl) {
        loadEl.style.display = 'none';
        if (!isAppend) loadEl.classList.remove('active');
      }
"@
$jsContent = $jsContent.Replace($oldLoadHide2, $newLoadHide2)

# 3. Add timeout to fetch
$oldFetch = @"
    let html = '';
    for (const makeProxy of proxies) {
      try {
        const res = await fetch(makeProxy(targetUrl));
"@
$newFetch = @"
    let html = '';
    for (const makeProxy of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(makeProxy(targetUrl), { signal: controller.signal });
        clearTimeout(timeoutId);
"@
$jsContent = $jsContent.Replace($oldFetch, $newFetch)

# 4. Fix HTML check if no proxy succeeds
$oldHtmlFail = @"
    if (!html) {
      if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">검색 결과를 불러올 수 없습니다.<br>잠시 후 다시 시도해 주세요.</div>`;
"@
$newHtmlFail = @"
    if (!html) {
      if (!isAppend) listEl.innerHTML = `<div style="padding:40px 20px;text-align:center;color:#aaa;font-size:14px;">검색 결과를 불러올 수 없습니다.<br>서버 연결 상태를 확인해주세요.</div>`;
"@
$jsContent = $jsContent.Replace($oldHtmlFail, $newHtmlFail)

Set-Content $jsFile $jsContent
Write-Host "ytmusic.js patched successfully"
