# Registers the Native Messaging host for Chrome and Edge (current user).
# Usage:
#   .\dev-register-host.ps1 -ExtensionId "abcdefghijklmnopqrstuvwxyz123456"
# Optional:
#   -HostExe "C:\full\path\OpenMyFilesApps.Host.exe"
#
# Build the host first:
#   dotnet publish ..\native-host\OpenMyFilesApps.Host\OpenMyFilesApps.Host.csproj -c Release -r win-x64 --self-contained false

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
$chromeKey = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$nmh"
$edgeKey = "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\$nmh"

New-Item -Path $chromeKey -Force | Out-Null
Set-ItemProperty -Path $chromeKey -Name "(default)" -Value $ManifestPath

New-Item -Path $edgeKey -Force | Out-Null
Set-ItemProperty -Path $edgeKey -Name "(default)" -Value $ManifestPath

Write-Host "Registered Native Messaging host."
Write-Host "Manifest: $ManifestPath"
Write-Host "Host exe: $HostExe"
Write-Host "Extension ID: $ExtensionId"
