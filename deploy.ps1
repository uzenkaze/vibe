# d:\VibeCoding\deploy.ps1

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
npm run build
Set-Location ..

# 3. 'learn' 빌드 결과물 복사
Write-Host "> 'learn' 빌드 결과물 복사 중..."
New-Item -ItemType Directory -Path "$deployDir/learn" | Out-Null
Copy-Item -Path "learn/dist/*" -Destination "$deployDir/learn" -Recurse

# 4. 기타 정적 폴더 복사 (Asset, task, hobby 등)
$staticFolders = @("Asset", "task", "hobby", "livetv-app", "vibe-hybrid-app")
foreach ($folder in $staticFolders) {
    if (Test-Path $folder) {
        Write-Host "> $folder 폴더 복사 중 (node_modules 제외)..."
        if ($folder -eq "vibe-hybrid-app" -or $folder -eq "livetv-app") {
            # 용량이 큰 프로젝트는 필요한 파일만 선별 복사하거나 dist가 있다면 dist만 복사
            if (Test-Path "$folder/dist") {
                New-Item -ItemType Directory -Path "$deployDir/$folder" -Force | Out-Null
                Copy-Item -Path "$folder/dist/*" -Destination "$deployDir/$folder" -Recurse
            } else {
                # dist가 없으면 node_modules를 제외하고 복사
                New-Item -ItemType Directory -Path "$deployDir/$folder" -Force | Out-Null
                Get-ChildItem -Path $folder -Exclude "node_modules", ".git", ".expo", ".vscode" | Copy-Item -Destination "$deployDir/$folder" -Recurse
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

# 6. GitHub Pages 배포
Write-Host "> GitHub Pages 업로드 중 (gh-pages 브랜치)..." -ForegroundColor Green
Set-Location $deployDir
git init
git add .
git commit -m "Integrated deploy: learn, Asset, task, and others"
git push -f https://github.com/uzenkaze/vibe.git master:gh-pages
Set-Location ..

Write-Host ">>> 모든 사이트 배포 완료!" -ForegroundColor Green
Write-Host "접속 주소:"
Write-Host "- Learn: https://uzenkaze.github.io/vibe/learn/"
Write-Host "- Task: https://uzenkaze.github.io/vibe/task/task-manager.html"
Write-Host "- Asset: https://uzenkaze.github.io/vibe/Asset/asset.html"
