Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images"

$openRef = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-open-reference.png"))
$pocket = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-pocket.png"))
$card = New-Object System.Drawing.Bitmap((Join-Path $dir "wedding-card.png"))
$closed = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-closed.png"))

# Check alignment of pocket in openRef vs pocket in envelope-pocket.png
Write-Host "OpenRef size: $($openRef.Width) x $($openRef.Height)"
Write-Host "Pocket size: $($pocket.Width) x $($pocket.Height)"
Write-Host "Card size: $($card.Width) x $($card.Height)"
Write-Host "Closed size: $($closed.Width) x $($closed.Height)"

$openRef.Dispose(); $pocket.Dispose(); $card.Dispose(); $closed.Dispose()
