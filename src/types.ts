type ModelMotion = {
  File: string;
  Sound?: string;
  FadeInTime: number;
  FadeOutTime: number;
}

type ModelFileRef = {
  Moc: string;
  Textures: string[];
  Physics: string;
  Motions: {
    [motionId: string]: ModelMotion[]
  };
}

type ModelGroup = {
  Target: string;
  Name: string;
  Ids: string[];
}

type ModelHitArea = {
  Id: string;
  Name: string;
}

export type ModelObject = {
  Version: number;
  FileReferences: ModelFileRef;
  Groups: ModelGroup[];
  HitAreas: ModelHitArea[];
}

type PhysicsDictionary = ModelHitArea;

type PhysicsMeta = {
  PhysicsSettingCount: number;
  TotalInputCount: number;
  TotalOutputCount: number;
  VertexCount: number;
  EffectiveForces: any;
  PhysicsDictionary: PhysicsDictionary[];
}

type PhysicsInputSource = {
  Target: string;
  Id: string;
}
type PhysicsOutputDestination = PhysicsInputSource;

type PhysicsInput = {
  Source: PhysicsInputSource;
  Weight: number;
  Type: "X" | "Y" | "Angle";
  Reflect: boolean;
}

type PhysicsOutput = {
  Destination: PhysicsOutputDestination;
  VertexIndex: number;
  Scale: number;
  Weight: number;
  Type: "X" | "Y" | "Angle";
  Reflect: boolean;
}

type PhysicsPosition = {
  X: number;
  Y: number;
}

type PhysicsVertex = {
  Position: PhysicsPosition;
  Mobility: number;
  Delay: number;
  Acceleration: number;
  Radius: number;
};

type PhysicsNormalizationValue = {
  Default: number;
  Maximum: number;
  Minimum: number;
}

type PhysicsNormalization = {
  Position: PhysicsNormalizationValue;
  Angle: PhysicsNormalizationValue;
}

type PhysicsSetting = {
  Id: string;
  Input: PhysicsInput[];
  Output: PhysicsOutput[];
  Vertices: PhysicsVertex[];
  Normalization: PhysicsNormalization;
}

export type PhysicObject = {
  Version: number;
  Meta: PhysicsMeta;
  PhysicsSettings: PhysicsSetting[];
}
