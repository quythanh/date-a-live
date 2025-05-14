class UserData {
  private _target;
  private _version: number;
  private _userDataCount;
  private _totalUserDataSize;
  private _userDataBodys: UserDataBody[];

  constructor(target, userData3Json) {
    this._target = target;

    if (!target) {
      return;
    }

    this._version = userData3Json.Version;
    this._userDataCount = userData3Json.Meta.UserDataCount;
    this._totalUserDataSize = userData3Json.Meta.TotalUserDataSize;

    if (userData3Json.UserData != null) {
      this._userDataBodys = userData3Json.UserData.map(
        (u) => new UserDataBody(u.Target, u.Id, u.Value),
      );
      console.assert(this._userDataBodys.length === this._userDataCount);
    }
  }

  static _fromUserData3Json(target, userData3Json) {
    const userdata = new UserData(target, userData3Json);
    return userdata._isValid ? userdata : null;
  }

  get _isValid() {
    return this._target != null;
  }

  get userDataCount() {
    return this._userDataBodys ? this._userDataCount : 0;
  }

  get totalUserDataSize() {
    return this._userDataBodys ? this._totalUserDataSize : 0;
  }

  get userDataBodys() {
    return this._userDataBodys || null;
  }

  isExistUserDataById(id_) {
    return this._userDataBodys
    ? this._userDataBodys.some((ud) => ud.id === id_)
    : false;
  }

  getUserDataValueById(id_) {
    if (this._userDataBodys) {
      const ud = this._userDataBodys.find((ud) => ud.id === id_);
      return ud ? ud.value : null;
    }
    return null;
  }

  getUserDataTargetById(id_) {
    if (this._userDataBodys) {
      const ud = this._userDataBodys.find((ud) => ud.id === id_);
      return ud ? ud.target : null;
    }
    return null;
  }

  getUserDataBodyById(id_) {
    if (this._userDataBodys) {
      return this._userDataBodys.find((ud) => ud.id === id_) || null;
    }
    return null;
  }
}
