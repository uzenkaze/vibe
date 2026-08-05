$ErrorActionPreference = 'Stop'
$file = 'livetv-app/src/ytmusic.css'
$content = Get-Content -Path $file -Raw -Encoding UTF8

$oldSearchContainer = @"
.search-container {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 0 12px;
  height: 36px;
  margin-right: 12px;
}
.search-container input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  flex: 1;
  outline: none;
  padding-left: 8px;
}
"@

$newSearchContainer = @"
.search-container {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 0 12px;
  height: 36px;
  margin-right: 12px;
  min-width: 0;
}
.search-container input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  flex: 1;
  outline: none;
  padding-left: 8px;
  min-width: 0;
  width: 100%;
}
"@

$content = $content.Replace($oldSearchContainer, $newSearchContainer)
Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Patched ytmusic.css successfully"
