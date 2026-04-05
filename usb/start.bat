@echo off
title LCKR Launcher
cd /d "%~dp0"

echo ============================================
echo   LCKR - Portable Encrypted Locker
echo ============================================
echo.

REM Try python (Python 3 on Windows often registers as "python")
python --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Starting LCKR at http://localhost:8080 ...
    start "" "http://localhost:8080"
    python -m http.server 8080 --directory dist
    goto :end
)

REM Try python3
python3 --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Starting LCKR at http://localhost:8080 ...
    start "" "http://localhost:8080"
    python3 -m http.server 8080 --directory dist
    goto :end
)

echo Python was not found on this machine.
echo.
echo To run LCKR offline, install Python (free, ~25MB):
echo   https://python.org/downloads
echo.
echo Or visit https://lckr.tech directly in Chrome, Edge, or Brave.
echo.
pause
:end
