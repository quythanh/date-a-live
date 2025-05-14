class AnimationSegment {
  public offset: number;
  public evaluate: BuiltinAnimationSegmentEvaluators;

  constructor(offset: number, evaluate: BuiltinAnimationSegmentEvaluators) {
		this.offset = offset;
		this.evaluate = evaluate;
	}
}
