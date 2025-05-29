import type Animation from "./Animation";
import type { AnimationBlender, CrossfadeWeighter } from "../type";
import type Groups from "../group/Groups";

export default class AnimationLayer {
  public blend: AnimationBlender;
  public groups: Groups;
  public weight: number;
  public weightCrossfade: CrossfadeWeighter;

  private _animation: Animation | null;
  private _fadeDuration: number;
  private _fadeTime: number;
  private _goalAnimation: Animation | null;
  private _goalTime: number;
  private _play: boolean;
  private _time: number;


  constructor(weight: number, blend: AnimationBlender, weightCrossfade: CrossfadeWeighter) {
    this.weight = weight;
    this.blend = blend;
    this.weightCrossfade = weightCrossfade;
    this.groups = null;

    this._animation = null;
    this._goalAnimation = null;
    this._play = false;
    this._time = 0;
    this._goalTime = 0;
    this._fadeTime = 0;
    this._fadeDuration = 0;
  }

  get currentAnimation() {
    return this._animation;
  }

  get currentTime() {
    return this._time;
  }

  set currentTime(value: number) {
    this._time = value;
  }

  get isPlaying() {
    return this._play;
  }

  play(animation: Animation, fadeDuration: number = 0) {
    if (this._animation && fadeDuration > 0) {
      this._goalAnimation = animation;
      this._goalTime = 0;
      this._fadeTime = 0;
      this._fadeDuration = fadeDuration;
    } else {
      this._animation = animation;
      this.currentTime = 0;
      this._play = true;
    }
  }

  resume() {
    this._play = true;
  }

  pause() {
    this._play = false;
  }

  stop() {
    this._play = false;
    this.currentTime = 0;
  }

  _update(deltaTime: number) {
    if (!this._play) return;

    this._time += deltaTime;
    this._goalTime += deltaTime;
    this._fadeTime += deltaTime;

    // Loop setting
    if (this._animation) {
      const motionLoopInput = document.getElementById("mloop") as HTMLInputElement;
      this._animation.loop = motionLoopInput.checked ?? false;
    }

    if (!this._animation || (!this._animation.loop && this._time > this._animation.duration)) {
      this.stop();
      this._animation = null;
    }
  }

  _evaluate(target, stackFlags) {
    if (!this._animation) return;

    const weight = this.weight < 1 ? this.weight : 1;
    let animationWeight = this._goalAnimation
      ? weight * this.weightCrossfade(this._fadeTime, this._fadeDuration)
      : weight;

    this._animation.evaluate(
      this._time,
      animationWeight,
      this.blend,
      target,
      stackFlags,
      this.groups
    );

    if (this._goalAnimation) {
      animationWeight = 1 - weight * this.weightCrossfade(this._fadeTime, this._fadeDuration);
      this._goalAnimation.evaluate(
        this._goalTime,
        animationWeight,
        this.blend,
        target,
        stackFlags,
        this.groups
      );

      if (this._fadeTime > this._fadeDuration) {
        this._animation = this._goalAnimation;
        this._time = this._goalTime;
        this._goalAnimation = null;
      }
    }
  }
}
