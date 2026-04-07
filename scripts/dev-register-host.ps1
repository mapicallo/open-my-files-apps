# Registers the Native Messaging host for Chromium browsers on Windows (current user).
# Covers Chrome / Edge stable + Beta / Dev / Canary (SxS) and Brave.
#
# Usage:
#   .\dev-register-host.ps1 -ExtensionId "abcdefghijklmnopqrstuvwxyz123456"
# Optional:
#   -HostExe "C:\full\path\OpenMyFilesApps.Host.exe"
#
# Build the host first:
#   dotnet build ..\native-host\OpenMyFilesApps.Host\OpenMyFilesApps.Host.csproj -c Release

param(
    [Parameter(Mandatory = $true)]
    [string] $ExtensionId,

    [string] $HostExe = ""
)

$ErrorActionPreference = "Stop"

if (-not $HostExe) {
    $HostExe = Join-Path $PSScriptRoot "..\native-host\OpenMyFilesApps.Host\bin\Release\net8.0-windows\OpenMyFilesApps.Host.exe"
    $HostExe = [System.IO.Path]::GetFullPath($HostExe)
}

if (-not (Test-Path -LiteralPath $HostExe)) {
    Write-Error @"
Host executable not found: $HostExe

From repo root, build the host:
  dotnet build native-host\OpenMyFilesApps.Host\OpenMyFilesApps.Host.csproj -c Release

Or publish:
  dotnet publish native-host\OpenMyFilesApps.Host\OpenMyFilesApps.Host.csproj -c Release -r win-x64 --self-contained false
Then pass -HostExe with the full path to OpenMyFilesApps.Host.exe
"@
}

$ManifestDir = Join-Path $env:LOCALAPPDATA "OpenMyFilesApps"
New-Item -ItemType Directory -Force -Path $ManifestDir | Out-Null

$ManifestPath = Join-Path $ManifestDir "com.mapicallo.open_my_files_apps.json"
$HostExeJson = $HostExe.Replace('\', '\\')

$json = @"
{
  "name": "com.mapicallo.open_my_files_apps",
  "description": "Native host for Open my files & apps",
  "path": "$HostExeJson",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://$ExtensionId/"
  ]
}
"@

# UTF-8 sin BOM: Chrome/Edge a veces fallan si el JSON empieza por EF BB FF
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($ManifestPath, $json, $utf8NoBom)

$nmh = "com.mapicallo.open_my_files_apps"

# Una clave por “familia” de Chromium; si solo registras Edge estable y usas Edge Dev,
# aparece: "Specified native messaging host not found".
$nativeMessagingParentKeys = @(
    "HKCU:\Software\Google\Chrome\NativeMessagingHosts",
    "HKCU:\Software\Google\Chrome Beta\NativeMessagingHosts",
    "HKCU:\Software\Google\Chrome Dev\NativeMessagingHosts",
    "HKCU:\Software\Google\Chrome SxS\NativeMessagingHosts",
    "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts",
    "HKCU:\Software\Microsoft\Edge Beta\NativeMessagingHosts",
    "HKCU:\Software\Microsoft\Edge Dev\NativeMessagingHosts",
    "HKCU:\Software\Microsoft\Edge SxS\NativeMessagingHosts",
    "HKCU:\Software\BraveSoftware\Brave-Browser\NativeMessagingHosts"
)

foreach ($parent in $nativeMessagingParentKeys) {
    $fullKey = Join-Path $parent $nmh
    New-Item -Path $fullKey -Force | Out-Null
    Set-ItemProperty -LiteralPath $fullKey -Name "(default)" -Value $ManifestPath -Type String
}

Write-Host "Registered Native Messaging host in $($nativeMessagingParentKeys.Count) browser hives."
Write-Host "Manifest: $ManifestPath"
Write-Host "Host exe: $HostExe"
Write-Host "Extension ID: $ExtensionId"
Write-Host "Cierra por completo el navegador y vuelve a abrirlo (Chrome/Edge/Brave)."
