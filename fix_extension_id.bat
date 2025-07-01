@echo off
echo Fixing Extension ID in Native Messaging Manifest...

set "MANIFEST_PATH=%~dp0dist\com.xautomation.cursormover.json"
set "SCRIPT_PATH=%~dp0dist\cursor_mover.bat"

echo.
echo 🔍 Please follow these steps:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Find "Twitter Auto Poster" extension
echo 3. Copy the Extension ID (long string of letters)
echo 4. Enter it below:
echo.

set /p EXTENSION_ID="Enter Extension ID: "

if "%EXTENSION_ID%"=="" (
    echo ERROR: No Extension ID provided
    pause
    exit /b 1
)

echo.
echo Creating native messaging manifest with Extension ID: %EXTENSION_ID%

REM Create the native messaging host manifest with the correct extension ID
echo {> "%MANIFEST_PATH%"
echo   "name": "com.xautomation.cursormover",>> "%MANIFEST_PATH%"
echo   "description": "Native messaging host for cursor movement",>> "%MANIFEST_PATH%"
echo   "path": "%SCRIPT_PATH:\=\\%",>> "%MANIFEST_PATH%"
echo   "type": "stdio",>> "%MANIFEST_PATH%"
echo   "allowed_origins": [>> "%MANIFEST_PATH%"
echo     "chrome-extension://%EXTENSION_ID%/">> "%MANIFEST_PATH%"
echo   ]>> "%MANIFEST_PATH%"
echo }>> "%MANIFEST_PATH%"

echo.
echo ✅ Native messaging manifest updated successfully!
echo Extension ID: %EXTENSION_ID%
echo Manifest path: %MANIFEST_PATH%
echo.
echo Now reload the extension in Chrome and test again.
echo.
pause 