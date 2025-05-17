import Physics from "./Physics";
import PhysicsFactorTuple from "./PhysicsFactorTuple";

export default class PhysicsInput {
  public targetId;
  public weight: number;
  public factor;
  public invert;

  constructor(targetId, weight: number, factor, invert) {
    this.targetId = targetId;
    this.weight = weight;
    this.factor = factor;
    this.invert = invert;
  }

  get normalizedWeight() {
    return Physics.clampScalar(this.weight / Physics.maximumWeight, 0, 1);
  }

  evaluateFactor(
    parameterValue,
    parameterMinimum,
    parameterMaximum,
    parameterDefault,
    normalization,
  ) {
    console.assert(parameterMaximum > parameterMinimum);
    const parameterMiddle = this.getMiddleValue(
      parameterMinimum,
      parameterMaximum,
    );
    let value = parameterValue - parameterMiddle;

    switch (Math.sign(value)) {
      case 1: {
        const parameterRange = parameterMaximum - parameterMiddle;
        if (parameterRange === 0) {
          value = normalization.angle.def;
        } else {
          const normalizationRange =
            normalization.angle.maximum - normalization.angle.def;
          if (normalizationRange === 0) {
            value = normalization.angle.maximum;
          } else {
            value *= Math.abs(normalizationRange / parameterRange);
            value += normalization.angle.def;
          }
        }
        break;
      }
      case -1: {
        const parameterRange = parameterMiddle - parameterMinimum;
        if (parameterRange === 0) {
          value = normalization.angle.def;
        } else {
          const normalizationRange =
            normalization.angle.def - normalization.angle.minimum;
          if (normalizationRange === 0) {
            value = normalization.angle.minimum;
          } else {
            value *= Math.abs(normalizationRange / parameterRange);
            value += normalization.angle.def;
          }
        }
        break;
      }
      case 0:
      value = normalization.angle.def;
      break;
    }

    const weight = this.weight / Physics.maximumWeight;
    value *= this.invert ? 1 : -1;
    return new PhysicsFactorTuple(
      value * this.factor.x * weight,
      value * this.factor.y * weight,
      value * this.factor.angle * weight,
    );
  }

  getRangeValue(min: number, max: number) {
    const maxValue = Math.max(min, max);
    const minValue = Math.min(min, max);
    return Math.abs(maxValue - minValue);
  }

  getMiddleValue(min: number, max: number) {
    const minValue = Math.min(min, max);
    return minValue + this.getRangeValue(min, max) / 2;
  }
}
