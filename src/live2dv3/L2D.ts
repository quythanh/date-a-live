import { Assets, Texture } from "pixi.js";

import Animation from "./live2dcubism/framework/animate/Animation";
import Animator from "./live2dcubism/framework/animate/Animator";
import Groups from "./live2dcubism/framework/group/Groups";
import PhysicsRig from "./live2dcubism/framework/physic/PhysicsRig";
import Model from "./live2dcubism/pixi/Model";
import type Live2dV3 from "./Live2dV3";
import type { ModelObject, PhysicObject } from "../types";

export default class L2D {
  public basePath: string;
  public timeScale: number;
  public models: { [key: string]: Model };

  constructor(basePath: string) {
    this.basePath = basePath;
    this.timeScale = 1;
    this.models = {};
  }

  load(folder: string, name: string, v: Live2dV3, bg: string = "assets/res/basic/scene/bg/kanban/green.png") {
    if (!this.models[name]) {
      const modelDir = `${folder}/`;
      const modelPath = `${name}.model3.json`;

      (async () => {
        const model3Obj = await Assets.load<ModelObject>(this.basePath + modelDir + modelPath);

        const groups = Groups.fromModel3Json(model3Obj);

        const _res = await fetch(this.basePath + modelDir + model3Obj.FileReferences.Moc);
        const mocData = await _res.arrayBuffer();
        const moc = Live2DCubismCore.Moc.fromArrayBuffer(mocData);

        const textures: Texture[] = [];
        for (const element of model3Obj.FileReferences.Textures) {
          const texture = await Assets.load<Texture>(this.basePath + modelDir + element);
          textures.push(texture);
        }

        const physicData = await Assets.load<PhysicObject>(this.basePath + modelDir + model3Obj.FileReferences.Physics);

        const motions: Map<string, Animation> = new Map();
        for (const group in model3Obj.FileReferences.Motions) {
          for (const element of model3Obj.FileReferences.Motions[group]) {
            const motionName = element.File.split("/")
              .pop()!
              .split(".")
              .shift()!;

            const motion = await Assets.load(this.basePath + modelDir + element.File);
            const animation = Animation.fromMotion3Json(motion)!;
            motions.set(motionName, animation);
          }
        }

        const coreModel = Live2DCubismCore.Model.fromMoc(moc);
        if (coreModel == null) {
          return;
        }

        const animator = new Animator(coreModel, this.timeScale);
        const physicsRig = new PhysicsRig(coreModel, this.timeScale, physicData);
        const userData = null;

        const model = new Model(coreModel, textures, animator, physicsRig, userData, groups);
        model.motions = motions;
        this.models[name] = model;

        v.changeCanvas(model, bg);
      })()
    } else {
      v.changeCanvas(this.models[name], bg);
    }
  }
}
