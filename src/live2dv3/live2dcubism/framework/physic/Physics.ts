class Physics {
  static gravity = new PhysicsVector2(0, -1);
  static wind = new PhysicsVector2(0, 0);
  static maximumWeight = 100;
  static airResistance = 5;
  static movementThreshold = 0.001;
  static correctAngles = true;

  static clampScalar(scalar: number, lower: number, upper: number) {
    if (scalar < lower) {
      return lower;
    }
    if (scalar > upper) {
      return upper;
    }
    return scalar;
  }

  static directionToDegrees(from: PhysicsVector2, to: PhysicsVector2) {
    const radians = Physics.directionToRadians(from, to);
    const degrees = Physics.radiansToDegrees(radians);
    return to.x - from.x > 0 ? -degrees : degrees;
  }

  static radiansToDegrees(radians: number) {
    return (radians * 180) / Math.PI;
  }

  static radiansToDirection(radians: number) {
    return new PhysicsVector2(Math.sin(radians), Math.cos(radians));
  }

  static degreesToRadians(degrees: number) {
    return (degrees / 180) * Math.PI;
  }

  static directionToRadians(from: PhysicsVector2, to: PhysicsVector2) {
    const dot = PhysicsVector2.dot(from, to);
    const magnitude = from.length * to.length;
    if (magnitude === 0) {
      return 0;
    }
    const cosTheta = dot / magnitude;
    return Math.abs(cosTheta) <= 1.0 ? Math.acos(cosTheta) : 0;
  }
}
