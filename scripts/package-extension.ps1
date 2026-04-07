# Creates open-my-files-apps.zip with manifest at ZIP root (Chrome / Edge upload).
$root = Split-Path $PSScriptRoot -Parent
$ext = Join-Path $root "extension"
$dest = Join-Path $root "open-my-files-apps.zip"
if (Test-Path $dest) { Remove-Item $dest -Force }
Push-Location $ext
try {
    Compress-Archive -Path * -DestinationPath $dest -Force
}
finally {
    Pop-Location
}
Write-Host "Wrote $dest"
