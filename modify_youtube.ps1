$ErrorActionPreference = 'Stop'

$ytmusicCss = Get-Content 'livetv-app/src/ytmusic.css' -Raw
$ytmusicHtml = Get-Content 'livetv-app/ytmusic.html' -Raw
$youtubeHtml = Get-Content 'livetv-app/youtube.html' -Raw

$playerCssMatch = [regex]::Match($ytmusicCss, '(?s)(/\* ════════════════════════════════════════════\r?\n\s*FULL PLAYER\r?\n════════════════════════════════════════════ \*/.*)')
$playerCss = $playerCssMatch.Groups[1].Value

$playerHtmlMatch = [regex]::Match($ytmusicHtml, '(?s)(<!-- Full Player Overlay -->.*?</div>\s*</div>\s*</div>)')
$playerHtml = $playerHtmlMatch.Groups[1].Value
$playerHtml = $playerHtml -replace '<div id=\"yt-player\"></div>', '<iframe id=\"yt-iframe\" allowfullscreen allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\"></iframe>'

$youtubeHtml = $youtubeHtml -replace '(?s)/\* Player Overlay \*/.*?/\* Add Channel Modal \*/', "/* Add Channel Modal */`n$playerCss`n"
$youtubeHtml = $youtubeHtml -replace '(?s)<!-- Video Player Overlay -->.*?<!-- Add Channel Modal -->', "$playerHtml`n`n  <!-- Add Channel Modal -->"

Set-Content 'livetv-app/youtube.html' $youtubeHtml
Write-Host 'youtube.html updated successfully'
