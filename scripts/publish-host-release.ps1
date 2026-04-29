# Build self-contained OpenMyFilesApps.Host.exe and attach it to a NEW GitHub Release
# so https://github.com/mapicallo/open-my-files-apps/releases/latest/download/OpenMyFilesApps.Host.exe works.
#
# Prerequisites:
#   1) .NET 8 SDK
#   2) GitHub CLI: winget install GitHub.cli
#   3) gh auth login   (once per machine)
#
# Usage (from repo root or scripts/):
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\publish-host-release.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$ghPath = $null
$ghCmd = Get-Command gh -ErrorAction SilentlyContinue
if ($ghCmd) {
    $ghPath = $ghCmd.Source
} else {
    $ghExe = Join-Path $env:ProgramFiles "GitHub CLI\gh.exe"
    if (Test-Path -LiteralPath $ghExe) {
        $ghPath = $ghExe
    }
}
if (-not $ghPath) {
    Write-Host "Install GitHub CLI: winget install GitHub.cli"
    Write-Host "Then run: gh auth login"
    exit 1
}

# gh prints "not logged in" to stderr; cmd hides both streams. (Start-Process cannot send stdout+stderr to the same "NUL".)
cmd.exe /c "`"$ghPath`" auth status >nul 2>nul"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Run (once): gh auth login"
    Write-Host "Or: & `"$ghPath`" auth login"
    exit 1
}

$manifest = Get-Content (Join-Path $root "extension\manifest.json") -Raw | ConvertFrom-Json
$ver = $manifest.version
$tag = "host-v$ver"

Write-Host "Publishing host -> Release tag $tag"
dotnet publish native-host/OpenMyFilesApps.Host/OpenMyFilesApps.Host.csproj `
    -c Release -r win-x64 --self-contained true `
    -p:PublishSingleFile=true `
    -p:IncludeNativeLibrariesForSelfExtract=true `
    -o (Join-Path $root "out")

$exe = Join-Path $root "out\OpenMyFilesApps.Host.exe"
if (-not (Test-Path -LiteralPath $exe)) {
    throw "Expected $exe after publish."
}

$notes = @"
Windows native messaging host for **Open my files & apps** (extension $ver).

- Single-file, self-contained **win-x64** build (no separate .NET install for end users).
- The panel installer downloads: \`releases/latest/download/OpenMyFilesApps.Host.exe\` — **asset name must stay exactly \`OpenMyFilesApps.Host.exe\`**.
"@

# If this tag already exists, bail out (non-zero gh output goes to stderr and would stop the script if invoked directly).
cmd.exe /c "`"$ghPath`" release view $tag >nul 2>nul"
if ($LASTEXITCODE -eq 0) {
    Write-Warning "Release $tag already exists. On GitHub: delete that release (and tag) or bump extension version, then re-run."
    exit 1
}

& $ghPath release create $tag $exe `
    --latest `
    --title "OpenMyFilesApps.Host (Windows x64)" `
    --notes $notes

Write-Host "Done. Check: https://github.com/mapicallo/open-my-files-apps/releases/latest"
