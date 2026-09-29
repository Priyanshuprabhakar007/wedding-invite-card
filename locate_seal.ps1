Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images"
$closed = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-closed.png"))

# Look for gold seal color (Hue around gold/brown, sat > 0.2, brightness around center)
$sealMinX = $closed.Width; $sealMaxX = 0; $sealMinY = $closed.Height; $sealMaxY = 0
for ($y = 200; $y -lt 1000; $y += 2) {
    for ($x = 200; $x -lt 900; $x += 2) {
        $p = $closed.GetPixel($x, $y)
        # Gold seal has high Red, medium Green, lower Blue (e.g. R > 150, G > 100, B < 120, R - B > 40)
        if ($p.R -gt 130 -and $p.G -gt 90 -and $p.B -lt 100 -and ($p.R - $p.B) -gt 45) {
            if ($x -lt $sealMinX) { $sealMinX = $x }
            if ($x -gt $sealMaxX) { $sealMaxX = $x }
            if ($y -lt $sealMinY) { $sealMinY = $y }
            if ($y -gt $sealMaxY) { $sealMaxY = $y }
        }
    }
}
$closed.Dispose()

[PSCustomObject]@{
    SealMinX = $sealMinX
    SealMaxX = $sealMaxX
    SealWidth = $sealMaxX - $sealMinX
    SealMinY = $sealMinY
    SealMaxY = $sealMaxY
    SealHeight = $sealMaxY - $sealMinY
    SealCenterX = ($sealMinX + $sealMaxX) / 2
    SealCenterY = ($sealMinY + $sealMaxY) / 2
    SealCenterXPct = [math]::Round((($sealMinX + $sealMaxX) / 2 / 1122) * 100, 2)
    SealCenterYPct = [math]::Round((($sealMinY + $sealMaxY) / 2 / 1402) * 100, 2)
    SealWidthPct = [math]::Round((($sealMaxX - $sealMinX) / 1122) * 100, 2)
}
