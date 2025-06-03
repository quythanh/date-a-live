import type { Model } from "@hazart-pkg/live2d-core";
import UserDataBody from "./UserDataBody";
import type { UserDataObject } from "../../../../types";

export default class UserData {
  private _target: Model;
  private _version: number;
  private _userDataCount: number;
  private _totalUserDataSize: number;
  private _userDataBodys: UserDataBody[];

  constructor(target: Model, userData3Json: UserDataObject) {
    this._target = target;
    this._version = userData3Json.Version;
    this._userDataCount = userData3Json.Meta.UserDataCount;
    this._totalUserDataSize = userData3Json.Meta.TotalUserDataSize;
    this._userDataBodys = [];

    console.log(this._target, this._version);

    if (userData3Json.UserData != null) {
      this._userDataBodys = userData3Json.UserData.map(
        (u) => new UserDataBody(u.Target, u.Id, u.Value),
      );
      console.assert(this._userDataBodys.length === this._userDataCount);
    }
  }

  static _fromUserData3Json(target: Model, userData3Json: UserDataObject) {
    return new UserData(target, userData3Json);
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

  isExistUserDataById(id_: string) {
    return this._userDataBodys
    ? this._userDataBodys.some((ud) => ud.id === id_)
    : false;
  }

  getUserDataValueById(id_: string) {
    if (this._userDataBodys) {
      const ud = this._userDataBodys.find((ud) => ud.id === id_);
      return ud ? ud.value : null;
    }
    return null;
  }

  getUserDataTargetById(id_: string) {
    if (this._userDataBodys) {
      const ud = this._userDataBodys.find((ud) => ud.id === id_);
      return ud ? ud.target : null;
    }
    return null;
  }

  getUserDataBodyById(id_: string) {
    if (this._userDataBodys) {
      return this._userDataBodys.find((ud) => ud.id === id_) || null;
    }
    return null;
  }
}
