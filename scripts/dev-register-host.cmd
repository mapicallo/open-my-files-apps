@echo off
setlocal
REM 1) Ejecuta build-host.cmd antes si aun no existe el .exe
REM 2) ExtensionId = 32 caracteres (sin chrome-extension://)

set "SCRIPT_DIR=%~dp0"
if "%~1"=="" (
  echo Usage: %~nx0 ^<ExtensionId^>
  echo Primero compila el host:  build-host.cmd
  echo Example: %~nx0 bmfkllecdjgdgdonhohgfpellkpfefla
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%dev-register-host.ps1" -ExtensionId "%~1"
exit /b %ERRORLEVEL%
