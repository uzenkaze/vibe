# d:\VibeCoding\deploy.ps1
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$deployDir = "deploy_dist"

Write-Host ">>> 통합 배포 프로세스 시작" -ForegroundColor Cyan

# 1. 기존 배포 폴더 정리
if (Test-Path $deployDir) { 
    Write-Host "> 기존 $deployDir 폴더 삭제 중..."
    Remove-Item -Recurse -Force $deployDir 
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# 2. 'learn' 프로젝트 빌드
Write-Host "> 'learn' 프로젝트 빌드 중..." -ForegroundColor Yellow
Set-Location learn
npm.cmd run build
# 빌드 결과물에서 불필요한 .git 폴더 제거 (GitHub Pages 간섭 방지)
if (Test-Path "dist/.git") { Remove-Item -Recurse -Force "dist/.git" }
Set-Location ..

# 3. 'learn' 빌드 결과물 복사
Write-Host "> 'learn' 빌드 결과물 복사 중..."
if (Test-Path "$deployDir/learn") { Remove-Item -Recurse -Force "$deployDir/learn" }
New-Item -ItemType Directory -Path "$deployDir/learn" | Out-Null
Copy-Item -Path "learn/dist/*" -Destination "$deployDir/learn" -Recurse -Force

# 3-2. 'livetv-app' 프로젝트 빌드
Write-Host "> 'livetv-app' 프로젝트 빌드 중..." -ForegroundColor Yellow
Set-Location livetv-app
npm.cmd run build
Set-Location ..


# 4. 기타 정적 폴더 복사 (Asset, task, hobby 등)
$staticFolders = @("Asset", "task", "hobby", "livetv-app", "vibe-hybrid-app")
foreach ($folder in $staticFolders) {
    if (Test-Path $folder) {
        # livetv-app 폴더는 배포 시 간단한 'livetv' 경로로 매핑
        $targetFolder = $folder
        if ($folder -eq "livetv-app") { $targetFolder = "livetv" }

        Write-Host "> $folder 폴더 복사 중 (node_modules 제외)... ($targetFolder 경로로 복사)"
        if ($folder -eq "vibe-hybrid-app" -or $folder -eq "livetv-app") {
            # 용량이 큰 프로젝트는 필요한 파일만 선별 복사하거나 dist가 있다면 dist만 복사
            if (Test-Path "$folder/dist") {
                New-Item -ItemType Directory -Path "$deployDir/$targetFolder" -Force | Out-Null
                Copy-Item -Path "$folder/dist/*" -Destination "$deployDir/$targetFolder" -Recurse
            } else {
                # dist가 없으면 node_modules를 제외하고 복사
                New-Item -ItemType Directory -Path "$deployDir/$targetFolder" -Force | Out-Null
                Get-ChildItem -Path $folder -Exclude "node_modules", ".git", ".expo", ".vscode" | Copy-Item -Destination "$deployDir/$targetFolder" -Recurse
            }
        } else {
            Copy-Item -Path $folder -Destination $deployDir -Recurse
        }
    }
}

# 5. 루트 파일 복사
if (Test-Path "README.md") { Copy-Item "README.md" $deployDir }
if (Test-Path "index.html") { 
    Write-Host "> index.html 복사 중..."
    Copy-Item "index.html" $deployDir 
}
if (Test-Path "home.html") { 
    Write-Host "> home.html 복사 중..."
    Copy-Item "home.html" $deployDir 
}
if (Test-Path "livetv-favicon.png") { Copy-Item "livetv-favicon.png" $deployDir }
# 포털 메인 카드 이미지 파일(vibe_*.png) 복사
Write-Host "> vibe_*.png 이미지 파일 복사 중..."
Get-ChildItem -Path . -Filter vibe_*.png | Copy-Item -Destination $deployDir

# 6. GitHub Pages 배포
Write-Host "> GitHub Pages 업로드 중 (gh-pages 브랜치)..." -ForegroundColor Green
Set-Location $deployDir
git init
git config user.name "uzenkaze"
git config user.email "uzenkaze@users.noreply.github.com"
git add .
git commit -m "Integrated deploy: learn, Asset, task, and others"
git push -f https://github.com/uzenkaze/vibe.git master:gh-pages
Set-Location ..

Write-Host ">>> 모든 사이트 배포 완료!" -ForegroundColor Green
Write-Host "접속 주소:"
Write-Host "- Learn: https://uzenkaze.github.io/vibe/learn/"
Write-Host "- Task: https://uzenkaze.github.io/vibe/task/task-manager.html"
Write-Host "- Asset: https://uzenkaze.github.io/vibe/Asset/asset.html"
