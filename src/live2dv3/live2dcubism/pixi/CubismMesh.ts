import { SimpleMesh } from "pixi.js";

export default class CubismMesh extends SimpleMesh {
  public isCulling: boolean;
  public isMaskMesh: boolean;

  constructor(...args) {
    super(...args);
    this.isCulling = false;
    this.isMaskMesh = false;
  }

  _render(renderer) {
    renderer.state.setFrontFace(this.isMaskMesh ? 1 : 0);
    renderer.state.setCullFace(this.isCulling ? 1 : 0);
    super._render(renderer);
    renderer.state.setFrontFace(0);
  }
}
