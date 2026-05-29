$ErrorActionPreference = 'Stop'
$file = 'livetv-app/src/ytmusic.js'
$content = Get-Content -Path $file -Raw -Encoding UTF8

# 1. searchMusic parsing
$oldSearchMusicParse = @"
  let jsonStr = '';
  const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({[\s\S]+?})\s*;</);
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

  let data;
  try {
    try { data = JSON.parse(jsonStr); } catch { data = new Function('return ' + jsonStr)(); }

    const contents = data.contents.twoColumnSearchResultsRenderer
      .primaryContents.sectionListRenderer.contents[0]
      .itemSectionRenderer.contents;
"@
$newSearchMusicParse = @"
  let jsonStr = '';
  const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*(.*?)\s*;</);
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

  let data;
  try {
    try { data = JSON.parse(jsonStr); } catch { data = new Function('return ' + jsonStr)(); }
    if (typeof data === 'string') data = JSON.parse(data);

    let contents = [];
    if (data.contents?.twoColumnSearchResultsRenderer) {
      contents = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    } else if (data.contents?.sectionListRenderer) {
      contents = data.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    }
"@
$content = $content.Replace($oldSearchMusicParse, $newSearchMusicParse)


# 2. searchRelated parsing
$oldSearchRelatedParse = @"
    let jsonStr = '';
    const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({[\s\S]+?})\s*;</);
    if (match) jsonStr = match[1];
    else throw new Error("No ytInitialData");
    let data;
    try { data = JSON.parse(jsonStr); } catch { data = new Function('return ' + jsonStr)(); }

    const contents = data.contents.twoColumnSearchResultsRenderer
      .primaryContents.sectionListRenderer.contents[0]
      .itemSectionRenderer.contents;
"@
$newSearchRelatedParse = @"
    let jsonStr = '';
    const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*(.*?)\s*;</);
    if (match) jsonStr = match[1];
    else throw new Error("No ytInitialData");
    let data;
    try { data = JSON.parse(jsonStr); } catch { data = new Function('return ' + jsonStr)(); }
    if (typeof data === 'string') data = JSON.parse(data);

    let contents = [];
    if (data.contents?.twoColumnSearchResultsRenderer) {
      contents = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    } else if (data.contents?.sectionListRenderer) {
      contents = data.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    }
"@
$content = $content.Replace($oldSearchRelatedParse, $newSearchRelatedParse)

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Patched ytmusic.js mobile structure parsing successfully!"
