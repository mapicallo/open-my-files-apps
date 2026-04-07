@echo off
setlocal
cd /d "%~dp0.."

where dotnet >nul 2>&1
if errorlevel 1 (
  echo [.NET SDK] No se encuentra "dotnet" en el PATH.
  echo Instala .NET 8 SDK desde https://dotnet.microsoft.com/download/dotnet/8.0
  echo Abre una ventana NUEVA de cmd tras instalar.
  exit /b 1
)

echo Compilando OpenMyFilesApps.Host ^(Release^)...
dotnet build native-host\OpenMyFilesApps.Host\OpenMyFilesApps.Host.csproj -c Release
set ERR=%ERRORLEVEL%
if %ERR% neq 0 exit /b %ERR%

echo.
echo Listo. Ejecutable esperado en:
echo   %CD%\native-host\OpenMyFilesApps.Host\bin\Release\net8.0-windows\OpenMyFilesApps.Host.exe
exit /b 0
