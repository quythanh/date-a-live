class PhysicsRigBuilder {
  private _timeScale: number;
  private _target;
  private _physics3Json;

  constructor() {
    this._timeScale = 1;
  }
  setTarget = function (value) {
    this._target = value;
    return this;
  };
  setTimeScale = function (value) {
    this._timeScale = value;
    return this;
  };
  setPhysics3Json = function (value) {
    this._physics3Json = value;
    return this;
  };
  build = function () {
    return PhysicsRig._fromPhysics3Json(
      this._target,
      this._timeScale,
      this._physics3Json,
    );
  };
}
