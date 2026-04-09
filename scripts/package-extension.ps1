# Creates dist/open-my-files-apps-<version>.zip with manifest at ZIP root (Chrome / Edge upload).
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$ext = Join-Path $root "extension"
$manifestPath = Join-Path $ext "manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Error "Missing $manifestPath"
}
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
if (-not $version) {
    Write-Error "manifest.json has no version"
}
foreach ($s in @(16, 32, 48, 128)) {
    $icon = Join-Path $ext "icons\icon$s.png"
    if (-not (Test-Path -LiteralPath $icon)) {
        Write-Error "Missing required icon: $icon"
    }
}
$dist = Join-Path $root "dist"
if (-not (Test-Path -LiteralPath $dist)) {
    New-Item -ItemType Directory -Path $dist | Out-Null
}
$dest = Join-Path $dist "open-my-files-apps-$version.zip"
if (Test-Path -LiteralPath $dest) {
    Remove-Item -LiteralPath $dest -Force
}
Push-Location $ext
try {
    Compress-Archive -Path * -DestinationPath $dest -Force
}
finally {
    Pop-Location
}
Write-Host "Wrote $dest"
Write-Host "Upload this ZIP to Chrome Web Store and Microsoft Edge Partner Center."
