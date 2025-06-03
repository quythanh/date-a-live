import type PhysicsNormalizationTuple from "./PhysicsNormalizationTuple";

export default class PhysicsNormalizationOptions {
  public position: PhysicsNormalizationTuple;
  public angle: PhysicsNormalizationTuple;

	constructor(position: PhysicsNormalizationTuple, angle: PhysicsNormalizationTuple) {
		this.position = position;
		this.angle = angle;
	}
}
