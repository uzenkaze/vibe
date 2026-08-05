$ErrorActionPreference = 'Stop'
$jsFile = 'livetv-app/src/ytmusic.js'
$jsContent = Get-Content $jsFile -Raw

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

if ($jsContent -match [regex]::Escape($oldLoadShow)) {
    $jsContent = $jsContent -replace [regex]::Escape($oldLoadShow), $newLoadShow
    $jsContent = $jsContent -replace [regex]::Escape($oldLoadHide), $newLoadHide
    $jsContent = $jsContent -replace [regex]::Escape($oldLoadHide2), $newLoadHide2
    Set-Content $jsFile $jsContent
    Write-Host "Fixed loading indicator display in ytmusic.js"
} else {
    Write-Host "Target text not found"
}
