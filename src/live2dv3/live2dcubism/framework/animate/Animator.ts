import type { AnimationBlender } from "../type";
import AnimationLayer from "./AnimationLayer";
import BuiltinAnimationBlenders from "../builtin/BuiltinAnimationBlenders";
import BuiltinCrossfadeWeighters from "../builtin/BuiltinCrossfadeWeighters";

export default class Animator {
  public timeScale: number;
  public groups;

  private _target;
  private _layers: Map<string, AnimationLayer>;

  constructor(target, timeScale: number, layers: Map<string, AnimationLayer>) {
    this._target = target;
    this.timeScale = timeScale;
    this._layers = layers;
  }

  get target() {
    return this._target;
  }

  get isPlaying() {
    return this._layers.values().some((l) => l.isPlaying);
  }

  addLayer(name: string, blender: AnimationBlender = BuiltinAnimationBlenders.OVERRIDE, weight = 1) {
    const layer = new AnimationLayer(
      weight,
      blender,
      BuiltinCrossfadeWeighters.LINEAR,
    );
    layer.groups = this.groups;
    this._layers.set(name, layer);
  }

  getLayer(name: string) {
    return this._layers.has(name) ? this._layers.get(name) : null;
  }

  removeLayer(name: string) {
    return this._layers.has(name) ? this._layers.delete(name) : null;
  }

  clearLayers() {
    this._layers.clear();
  }

  updateAndEvaluate(deltaTime: number) {
    deltaTime *= this.timeScale > 0 ? this.timeScale : 0;

    if (deltaTime > 0.001) {
      for (const l of this._layers.values()) {
        l._update(deltaTime);
      }
    }
    const paramStackFlags = new Array(this._target.parameters.count).fill(
      false,
    );
    const partsStackFlags = new Array(this._target.parts.count).fill(false);
    const stackFlags = [paramStackFlags, partsStackFlags];

    for (const l of this._layers.values()) {
      l._evaluate(this._target, stackFlags);
    }
  }

  get isValid() {
    return this._target != null;
  }

  static _create(target, timeScale: number, layers: Map<string, AnimationLayer>) {
    const animator = new Animator(target, timeScale, layers);
    return animator.isValid ? animator : null;
  }
}
