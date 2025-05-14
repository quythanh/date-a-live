class AnimationTrack {
  public targetId: string;
  public points: AnimationPoint[];
  public segments: AnimationSegment[];

  constructor(targetId: string, points: AnimationPoint[], segments: AnimationSegment[]) {
		this.targetId = targetId;
		this.points = points;
		this.segments = segments;
	}

	evaluate(time: number) {
		let s = 0;
		const lastS = this.segments.length - 1;
		for (; s < lastS; ++s) {
			if (this.points[this.segments[s + 1].offset].time < time) {
				continue;
			}
			break;
		}
		return this.segments[s].evaluate(
			this.points,
			this.segments[s].offset,
			time,
		);
	}
}
