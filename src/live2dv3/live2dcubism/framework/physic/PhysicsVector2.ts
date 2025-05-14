class PhysicsVector2 {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static distance = (a: PhysicsVector2, b: PhysicsVector2) => Math.abs(a.subtract(b).length);

  static dot = (a: PhysicsVector2, b: PhysicsVector2) => a.x * b.x + a.y * b.y;

  get length() {
    return Math.sqrt(PhysicsVector2.dot(this, this));
  }

  add = (vector2: PhysicsVector2) => {
    return new PhysicsVector2(this.x + vector2.x, this.y + vector2.y);
  }

  subtract = (vector2: PhysicsVector2) => {
    return new PhysicsVector2(this.x - vector2.x, this.y - vector2.y);
  }

  multiply = (vector2: PhysicsVector2) => {
    return new PhysicsVector2(this.x * vector2.x, this.y * vector2.y);
  }

  multiplyByScalar = (scalar: number) => {
    return this.multiply(new PhysicsVector2(scalar, scalar));
  }

  divide = (vector2: PhysicsVector2) => {
    return new PhysicsVector2(this.x / vector2.x, this.y / vector2.y);
  }

  divideByScalar = (scalar: number) => {
    return this.divide(new PhysicsVector2(scalar, scalar));
  }

  rotateByRadians = (radians: number) => {
    const x = this.x * Math.cos(radians) - this.y * Math.sin(radians);
    const y = this.x * Math.sin(radians) + this.y * Math.cos(radians);
    return new PhysicsVector2(x, y);
  }

  normalize = () => {
    const length = this.length;
    const x = this.x / length;
    const y = this.y / length;
    return new PhysicsVector2(x, y);
  }

  static zero = new PhysicsVector2(0, 0);
}
