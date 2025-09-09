class Player:
    def __init__(self):
        self.score = 0
        self.best_score = 0
        
        self.postition = (0, 0)
        self.velocity = (0, 0)
        self.acceleration = (0, 0)
    
    def update(self):
        self.velocity = (self.velocity[0] + self.acceleration[0], self.velocity[1] + self.acceleration[1])
        self.postition = (self.postition[0] + self.velocity[0], self.postition[1] + self.velocity[1])
    
    def jump(self, height=int):
        self.velocity = (self.velocity[0], self.velocity[1] - height)

    def __str__(self):
        return f"[PLAYER] Position: {self.postition}, Velocity: {self.velocity}, Acceleration: {self.acceleration}"
    
    