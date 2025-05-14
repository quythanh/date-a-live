class Groups {
  private _groupBodys: GroupBody[] | null;

  constructor(model3Json) {
    if (typeof model3Json.Groups !== 'undefined') {
      this._groupBodys = model3Json.Groups.map((u) => new GroupBody(u.Target, u.Name, u.Ids));
    } else {
      this._groupBodys = null;
    }
  }

  get data() {
    return this._groupBodys || null;
  }

  static fromModel3Json(model3Json) {
    return new Groups(model3Json);
  }

  getGroupById(targetId) {
    if (this._groupBodys) {
      return this._groupBodys.find((body) => body.name === targetId) || null;
    }
    return null;
  }
}
