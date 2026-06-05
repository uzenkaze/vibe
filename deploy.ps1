# d:\VibeCoding\deploy.ps1
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$Utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Read-TextUtf8([string]$Path) {
    return [System.IO.File]::ReadAllText($Path, $Utf8NoBom)
}

function Write-TextUtf8([string]$Path, [string]$Content) {
    [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

function Copy-HtmlWithCacheBust([string]$Source, [string]$Dest, [string]$Timestamp) {
    $text = Read-TextUtf8 $Source
    $text = $text -replace 'CACHE_BUST', $Timestamp
    Write-TextUtf8 $Dest $text
}

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
try {
    Set-Location learn
    npm.cmd run build
    # 빌드 결과물에서 불필요한 .git 폴더 제거 (GitHub Pages 간섭 방지)
    if (Test-Path "dist/.git") { Remove-Item -Recurse -Force "dist/.git" }
    Set-Location ..
} catch {
    Write-Host "> 'learn' 프로젝트 빌드 실패 (기존 dist 복사 시도)" -ForegroundColor Red
    Set-Location ..
}

# 2-2. 'Asset/asset-react' 프로젝트 빌드
Write-Host "> 'Asset/asset-react' 프로젝트 빌드 중..." -ForegroundColor Yellow
try {
    Set-Location Asset/asset-react
    npm.cmd run build
    Set-Location ../..
} catch {
    Write-Host "> 'Asset/asset-react' 프로젝트 빌드 실패" -ForegroundColor Red
    Set-Location ../..
}

# 3. 'learn' 빌드 결과물 복사
Write-Host "> 'learn' 빌드 결과물 복사 중..."
if (Test-Path "$deployDir/learn") { Remove-Item -Recurse -Force "$deployDir/learn" }
New-Item -ItemType Directory -Path "$deployDir/learn" | Out-Null
Copy-Item -Path "learn/dist/*" -Destination "$deployDir/learn" -Recurse -Force

# 3-2. 'livetv-app' 프로젝트 빌드 (건너뛰고 정적 직접 복사 방식 사용)
Write-Host "> 'livetv-app' 프로젝트 빌드는 건너뜁니다 (정적 소스 직접 복사)" -ForegroundColor Yellow


# 4. 기타 정적 폴더 복사 (Asset, task, hobby 등)
$staticFolders = @("Asset", "task", "hobby-app", "livetv-app", "vibe-hybrid-app")
foreach ($folder in $staticFolders) {
    if (Test-Path $folder) {
        # livetv-app 폴더는 배포 시 간단한 'livetv' 경로로 매핑, hobby-app은 'mPlay'로 매핑
        $targetFolder = $folder
        if ($folder -eq "livetv-app") { $targetFolder = "livetv" }
        if ($folder -eq "hobby-app") { $targetFolder = "mPlay" }

        Write-Host "> $folder 폴더 복사 중 (node_modules 제외)... ($targetFolder 및 hobby 경로로 복사)"
        if ($folder -eq "hobby-app") {
            New-Item -ItemType Directory -Path "$deployDir/$targetFolder" -Force | Out-Null
            Copy-Item -Path "$folder/www/*" -Destination "$deployDir/$targetFolder" -Recurse -Force
            # 레거시 하이브리드 앱과의 완벽한 주소 호환을 위해 hobby 폴더에도 동시에 물리 복사하여 배포
            New-Item -ItemType Directory -Path "$deployDir/hobby" -Force | Out-Null
            Copy-Item -Path "$folder/www/*" -Destination "$deployDir/hobby" -Recurse -Force
        } elseif ($folder -eq "livetv-app") {
            # livetv-app은 빌드(dist)를 타지 않고 원본 정적 파일을 직접 복사하여 배포
            Write-Host "> livetv-app 원본 정적 소스 직접 복사 중..." -ForegroundColor Cyan
            New-Item -ItemType Directory -Path "$deployDir/$targetFolder" -Force | Out-Null
            
            # youtube.html 및 ytmusic.html, index.html 복사 후 캐시 버스터 실시간 주입 (모바일 웹뷰 캐싱 철저 방어)
            $timestamp = Get-Date -Format "yyyyMMddHHmmss"

            Write-Host "> livetv UTF-8 copy (Node)..." -ForegroundColor Cyan
            $env:CACHE_BUST = $timestamp
            node "$PSScriptRoot/scripts/deploy-livetv-utf8.js"
            if ($LASTEXITCODE -ne 0) { throw "livetv UTF-8 copy failed" }
            Write-Host "> livetv 복사 및 캐시 버스터 주입 완료 (v=$timestamp)" -ForegroundColor Green
        } elseif ($folder -eq "vibe-hybrid-app") {
            # 용량이 큰 프로젝트는 필요한 파일만 선별 복사하거나 dist가 있다면 dist만 복사
            if (Test-Path "$folder/dist") {
                New-Item -ItemType Directory -Path "$deployDir/$targetFolder" -Force | Out-Null
                Copy-Item -Path "$folder/dist/*" -Destination "$deployDir/$targetFolder" -Recurse
            } else {
                # dist가 없으면 node_modules를 제외하고 복사
                New-Item -ItemType Directory -Path "$deployDir/$targetFolder" -Force | Out-Null
                Get-ChildItem -Path $folder -Exclude "node_modules", ".git", ".expo", ".vscode" | Copy-Item -Destination "$deployDir/$targetFolder" -Recurse
            }
        } elseif ($folder -eq "Asset") {
            # 자산관리 폴더는 소스코드(node_modules, src 등)를 제외하고 빌드 산출물(dist)과 데이터 파일만 선별 복사
            Write-Host "> Asset 빌드 결과물 및 데이터만 복사 중..." -ForegroundColor Cyan
            New-Item -ItemType Directory -Path "$deployDir/Asset" -Force | Out-Null
            if (Test-Path "Asset/favicon.png") { Copy-Item -Path "Asset/favicon.png" -Destination "$deployDir/Asset/" -Force }
            if (Test-Path "Asset/data") { Copy-Item -Path "Asset/data" -Destination "$deployDir/Asset/" -Recurse -Force }
            if (Test-Path "Asset/asset-react/dist") {
                New-Item -ItemType Directory -Path "$deployDir/Asset/asset-react" -Force | Out-Null
                Copy-Item -Path "Asset/asset-react/dist" -Destination "$deployDir/Asset/asset-react/" -Recurse -Force
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
if (Test-Path "404.html") { 
    Write-Host "> 404.html 복사 중..."
    Copy-Item "404.html" $deployDir 
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
Write-Host "- Asset: https://uzenkaze.github.io/vibe/Asset/asset-react/dist/index.html"
