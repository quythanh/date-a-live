class PhysicsParticle {
  constructor(initialPosition, mobility, delay, acceleration, radius) {
    this.initialPosition = initialPosition;
    this.mobility = mobility;
    this.delay = delay;
    this.acceleration = acceleration;
    this.radius = radius;
    this.position = initialPosition;
    this.lastPosition = this.position;
    this.lastGravity = new PhysicsVector2(0, -1);
    this.force = new PhysicsVector2(0, 0);
    this.velocity = new PhysicsVector2(0, 0);
  }
}
