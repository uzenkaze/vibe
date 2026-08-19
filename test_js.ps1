$u = "https://uzenkaze.github.io/vibe/learn/assets/index-BjZQ0KEC.js"
try {
  $res = Invoke-WebRequest -Uri $u -UseBasicParsing -ErrorAction Stop
  Write-Host "Direct JS Fetch StatusCode: $($res.StatusCode), Length: $($res.Content.Length)"
} catch {
  Write-Host "Direct JS Fetch Failed: $($_.Exception.Message)"
}
