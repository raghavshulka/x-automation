#!/usr/bin/env python3

import json
import sys
import struct
import time
import ctypes
import os
import logging

# Set up logging for debugging
log_file = os.path.join(os.path.dirname(__file__), 'cursor_mover.log')
logging.basicConfig(filename=log_file, level=logging.DEBUG, 
                   format='%(asctime)s - %(levelname)s - %(message)s')

# Windows API functions for cursor movement
user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

def move_cursor(x, y):
    """Move the system cursor to the specified position"""
    try:
        result = user32.SetCursorPos(int(x), int(y))
        logging.debug(f"SetCursorPos({x}, {y}) returned: {result}")
        return result
    except Exception as e:
        logging.error(f"Error moving cursor: {e}")
        return False

def get_screen_size():
    """Get the screen dimensions"""
    try:
        width = user32.GetSystemMetrics(0)  # SM_CXSCREEN
        height = user32.GetSystemMetrics(1)  # SM_CYSCREEN
        logging.debug(f"Screen size: {width}x{height}")
        return width, height
    except Exception as e:
        logging.error(f"Error getting screen size: {e}")
        return 1920, 1080  # fallback

def send_message(message):
    """Send a message back to the extension"""
    try:
        message_json = json.dumps(message)
        message_bytes = message_json.encode('utf-8')
        
        # Write message length as 4-byte integer
        sys.stdout.buffer.write(struct.pack('I', len(message_bytes)))
        # Write message
        sys.stdout.buffer.write(message_bytes)
        sys.stdout.buffer.flush()
        
        logging.debug(f"Sent message: {message}")
    except Exception as e:
        logging.error(f"Error sending message: {e}")

def read_message():
    """Read a message from the extension"""
    try:
        # Read message length (4 bytes)
        raw_length = sys.stdin.buffer.read(4)
        if not raw_length:
            logging.debug("No message length received")
            return None
        
        message_length = struct.unpack('I', raw_length)[0]
        logging.debug(f"Expecting message of length: {message_length}")
        
        # Read message
        message_bytes = sys.stdin.buffer.read(message_length)
        if not message_bytes:
            logging.debug("No message data received")
            return None
            
        message = message_bytes.decode('utf-8')
        parsed_message = json.loads(message)
        
        logging.debug(f"Received message: {parsed_message}")
        return parsed_message
        
    except Exception as e:
        logging.error(f"Error reading message: {e}")
        return None

def move_cursor_left_to_right():
    """Move cursor from left to right and back"""
    try:
        logging.info("Starting cursor movement")
        
        width, height = get_screen_size()
        
        start_x = int(width * 0.2)
        end_x = int(width * 0.8)
        y = int(height * 0.5)
        
        logging.info(f"Moving cursor from ({start_x}, {y}) to ({end_x}, {y}) on screen {width}x{height}")
        
        # Move from left to right
        for x in range(start_x, end_x + 1, 20):
            if not move_cursor(x, y):
                logging.error(f"Failed to move cursor to {x}, {y}")
            time.sleep(0.05)  # 50ms delay
        
        # Move from right to left
        for x in range(end_x, start_x - 1, -20):
            if not move_cursor(x, y):
                logging.error(f"Failed to move cursor to {x}, {y}")
            time.sleep(0.05)  # 50ms delay
            
        logging.info("Cursor movement completed successfully")
        return {"success": True, "message": "Cursor movement completed"}
        
    except Exception as e:
        error_msg = f"Error during cursor movement: {e}"
        logging.error(error_msg)
        return {"success": False, "error": error_msg}

def main():
    """Main function to handle native messaging"""
    logging.info("Native messaging host started")
    
    try:
        while True:
            message = read_message()
            if message is None:
                logging.info("No message received, exiting")
                break
                
            logging.info(f"Processing message: {message}")
            
            if message.get("action") == "moveCursor":
                result = move_cursor_left_to_right()
                send_message(result)
            else:
                error_msg = f"Unknown action: {message.get('action')}"
                logging.warning(error_msg)
                send_message({"success": False, "error": error_msg})
                
    except Exception as e:
        error_msg = f"Main loop error: {e}"
        logging.error(error_msg)
        send_message({"success": False, "error": error_msg})
    
    logging.info("Native messaging host ending")

if __name__ == "__main__":
    main() 