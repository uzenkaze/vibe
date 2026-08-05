$ErrorActionPreference = 'Stop'
$file = 'livetv-app/src/ytmusic.js'
$content = Get-Content -Path $file -Raw -Encoding UTF8

# 1. Update Proxy Fetch for searchMusic and searchRelated (they share the same loop structure)
$oldFetch = @"
    for (const makeProxy of proxies) {
      try {
        const res = await fetch(makeProxy(targetUrl));
        if (!res.ok) continue;
        if (makeProxy(targetUrl).includes('allorigins')) {
          html = (await res.json()).contents;
        } else {
          html = await res.text();
        }
        if (html && html.includes('ytInitialData')) break;
      } catch (e) { /* try next */ }
    }
"@
$newFetch = @"
    for (const makeProxy of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(makeProxy(targetUrl), { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) continue;
        if (makeProxy(targetUrl).includes('allorigins')) {
          html = (await res.json()).contents;
        } else {
          html = await res.text();
        }
        if (html && html.includes('ytInitialData')) break;
      } catch (e) { /* try next */ }
    }
"@
$content = $content.Replace($oldFetch, $newFetch)

# 2. Update searchMusic parsing
$oldSearchMusicParse = @"
  const prefix = 'var ytInitialData = ';
  const si = html.indexOf(prefix);
  if (si === -1) {
    if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">데이터 구조가 변경되었습니다.</div>`;
    if (loadEl) {
      if (isAppend) loadEl.style.display = 'none';
      else loadEl.classList.remove('active');
    }
    isSearchLoading = false;
    return;
  }
  const ei = html.indexOf(';</script>', si);
  const jsonStr = html.substring(si + prefix.length, ei);
"@
$newSearchMusicParse = @"
  let jsonStr = '';
  const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({.+?})\s*;</);
  if (match) {
    jsonStr = match[1];
  } else {
    if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">데이터 구조가 변경되었습니다.</div>`;
    if (loadEl) {
      if (isAppend) loadEl.style.display = 'none';
      else loadEl.classList.remove('active');
    }
    isSearchLoading = false;
    return;
  }
"@
$content = $content.Replace($oldSearchMusicParse, $newSearchMusicParse)

# 3. Update searchRelated parsing
$oldSearchRelatedParse = @"
    const prefix = 'var ytInitialData = ';
    const si = html.indexOf(prefix);
    const ei = html.indexOf(';</script>', si);
    const jsonStr = html.substring(si + prefix.length, ei);
"@
$newSearchRelatedParse = @"
    let jsonStr = '';
    const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({.+?})\s*;</);
    if (match) jsonStr = match[1];
    else throw new Error("No ytInitialData");
"@
$content = $content.Replace($oldSearchRelatedParse, $newSearchRelatedParse)

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Patched ytmusic.js search logic successfully!"
