@echo off
setlocal
REM Optional arg: removemanifest  —  also deletes the JSON manifest file

set "SCRIPT_DIR=%~dp0"
if /i "%~1"=="removemanifest" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%dev-unregister-host.ps1" -RemoveManifest
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%dev-unregister-host.ps1"
)
exit /b %ERRORLEVEL%
