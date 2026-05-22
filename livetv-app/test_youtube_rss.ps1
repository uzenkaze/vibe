$channels = @(
    [PSCustomObject]@{ id = 'UCsJ6RuBi65JHJkZYO1MECIA'; name = '슈카월드' },
    [PSCustomObject]@{ id = 'UCO850F-GqB3hSpR3M7z182A'; name = '삼프로TV' },
    [PSCustomObject]@{ id = 'UC3K0_A1vpyN8SLeJ_0S5yfg'; name = '지무비' },
    [PSCustomObject]@{ id = 'UCaHGGHs_R54KGDpy7IdFmew'; name = '고몽' },
    [PSCustomObject]@{ id = 'UCQ27n_iHn0D2c5kH5vms_qA'; name = '삐맨' }
)

foreach ($ch in $channels) {
    Write-Host "=============================================="
    Write-Host "[TEST] Channel: $($ch.name) ($($ch.id))"
    $url = "https://www.youtube.com/feeds/videos.xml?channel_id=$($ch.id)"
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        Write-Host "Status Code: $($response.StatusCode)"
        $content = $response.Content
        Write-Host "Data Length: $($content.Length) bytes"
        
        # entry 개수 세어보기
        $entryCount = ([regex]::Matches($content, "<entry>")).Count
        Write-Host "Entry Count: $entryCount"
        
        if ($entryCount -gt 0) {
            $idx = $content.IndexOf("<entry>")
            $endIdx = $content.IndexOf("</entry>", $idx)
            $entryXml = $content.Substring($idx, ($endIdx - $idx + 8))
            Write-Host "First Entry Sample:"
            Write-Host $entryXml.Substring(0, [Math]::Min(500, $entryXml.Length))
        } else {
            Write-Host "No <entry> found! First 300 chars of data:"
            Write-Host $content.Substring(0, [Math]::Min(300, $content.Length))
        }
    } catch {
        Write-Error "Error fetching channel $($ch.name): $_"
    }
}
