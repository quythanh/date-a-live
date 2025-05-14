class UserDataBuilder {
  setTarget = function (value) {
    this._target = value;
    return this;
  };
  setUserData3Json = function (value) {
    this._userData3Json = value;
    return value;
  };
  build = function () {
    return UserData._fromUserData3Json(this._target, this._userData3Json);
  };
}
