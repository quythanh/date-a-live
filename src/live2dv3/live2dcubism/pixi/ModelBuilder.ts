class ModelBuilder {
  private _textures;
  private _timeScale: number;
  private _animatorBuilder: AnimatorBuilder;
  private _moc;
  private _physicsRigBuilder: PhysicsRigBuilder;
  private _userDataBuilder: UserDataBuilder;
  private _groups;

  constructor() {
    this._textures = [];
    this._timeScale = 1;
    this._animatorBuilder = new LIVE2DCUBISMFRAMEWORK.AnimatorBuilder();
  }

  setMoc(value) {
    this._moc = value;
    return this;
  }

  setTimeScale(value) {
    this._timeScale = value;
    return this;
  }

  setPhysics3Json(value) {
    if (!this._physicsRigBuilder) {
      this._physicsRigBuilder = new LIVE2DCUBISMFRAMEWORK.PhysicsRigBuilder();
    }
    this._physicsRigBuilder.setPhysics3Json(value);
    return this;
  }

  setUserData3Json(value) {
    if (!this._userDataBuilder) {
      this._userDataBuilder = new LIVE2DCUBISMFRAMEWORK.UserDataBuilder();
    }
    this._userDataBuilder.setUserData3Json(value);
    return this;
  }

  addTexture(index, texture) {
    this._textures.splice(index, 0, texture);
    return this;
  }

  addAnimatorLayer(name, blender = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, weight = 1) {
    this._animatorBuilder.addLayer(name, blender, weight);
    return this;
  }

  addGroups(groups) {
    this._groups = groups;
    return this;
  }

  buildFromModel3Json(loader, model3Obj, callbackFunc) {
    const model3URL = model3Obj.url;
    const modelDir = model3URL.substring(0, model3URL.lastIndexOf('/') + 1);
    let textureCount = 0;

    if (model3Obj.data.FileReferences.Moc) {
      loader.add('moc', modelDir + model3Obj.data.FileReferences.Moc, {
        xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.BUFFER,
      });
    }

    if (model3Obj.data.FileReferences.Textures) {
      for (const element of model3Obj.data.FileReferences.Textures) {
        loader.add(`texture${textureCount}`, modelDir + element);
        textureCount++;
      }
    }

    if (model3Obj.data.FileReferences.Physics) {
      loader.add('physics', modelDir + model3Obj.data.FileReferences.Physics, {
        xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.JSON,
      });
    }

    if (model3Obj.data.FileReferences.UserData) {
      loader.add('userdata', modelDir + model3Obj.data.FileReferences.UserData, {
        xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.JSON,
      });
    }

    if (model3Obj.data.Groups) {
      this._groups = LIVE2DCUBISMFRAMEWORK.Groups.fromModel3Json(model3Obj.data);
    }

    loader.load((_, resources) => {
      if (resources.moc) {
        this.setMoc(Live2DCubismCore.Moc.fromArrayBuffer(resources.moc.data));
      }

      if (resources.texture0) {
        for (let i = 0; i < textureCount; i++) {
          this.addTexture(i, resources[`texture${i}`].texture);
        }
      }

      if (resources.physics) {
        this.setPhysics3Json(resources.physics.data);
      }

      if (resources.userdata) {
        this.setUserData3Json(resources.userdata.data);
      }

      const model = this.build();
      callbackFunc(model);
    });
  }

  build() {
    const coreModel = Live2DCubismCore.Model.fromMoc(this._moc);
    if (!coreModel) {
      return null;
    }

    const animator = this._animatorBuilder.setTarget(coreModel).setTimeScale(this._timeScale).build();
    let physicsRig = null;
    if (this._physicsRigBuilder) {
      physicsRig = this._physicsRigBuilder.setTarget(coreModel).setTimeScale(this._timeScale).build();
    }

    let userData = null;
    if (this._userDataBuilder) {
      userData = this._userDataBuilder.setTarget(coreModel).build();
    }

    return Model._create(coreModel, this._textures, animator, physicsRig, userData, this._groups);
  }
}
