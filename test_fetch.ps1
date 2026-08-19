$r = Get-Random
$u = "https://uzenkaze.github.io/vibe/learn/index.html?t=$r"
$res = Invoke-WebRequest -Uri $u -UseBasicParsing
Write-Host "=== HTML ==="
Write-Host $res.Content

# 스크립트 태그 추출
if ($res.Content -match '<script type="module" crossorigin src="([^"]+)">') {
  $jsPath = $matches[1]
  Write-Host "Extracted JS Path: $jsPath"
  $fullJsUrl = "https://uzenkaze.github.io$jsPath"
  Write-Host "Full JS URL: $fullJsUrl"
  try {
    $jsRes = Invoke-WebRequest -Uri "$fullJsUrl?t=$r" -UseBasicParsing -ErrorAction Stop
    Write-Host "JS Status: $($jsRes.StatusCode)"
  } catch {
    Write-Host "JS Fetch Failed: $_"
  }
}
