Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images"

function Get-ImageBounds($fileName) {
    $filePath = Join-Path $dir $fileName
    $bmp = New-Object System.Drawing.Bitmap($filePath)
    $minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0
    for ($y = 0; $y -lt $bmp.Height; $y += 3) {
        for ($x = 0; $x -lt $bmp.Width; $x += 3) {
            $pixel = $bmp.GetPixel($x, $y)
            if ($pixel.A -gt 15) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    $w = $maxX - $minX
    $h = $maxY - $minY
    $totalW = $bmp.Width
    $totalH = $bmp.Height
    $bmp.Dispose()
    
    [PSCustomObject]@{
        Name = $fileName
        CanvasWidth = $totalW
        CanvasHeight = $totalH
        MinX = $minX
        MaxX = $maxX
        ContentWidth = $w
        MinY = $minY
        MaxY = $maxY
        ContentHeight = $h
        RelLeftPct = [math]::Round(($minX / $totalW) * 100, 2)
        RelTopPct = [math]::Round(($minY / $totalH) * 100, 2)
        RelWidthPct = [math]::Round(($w / $totalW) * 100, 2)
        RelHeightPct = [math]::Round(($h / $totalH) * 100, 2)
    }
}

Get-ImageBounds "envelope-closed.png"
Get-ImageBounds "envelope-pocket.png"
Get-ImageBounds "envelope-flap.png"
Get-ImageBounds "envelope-seal.png"
Get-ImageBounds "wedding-card.png"
Get-ImageBounds "envelope-open-reference.png"
