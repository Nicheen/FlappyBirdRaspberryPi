import json
import time
import threading
from pathlib import Path
import keyboard  # You'll need to install this: pip install keyboard

class FlappyBirdController:
    def __init__(self):
        self.json_file = Path("data.json")
        self.running = False
        self.jump_count = 0
        
    def send_jump_command(self):
        """Send a jump command to JavaScript"""
        self.jump_count += 1
        command = {
            "jump": True,
            "timestamp": time.time(),  # Unique timestamp for each jump
            "jump_id": self.jump_count
        }
        
        try:
            with open(self.json_file, 'w') as f:
                json.dump(command, f, indent=2)
            print(f"🦘 Jump command sent! (#{self.jump_count})")
        except Exception as e:
            print(f"❌ Error sending jump command: {e}")
    
    def keyboard_listener(self):
        """Listen for keyboard input"""
        print("🎮 Keyboard controls active!")
        print("Press SPACE to make the bird jump")
        print("Press 'q' to quit")
        print("-" * 40)
        
        while self.running:
            try:
                if keyboard.is_pressed('space'):
                    self.send_jump_command()
                    time.sleep(0.2)  # Prevent multiple jumps from one press
                elif keyboard.is_pressed('q'):
                    print("👋 Quitting...")
                    self.running = False
                    break
                
                time.sleep(0.05)  # Small delay to prevent excessive CPU usage
            except Exception as e:
                print(f"❌ Keyboard error: {e}")
                break
    
    def auto_jump_demo(self):
        """Automatically jump at intervals (demo mode)"""
        print("🤖 Auto-jump demo mode!")
        print("Bird will jump every 1.5 seconds")
        print("Press Ctrl+C to stop")
        print("-" * 40)
        
        while self.running:
            try:
                self.send_jump_command()
                time.sleep(1.5)  # Jump every 1.5 seconds
            except KeyboardInterrupt:
                print("\n👋 Demo stopped!")
                self.running = False
                break
            except Exception as e:
                print(f"❌ Auto-jump error: {e}")
                break
    
    def manual_control(self):
        """Manual control via console input"""
        print("✋ Manual control mode!")
        print("Press ENTER to jump, type 'quit' to exit")
        print("-" * 40)
        
        while self.running:
            try:
                user_input = input("Press ENTER to jump (or 'quit'): ").strip().lower()
                if user_input in ['quit', 'exit', 'q']:
                    print("👋 Goodbye!")
                    self.running = False
                    break
                else:
                    self.send_jump_command()
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                self.running = False
                break
            except Exception as e:
                print(f"❌ Input error: {e}")
                break
    
    def start(self, mode='keyboard'):
        """Start the controller in specified mode"""
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
            print(f"❌ Error initializing command file: {e}")
            return
        
        print("🚀 Flappy Bird Python Controller Started!")
        print("Make sure your web browser is running the game")
        print("=" * 50)
        
        if mode == 'keyboard':
            try:
                self.keyboard_listener()
            except ImportError:
                print("❌ 'keyboard' library not found!")
                print("Install it with: pip install keyboard")
                print("Falling back to manual mode...")
                self.manual_control()
        elif mode == 'auto':
            self.auto_jump_demo()
        else:
            self.manual_control()
    
    def stop(self):
        """Stop the controller"""
        self.running = False

def main():
    controller = FlappyBirdController()
    
    print("🎮 Flappy Bird Python Controller")
    print("=" * 40)
    print("Choose control mode:")
    print("1. Keyboard (SPACE to jump) - Recommended")
    print("2. Manual (ENTER to jump)")
    print("3. Auto demo (automatic jumps)")
    print()
    
    while True:
        try:
            choice = input("Enter your choice (1-3): ").strip()
            if choice == '1':
                controller.start('keyboard')
                break
            elif choice == '2':
                controller.start('manual')
                break
            elif choice == '3':
                controller.start('auto')
                break
            else:
                print("❌ Please enter 1, 2, or 3")
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    main()