import { BLEND_MODES, Container, DRAW_MODES, Filter, Texture, type IDestroyOptions } from "pixi.js";
import type { Model as CoreModel } from "@hazart-pkg/live2d-core";

import type Animation from "../framework/animate/Animation";
import type Animator from "../framework/animate/Animator";
import CubismMesh from "./CubismMesh";
import MaskSpriteContainer from "./MaskSpriteContainer";
import type PhysicsRig from "../framework/physic/PhysicsRig";
import type Groups from "../framework/group/Groups";
import type UserData from "../framework/user/UserData";

export default class Model extends Container {
  public motions?: Map<string, Animation>;
  public inDrag?: boolean;

  private _coreModel: CoreModel;
  private _textures: Texture[];
  private _animator: Animator;
  private _physicsRig: PhysicsRig;
  private _userData: UserData | null;
  private _groups: Groups;
  private _meshes: CubismMesh[];
  private _maskSpriteContainer: MaskSpriteContainer;

  constructor(
    coreModel: CoreModel,
    textures: Texture[],
    animator: Animator,
    physicsRig: PhysicsRig,
    userData: UserData | null,
    groups: Groups
  ) {
    super();
    this._coreModel = coreModel;
    this._textures = textures;
    this._animator = animator;
    this._physicsRig = physicsRig;
    this._userData = userData;
    this._groups = groups;
    this._animator.groups = this._groups;
    this._meshes = [];

    if (this._coreModel == null) {
      return;
    }

    this._meshes = new Array(this._coreModel.drawables.ids.length);

    for (let m = 0; m < this._meshes.length; ++m) {
      // console.log(Object.prototype.toString.call(this._coreModel.drawables.vertexUvs[m]));
      //   --> [object Float32Array]
      //   => const uvs = [...this._coreModel.drawables.vertexUvs[m]] NOT WORK
      const uvs = this._coreModel.drawables.vertexUvs[m].slice();
      for (let v = 1; v < uvs.length; v += 2) {
        uvs[v] = 1 - uvs[v];
      }

      const mesh = new CubismMesh(
        textures[this._coreModel.drawables.textureIndices[m]],
        this._coreModel.drawables.vertexPositions[m],
        uvs,
        this._coreModel.drawables.indices[m],
        DRAW_MODES.TRIANGLES
      );

      mesh.name = this._coreModel.drawables.ids[m];
      mesh.scale.y *= -1;
      mesh.isCulling = !Live2DCubismCore.Utils.hasIsDoubleSidedBit(this._coreModel.drawables.constantFlags[m]);

      const flags = this._coreModel.drawables.constantFlags[m];
      const hasMask = this._coreModel.drawables.maskCounts[m] > 0;

      if (Live2DCubismCore.Utils.hasBlendAdditiveBit(flags)) {
        if (hasMask) {
          const addFilter = new Filter();
          addFilter.blendMode = BLEND_MODES.ADD;
          mesh.filters = [addFilter];
        } else {
          mesh.blendMode = BLEND_MODES.ADD;
        }
      } else if (Live2DCubismCore.Utils.hasBlendMultiplicativeBit(flags)) {
        if (hasMask) {
          const multiplyFilter = new Filter();
          multiplyFilter.blendMode = BLEND_MODES.MULTIPLY;
          mesh.filters = [multiplyFilter];
        } else {
          mesh.blendMode = BLEND_MODES.MULTIPLY;
        }
      }

      this._meshes[m] = mesh;
      this.addChild(mesh);
    }

    this._maskSpriteContainer = new MaskSpriteContainer(coreModel, this);
  }

  get parameters() {
    return this._coreModel.parameters;
  }

  get parts() {
    return this._coreModel.parts;
  }

  get drawables() {
    return this._coreModel.drawables;
  }

  get canvasinfo() {
    return this._coreModel.canvasinfo;
  }

  get textures() {
    return this._textures;
  }

  get animator() {
    return this._animator;
  }

  get userData() {
    return this._userData;
  }

  get meshes() {
    return this._meshes;
  }

  get masks() {
    return this._maskSpriteContainer;
  }

  get groups() {
    return this._groups;
  }

  update(delta: number) {
    const deltaTime = 0.016 * delta;
    this._animator.updateAndEvaluate(deltaTime);

    if (this._physicsRig) {
      this._physicsRig.updateAndEvaluate(deltaTime);
    }

    this._coreModel.update();
    let sort = false;

    for (let m = 0; m < this._meshes.length; ++m) {
      const mesh = this._meshes[m];
      mesh.alpha = this._coreModel.drawables.opacities[m];
      mesh.visible = Live2DCubismCore.Utils.hasIsVisibleBit(this._coreModel.drawables.dynamicFlags[m]);

      if (Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
        mesh.vertices = this._coreModel.drawables.vertexPositions[m];
        mesh.dirtyVertex = true;
      }

      if (Live2DCubismCore.Utils.hasRenderOrderDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
        sort = true;
      }
    }

    if (sort) {
      this.children.sort((a, b) => {
        const aIndex = this._meshes.indexOf(a);
        const bIndex = this._meshes.indexOf(b);
        const aRenderOrder = this._coreModel.drawables.renderOrders[aIndex];
        const bRenderOrder = this._coreModel.drawables.renderOrders[bIndex];
        return aRenderOrder - bRenderOrder;
      });
    }

    this._coreModel.drawables.resetDynamicFlags();
  }

  destroy(options?: IDestroyOptions | boolean) {
    if (this._coreModel !== null) {
      this._coreModel.release();
    }

    super.destroy(options);
    this.masks.destroy();

    this._meshes.forEach((m) => m.destroy());

    if (options === true) {
      this._textures.forEach((t) => t.destroy());
    }
  }

  getModelMeshById(id: string) {
    if (this._meshes == null) return null;
    return this._meshes.find(mesh => mesh.name === id) || null;
  }

  addParameterValueById(id: string, value: number) {
    const index = this._coreModel.parameters.ids.indexOf(id);
    if (index === -1) return;
    this._coreModel.parameters.values[index] += value;
  }
}
