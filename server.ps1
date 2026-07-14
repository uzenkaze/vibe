# D:\VibeCoding\server.ps1
$port = 5500
$rootDir = "D:\VibeCoding"

# Ensure HTTP Listener class is available
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".mp3"  = "audio/mpeg"
    ".mp4"  = "video/mp4"
    ".m3u"  = "text/plain; charset=utf-8"
    ".m3u8" = "application/vnd.apple.mpegurl"
    ".wav"  = "audio/wav"
}

try {
    $listener.Start()
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  PowerShell Native Web Server running at:" -ForegroundColor Green
    Write-Host "  👉 http://localhost:$port/" -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Cyan
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    exit
}

# Keep listening loop
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        # --- API Route Handlers ---

        # 1. API: Save Asset data
        if ($request.HttpMethod -eq "POST" -and $request.Url.AbsolutePath -eq "/api/save-asset") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd()
            $reader.Close()

            try {
                $payload = ConvertFrom-Json $body
                $year = $payload.year
                $dataDir = Join-Path $rootDir "asset\data"
                if (-not (Test-Path $dataDir)) {
                    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
                }
                $filePath = Join-Path $dataDir "assetData_$year.json"
                $jsonData = ConvertTo-Json $payload.data -Depth 100
                [System.IO.File]::WriteAllText($filePath, $jsonData, [System.Text.Encoding]::UTF8)
                Write-Host "[Server] Saved asset data for $year to $filePath" -ForegroundColor Green

                # Commit & Deploy in background
                $scriptBlock = {
                    param($yr)
                    Set-Location "D:\VibeCoding"
                    git add "asset/data/assetData_$yr.json"
                    git commit -m "chore(data): auto-update asset data for year $yr"
                    git push origin main
                    powershell -ExecutionPolicy Bypass -File ./deploy.ps1
                }
                Start-Job -ScriptBlock $scriptBlock -ArgumentList $year | Out-Null

                $response.StatusCode = 200
                $response.ContentType = "application/json; charset=utf-8"
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true,"message":"Saved and syncing with git"}')
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
            } catch {
                Write-Host "Error saving asset: $_" -ForegroundColor Red
                $response.StatusCode = 500
                $response.ContentType = "application/json; charset=utf-8"
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"error":"' + $_.Exception.Message + '"}')
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
            continue
        }

        # 2. API: CarRep - Get reports list
        if ($request.HttpMethod -eq "GET" -and $request.Url.AbsolutePath -eq "/api/carrep/reports") {
            $reportsFile = Join-Path $rootDir "carrep\public\data\reports.json"
            if (-not (Test-Path $reportsFile)) {
                New-Item -ItemType Directory -Path (Split-Path $reportsFile) -Force | Out-Null
                [System.IO.File]::WriteAllText($reportsFile, "[]", [System.Text.Encoding]::UTF8)
            }
            $bytes = [System.IO.File]::ReadAllBytes($reportsFile)
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }

        # 3. API: CarRep - Save / Update report
        if ($request.HttpMethod -eq "POST" -and $request.Url.AbsolutePath -eq "/api/carrep/reports") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd()
            $reader.Close()
            
            try {
                $newReport = ConvertFrom-Json $body
                $reportsFile = Join-Path $rootDir "carrep\public\data\reports.json"
                if (-not (Test-Path $reportsFile)) {
                    [System.IO.File]::WriteAllText($reportsFile, "[]", [System.Text.Encoding]::UTF8)
                }
                $reportsText = [System.IO.File]::ReadAllText($reportsFile, [System.Text.Encoding]::UTF8)
                $reports = ConvertFrom-Json $reportsText
                
                $idx = -1
                for ($i = 0; $i -lt $reports.Length; $i++) {
                    if ($reports[$i].id -eq $newReport.id) {
                        $idx = $i
                        break
                    }
                }
                
                if ($idx -ne -1) {
                    $reports[$idx] = $newReport
                } else {
                    $reports = @($newReport) + $reports
                }
                
                $reportsJson = ConvertTo-Json $reports -Depth 100
                [System.IO.File]::WriteAllText($reportsFile, $reportsJson, [System.Text.Encoding]::UTF8)
                
                # Commit & Deploy in background
                $scriptBlock = {
                    param($rid)
                    Set-Location "D:\VibeCoding"
                    git add carrep/public/data/reports.json carrep/public/data/mycar.json
                    git commit -m "chore(data): save repair report $rid"
                    git push origin main
                    powershell -ExecutionPolicy Bypass -File ./deploy.ps1
                }
                Start-Job -ScriptBlock $scriptBlock -ArgumentList $newReport.id | Out-Null
                
                $response.StatusCode = 200
                $response.ContentType = "application/json; charset=utf-8"
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true,"message":"Report saved inside JSON database"}')
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
            } catch {
                $response.StatusCode = 500
                $response.ContentType = "application/json; charset=utf-8"
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"error":"' + $_.Exception.Message + '"}')
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
            continue
        }

        # 4. API: CarRep - Delete report
        if ($request.HttpMethod -eq "DELETE" -and $request.Url.AbsolutePath.StartsWith("/api/carrep/reports/")) {
            $reportIdStr = $request.Url.AbsolutePath.Substring("/api/carrep/reports/".Length)
            try {
                $reportsFile = Join-Path $rootDir "carrep\public\data\reports.json"
                $reportsText = [System.IO.File]::ReadAllText($reportsFile, [System.Text.Encoding]::UTF8)
                $reports = ConvertFrom-Json $reportsText
                
                $filtered = @()
                foreach ($r in $reports) {
                    if ($r.id.ToString() -ne $reportIdStr) {
                        $filtered += $r
                    }
                }
                
                $reportsJson = ConvertTo-Json $filtered -Depth 100
                [System.IO.File]::WriteAllText($reportsFile, $reportsJson, [System.Text.Encoding]::UTF8)
                
                # Commit & Deploy in background
                $scriptBlock = {
                    param($rid)
                    Set-Location "D:\VibeCoding"
                    git add carrep/public/data/reports.json carrep/public/data/mycar.json
                    git commit -m "chore(data): delete repair report $rid"
                    git push origin main
                    powershell -ExecutionPolicy Bypass -File ./deploy.ps1
                }
                Start-Job -ScriptBlock $scriptBlock -ArgumentList $reportIdStr | Out-Null
                
                $response.StatusCode = 200
                $response.ContentType = "application/json; charset=utf-8"
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true,"message":"Report deleted from JSON database"}')
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
            } catch {
                $response.StatusCode = 500
                $response.ContentType = "application/json; charset=utf-8"
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"error":"' + $_.Exception.Message + '"}')
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
            continue
        }

        # 5. API: CarRep - Get my car profile
        if ($request.HttpMethod -eq "GET" -and $request.Url.AbsolutePath -eq "/api/carrep/mycar") {
            $myCarFile = Join-Path $rootDir "carrep\public\data\mycar.json"
            if (-not (Test-Path $myCarFile)) {
                New-Item -ItemType Directory -Path (Split-Path $myCarFile) -Force | Out-Null
                [System.IO.File]::WriteAllText($myCarFile, "null", [System.Text.Encoding]::UTF8)
            }
            $bytes = [System.IO.File]::ReadAllBytes($myCarFile)
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }

        # 6. API: CarRep - Save my car profile
        if ($request.HttpMethod -eq "POST" -and $request.Url.AbsolutePath -eq "/api/carrep/mycar") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd()
            $reader.Close()
            
            try {
                $myCarFile = Join-Path $rootDir "carrep\public\data\mycar.json"
                [System.IO.File]::WriteAllText($myCarFile, $body, [System.Text.Encoding]::UTF8)
                
                # Commit & Deploy in background
                $scriptBlock = {
                    Set-Location "D:\VibeCoding"
                    git add carrep/public/data/reports.json carrep/public/data/mycar.json
                    git commit -m "chore(data): update MyCar profile"
                    git push origin main
                    powershell -ExecutionPolicy Bypass -File ./deploy.ps1
                }
                Start-Job -ScriptBlock $scriptBlock | Out-Null
                
                $response.StatusCode = 200
                $response.ContentType = "application/json; charset=utf-8"
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
            } catch {
                $response.StatusCode = 500
                $response.ContentType = "application/json; charset=utf-8"
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"error":"' + $_.Exception.Message + '"}')
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
            continue
        }

        # --- Static File Serving ---
        $urlPath = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
        $cleanPath = $urlPath.Replace("/", "\").TrimStart("\")
        $filePath = Join-Path $rootDir $cleanPath

        if (Test-Path $filePath -PathType Container) {
            $filePath = Join-Path $filePath "index.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = $MimeTypes[$ext]
            if ($null -eq $contentType) { $contentType = "application/octet-stream" }

            $response.ContentType = $contentType
            if ($ext -eq ".html") {
                $htmlText = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
                $timestamp = Get-Date -Format "yyyyMMddHHmmss"
                $htmlText = $htmlText -replace "CACHE_BUST", $timestamp
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($htmlText)
            } else {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
            }
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $response.ContentType = "text/plain; charset=utf-8"
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
    } catch {
        # Fail-silent for transient connection drops
    } finally {
        if ($null -ne $response) {
            try { $response.Close() } catch {}
        }
    }
}
