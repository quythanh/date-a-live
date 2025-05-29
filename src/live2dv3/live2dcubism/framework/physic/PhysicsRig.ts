import type { Model } from "@hazart-pkg/live2d-core";
import type { PhysicObject } from "../../../../types";
import PhysicsFactorTuple from "./PhysicsFactorTuple";
import PhysicsInput from "./PhysicsInput";
import PhysicsNormalizationOptions from "./PhysicsNormalizationOptions";
import PhysicsNormalizationTuple from "./PhysicsNormalizationTuple";
import PhysicsOutput from "./PhysicsOutput";
import PhysicsParticle from "./PhysicsParticle";
import PhysicsSubRig from "./PhysicsSubRig";
import PhysicsVector2 from "./PhysicsVector2";

export default class PhysicsRig {
  public timeScale: number;

  private _target: Model;
  private _subRigs: PhysicsSubRig[];

  constructor(target: Model, timeScale: number, physics3Json: PhysicObject) {
    this.timeScale = timeScale || 1;
    this._target = target;
    this._subRigs = [];

    for (const r of physics3Json.PhysicsSettings) {
      const input = r.Input.map((i) => {
        const factor = new PhysicsFactorTuple(1, 0, 0);
        if (i.Type === "Y") {
          factor.x = 0;
          factor.y = 1;
        } else if (i.Type === "Angle") {
          factor.x = 0;
          factor.angle = 1;
        }
        return new PhysicsInput(i.Source.Id, i.Weight, factor, i.Reflect);
      });

      const output = r.Output.map((o) => {
        const factor = new PhysicsFactorTuple(1, 0, 0);
        if (o.Type === "Y") {
          factor.x = 0;
          factor.y = 1;
        } else if (o.Type === "Angle") {
          factor.x = 0;
          factor.angle = 1;
        }
        return new PhysicsOutput(
          o.Destination.Id,
          o.VertexIndex,
          o.Weight,
          o.Scale,
          factor,
          o.Reflect,
        );
      });

      const particles = r.Vertices.map((p) => {
        const initialPosition = new PhysicsVector2(p.Position.X, p.Position.Y);
        return new PhysicsParticle(
          initialPosition,
          p.Mobility,
          p.Delay,
          p.Acceleration,
          p.Radius,
        );
      });

      const jsonOptions = r.Normalization;
      const positionsOption = new PhysicsNormalizationTuple(
        jsonOptions.Position.Minimum,
        jsonOptions.Position.Maximum,
        jsonOptions.Position.Default,
      );
      const anglesOption = new PhysicsNormalizationTuple(
        jsonOptions.Angle.Minimum,
        jsonOptions.Angle.Maximum,
        jsonOptions.Angle.Default,
      );
      const normalization = new PhysicsNormalizationOptions(
        positionsOption,
        anglesOption,
      );

      this._subRigs.push(
        new PhysicsSubRig(input, output, particles, normalization),
      );
    }
  }

  updateAndEvaluate(deltaTime: number) {
    deltaTime *= this.timeScale > 0 ? this.timeScale : 0;

    if (deltaTime > 0.01) {
      for (const r of this._subRigs) {
        r._update(deltaTime, this._target);
      }
    }

    for (const r of this._subRigs) {
      r._evaluate(this._target);
    }
  }
}
