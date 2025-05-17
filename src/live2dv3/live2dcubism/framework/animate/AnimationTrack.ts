import AnimationPoint from "./AnimationPoint";
import AnimationSegment from "./AnimationSegment";

export default class AnimationTrack {
  public targetId: string;
  public points: AnimationPoint[];
  public segments: AnimationSegment[];

  constructor(targetId: string, points: AnimationPoint[], segments: AnimationSegment[]) {
    this.targetId = targetId;
    this.points = points;
    this.segments = segments;
  }

  evaluate(time: number) {
    const s = this.segments.findIndex((_, i) => {
      if (i === this.segments.length - 1) return true;
      return this.points[this.segments[i + 1].offset].time >= time;
    });

    return this.segments[s].evaluate(
      this.points,
      this.segments[s].offset,
      time,
    );
  }
}
