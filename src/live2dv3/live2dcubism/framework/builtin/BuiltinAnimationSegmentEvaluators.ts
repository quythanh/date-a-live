const BuiltinAnimationSegmentEvaluators = {
  lerp: (a: AnimationPoint, b: AnimationPoint, t: number) => {
    return new AnimationPoint(a.time + (b.time - a.time) * t, a.value + (b.value - a.value) * t);
  },

  LINEAR: (points: AnimationPoint[], offset: number, time) => {
    const p0 = points[offset + 0];
    const p1 = points[offset + 1];
    const t = (time - p0.time) / (p1.time - p0.time);
    return p0.value + (p1.value - p0.value) * t;
  },

  BEZIER: (points: AnimationPoint[], offset: number, time: number) => {
    const t = (time - points[offset + 0].time) / (points[offset + 3].time - points[offset].time);
    const p01 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 0], points[offset + 1], t);
    const p12 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 1], points[offset + 2], t);
    const p23 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 2], points[offset + 3], t);
    const p012 = BuiltinAnimationSegmentEvaluators.lerp(p01, p12, t);
    const p123 = BuiltinAnimationSegmentEvaluators.lerp(p12, p23, t);
    return BuiltinAnimationSegmentEvaluators.lerp(p012, p123, t).value;
  },

  STEPPED: (points: AnimationPoint[], offset: number, _) => {
    return points[offset + 0].value;
  },

  INVERSE_STEPPED: (points: AniAnimationPoint[], offset: number, _) => {
    return points[offset + 1].value;
  },
}
