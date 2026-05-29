$ErrorActionPreference = 'Stop'
$jsFile = 'livetv-app/src/ytmusic.js'
$jsContent = Get-Content $jsFile -Raw

$oldParse = @"
    try {
      const regex = /var ytInitialData = (\{.*?\});<\/script>/;
      const match = html.match(regex);
      if (match) {
        const data = JSON.parse(match[1]);
"@

$newParse = @"
    try {
      let match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
      if (!match) match = html.match(/window\["ytInitialData"\]\s*=\s*(\{.*?\});<\/script>/);
      if (!match) match = html.match(/ytInitialData\s*=\s*(\{.*?\});<\/script>/);
      
      if (match) {
        const data = JSON.parse(match[1]);
"@

$oldCatch = @"
    } catch (e) {
      console.error('Parse error', e);
      if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">결과 분석 중 오류가 발생했습니다.</div>`;
    }
"@

$newCatch = @"
      } else {
        console.error('Regex match failed on html');
        if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">유튜브 데이터를 불러올 수 없습니다.<br>잠시 후 다시 시도해 주세요.</div>`;
      }
    } catch (e) {
      console.error('Parse error', e);
      if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">결과 분석 중 오류가 발생했습니다.</div>`;
    }
"@

if ($jsContent -match [regex]::Escape($oldParse)) {
    $jsContent = $jsContent -replace [regex]::Escape($oldParse), $newParse
    $jsContent = $jsContent -replace [regex]::Escape($oldCatch), $newCatch
    Set-Content $jsFile $jsContent
    Write-Host "Updated ytmusic.js parsing logic"
} else {
    Write-Host "Target text not found"
}
