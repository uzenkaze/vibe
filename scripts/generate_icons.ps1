Add-Type -AssemblyName System.Drawing

function Create-Logo-Png {
    param (
        [string]$outputPath,
        [int]$size
    )
    
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # 안티앨리어싱 설정 (고화질 렌더링)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # 배경 투명 클리어
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # 둥근 사각형 크기 및 좌표 계산 (약간의 여백을 주어 잘리지 않게)
    $padding = $size * 0.04
    $cardSize = $size - ($padding * 2)
    $rect = New-Object System.Drawing.RectangleF($padding, $padding, $cardSize, $cardSize)
    
    # 둥근 사각형 경로 생성 (rx = size * 0.25)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $r = $size * 0.22 # 모서리 반경
    $path.AddArc($rect.X, $rect.Y, $r*2, $r*2, 180, 90)
    $path.AddArc(($rect.X + $rect.Width - $r*2), $rect.Y, $r*2, $r*2, 270, 90)
    $path.AddArc(($rect.X + $rect.Width - $r*2), ($rect.Y + $rect.Height - $r*2), $r*2, $r*2, 0, 90)
    $path.AddArc($rect.X, ($rect.Y + $rect.Height - $r*2), $r*2, $r*2, 90, 90)
    $path.CloseAllFigures()
    
    # 오렌지 그라데이션 브러쉬 생성 (135도)
    $colorStart = [System.Drawing.ColorTranslator]::FromHtml("#f97316")
    $colorEnd = [System.Drawing.ColorTranslator]::FromHtml("#ea580c")
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect, $colorStart, $colorEnd, 135.0
    )
    
    # 카드 배경 채우기
    $g.FillPath($brush, $path)
    
    # 다이아몬드 그리기 (외곽선 흰색)
    $strokeWidth = $size * 0.035
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, $strokeWidth)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    
    # 다이아몬드 점 정의
    $topX = $size / 2
    $topY = $size * 0.28
    $rightX = $size * 0.72
    $rightY = $size / 2
    $bottomX = $size / 2
    $bottomY = $size * 0.72
    $leftX = $size * 0.28
    $leftY = $size / 2
    
    $p1 = New-Object System.Drawing.PointF($topX, $topY)
    $p2 = New-Object System.Drawing.PointF($rightX, $rightY)
    $p3 = New-Object System.Drawing.PointF($bottomX, $bottomY)
    $p4 = New-Object System.Drawing.PointF($leftX, $leftY)
    
    $diamondPoints = @($p1, $p2, $p3, $p4)
    $g.DrawPolygon($pen, $diamondPoints)
    
    # 다이아몬드 중앙 수직 점선 그리기
    $dashPenWidth = $size * 0.015
    $dashPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(166, 255, 255, 255), $dashPenWidth)
    $dashPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    $dashPen.DashPattern = @(2.0, 2.0)
    
    $g.DrawLine($dashPen, $topX, $topY, $bottomX, $bottomY)
    
    # 파일 저장
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # 리소스 해제
    $pen.Dispose()
    $dashPen.Dispose()
    $brush.Dispose()
    $path.Dispose()
    $g.Dispose()
    $bmp.Dispose()
}

# 디렉토리 생성
New-Item -ItemType Directory -Path "d:\VibeCoding\asset\asset-react\public" -Force | Out-Null
New-Item -ItemType Directory -Path "d:\VibeCoding\vibe-hybrid-app\assets" -Force | Out-Null

# 아이콘 파일들 일괄 생성
Write-Host "Generating favicons..."
Create-Logo-Png "d:\VibeCoding\asset\asset-react\public\favicon.png" 512

Write-Host "Generating mobile app icons..."
Create-Logo-Png "d:\VibeCoding\vibe-hybrid-app\assets\icon.png" 1024
Create-Logo-Png "d:\VibeCoding\vibe-hybrid-app\assets\adaptive-icon.png" 1024
Create-Logo-Png "d:\VibeCoding\vibe-hybrid-app\assets\favicon.png" 512
Create-Logo-Png "d:\VibeCoding\vibe-hybrid-app\assets\splash-icon.png" 1024

Write-Host "Icon generation completed successfully!" -ForegroundColor Green
