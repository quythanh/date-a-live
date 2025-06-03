import Physics from "./Physics";
import type PhysicsFactorTuple from "./PhysicsFactorTuple";
import type PhysicsParticle from "./PhysicsParticle";
import type PhysicsVector2 from "./PhysicsVector2";

export default class PhysicsOutput {
  public targetId: string;
  public particleIndex: number;
  public weight: number;
  public factor: PhysicsFactorTuple;
  public invert: boolean;

  constructor(
    targetId: string,
    particleIndex: number,
    weight: number,
    angleScale: number,
    factor: PhysicsFactorTuple,
    invert: boolean
  ) {
    this.targetId = targetId;
    this.particleIndex = particleIndex;
    this.weight = weight;
    this.factor = factor;
    this.invert = invert;
    this.factor.angle *= angleScale;
  }

  get normalizedWeight() {
    return Physics.clampScalar(this.weight / Physics.maximumWeight, 0, 1);
  }

  evaluateValue(translation: PhysicsVector2, particles: PhysicsParticle[]) {
    let value = translation.x * this.factor.x + translation.y * this.factor.y;

    if (this.factor.angle > 0) {
      let parentGravity = Physics.gravity;

      if (Physics.correctAngles && this.particleIndex > 1) {
        parentGravity = particles[this.particleIndex - 2].position.subtract(
          particles[this.particleIndex - 1].position,
        );
      }

      const angleResult = Physics.directionToRadians(parentGravity, translation);
      value += (translation.x - parentGravity.x > 0 ? -angleResult : angleResult) * this.factor.angle;
    }

    value *= this.invert ? -1 : 1;
    return value;
  }
}
