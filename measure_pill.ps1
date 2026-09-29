Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images"
$closed = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-closed.png"))

# Look for the red/burgundy text "UNSEAL THE INVITATION" and gold pill border in closed
$pillMinX = 1122; $pillMaxX = 0; $pillMinY = 1402; $pillMaxY = 0
for ($y = 550; $y -lt 850; $y++) {
    for ($x = 250; $x -lt 872; $x++) {
        $p = $closed.GetPixel($x, $y)
        # Burgundy text or gold border
        if (($p.R -gt 100 -and $p.G -lt 40 -and $p.B -lt 50) -or ($p.R -gt 180 -and $p.G -gt 140 -and $p.B -lt 100)) {
            if ($x -lt $pillMinX) { $pillMinX = $x }
            if ($x -gt $pillMaxX) { $pillMaxX = $x }
            if ($y -lt $pillMinY) { $pillMinY = $y }
            if ($y -gt $pillMaxY) { $pillMaxY = $y }
        }
    }
}

Write-Host "Pill MinX: $pillMinX, MaxX: $pillMaxX, MinY: $pillMinY, MaxY: $pillMaxY"
Write-Host "Top Pct: $([math]::Round(($pillMinY / 1402) * 100, 2))% to $([math]::Round(($pillMaxY / 1402) * 100, 2))%"

$closed.Dispose()
