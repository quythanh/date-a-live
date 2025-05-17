import AnimationPoint from "./animate/AnimationPoint";

export type AnimationBlender = (source: number, destination: number, initial: number, weight: number) => number;
export type AnimationSegmentEvaluator = (points: AnimationPoint[], offset: number, time: number) => number;
export type CrossfadeWeighter = (time: number, duration: number) => number;
