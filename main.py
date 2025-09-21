import json
import time
from pathlib import Path
from sense_hat import SenseHat

# You'll need to install this: pip install keyboard
import keyboard

class FlappyBirdController:
    def __init__(self):
        self.json_file = Path("data.json")
        self.running = False
        self.jump_count = 0
        self.time_of_last_jump = 0
        self.sense = SenseHat()

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

    def device_listener(self):
        print("we here")
        while self.running:
            try:
                if keyboard.is_pressed('space'): #self.is_shaken():
                    self.send_jump_command()
                elif keyboard.is_pressed('q'):
                    self.running = False
                    break
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
            self.device_listener()
        except ImportError:
            print("Make sure to pip install keyboard!")
        except Exception as e:
            print(f"Error: {e}")
            return

    def stop(self):
        """Stop the controller"""
        self.running = False

    def is_shaken(self):
        red = (255, 0, 0)
        green = (0, 255, 0)
        acceleration = self.sense.get_accelerometer_raw()
        x = acceleration['x']
        y = acceleration['y']
        z = acceleration['z']

        x = abs(x)
        y = abs(y)
        z = abs(z)

        if x > 3 or y > 3 or z > 3:
            self.sense.show_letter('A', red)
            return True;
        self.sense.show_letter('A', green)
        return False;

def main():
    print("starting ******************************** here")
    controller = FlappyBirdController()
    controller.start()
      
if __name__ == "__main__":
    main()
