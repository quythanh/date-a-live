class UserDataBuilder {
  private _target;
  private _userData3Json;

  setTarget(value) {
    this._target = value;
    return this;
  };
  setUserData3Json(value) {
    this._userData3Json = value;
    return value;
  };
  build() {
    return UserData._fromUserData3Json(this._target, this._userData3Json);
  };
}
