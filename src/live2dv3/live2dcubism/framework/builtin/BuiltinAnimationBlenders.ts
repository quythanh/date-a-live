const BuiltinAnimationBlenders = {
  OVERRIDE: (source: number, destination: number, _, weight: number) => {
    return destination * weight + source * (1 - weight);
  },
  ADD: (source: number, destination: number, initial: number, weight: number) => {
    return source + (destination - initial) * weight;
  },
  MULTIPLY: (source: number, destination: number, weight: number) => {
    return source * (1 + (destination - 1) * weight);
  }
}
