import type { CrossfadeWeighter } from "../type";

const BuiltinCrossfadeWeighters: {
  [key: string]: CrossfadeWeighter
} = {
  LINEAR: (time: number, duration: number) => {
    return time / duration;
  }
}

export default BuiltinCrossfadeWeighters;
