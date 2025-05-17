import PhysicsRig from "./PhysicsRig";

export default class PhysicsRigBuilder {
  private _timeScale: number;
  private _target;
  private _physics3Json;

  constructor() {
    this._timeScale = 1;
  }

  setTarget(value) {
    this._target = value;
    return this;
  }

  setTimeScale(timeScale: number) {
    this._timeScale = timeScale;
    return this;
  }

  setPhysics3Json(value) {
    this._physics3Json = value;
  }

  build() {
    return PhysicsRig._fromPhysics3Json(
      this._target,
      this._timeScale,
      this._physics3Json,
    );
  };
}
