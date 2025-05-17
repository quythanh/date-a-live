import PhysicsVector2 from "./PhysicsVector2";

export default class PhysicsParticle {
  public initialPosition;
  public mobility;
  public delay;
  public acceleration;
  public radius;
  public position;
  public lastPosition;
  public lastGravity: PhysicsVector2;
  public force: PhysicsVector2;
  public velocity: PhysicsVector2;

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
