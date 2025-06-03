import type { Model } from "@hazart-pkg/live2d-core";
import UserData from "./UserData";
import type { UserDataObject } from "../../../../types";

export default class UserDataBuilder {
  private _target?: Model;
  private _userData3Json?: UserDataObject;

  setTarget(value: Model) {
    this._target = value;
    return this;
  }

  setUserData3Json(value: UserDataObject) {
    this._userData3Json = value;
    return value;
  }

  build() {
    if (this._target === undefined) {
      throw new Error("`target` hasn't been set.");
    }

    if (this._userData3Json === undefined) {
      throw new Error("`userData3Json` hasn't been set.");
    }

    return UserData._fromUserData3Json(this._target, this._userData3Json);
  }
}
