Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images"

$openRef = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-open-reference.png"))
$closed = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-closed.png"))
$pocket = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-pocket.png"))

# Measure open flap height in openRef
$openTopY = $openRef.Height; $openBottomY = 0
for ($y = 0; $y -lt 600; $y += 2) {
    for ($x = 100; $x -lt 1000; $x += 2) {
        $p = $openRef.GetPixel($x, $y)
        if ($p.A -gt 20) {
            if ($y -lt $openTopY) { $openTopY = $y }
            if ($y -gt $openBottomY) { $openBottomY = $y }
        }
    }
}

# Measure closed flap height in closed
$closedTopY = $closed.Height; $closedBottomY = 0
for ($y = 0; $y -lt 900; $y += 2) {
    for ($x = 200; $x -lt 900; $x += 2) {
        $p = $closed.GetPixel($x, $y)
        $pPocket = $pocket.GetPixel($x, $y)
        if ([math]::Abs($p.A - $pPocket.A) -gt 30 -or [math]::Abs($p.R - $pPocket.R) -gt 30) {
            if ($y -lt $closedTopY) { $closedTopY = $y }
            if ($y -gt $closedBottomY) { $closedBottomY = $y }
        }
    }
}

Write-Host "Open Flap Top Y: $openTopY, Bottom Y: $openBottomY (Height: $($openBottomY - $openTopY))"
Write-Host "Closed Flap Top Y: $closedTopY, Bottom Y: $closedBottomY (Height: $($closedBottomY - $closedTopY))"

$openRef.Dispose(); $closed.Dispose(); $pocket.Dispose()
