@echo off
setlocal
REM Run from repo root: scripts\dev-register-host.cmd YOUR_EXTENSION_ID
REM Or from scripts\: dev-register-host.cmd YOUR_EXTENSION_ID

set "SCRIPT_DIR=%~dp0"
if "%~1"=="" (
  echo Usage: %~nx0 ^<ExtensionId^>
  echo Example: %~nx0 bmfkllecdjgdgdonhohgfpellkpfefla
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%dev-register-host.ps1" -ExtensionId "%~1"
exit /b %ERRORLEVEL%
