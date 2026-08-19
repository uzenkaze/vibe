$runs = (Invoke-RestMethod -Uri 'https://api.github.com/repos/uzenkaze/vibe/actions/runs' -Headers @{ 'User-Agent' = 'Mozilla/5.0' }).workflow_runs
$latestRun = $runs[0]
$jobs = (Invoke-RestMethod -Uri $latestRun.jobs_url -Headers @{ 'User-Agent' = 'Mozilla/5.0' }).jobs
$steps = $jobs[0].steps

foreach ($s in $steps) {
  Write-Host "$($s.name) -> $($s.conclusion)"
}
