import json
import time
from pathlib import Path

# You'll need to install this: pip install keyboard
import keyboard

class FlappyBirdController:
    def __init__(self):
        self.json_file = Path("data.json")
        self.running = False
        self.jump_count = 0

    def send_jump_command(self):
        self.jump_count += 1
        command = {
            "jump": True,
            "timestamp": time.time(),
            "jump_id": self.jump_count
        }
 
        try:
            with open(self.json_file, 'w') as f:
                json.dump(command, f, indent=2)
            print(f"Jump command sent! (#{self.jump_count})")
        except Exception as e:
            print(f"Error: {e}")

    def keyboard_listener(self):
        while self.running:
            try:
                if keyboard.is_pressed('space'):
                    self.send_jump_command()
                    time.sleep(0.2)
                elif keyboard.is_pressed('q'):
                    self.running = False
                    break

                time.sleep(0.05)
            except Exception as e:
                print(f"Error: {e}")
                break

    def start(self):
        self.running = True

        # Initialize the JSON file
        initial_command = {
            "jump": False,
            "timestamp": 0,
            "jump_id": 0
        }

        try:
            with open(self.json_file, 'w') as f:
                json.dump(initial_command, f, indent=2)
        except Exception as e:
            print(f"Error: {e}")
            return

        try:
            self.keyboard_listener()
        except ImportError:
            print("Make sure to pip install keyboard!")

    def stop(self):
        """Stop the controller"""
        self.running = False

def main():
    controller = FlappyBirdController()
    controller.start()
      
if __name__ == "__main__":
    main()