# d:\VibeCoding\build_apk.ps1
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ">>> 통합 APK 빌드 프로세스 시작 (Vercel URL 연동)" -ForegroundColor Cyan

# 1. LiveTV APK 빌드
Write-Host "> 1/2 LiveTV APK 빌드 진행 중..." -ForegroundColor Yellow
Set-Location livetv-app\android
cmd.exe /c "gradlew.bat assembleDebug"
Set-Location ..\..

$liveTvApkSource = "livetv-app\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $liveTvApkSource) {
    Write-Host ">>> LiveTV APK 빌드 완료!" -ForegroundColor Green
    Copy-Item $liveTvApkSource "livetv-app.apk" -Force
    Copy-Item $liveTvApkSource "livetv\livetv-app.apk" -Force
    Write-Host "복사 완료: livetv-app.apk, livetv\livetv-app.apk" -ForegroundColor Green
} else {
    Write-Host "!!! LiveTV APK 빌드 실패!" -ForegroundColor Red
}

# 2. Asset App APK 빌드
Write-Host "> 2/2 Asset Management APK 빌드 진행 중..." -ForegroundColor Yellow
if (Test-Path "asset\asset-react\android") {
    Set-Location asset\asset-react\android
    cmd.exe /c "gradlew.bat assembleDebug"
    Set-Location ..\..\..

    $assetApkSource = "asset\asset-react\android\app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $assetApkSource) {
        Write-Host ">>> Asset App APK 빌드 완료!" -ForegroundColor Green
        Copy-Item $assetApkSource "asset-app.apk" -Force
        if (-not (Test-Path "asset")) { New-Item -ItemType Directory -Path "asset" -Force | Out-Null }
        Copy-Item $assetApkSource "asset\asset-app.apk" -Force
        Write-Host "복사 완료: asset-app.apk, asset\asset-app.apk" -ForegroundColor Green
    } else {
        Write-Host "!!! Asset App APK 빌드 실패!" -ForegroundColor Red
    }
} else {
    Write-Host "Asset android 경로가 존재하지 않습니다." -ForegroundColor Yellow
}

Write-Host ">>> 모든 APK 빌드 완료!" -ForegroundColor Green
