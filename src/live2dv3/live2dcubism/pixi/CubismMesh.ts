import type { DRAW_MODES, IArrayBuffer, Renderer, Texture } from "pixi.js";
import { SimpleMesh } from "pixi.js";

type SimpleMeshArg = [
  texture?: Texture,
  vertices?: IArrayBuffer,
  uvs?: IArrayBuffer,
  indices?: IArrayBuffer,
  drawmode?: DRAW_MODES
]

export default class CubismMesh extends SimpleMesh {
  public isCulling: boolean;
  public isMaskMesh: boolean;

  constructor(...args: SimpleMeshArg) {
    super(...args);
    this.isCulling = false;
    this.isMaskMesh = false;
  }

  _render(renderer: Renderer) {
    renderer.state.setFrontFace(this.isMaskMesh);
    renderer.state.setCullFace(this.isCulling);
    super._render(renderer);
    renderer.state.setFrontFace(false);
  }
}
