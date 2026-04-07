# Comprueba registro + manifiesto + exe (no prueba el ping desde el navegador).

param(
    [string] $ManifestPath = ""
)

function Test-AssertPath([string] $p) {
    return ($p -and (Test-Path -LiteralPath $p))
}

if (-not $ManifestPath) {
    $ManifestPath = Join-Path $env:LOCALAPPDATA "OpenMyFilesApps\com.mapicallo.open_my_files_apps.json"
}

$nmh = "com.mapicallo.open_my_files_apps"
$parents = @(
    @{ Name = "Chrome Stable"; Path = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$nmh" },
    @{ Name = "Chrome Beta";   Path = "HKCU:\Software\Google\Chrome Beta\NativeMessagingHosts\$nmh" },
    @{ Name = "Chrome Dev";    Path = "HKCU:\Software\Google\Chrome Dev\NativeMessagingHosts\$nmh" },
    @{ Name = "Chrome Canary"; Path = "HKCU:\Software\Google\Chrome SxS\NativeMessagingHosts\$nmh" },
    @{ Name = "Edge Stable";   Path = "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\$nmh" },
    @{ Name = "Edge Beta";     Path = "HKCU:\Software\Microsoft\Edge Beta\NativeMessagingHosts\$nmh" },
    @{ Name = "Edge Dev";      Path = "HKCU:\Software\Microsoft\Edge Dev\NativeMessagingHosts\$nmh" },
    @{ Name = "Edge Canary";   Path = "HKCU:\Software\Microsoft\Edge SxS\NativeMessagingHosts\$nmh" },
    @{ Name = "Brave";         Path = "HKCU:\Software\BraveSoftware\Brave-Browser\NativeMessagingHosts\$nmh" }
)

Write-Host "=== Manifest file ===" -ForegroundColor Cyan
if (Test-AssertPath $ManifestPath) {
    Write-Host "  OK: $ManifestPath"
    try {
        $raw = [System.IO.File]::ReadAllText($ManifestPath)
        $j = $raw | ConvertFrom-Json
        Write-Host "  name: $($j.name)"
        Write-Host "  path (exe): $($j.path)"
        if (Test-AssertPath $j.path) { Write-Host "  exe exists: OK" -ForegroundColor Green }
        else { Write-Host "  exe exists: MISSING" -ForegroundColor Red }
    }
    catch {
        Write-Host "  JSON parse error: $_" -ForegroundColor Red
    }
}
else {
    Write-Host "  MISSING: $ManifestPath" -ForegroundColor Red
}

Write-Host "`n=== Registry (default value should be manifest path) ===" -ForegroundColor Cyan
foreach ($p in $parents) {
    if (-not (Test-Path -LiteralPath $p.Path)) {
        Write-Host "  [$($p.Name)] key absent (normal if that browser not installed)" -ForegroundColor DarkGray
        continue
    }
    $v = (Get-ItemProperty -LiteralPath $p.Path).'(default)'
    $ok = ($v -eq $ManifestPath)
    if ($ok) {
        Write-Host "  [$($p.Name)] OK -> $v" -ForegroundColor Green
    }
    else {
        Write-Host "  [$($p.Name)] MISMATCH or empty" -ForegroundColor Yellow
        Write-Host "             got: $v"
        Write-Host "             expect: $ManifestPath"
    }
}
