import { Container, DRAW_MODES, Filter, RenderTexture, Sprite, type IDestroyOptions } from "pixi.js";
import type { Model as CoreModel } from "@hazart-pkg/live2d-core";
import CubismMesh from "./CubismMesh";
import type Model from "./Model";

export default class MaskSpriteContainer extends Container {
  private _maskShaderVertSrc: string;
  private _maskShaderFragSrc: string;
  private _maskShader: Filter;
  private _maskMeshContainers: Container[];
  private _maskTextures: RenderTexture[];
  private _maskSprites: Sprite[];

  constructor(coreModel: CoreModel, pixiModel: Model) {
    super();
    this._maskShaderVertSrc = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform mat3 projectionMatrix;
      varying vec2 vTextureCoord;
      void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;
    this._maskShaderFragSrc = `
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      void main(void) {
        vec4 c = texture2D(uSampler, vTextureCoord);
        c.r = c.a;
        c.g = 0.0;
        c.b = 0.0;
        gl_FragColor = c;
      }
    `;
    this._maskShader = new Filter(this._maskShaderVertSrc.toString(), this._maskShaderFragSrc.toString());

    const _maskCounts = coreModel.drawables.maskCounts;
    const _maskRelationList = coreModel.drawables.masks;
    this._maskMeshContainers = [];
    this._maskTextures = [];
    this._maskSprites = [];

    for (let m = 0; m < pixiModel.meshes.length; ++m) {
      if (_maskCounts[m] > 0) {
        const newContainer = new Container();
        for (let n = 0; n < _maskRelationList[m].length; ++n) {
          const meshMaskID = coreModel.drawables.masks[m][n];
          const maskMesh = new CubismMesh(
            pixiModel.meshes[meshMaskID].texture,
            pixiModel.meshes[meshMaskID].vertices,
            pixiModel.meshes[meshMaskID].uvs,
            pixiModel.meshes[meshMaskID].indices,
            DRAW_MODES.TRIANGLES,
          );
          maskMesh.name = pixiModel.meshes[meshMaskID].name;
          maskMesh.transform = pixiModel.meshes[meshMaskID].transform;
          maskMesh.isCulling = pixiModel.meshes[meshMaskID].isCulling;
          maskMesh.isMaskMesh = true;
          maskMesh.filters = [this._maskShader];
          newContainer.addChild(maskMesh);
        }
        newContainer.transform = pixiModel.transform;
        this._maskMeshContainers.push(newContainer);
        const newTexture = RenderTexture.create({ width: 100, height: 100 });
        this._maskTextures.push(newTexture);
        const newSprite = new Sprite(newTexture);
        this._maskSprites.push(newSprite);
        this.addChild(newSprite);
        pixiModel.meshes[m].mask = newSprite;
      }
    }
  }

  get maskSprites() {
    return this._maskSprites;
  }

  get maskMeshes() {
    return this._maskMeshContainers;
  }

  destroy(options?: IDestroyOptions | boolean) {
    this._maskSprites.forEach((m) => m.destroy());
    this._maskTextures.forEach((m) => m.destroy());
    this._maskMeshContainers.forEach((m) => m.destroy());
    this._maskShader.destroy();
  }

  update(appRenderer) {
    for (let m = 0; m < this._maskSprites.length; ++m) {
      appRenderer.render(this._maskMeshContainers[m], this._maskTextures[m], true, null, false);
    }
  }

  resize(viewWidth: number, viewHeight: number) {
    for (let m = 0; m < this._maskTextures.length; ++m) {
      this._maskTextures[m].resize(viewWidth, viewHeight, false);
    }
  }
}
