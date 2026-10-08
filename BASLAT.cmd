@echo off
setlocal
cd /d "%~dp0"
set "PATI_NODE=node"
where node >nul 2>nul
if errorlevel 1 (
  set "PATI_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if not exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
    echo Node.js bulunamadi. Node.js 18 veya daha yeni bir surum kurun.
    pause
    exit /b 1
  )
)
if not exist "dist\index.html" (
  "%PATI_NODE%" build.cjs
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
"%PATI_NODE%" server.cjs --open
if errorlevel 1 pause
