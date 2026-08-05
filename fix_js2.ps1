$ErrorActionPreference = 'Stop'
$file = 'livetv-app/src/ytmusic.js'
$content = Get-Content -Path $file -Raw -Encoding UTF8

$oldTab = @"
let activeBottomTab = 'next';
"@
$newTab = @"
let activeBottomTab = '';
"@
$content = $content.Replace($oldTab, $newTab)

$oldPlayMusic = @"
  updatePlayPauseIcon();
  saveToRecent(song);
  refreshNextTrackList();
"@
$newPlayMusic = @"
  updatePlayPauseIcon();
  saveToRecent(song);
  if (activeBottomTab) switchBottomTab(activeBottomTab);
"@
$content = $content.Replace($oldPlayMusic, $newPlayMusic)

$oldOpen = @"
function openFullPlayer() {
  document.getElementById('full-player').classList.add('open');
  refreshNextTrackList();
}
"@
$newOpen = @"
function openFullPlayer() {
  document.getElementById('full-player').classList.add('open');
  if (activeBottomTab) switchBottomTab(activeBottomTab);
}
"@
$content = $content.Replace($oldOpen, $newOpen)

$oldClear = @"
  if (tab === 'next')    renderNextTracks(content);
  else if (tab === 'lyrics')  renderLyrics(content);
  else if (tab === 'related') renderRelated(content);
}
"@
$newClear = @"
  if (tab === 'next')    renderNextTracks(content);
  else if (tab === 'lyrics')  renderLyrics(content);
  else if (tab === 'related') renderRelated(content);
  else content.innerHTML = '';
}
"@
if (-not $content.Contains("else content.innerHTML = '';")) {
    $content = $content.Replace($oldClear, $newClear)
}

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Patched ytmusic.js active tab successfully"
