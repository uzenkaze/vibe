$ErrorActionPreference = 'Stop'

$jsFile = 'livetv-app/src/ytmusic.js'
$jsContent = Get-Content $jsFile -Raw

# In ytmusic.js, playMusic function
$targetText = "document.getElementById('mini-player').classList.add('visible');"
$replacementText = "document.getElementById('mini-player').classList.add('visible');`n  openFullPlayer(); // User request: Open full player automatically when a song is clicked"

if ($jsContent -match [regex]::Escape($targetText)) {
    $jsContent = $jsContent -replace [regex]::Escape($targetText), $replacementText
    Set-Content $jsFile $jsContent
    Write-Host "ytmusic.js updated"
} else {
    Write-Host "Target text not found in ytmusic.js"
}

# In youtube.js, playVideo function
$ytJsFile = 'livetv-app/src/youtube.js'
$ytJsContent = Get-Content $ytJsFile -Raw
# youtube.js already has `player.classList.add('open');` in playVideo, but let's make sure it doesn't close it incorrectly when 'v' is clicked.
# In youtube.js, closePlayer function:
# function closeFullPlayer() {
#     closePlayer();
# }
# Change it to togglePIP or just minimize!
# Actually, the user just wanted it for ytmusic.html but it applies to both. Let's just fix ytmusic.js first.
