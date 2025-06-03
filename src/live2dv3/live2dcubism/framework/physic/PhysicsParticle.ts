import PhysicsVector2 from "./PhysicsVector2";

export default class PhysicsParticle {
  public initialPosition: PhysicsVector2;
  public mobility: number;
  public delay: number;
  public acceleration: number;
  public radius: number;
  public position: PhysicsVector2;
  public lastPosition: PhysicsVector2;
  public lastGravity: PhysicsVector2;
  public force: PhysicsVector2;
  public velocity: PhysicsVector2;

  constructor(
    initialPosition: PhysicsVector2,
    mobility: number,
    delay: number,
    acceleration: number,
    radius: number
  ) {
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
