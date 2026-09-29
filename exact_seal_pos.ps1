Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images"

$closed = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-closed.png"))
$seal = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-seal.png"))

# Let's inspect the exact pixel bounds of the wax seal in envelope-closed.png
# The canvas is 1122 x 1402.
# Let's find the center of the circular gold wax seal in closed:
$minX = 1122; $maxX = 0; $minY = 1402; $maxY = 0

for ($y = 400; $y -lt 900; $y++) {
    for ($x = 350; $x -lt 772; $x++) {
        $p = $closed.GetPixel($x, $y)
        # Gold wax seal color check
        if ($p.R -gt 150 -and $p.G -gt 110 -and $p.B -lt 110 -and ($p.R - $p.B) -gt 60) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$sealW = $maxX - $minX
$sealH = $maxY - $minY
$centerX = ($minX + $maxX) / 2
$centerY = ($minY + $maxY) / 2

[PSCustomObject]@{
    MinX = $minX
    MaxX = $maxX
    SealWidthPx = $sealW
    MinY = $minY
    MaxY = $maxY
    SealHeightPx = $sealH
    CenterX = $centerX
    CenterY = $centerY
    LeftPct = [math]::Round(($centerX / 1122) * 100, 2)
    TopPct = [math]::Round(($centerY / 1402) * 100, 2)
    WidthPct = [math]::Round(($sealW / 1122) * 100, 2)
}
