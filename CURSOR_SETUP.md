# Real Cursor Movement Setup

The X Automation extension now uses **real system cursor movement** instead of virtual cursors. This requires a one-time setup to enable native messaging.

## Prerequisites

1. **Python 3.6+** must be installed on your system
   - Download from: https://python.org
   - Make sure to check "Add Python to PATH" during installation

## Setup Instructions

### Step 1: Run the Setup Script
1. Double-click `setup_native_messaging.bat` in this folder
2. If you see a security warning, click "Run anyway"
3. The script will:
   - Check if Python is installed
   - Create the native messaging manifest
   - Register it with Chrome

### Step 2: Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `dist` folder from this directory

### Step 3: Test the Extension
1. Go to Twitter/X.com
2. Start the auto-posting
3. You should now see your **real cursor** moving left-to-right between posts!

## How It Works

- **Between Posts**: The real system cursor moves smoothly from left (20% of screen) to right (80% of screen) and back
- **During Posting**: No cursor movement occurs while typing/posting
- **Timing**: Movement happens only in the idle time between completing one post and starting the next

## Troubleshooting

### "Python not found" error
- Install Python from https://python.org
- Make sure "Add to PATH" was checked during installation
- Restart your computer after installation

### "Failed to register" error
- Right-click `setup_native_messaging.bat` and select "Run as administrator"

### Cursor still not moving
1. Check Chrome's console (F12 → Console) for error messages
2. Make sure the extension is loaded from the `dist` folder
3. Try restarting Chrome after setup

### Native messaging error
- Unload and reload the extension
- Make sure Python is accessible from command line: `python --version`

## Technical Details

The extension uses:
- **Native Messaging**: Chrome extension communicates with Python script
- **Windows API**: Python uses `ctypes` to call `user32.SetCursorPos()`
- **Registry**: Native messaging host is registered in Windows registry

## Security Note

The Python script only moves the cursor and has no other system access. The source code is available for inspection in `cursor_mover.py`. 