class PhysicsSubRig {
  public input;
	public output;
	public particles;
	public normalization;

	constructor(input, output, particles, normalization) {
		this.input = input;
		this.output = output;
		this.particles = particles;
		this.normalization = normalization;
	}

	_update(deltaTime: number, target) {
		const parameters = target.parameters;
		let factor = new PhysicsFactorTuple(0, 0, 0);

		for (const i of this.input) {
			const parameterIndex = parameters.ids.indexOf(i.targetId);
			if (parameterIndex === -1) return;

			factor = factor.add(
				i.evaluateFactor(
					parameters.values[parameterIndex],
					parameters.minimumValues[parameterIndex],
					parameters.maximumValues[parameterIndex],
					parameters.defaultValues[parameterIndex],
					this.normalization,
				),
			);
		}

		const a = Physics.degreesToRadians(-factor.angle);
		const xy = new PhysicsVector2(factor.x, factor.y).rotateByRadians(a);
		factor.x = xy.x;
		factor.y = xy.y;
		const factorRadians = a;
		const gravityDirection =
			Physics.radiansToDirection(factorRadians).normalize();

		this.particles.forEach((p, i) => {
			if (i === 0) {
				p.position = new PhysicsVector2(factor.x, factor.y);
				return;
			}
			p.force = gravityDirection
				.multiplyByScalar(p.acceleration)
				.add(Physics.wind);
			p.lastPosition = p.position;

			const delay = p.delay * deltaTime * 30;
			let direction = p.position.subtract(this.particles[i - 1].position);
			const distance = PhysicsVector2.distance(PhysicsVector2.zero, direction);
			const angle = Physics.directionToDegrees(p.lastGravity, gravityDirection);
			const radians = Physics.degreesToRadians(angle) / Physics.airResistance;
			direction = direction.rotateByRadians(radians).normalize();

			p.position = this.particles[i - 1].position.add(
				direction.multiplyByScalar(distance),
			);
			const velocity = p.velocity.multiplyByScalar(delay);
			const force = p.force.multiplyByScalar(delay).multiplyByScalar(delay);
			p.position = p.position.add(velocity).add(force);
			const newDirection = p.position
				.subtract(this.particles[i - 1].position)
				.normalize();

			p.position = this.particles[i - 1].position.add(
				newDirection.multiplyByScalar(p.radius),
			);
			if (Math.abs(p.position.x) < Physics.movementThreshold) {
				p.position.x = 0;
			}

			if (delay !== 0) {
				p.velocity = p.position
					.subtract(p.lastPosition)
					.divideByScalar(delay)
					.multiplyByScalar(p.mobility);
			} else {
				p.velocity = PhysicsVector2.zero;
			}

			p.force = PhysicsVector2.zero;
			p.lastGravity = gravityDirection;
		});
	}

	_evaluate(target) {
		const parameters = target.parameters;

		for (const o of this.output) {
			if (o.particleIndex < 1 || o.particleIndex >= this.particles.length)
				return;

			const parameterIndex = parameters.ids.indexOf(o.targetId);
			if (parameterIndex === -1) return;

			const translation = this.particles[o.particleIndex - 1].position.subtract(
				this.particles[o.particleIndex].position,
			);

			const value = Physics.clampScalar(
				o.evaluateValue(translation, this.particles),
				parameters.minimumValues[parameterIndex],
				parameters.maximumValues[parameterIndex],
			);

			const unclampedParameterValue =
				parameters.values[parameterIndex] * (1 - o.normalizedWeight) +
				value * o.normalizedWeight;

			parameters.values[parameterIndex] = Physics.clampScalar(
				unclampedParameterValue,
				parameters.minimumValues[parameterIndex],
				parameters.maximumValues[parameterIndex],
			);
		}
	}
}
