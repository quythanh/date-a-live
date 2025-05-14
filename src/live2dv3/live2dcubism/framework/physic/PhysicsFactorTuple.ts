class PhysicsFactorTuple {
  public x: number;
  public y: number;
  public angle: number;

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  add(factor: PhysicsFactorTuple) {
    const x = this.x + factor.x;
    const y = this.y + factor.y;
    const angle = this.angle + factor.angle;
    return new PhysicsFactorTuple(x, y, angle);
  }
}
