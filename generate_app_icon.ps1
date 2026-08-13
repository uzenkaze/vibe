# d:\VibeCoding\generate_app_icon.ps1
Add-Type -AssemblyName System.Drawing

function Create-MelonIcon($size, $outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $margin = $size * 0.02
    $w = $size - ($margin * 2)
    $r = $w * 0.23

    # Squircle path
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($margin, $margin, $r*2, $r*2, 180, 90)
    $path.AddArc($margin + $w - $r*2, $margin, $r*2, $r*2, 270, 90)
    $path.AddArc($margin + $w - $r*2, $margin + $w - $r*2, $r*2, $r*2, 0, 90)
    $path.AddArc($margin, $margin + $w - $r*2, $r*2, $r*2, 90, 90)
    $path.CloseFigure()

    # Gradient Background (Melon Green)
    $rect = New-Object System.Drawing.RectangleF($margin, $margin, $w, $w)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 0, 240, 75),
        [System.Drawing.Color]::FromArgb(255, 0, 150, 45),
        135.0
    )
    $g.FillPath($bgBrush, $path)

    # Translucent inner border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 255, 255, 255), ($size * 0.025))
    $g.DrawPath($borderPen, $path)

    # Thick White "m" character stroke
    $strokeWidth = $size * 0.12
    $mPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, $strokeWidth)
    $mPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $mPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $mPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $mPath = New-Object System.Drawing.Drawing2D.GraphicsPath

    # Left stem: (24%, 44%) to (24%, 73%)
    $x1 = $size * 0.25
    $x2 = $size * 0.50
    $x3 = $size * 0.75

    $yBottom = $size * 0.73
    $yArchTop = $size * 0.42
    $yArchStart = $size * 0.54

    # Left leg
    $mPath.AddLine($x1, $yBottom, $x1, $yArchStart)
    # First arch to middle leg
    $mPath.AddArc($x1, $yArchTop, ($x2 - $x1), ($yArchStart - $yArchTop) * 2, 180, 180)
    $mPath.AddLine($x2, $yArchStart, $x2, $yBottom)

    # Middle to Right arch
    $mPath.AddLine($x2, $yBottom, $x2, $yArchStart)
    $mPath.AddArc($x2, $yArchTop, ($x3 - $x2), ($yArchStart - $yArchTop) * 2, 180, 180)
    $mPath.AddLine($x3, $yArchStart, $x3, $yBottom)

    $g.DrawPath($mPen, $mPath)

    # Save
    $dir = Split-Path -Parent $outputPath
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $mPen.Dispose()
    $mPath.Dispose()
    $borderPen.Dispose()
    $bgBrush.Dispose()
    $path.Dispose()
    $g.Dispose()
    $bmp.Dispose()

    Write-Host "아이콘 생성 성공: $outputPath ($size x $size)" -ForegroundColor Green
}

$masterPath = "master_icon.png"
Create-MelonIcon 1024 $masterPath

# Android Mipmap 크기 배열
$mipmapSizes = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

$resBase = "livetv-app\android\app\src\main\res"

foreach ($folder in $mipmapSizes.Keys) {
    $sz = $mipmapSizes[$folder]
    Create-MelonIcon $sz "$resBase\$folder\ic_launcher.png"
    Create-MelonIcon $sz "$resBase\$folder\ic_launcher_round.png"
    Create-MelonIcon $sz "$resBase\$folder\ic_launcher_foreground.png"
}

# 웹 & 파비콘 파일 갱신
Create-MelonIcon 512 "livetv-app\favicon.png"
Create-MelonIcon 512 "livetv-app\livetv-favicon.png"
Create-MelonIcon 512 "livetv-app\assets\icon.png"
Create-MelonIcon 512 "livetv-app\assets\icon-only.png"
Create-MelonIcon 512 "livetv-app\assets\icon-foreground.png"

Create-MelonIcon 512 "livetv\favicon.png"
Create-MelonIcon 512 "livetv\livetv-favicon.png"

Write-Host "모든 앱 아이콘 갱신 완벽 완료!" -ForegroundColor Cyan
