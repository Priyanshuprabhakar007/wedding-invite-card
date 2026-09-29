Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\pc\.gemini\antigravity-ide\scratch\sister-wedding-invitation\assets\images"

$closed = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-closed.png"))
$pocket = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-pocket.png"))
$flap = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-flap.png"))
$seal = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-seal.png"))
$card = New-Object System.Drawing.Bitmap((Join-Path $dir "wedding-card.png"))
$ref = New-Object System.Drawing.Bitmap((Join-Path $dir "envelope-open-reference.png"))

Write-Host "Dimensions:"
Write-Host "Closed: $($closed.Width) x $($closed.Height)"
Write-Host "Pocket: $($pocket.Width) x $($pocket.Height)"
Write-Host "Flap: $($flap.Width) x $($flap.Height)"
Write-Host "Seal: $($seal.Width) x $($seal.Height)"
Write-Host "Card: $($card.Width) x $($card.Height)"
Write-Host "Ref: $($ref.Width) x $($ref.Height)"

$closed.Dispose(); $pocket.Dispose(); $flap.Dispose(); $seal.Dispose(); $card.Dispose(); $ref.Dispose()
