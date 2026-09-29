Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images"

$closed = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-closed.png"))
$pocket = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-pocket.png"))
$seal = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-seal.png"))
$ref = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-open-reference.png"))

# Find difference between closed and pocket -> this is the flap & seal area in closed state
$diffMinX = $closed.Width; $diffMaxX = 0; $diffMinY = $closed.Height; $diffMaxY = 0
for ($y = 0; $y -lt $closed.Height; $y += 2) {
    for ($x = 0; $x -lt $closed.Width; $x += 2) {
        $p1 = $closed.GetPixel($x, $y)
        $p2 = $pocket.GetPixel($x, $y)
        if ([math]::Abs($p1.R - $p2.R) -gt 25 -or [math]::Abs($p1.G - $p2.G) -gt 25 -or [math]::Abs($p1.B - $p2.B) -gt 25 -or [math]::Abs($p1.A - $p2.A) -gt 25) {
            if ($x -lt $diffMinX) { $diffMinX = $x }
            if ($x -gt $diffMaxX) { $diffMaxX = $x }
            if ($y -lt $diffMinY) { $diffMinY = $y }
            if ($y -gt $diffMaxY) { $diffMaxY = $y }
        }
    }
}

# Find open flap location in reference
$refDiffMinX = $ref.Width; $refDiffMaxX = 0; $refDiffMinY = $ref.Height; $refDiffMaxY = 0
for ($y = 0; $y -lt 400; $y += 2) {
    for ($x = 0; $x -lt $ref.Width; $x += 2) {
        $p = $ref.GetPixel($x, $y)
        if ($p.A -gt 20) {
            if ($x -lt $refDiffMinX) { $refDiffMinX = $x }
            if ($x -gt $refDiffMaxX) { $refDiffMaxX = $x }
            if ($y -lt $refDiffMinY) { $refDiffMinY = $y }
            if ($y -gt $refDiffMaxY) { $refDiffMaxY = $y }
        }
    }
}

$closed.Dispose(); $pocket.Dispose(); $seal.Dispose(); $ref.Dispose()

[PSCustomObject]@{
    ClosedFlapAreaMinX = $diffMinX
    ClosedFlapAreaMaxX = $diffMaxX
    ClosedFlapAreaMinY = $diffMinY
    ClosedFlapAreaMaxY = $diffMaxY
    ClosedFlapCenterX = ($diffMinX + $diffMaxX) / 2
    ClosedFlapCenterY = ($diffMinY + $diffMaxY) / 2
    OpenFlapTopY = $refDiffMinY
    OpenFlapBottomY = $refDiffMaxY
}
