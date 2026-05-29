$ErrorActionPreference = 'Stop'
$file = 'livetv-app/src/ytmusic.js'
$content = Get-Content -Path $file -Raw -Encoding UTF8

$oldInit = @"
    ytPlayer = new YT.Player('yt-player', {
      height: '100%', width: '100%',
      videoId: '',
      playerVars: { playsinline: 1, autoplay: 1, controls: 0, disablekb: 1, fs: 0, rel: 0 },
"@
$newInit = @"
    ytPlayer = new YT.Player('yt-player', {
      height: '100%', width: '100%',
      playerVars: { playsinline: 1, autoplay: 1, controls: 0, disablekb: 1, fs: 0, rel: 0 },
"@
$content = $content.Replace($oldInit, $newInit)

$oldPlay = @"
    if (isPlayerReady && ytPlayer?.loadVideoById) {
      ytPlayer.loadVideoById(song.videoId);
    } else {
      const iv = setInterval(() => {
        if (isPlayerReady && ytPlayer?.loadVideoById) {
          ytPlayer.loadVideoById(song.videoId);
          clearInterval(iv);
        }
      }, 200);
    }
"@
$newPlay = @"
    if (isPlayerReady && ytPlayer?.loadVideoById) {
      ytPlayer.loadVideoById(song.videoId);
      if (ytPlayer.playVideo) ytPlayer.playVideo();
    } else {
      const iv = setInterval(() => {
        if (isPlayerReady && ytPlayer?.loadVideoById) {
          ytPlayer.loadVideoById(song.videoId);
          if (ytPlayer.playVideo) ytPlayer.playVideo();
          clearInterval(iv);
        }
      }, 200);
    }
"@
$content = $content.Replace($oldPlay, $newPlay)

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Patched ytmusic.js successfully"
