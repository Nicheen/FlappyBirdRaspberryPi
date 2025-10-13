import json
import time
from pathlib import Path
from sense_hat import SenseHat

# You'll need to install this: pip install keyboard
#import keyboard

class FlappyBirdController:
    def __init__(self):
        self.json_file = Path("data.json")
        self.running = False
        self.jump_count = 0
        self.time_of_last_jump = 0
        self.sense = SenseHat()
        self.sense.stick.direction_down = self.j_jump
        self.sense.stick.direction_up = self.j_jump
        self.sense.stick.direction_middle = self.j_jump
        self.time = time.time()

    def j_jump(self):
        if self.running:
         if abs(self.time - time.time()) > 0.15: 
          self.send_jump_command()
          self.time = time.time()

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
        shaken = False
        while self.running:
            try:
                if self.is_shaken(): #keyboard.is_pressed('space'): 
                    if not shaken:
                        self.send_jump_command()
                        shaken = True
                #elif keyboard.is_pressed('q'):
                #    self.running = False
                #    break
                else:
                    shaken = False
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

        if x > 1.5 or y > 1.5 or z > 1.5:
            self.sense.show_letter('6', red)
            return True;
        self.sense.clear()
        return False;

def main():
    print("main.py is running...")
    controller = FlappyBirdController()
    controller.start()
      
if __name__ == "__main__":
    main()
