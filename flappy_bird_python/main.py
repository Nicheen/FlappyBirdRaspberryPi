from player import Player
from pipes import Pipes, Pipe
import time

class Game:
    def __init__(self):
        self.quit = False
        self.player = Player()
        self.pipes = Pipes()
    
    def initialize(self):
        self.player.position = (50, 250)
        self.player.velocity = (0, 0)

        for i in range(3):
            new_pipe = Pipe((300 + i * 200, 0), gap_size=100)
            self.pipes.add_pipe(new_pipe)

    def run(self):
        print("Game is running")
        while not self.quit:
            time.sleep(1.0)  # Simulate frame delay
            self.player.update()
            for pipe in self.pipes.get_pipes():
                pipe.move((5, 0))

            print(self.player)
            for pipe in self.pipes.get_pipes():
                print(pipe)
        

if __name__ == '__main__':
    new_game = Game()
    new_game.run()