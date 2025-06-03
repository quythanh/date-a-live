export default class PhysicsNormalizationTuple {
  public minimum: number;
  public maximum: number;
  public def: number;

  constructor(minimum: number, maximum: number, def: number) {
    this.minimum = minimum;
    this.maximum = maximum;
    this.def = def;
  }
}
