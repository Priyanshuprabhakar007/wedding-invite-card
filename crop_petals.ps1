Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images\Petal Shower"
$files = Get-ChildItem -Path $dir -Filter "ChatGPT*.png" | Sort-Object Name
$i = 1
foreach ($f in $files) {
    $bmp = New-Object System.Drawing.Bitmap($f.FullName)
    $minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0
    for ($y = 0; $y -lt $bmp.Height; $y += 2) {
        for ($x = 0; $x -lt $bmp.Width; $x += 2) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.A -gt 15) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    $pad = 10
    $minX = [math]::Max(0, $minX - $pad)
    $minY = [math]::Max(0, $minY - $pad)
    $maxX = [math]::Min($bmp.Width - 1, $maxX + $pad)
    $maxY = [math]::Min($bmp.Height - 1, $maxY + $pad)
    $w = $maxX - $minX
    $h = $maxY - $minY
    $rect = New-Object System.Drawing.Rectangle($minX, $minY, $w, $h)
    $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
    $dstPath = Join-Path $dir ("petal-" + $i + ".png")
    $cropped.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose(); $cropped.Dispose()
    Write-Host ("Saved petal-" + $i + ".png (" + $w + "x" + $h + ")")
    $i++
}
