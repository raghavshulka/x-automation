#!/usr/bin/env python3

import time
import ctypes

def test_cursor_movement():
    """Test cursor movement independently"""
    print("Testing cursor movement...")
    
    # Get Windows API
    user32 = ctypes.windll.user32
    
    # Get screen size
    width = user32.GetSystemMetrics(0)  # SM_CXSCREEN
    height = user32.GetSystemMetrics(1)  # SM_CYSCREEN
    
    print(f"Screen size: {width}x{height}")
    
    # Calculate positions
    start_x = int(width * 0.2)
    end_x = int(width * 0.8)
    y = int(height * 0.5)
    
    print(f"Moving cursor from ({start_x}, {y}) to ({end_x}, {y})")
    
    # Move from left to right
    print("Moving left to right...")
    for x in range(start_x, end_x + 1, 20):
        user32.SetCursorPos(x, y)
        print(f"Cursor at: {x}, {y}")
        time.sleep(0.1)  # 100ms delay for visibility
    
    # Move from right to left
    print("Moving right to left...")
    for x in range(end_x, start_x - 1, -20):
        user32.SetCursorPos(x, y)
        print(f"Cursor at: {x}, {y}")
        time.sleep(0.1)  # 100ms delay for visibility
    
    print("Cursor movement test completed!")

if __name__ == "__main__":
    print("Starting cursor movement test in 3 seconds...")
    time.sleep(3)
    test_cursor_movement() 