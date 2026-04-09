# Removes Native Messaging registration for Open my files & apps (current user).
# Use to test "first install" / yellow banner, or before switching machines.
# Same browser hives as dev-register-host.ps1.
#
# Usage:
#   .\dev-unregister-host.ps1
# Optional:
#   .\dev-unregister-host.ps1 -RemoveManifest   # also delete the JSON under %LOCALAPPDATA%\OpenMyFilesApps

param(
    [switch] $RemoveManifest
)

$ErrorActionPreference = "Continue"

$nmh = "com.mapicallo.open_my_files_apps"
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

$removed = 0
foreach ($parent in $nativeMessagingParentKeys) {
    $fullKey = Join-Path $parent $nmh
    if (Test-Path -LiteralPath $fullKey) {
        Remove-Item -LiteralPath $fullKey -Recurse -Force
        $removed++
        Write-Host "Removed: $fullKey"
    }
}

if ($removed -eq 0) {
    Write-Host "No registry keys found for $nmh (already clean or never registered)."
} else {
    Write-Host "Removed $removed hive(s). Close every browser window, then reopen."
}

if ($RemoveManifest) {
    $manifestPath = Join-Path $env:LOCALAPPDATA "OpenMyFilesApps\com.mapicallo.open_my_files_apps.json"
    if (Test-Path -LiteralPath $manifestPath) {
        Remove-Item -LiteralPath $manifestPath -Force
        Write-Host "Deleted manifest: $manifestPath"
    } else {
        Write-Host "No manifest at $manifestPath"
    }
}
