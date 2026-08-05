$ErrorActionPreference = 'Stop'

# 1. Fix ytmusic.css to allow album art to shrink and fit screen without scrolling
$cssFile = 'livetv-app/src/ytmusic.css'
$cssContent = Get-Content $cssFile -Raw

$oldArtCss = @"
.full-art-container {
  flex-shrink: 0;
  padding: 32px;
  position: relative;
}
.full-art-container img#full-art {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 8px;
  object-fit: cover;
  background: #222;
  display: block;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}
"@

$newArtCss = @"
.full-art-container {
  flex: 1;
  min-height: 0;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.full-art-container img#full-art {
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1/1;
  width: auto;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
  background: #222;
  display: block;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}
"@

$cssContent = $cssContent -replace [regex]::Escape($oldArtCss), $newArtCss

# Also fix yt-player-container for video mode
$oldVideoCss = @"
#yt-player-container.video-mode-active {
  opacity: 1;
  pointer-events: auto;
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
}
"@

$newVideoCss = @"
#yt-player-container.video-mode-active {
  opacity: 1;
  pointer-events: auto;
  position: relative;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1/1;
  width: 100%;
}
"@

$cssContent = $cssContent -replace [regex]::Escape($oldVideoCss), $newVideoCss
Set-Content $cssFile $cssContent
Write-Host "Updated ytmusic.css"

# 2. Fix youtube.html
$ytmusicHtml = Get-Content 'livetv-app/ytmusic.html' -Raw
$youtubeHtml = Get-Content 'livetv-app/youtube.html' -Raw

# Grab the correct full-player block from ytmusic.html
$playerMatch = [regex]::Match($ytmusicHtml, '(?s)(<div class="full-player" id="full-player">.*?</script>\s*</body>)')
$playerHtml = $playerMatch.Groups[1].Value

# Replace the broken full-player block in youtube.html
$youtubeHtml = $youtubeHtml -replace '(?s)<div class="full-player" id="full-player">.*', $playerHtml

# Fix the scripts and iframe for youtube.html
$youtubeHtml = $youtubeHtml -replace '<script src="src/ytmusic.js\?v=CACHE_BUST"></script>', '<script type="module" src="src/youtube.js?v=CACHE_BUST"></script>'
$youtubeHtml = $youtubeHtml -replace '<div id="yt-player"></div>', '<iframe id="yt-iframe" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>'

Set-Content 'livetv-app/youtube.html' $youtubeHtml
Write-Host "Fixed youtube.html"
