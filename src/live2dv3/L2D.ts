class L2D {
  public basePath: string;
  public loader: Loader;
  public animatorBuilder: AnimatorBuilder;
  public timeScale: number;
  public models: { [key: string]: Model };
  public physicsRigBuilder: PhysicsRigBuilder;

  constructor(basePath) {
    this.basePath = basePath;
    this.loader = new PIXI.Loader(this.basePath);
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
      const modelNames: string[] = [];
      const motionNames: string[] = [];
      const textures = [];
      let textureCount = 0;

      // if (!modelNames.includes(name+'_model')){
      this.loader.add(`${name}_model`, modelDir + modelPath, {
        xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.JSON,
      });
      modelNames.push(`${name}_model`);
      // }

      this.loader.load((loader, resources) => {
        const model3Obj = resources[`${name}_model`].data;

        if (typeof model3Obj.FileReferences.Moc !== "undefined") {
          loader.add(`${name}_moc`, modelDir + model3Obj.FileReferences.Moc, {
            xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.BUFFER,
          });
        }

        if (typeof model3Obj.FileReferences.Textures !== "undefined") {
          for (const element of model3Obj.FileReferences.Textures) {
            loader.add(`${name}_texture${textureCount}`, modelDir + element);
            textureCount++;
          }
        }

        if (typeof model3Obj.FileReferences.Physics !== "undefined") {
          loader.add(
            `${name}_physics`,
            modelDir + model3Obj.FileReferences.Physics,
            {
              xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.JSON,
            },
          );
        }

        if (typeof model3Obj.FileReferences.Motions !== "undefined") {
          for (const group in model3Obj.FileReferences.Motions) {
            for (const element of model3Obj.FileReferences.Motions[group]) {
              const motionName = element.File.split("/")
                .pop()
                .split(".")
                .shift();
              if (!motionNames.includes(`${name}_${motionName}`)) {
                loader.add(`${name}_${motionName}`, modelDir + element.File, {
                  xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.JSON,
                });
                motionNames.push(`${name}_${motionName}`);
              } else {
                const n = `${name}_${motionName}${String(Date.now())}`;
                loader.add(n, modelDir + element.File, {
                  xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.JSON,
                });
                motionNames.push(`${name}_${motionName}`);
              }
            }
          }
        }

        let groups = null;
        if (typeof model3Obj.Groups !== "undefined") {
          groups = LIVE2DCUBISMFRAMEWORK.Groups.fromModel3Json(model3Obj);
        }

        loader.load((l, r) => {
          let moc = null;
          if (typeof r[`${name}_moc`] !== "undefined") {
            moc = Live2DCubismCore.Moc.fromArrayBuffer(r[`${name}_moc`].data);
          }

          if (typeof r[`${name}_texture${0}`] !== "undefined") {
            for (let i = 0; i < textureCount; i++) {
              textures.splice(i, 0, r[`${name}_texture${i}`].texture);
            }
          }

          if (typeof r[`${name}_physics`] !== "undefined") {
            this.setPhysics3Json(r[`${name}_physics`].data);
          }

          const motions = new Map();
          for (const element of motionNames) {
            const n = element.split(`${name}_`).pop();
            motions.set(
              n,
              LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(r[element].data),
            );
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
        });
      });
    } else {
      v.changeCanvas(this.models[name], bg);
    }
  }
}
