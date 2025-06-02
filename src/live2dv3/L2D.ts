import { Assets, Texture } from "pixi.js";

import Animation from "./live2dcubism/framework/animate/Animation";
import Animator from "./live2dcubism/framework/animate/Animator";
import Groups from "./live2dcubism/framework/group/Groups";
import PhysicsRig from "./live2dcubism/framework/physic/PhysicsRig";
import Model from "./live2dcubism/pixi/Model";
import type Live2dV3 from "./Live2dV3";
import type { ModelObject, PhysicObject } from "../types";

export default class L2D {
  private static models: { [key: string]: Model } = {};

  private constructor() {}

  private static async loadResources(basePath: string, modelDir: string, modelPath: string) {
    const model3Obj = await Assets.load<ModelObject>(basePath + modelDir + modelPath);

    const _res = await fetch(basePath + modelDir + model3Obj.FileReferences.Moc);
    const mocData = await _res.arrayBuffer();
    const moc = Live2DCubismCore.Moc.fromArrayBuffer(mocData);

    const textures: Texture[] = [];
    for (const element of model3Obj.FileReferences.Textures) {
      const texture = await Assets.load<Texture>(basePath + modelDir + element);
      textures.push(texture);
    }

    const physicData = await Assets.load<PhysicObject>(basePath + modelDir + model3Obj.FileReferences.Physics);

    const motions: Map<string, Animation> = new Map();
    for (const group in model3Obj.FileReferences.Motions) {
      for (const element of model3Obj.FileReferences.Motions[group]) {
        const motionName = element.File.split("/")
          .pop()!
          .split(".")
          .shift()!;

        const motion = await Assets.load(basePath + modelDir + element.File);
        const animation = Animation.fromMotion3Json(motion)!;
        motions.set(motionName, animation);
      }
    }

    return { model3Obj, moc, textures, physicData, motions }
  }

  static load(
    v: Live2dV3,
    bg: string = "assets/res/basic/scene/bg/kanban/green.png",
    basePath?: string,
    folder?: string,
    name?: string,
  ) {
    basePath ??= v.basePath;
    folder ??= v.folderName;
    name ??= v.modelName;

    if (L2D.models[name]) {
      v.changeCanvas(L2D.models[name], bg);
      return;
    }

    const modelDir = `${folder}/`;
    const modelPath = `${name}.model3.json`;
    const timeScale = 1;

    (async () => {
      const { model3Obj, moc, textures, physicData, motions } = await L2D.loadResources(basePath, modelDir, modelPath);

      const coreModel = Live2DCubismCore.Model.fromMoc(moc);
      if (coreModel == null) {
        return;
      }

      const animator = new Animator(coreModel, timeScale);
      const physicsRig = new PhysicsRig(coreModel, timeScale, physicData);
      const groups = Groups.fromModel3Json(model3Obj);
      const userData = null;

      const model = new Model(coreModel, textures, animator, physicsRig, userData, groups);
      model.motions = motions;
      L2D.models[name] = model;

      v.changeCanvas(model, bg);
    })();
  }
}
