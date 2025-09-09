class Pipes:
    def __init__(self):
        self.pipe_list = []

    def add_pipe(self, pipe):
        self.pipe_list.append(pipe)

    def get_pipes(self):
        return self.pipe_list

class Pipe:
    def __init__(self, position, gap_size):
        self.position = position
        self.gap_size = gap_size

    def move(self, direction):
        self.position = (self.position[0] - direction[0], self.position[1] - direction[1])
    
    def __str__(self):
        return f"[PIPE] Position: {self.position}, Gap Size: {self.gap_size}"