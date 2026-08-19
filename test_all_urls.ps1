$urls = @(
  'https://uzenkaze.github.io/vibe/learn/',
  'https://uzenkaze.github.io/vibe/learn/index.html',
  'https://uzenkaze.github.io/vibe/learn/assets/index.js',
  'https://uzenkaze.github.io/vibe/learn/assets/index.css',
  'https://uzenkaze.github.io/vibe/learn/assets/favicon.png',
  'https://uzenkaze.github.io/vibe/learn/data.json',
  'https://uzenkaze.github.io/vibe/carrep/',
  'https://uzenkaze.github.io/vibe/carrep/index.html',
  'https://uzenkaze.github.io/vibe/asset/assets/index-Cl4zY__Y.js'
)

foreach ($u in $urls) {
  try {
    $res = Invoke-WebRequest -Uri $u -UseBasicParsing -ErrorAction Stop
    Write-Host "$u -> $($res.StatusCode) OK"
  } catch {
    Write-Host "$u -> 404 Not Found"
  }
}
