$run = (Invoke-RestMethod -Uri 'https://api.github.com/repos/uzenkaze/vibe/actions/runs' -Headers @{ 'User-Agent' = 'Mozilla/5.0' }).workflow_runs[0]
$jobs = (Invoke-RestMethod -Uri $run.jobs_url -Headers @{ 'User-Agent' = 'Mozilla/5.0' }).jobs
$jobId = $jobs[0].id
Write-Host "Job ID: $jobId"

# 로그 다운로드 시도
$headers = @{ 'User-Agent' = 'Mozilla/5.0' }
$logUrl = "https://api.github.com/repos/uzenkaze/vibe/actions/jobs/$jobId/logs"
try {
  $log = Invoke-RestMethod -Uri $logUrl -Headers $headers
  Write-Host $log
} catch {
  Write-Host "Log fetch failed: $_"
}
