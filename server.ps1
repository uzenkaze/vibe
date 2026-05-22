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

        # Parse request URI safely
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
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
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
