@echo off
echo Testing cursor movement batch script...
echo.

REM Test 1: Check if Python is accessible
echo 1. Testing Python availability...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found in PATH
    pause
    exit /b 1
)
echo ✅ Python is available
echo.

REM Test 2: Check if Python script exists
if not exist "dist\cursor_mover.py" (
    echo ERROR: cursor_mover.py not found in dist folder
    pause
    exit /b 1
)
echo ✅ Python script found
echo.

REM Test 3: Test the standalone cursor movement
echo 2. Testing standalone cursor movement...
python test_cursor.py
echo.

REM Test 4: Test native messaging format
echo 3. Testing native messaging script directly...
echo Note: This will wait for input. Press Ctrl+C to cancel if it hangs.
echo.
echo {"action":"moveCursor"} | dist\cursor_mover.bat

echo.
echo Test completed! Check if cursor moved during the tests.
pause 