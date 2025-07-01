@echo off
echo Setting up Native Messaging Host for X Automation Extension...

REM Get the current directory
set "CURRENT_DIR=%~dp0"
set "SCRIPT_PATH=%CURRENT_DIR%dist\cursor_mover.bat"
set "MANIFEST_PATH=%CURRENT_DIR%dist\com.xautomation.cursormover.json"

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Create the native messaging host manifest with correct path
echo {> "%MANIFEST_PATH%"
echo   "name": "com.xautomation.cursormover",>> "%MANIFEST_PATH%"
echo   "description": "Native messaging host for cursor movement",>> "%MANIFEST_PATH%"
echo   "path": "%SCRIPT_PATH:\=\\%",>> "%MANIFEST_PATH%"
echo   "type": "stdio",>> "%MANIFEST_PATH%"
echo   "allowed_origins": [>> "%MANIFEST_PATH%"
echo     "chrome-extension://*/">> "%MANIFEST_PATH%"
echo   ]>> "%MANIFEST_PATH%"
echo }>> "%MANIFEST_PATH%"

REM Register the native messaging host in the Windows registry
echo Registering native messaging host...
reg add "HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.xautomation.cursormover" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f

if %errorlevel% equ 0 (
    echo SUCCESS: Native messaging host registered successfully!
    echo.
    echo IMPORTANT: 
    echo 1. Make sure Python is installed and accessible from PATH
    echo 2. Load the extension in Chrome from the 'dist' folder
    echo 3. The extension will now be able to move your real cursor
    echo.
) else (
    echo ERROR: Failed to register native messaging host.
    echo Please run this script as Administrator.
)

pause 