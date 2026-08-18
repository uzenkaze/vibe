# d:\VibeCoding\deploy-vercel.ps1
# Vercel 수동 배포 스크립트
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ">>> Vercel Production 수동 배포 시작..." -ForegroundColor Cyan
git push origin master:main -f

if ($env:VERCEL_DEPLOY_HOOK_URL) {
    Write-Host "> Vercel Deploy Hook 호출 중..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri $env:VERCEL_DEPLOY_HOOK_URL -Method Post | Out-Null
        Write-Host "> Vercel Deploy Hook 호출 성공!" -ForegroundColor Green
    } catch {
        Write-Host "> Vercel Deploy Hook 호출 실패 (경고)" -ForegroundColor Yellow
    }
}

Write-Host ">>> Vercel 배포 트리거 완료! (https://vibe-kaze.vercel.app/)" -ForegroundColor Green
