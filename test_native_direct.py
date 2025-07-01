#!/usr/bin/env python3

import json
import struct
import subprocess
import sys
import os

def test_native_messaging():
    """Test the native messaging host directly"""
    print("Testing native messaging host...")
    
    # Create the message
    message = {"action": "moveCursor"}
    message_json = json.dumps(message)
    message_bytes = message_json.encode('utf-8')
    
    # Create the properly formatted input (length + message)
    length_bytes = struct.pack('I', len(message_bytes))
    full_input = length_bytes + message_bytes
    
    print(f"Sending message: {message}")
    print(f"Message length: {len(message_bytes)} bytes")
    
    try:
        # Get the path to the batch file
        batch_path = os.path.join(os.path.dirname(__file__), 'dist', 'cursor_mover.bat')
        print(f"Running: {batch_path}")
        
        # Run the batch file with the formatted input
        process = subprocess.Popen(
            [batch_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Send the input and wait for response
        stdout, stderr = process.communicate(input=full_input, timeout=10)
        
        print(f"Exit code: {process.returncode}")
        
        if stdout:
            print("STDOUT:")
            print(stdout.decode('utf-8', errors='ignore'))
        
        if stderr:
            print("STDERR:")
            print(stderr.decode('utf-8', errors='ignore'))
            
        print("Test completed!")
        
    except subprocess.TimeoutExpired:
        print("Process timed out after 10 seconds")
        process.kill()
    except Exception as e:
        print(f"Error running test: {e}")

if __name__ == "__main__":
    test_native_messaging() 