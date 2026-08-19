$urls = @(
  'https://uzenkaze.github.io/vibe/learn/index.html',
  'https://uzenkaze.github.io/vibe/learn/data.json',
  'https://uzenkaze.github.io/vibe/learn/favicon.png',
  'https://uzenkaze.github.io/vibe/learn/assets/index-bxI46LxQ.css',
  'https://uzenkaze.github.io/vibe/learn/assets/index-BjZQ0KEC.js',
  'https://uzenkaze.github.io/vibe/asset/assets/index-Cl4zY__Y.js',
  'https://uzenkaze.github.io/vibe/carrep/index.html'
)

foreach ($u in $urls) {
  try {
    $res = Invoke-WebRequest -Uri $u -UseBasicParsing -ErrorAction Stop
    Write-Host "$u -> $($res.StatusCode)"
  } catch {
    Write-Host "$u -> 404 Not Found"
  }
}
