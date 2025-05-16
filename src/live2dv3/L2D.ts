class L2D {
  public basePath: string;
  // public loader: Loader;
  public animatorBuilder: AnimatorBuilder;
  public timeScale: number;
  public models: { [key: string]: Model };
  public physicsRigBuilder: PhysicsRigBuilder;

  constructor(basePath) {
    this.basePath = basePath;
    // this.loader = new PIXI.Loader(this.basePath);
    this.animatorBuilder = new LIVE2DCUBISMFRAMEWORK.AnimatorBuilder();
    this.timeScale = 1;
    this.models = {};
  }

  setPhysics3Json(value) {
    if (!this.physicsRigBuilder) {
      this.physicsRigBuilder = new LIVE2DCUBISMFRAMEWORK.PhysicsRigBuilder();
    }
    this.physicsRigBuilder.setPhysics3Json(value);

    return this;
  }

  load(folder: string, name: string, v, bg = "assets/res/basic/scene/bg/kanban/green.png") {
    if (!this.models[name]) {
      const modelDir = `${folder}/`;
      const modelPath = `${name}.model3.json`;
      const textures = [];

      (async () => {
        const model3Obj = await PIXI.Assets.load(this.basePath + modelDir + modelPath);

        let groups = null;
        if (typeof model3Obj.Groups !== "undefined") {
          groups = LIVE2DCUBISMFRAMEWORK.Groups.fromModel3Json(model3Obj);
        }

        let moc = null;
        if (typeof model3Obj.FileReferences.Moc !== "undefined") {
          const _res = await fetch(this.basePath + modelDir + model3Obj.FileReferences.Moc);
          const mocData = await _res.arrayBuffer();
          moc = Live2DCubismCore.Moc.fromArrayBuffer(mocData);
        }

        if (typeof model3Obj.FileReferences.Textures !== "undefined") {
          for (const element of model3Obj.FileReferences.Textures) {
            const texture = await PIXI.Assets.load(this.basePath + modelDir + element)
            textures.push(texture);
          }
        }

        if (typeof model3Obj.FileReferences.Physics !== "undefined") {
          const physicData = await PIXI.Assets.load(this.basePath + modelDir + model3Obj.FileReferences.Physics);
          this.setPhysics3Json(physicData);
        }

        const motions = new Map();
        if (typeof model3Obj.FileReferences.Motions !== "undefined") {
          for (const group in model3Obj.FileReferences.Motions) {
            for (const element of model3Obj.FileReferences.Motions[group]) {
              const motionName = element.File.split("/")
                .pop()
                .split(".")
                .shift();

              const motion = await PIXI.Assets.load(this.basePath + modelDir + element.File);
              const animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(motion);
              motions.set(motionName, animation);
            }
          }
        }

        let model = null;
        const coreModel = Live2DCubismCore.Model.fromMoc(moc);
        if (coreModel == null) {
          return;
        }

        const animator = this.animatorBuilder
          .setTarget(coreModel)
          .setTimeScale(this.timeScale)
          .build();

        const physicsRig = this.physicsRigBuilder
          .setTarget(coreModel)
          .setTimeScale(this.timeScale)
          .build();

        const userData = null;

        model = LIVE2DCUBISMPIXI.Model._create(
          coreModel,
          textures,
          animator,
          physicsRig,
          userData,
          groups,
        );
        model.motions = motions;
        this.models[name] = model;

        v.changeCanvas(model, bg);
      })()
    } else {
      v.changeCanvas(this.models[name], bg);
    }
  }
}
