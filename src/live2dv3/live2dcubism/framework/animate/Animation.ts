import AnimationPoint from "./AnimationPoint";
import AnimationSegment from "./AnimationSegment";
import AnimationTrack from "./AnimationTrack";
import AnimationUserDataBody from "./AnimationUserDataBody";
import BuiltinAnimationSegmentEvaluators from "../builtin/BuiltinAnimationSegmentEvaluators";
import type { AnimationBlender } from "../type";
import type { MotionObject } from "../../../../types";
import type Groups from "../group/Groups";
import type { Model } from "@hazart-pkg/live2d-core";

export default class Animation {
  public duration: number;
  public fps: number;
  public loop: boolean;
  public userDataCount: number;
  public totalUserDataSize: number;
  public modelTracks: AnimationTrack[];
  public parameterTracks: AnimationTrack[];
  public partOpacityTracks: AnimationTrack[];
  public userDataBodys: AnimationUserDataBody[];

  private _callbackFunctions: ((value: number) => any)[];
  private _lastTime: number;

  constructor(motion3Json: MotionObject) {
    this.modelTracks = [];
    this.parameterTracks = [];
    this.partOpacityTracks = [];
    this.userDataBodys = [];
    this.duration = motion3Json.Meta.Duration;
    this.fps = motion3Json.Meta.Fps;
    this.loop = motion3Json.Meta.Loop;
    this.userDataCount = motion3Json.Meta.UserDataCount;
    this.totalUserDataSize = motion3Json.Meta.TotalUserDataSize;
    this._callbackFunctions = [];
    this._lastTime = 0;

    if (motion3Json.UserData != null) {
      for (const u of motion3Json.UserData) {
        this.userDataBodys.push(new AnimationUserDataBody(u.Time, u.Value));
      }
      console.assert(this.userDataBodys.length === this.userDataCount);
    }

    for (const c of motion3Json.Curves) {
      const s = c.Segments;
      const points: AnimationPoint[] = [];
      const segments: AnimationSegment[] = [];
      points.push(new AnimationPoint(s[0], s[1]));

      for (let t = 2; t < s.length; t += 3) {
        const offset = points.length - 1;
        let evaluate = BuiltinAnimationSegmentEvaluators.LINEAR;
        const type = s[t];

        if (type === 1) {
          evaluate = BuiltinAnimationSegmentEvaluators.BEZIER;
          points.push(new AnimationPoint(s[t + 1], s[t + 2]));
          points.push(new AnimationPoint(s[t + 3], s[t + 4]));
          t += 4;
        } else if (type === 2) {
          evaluate = BuiltinAnimationSegmentEvaluators.STEPPED;
        } else if (type === 3) {
          evaluate = BuiltinAnimationSegmentEvaluators.INVERSE_STEPPED;
        }

        // console.log(type, evaluate)
        points.push(new AnimationPoint(s[t + 1], s[t + 2]));
        segments.push(new AnimationSegment(offset, evaluate));
      }

      const track = new AnimationTrack(c.Id, points, segments);
      if (c.Target === "Model") {
        this.modelTracks.push(track);
      } else if (c.Target === "Parameter") {
        this.parameterTracks.push(track);
      } else if (c.Target === "PartOpacity") {
        this.partOpacityTracks.push(track);
      }
    }
  }

  static fromMotion3Json(motion3Json: MotionObject) {
    return new Animation(motion3Json);
  }

  addAnimationCallback(callbackFunc: (value: number) => any) {
    this._callbackFunctions.push(callbackFunc);
  }

  removeAnimationCallback(callbackFunc: (value: number) => any) {
    const index = this._callbackFunctions.indexOf(callbackFunc);
    if (index >= 0) {
      this._callbackFunctions.splice(index, 1);
    }
  }

  clearAnimationCallback() {
    this._callbackFunctions = [];
  }

  callAnimationCallback(value: number) {
    if (this._callbackFunctions.length > 0) {
      for (const func of this._callbackFunctions) {
        func(value);
      }
    }
  }

  // Not sure type of blend
  evaluate(
    time: number,
    weight: number,
    blend: AnimationBlender,
    target: Model,
    stackFlags: boolean[][],
    groups: Groups | null = null
  ) {
    if (weight <= 0.01) return;

    if (this.loop) {
      while (time > this.duration) {
        time -= this.duration;
      }
    }

    for (const t of this.parameterTracks) {
      const p = target.parameters.ids.indexOf(t.targetId);
      if (p >= 0) {
        const sample = t.evaluate(time);
        if (!stackFlags[0][p]) {
          target.parameters.values[p] = target.parameters.defaultValues[p];
          stackFlags[0][p] = true;
        }
        target.parameters.values[p] = blend(
          target.parameters.values[p],
          sample,
          t.evaluate(0),
          weight,
        );
      }
    }

    for (const t of this.partOpacityTracks) {
      const p = target.parts.ids.indexOf(t.targetId);
      if (p >= 0) {
        const sample = t.evaluate(time);
        if (!stackFlags[1][p]) {
          target.parts.opacities[p] = 1;
          stackFlags[1][p] = true;
        }
        target.parts.opacities[p] = blend(
          target.parts.opacities[p],
          sample,
          t.evaluate(0),
          weight,
        );
      }
    }

    for (const t of this.modelTracks) {
      if (groups) {
        const g = groups.getGroupById(t.targetId);
        if (g && g.target === "Parameter") {
          for (const tid of g.ids) {
            const p = target.parameters.ids.indexOf(tid);
            if (p >= 0) {
              const sample = t.evaluate(time);
              if (!stackFlags[0][p]) {
                target.parameters.values[p] =
                  target.parameters.defaultValues[p];
                stackFlags[0][p] = true;
              }
              target.parameters.values[p] = blend(
                target.parameters.values[p],
                sample,
                t.evaluate(0),
                weight,
              );
            }
          }
        }
      }
    }

    if (this._callbackFunctions.length > 0) {
      for (const ud of this.userDataBodys) {
        if (
          this.isEventTriggered(ud.time, time, this._lastTime, this.duration)
        ) {
          this.callAnimationCallback(ud.value);
        }
      }
    }

    this._lastTime = time;
  }

  isEventTriggered(timeEvaluate: number, timeForward: number, timeBack: number, duration: number) {
    if (timeForward > timeBack) {
      return timeEvaluate > timeBack && timeEvaluate < timeForward;
    }
    return (
      (timeEvaluate > 0 && timeEvaluate < timeForward) ||
      (timeEvaluate > timeBack && timeEvaluate < duration)
    );
  }
}
