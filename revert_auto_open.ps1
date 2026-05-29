$ErrorActionPreference = 'Stop'
$jsFile = 'livetv-app/src/ytmusic.js'
$jsContent = Get-Content $jsFile -Raw

$targetText = "document.getElementById('mini-player').classList.add('visible');`n  openFullPlayer(); // User request: Open full player automatically when a song is clicked"
$replacementText = "document.getElementById('mini-player').classList.add('visible');"

if ($jsContent -match [regex]::Escape($targetText)) {
    $jsContent = $jsContent -replace [regex]::Escape($targetText), $replacementText
    Set-Content $jsFile $jsContent
    Write-Host "Reverted auto-open in ytmusic.js"
} else {
    Write-Host "Target text not found"
}
