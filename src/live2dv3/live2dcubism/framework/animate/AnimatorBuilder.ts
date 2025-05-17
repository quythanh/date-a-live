import type { AnimationBlender, CrossfadeWeighter } from "../type";
import AnimationLayer from "./AnimationLayer";
import Animator from "./Animator";
import BuiltinAnimationBlenders from "../builtin/BuiltinAnimationBlenders";
import BuiltinCrossfadeWeighters from "../builtin/BuiltinCrossfadeWeighters";

export default class AnimatorBuilder {
  private _timeScale: number;
  private _layerNames: string[];
  private _layerBlenders: AnimationBlender[];
  private _layerCrossfadeWeighters: CrossfadeWeighter[];
  private _layerWeights: number[];

  constructor() {
    this._timeScale = 1;
    this._layerNames = [];
    this._layerBlenders = [];
    this._layerCrossfadeWeighters = [];
    this._layerWeights = [];
  }

  setTarget(value) {
    this._target = value;
    return this;
  }

  setTimeScale(timeScale: number) {
    this._timeScale = timeScale;
    return this;
  }

  addLayer(name: string, blender: AnimationBlender = BuiltinAnimationBlenders.OVERRIDE, weight = 1) {
    this._layerNames.push(name);
    this._layerBlenders.push(blender);
    this._layerCrossfadeWeighters.push(BuiltinCrossfadeWeighters.LINEAR);
    this._layerWeights.push(weight);
    return this;
  }

  build() {
    const layers = new Map();
    for (let l = 0; l < this._layerNames.length; ++l) {
      const layer = new AnimationLayer(this._layerWeights[l], this._layerBlenders[l], this._layerCrossfadeWeighters[l]);
      layers.set(this._layerNames[l], layer);
    }
    return Animator._create(this._target, this._timeScale, layers);
  }
}
