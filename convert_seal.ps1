Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\pc\.gemini\antigravity-ide\brain\4440ef2a-f0fb-42f5-b02a-eedc1e2ae2b6\wax_seal_s_and_i_1790866525460.jpg"
$destPng = "c:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images\envelope-seal.png"
$backupPng = "c:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images\envelope-seal-is-backup.png"

# Backup original if not already backed up
if (!(Test-Path $backupPng)) {
    Copy-Item $destPng $backupPng
}

# Check if original was transparent
$origBmp = [System.Drawing.Bitmap]::FromFile($backupPng)
Write-Output "Original Size: $($origBmp.Width)x$($origBmp.Height)"
$origCorner = $origBmp.GetPixel(5, 5)
Write-Output "Original corner: Alpha=$($origCorner.A), R=$($origCorner.R), G=$($origCorner.G), B=$($origCorner.B)"
$origBmp.Dispose()

# Process new JPG to PNG with transparent background
$img = [System.Drawing.Bitmap]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$g.Dispose()
$img.Dispose()

# Flood-fill or convert outer white/near-white pixels to transparent
for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check distance from center to only make outside of circular wax seal transparent
        $cx = $bmp.Width / 2.0
        $cy = $bmp.Height / 2.0
        $dx = $x - $cx
        $dy = $y - $cy
        $dist = [Math]::Sqrt($dx*$dx + $dy*$dy)
        $maxRadius = ($bmp.Width / 2.0) * 0.98

        # If near-white outside or corner
        if ($pixel.R -gt 240 -and $pixel.G -gt 240 -and $pixel.B -gt 240) {
            # Check edge antialiasing
            $brightness = ($pixel.R + $pixel.G + $pixel.B) / 3.0
            if ($brightness -gt 250) {
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
            } else {
                $alpha = [int]([Math]::Max(0, [Math]::Min(255, (255 - $brightness) * 25.5)))
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))
            }
        }
    }
}

$bmp.Save($destPng, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "Saved S&I seal to $destPng successfully!"
