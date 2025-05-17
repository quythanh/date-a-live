import type { AnimationSegmentEvaluator } from '../type';

export default class AnimationSegment {
  public offset: number;
  public evaluate: AnimationSegmentEvaluator;

  constructor(offset: number, evaluate: AnimationSegmentEvaluator) {
    this.offset = offset;
    this.evaluate = evaluate;
  }
}
