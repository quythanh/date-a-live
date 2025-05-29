import $ from 'jquery';
import { Application, Point, Sprite } from "pixi.js";
import L2D from "./L2D";
import { httpGet, isDom } from "../utility";
import BuiltinAnimationBlenders from './live2dcubism/framework/builtin/BuiltinAnimationBlenders';
import bgEffect from './background_effect';

type Live2dV3Args = {
  folderName: string;
  basePath: string;
  modelName: string;
  width: number;
  height: number;
  bg?: string;
  el: any;
  sizeLimit: boolean;
  mobileLimit: boolean;
}

let favorPoint: number = 0;
let favorLevel: number = 1;

export default class Live2dV3 {
  public l2d: L2D;
  public audio;
  public basePath: string;
  public bg;
  public modelName: string;
  public folderName: string;
  public canvas: HTMLDivElement;
  public app: Application;
  public model;
  public animator;
  public motions;
  public children;

  private _animator;
  private _coreModel;
  private _meshes;
  private _physicsRig;

  private constructor({
    folderName,
    basePath,
    modelName,
    width = 500,
    height = 300,
    bg = "assets/res/basic/scene/bg/kanban/green.png",
    el
  }: Live2dV3Args) {
    this.l2d = new L2D(basePath);
    this.audio = new Audio();
    this.basePath = basePath;
    this.bg = bg;
    this.folderName = folderName;
    this.modelName = modelName;
    this.l2d.load(folderName, modelName, this);

    this.app = new Application({
      width,
      height,
      transparent: true,
      powerPreference: "high-performance"
    });
    el.replaceWith(this.app.view);

    this.app.ticker.add((deltaTime) => {
      if (!this.model) {
        return;
      }

      this.model.update(deltaTime);
      this.model.masks.update(this.app.renderer);
    });

    window.onresize = () => {
      this.app.view.style!.width = `${width}px`;
      this.app.view.style!.height = `${height}px`;
      this.app.renderer.resize(width, height);

      if (this.model) {
        this.model.position = new Point(width * 0.5, height * 0.5);
        this.model.scale = new Point(
          this.model.position.x * 1,
          this.model.position.x * 1,
        );
        this.model.masks.resize(this.app.view.width, this.app.view.height);

        //modification date a live
        if ($("#posx").length) {
          this.model.position = new Point(
            Number.parseInt($("#posx").val() as string),
            Number.parseInt($("#posy").val() as string),
          );
        }
      }
    };

    let isClick = false;

    this.app.view.addEventListener("mousedown", () => {
      isClick = true;
    });
    this.app.view.addEventListener("mousemove", (event) => {
      if (isClick) {
        isClick = false;
        if (this.model) {
          this.model.inDrag = true;
        }
      }

      if (this.model) {
        const mouseX = this.model.position.x - event.offsetX;
        const mouseY = this.model.position.y - event.offsetY;
        this.model.pointerX = -mouseX / this.app.view.height;
        this.model.pointerY = -mouseY / this.app.view.width;
      }
    });
    this.app.view.addEventListener("mouseup", (event: MouseEvent) => {
      if (!this.model) return;

      if (isClick) {
        //dal model
        if (this.isHit("HitArea", event.offsetX, event.offsetY)) {
          console.log("head");
          if (this.model.motions.get(`id_favor${favorLevel}_${1}`))
          this.startAnimation(`id_favor${favorLevel}_${1}`, "base");
        } else if (this.isHit("HitArea2", event.offsetX, event.offsetY)) {
          console.log("pai");
          if (this.model.motions.get(`id_favor${favorLevel}_${2}`))
          this.startAnimation(`id_favor${favorLevel}_${2}`, "base");
        } else if (this.isHit("HitArea3", event.offsetX, event.offsetY)) {
          console.log("idk");
          if (this.model.motions.get(`id_favor${favorLevel}_${3}`))
          this.startAnimation(`id_favor${favorLevel}_${3}`, "base");
        }
      }

      isClick = false;
      this.model.inDrag = false;
    });
  }

  changeCanvas(model, bg = "assets/res/basic/scene/bg/kanban/green.png") {
    this.app.stage.removeChildren();

    this.model = model;
    this.model.update = this._onUpdate;
    this.model.animator.addLayer(
      "base",
      BuiltinAnimationBlenders.OVERRIDE,
      1,
    );
    //background
    const foreground = Sprite.from(bg);
    //calculator
    if (foreground.height !== 1) {
      let hRatio = foreground.height / window.innerHeight;
      let wRatio = foreground.width / window.innerWidth;
      let ratio;
      if (hRatio >= 1 && wRatio >= 1) {
        //too high, so we scale downn
        hRatio = 1 / hRatio;
        wRatio = 1 / wRatio;
        ratio = hRatio >= wRatio ? hRatio : wRatio;
      } else {
        if (hRatio >= 1) {
          ratio = 1 / wRatio;
        } else if (wRatio >= 1) {
          ratio = 1 / hRatio;
        } else {
          //lower, ex 0.8 and 0.9
          // lek ben 1, 1 = 0.8 * x, x=1/0.8
          hRatio = 1 / hRatio;
          wRatio = 1 / wRatio;
          ratio = hRatio >= wRatio ? hRatio : wRatio;
        }
      }
      foreground.width *= ratio;
      foreground.height *= ratio;
    }
    foreground.texture.baseTexture.on("loaded", () => {
      let hRatio = foreground.height / window.innerHeight;
      let wRatio = foreground.width / window.innerWidth;
      let ratio;
      if (hRatio >= 1 && wRatio >= 1) {
        //too high, so we scale downn
        hRatio = 1 / hRatio;
        wRatio = 1 / wRatio;
        ratio = hRatio >= wRatio ? hRatio : wRatio;
      } else {
        if (hRatio >= 1) {
          //upsize w
          ratio = 1 / wRatio;
        } else if (wRatio >= 1) {
          //upsize h
          ratio = 1 / hRatio;
        } else {
          //lower, ex 0.8 and 0.9
          // lek ben 1, 1 = 0.8 * x, x=1/0.8
          hRatio = 1 / hRatio;
          wRatio = 1 / wRatio;
          ratio = hRatio >= wRatio ? hRatio : wRatio;
        }
      }
      foreground.width *= ratio;
      foreground.height *= ratio;
    });
    this.app.stage.addChild(foreground);
    bgEffect.backgroundManager(this.folderName, this);
    const waitBg = setInterval(() => {
      if (bgEffect.isLoaded) {
        clearInterval(waitBg);
        this.app.stage.addChild(this.model);
        this.app.stage.addChild(this.model.masks);
      }
    }, 500);

    window.dispatchEvent(new Event('resize'));
  }

  private _onUpdate(delta: number) {
    const deltaTime = 0.016 * delta;

    if (!this.animator.isPlaying) {
      const m = this.motions.get("idle");
      this.animator.getLayer("base").play(m);
    }
    this._animator.updateAndEvaluate(deltaTime);

    if (this.inDrag) {
      this.addParameterValueById("ParamAngleX", this.pointerX * 30);
      this.addParameterValueById("ParamAngleY", -this.pointerY * 30);
      this.addParameterValueById("ParamBodyAngleX", this.pointerX * 10);
      this.addParameterValueById("ParamBodyAngleY", -this.pointerY * 10);
      this.addParameterValueById("ParamEyeBallX", this.pointerX);
      this.addParameterValueById("ParamEyeBallY", -this.pointerY);
    }

    if (this._physicsRig) {
      this._physicsRig.updateAndEvaluate(deltaTime);
    }

    this._coreModel.update();

    let sort = false;
    for (let m = 0; m < this._meshes.length; ++m) {
      this._meshes[m].alpha = this._coreModel.drawables.opacities[m];
      this._meshes[m].visible = Live2DCubismCore.Utils.hasIsVisibleBit(
        this._coreModel.drawables.dynamicFlags[m],
      );
      if (
        Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit(
          this._coreModel.drawables.dynamicFlags[m],
        )
      ) {
        this._meshes[m].vertices = this._coreModel.drawables.vertexPositions[m];
        this._meshes[m].dirtyVertex = true;
      }
      if (
        Live2DCubismCore.Utils.hasRenderOrderDidChangeBit(
          this._coreModel.drawables.dynamicFlags[m],
        )
      ) {
        sort = true;
      }
    }

    if (sort) {
      this.children.sort((a, b) => {
        const aIndex = this._meshes.indexOf(a);
        const bIndex = this._meshes.indexOf(b);
        const aRenderOrder = this._coreModel.drawables.renderOrders[aIndex];
        const bRenderOrder = this._coreModel.drawables.renderOrders[bIndex];

        return aRenderOrder - bRenderOrder;
      });
    }

    this._coreModel.drawables.resetDynamicFlags();
  }

  startAnimation(motionId: string, layerId) {
    if (!this.model) {
      return;
    }

    const m = this.model.motions.get(motionId);
    if (!m) {
      return;
    }

    const l = this.model.animator.getLayer(layerId);
    if (!l) {
      return;
    }

    if (this.audio) this.audio.pause();
    const mmotions = JSON.parse(
      httpGet(
        `${this.basePath}/${this.folderName}/${this.modelName}.model3.json`,
      ),
    );

    for (const i in mmotions.FileReferences.Motions) {
      if (i.toLowerCase() === motionId) {
        if (mmotions.FileReferences.Motions[i][0].Sound) {
          const audioPath = `assets/res/basic/${mmotions.FileReferences.Motions[i][0].Sound}`;
          this.audio = new Audio(audioPath);
          this.audio.play();

          this.audio.addEventListener("canplay", () => {
            l.play(m);
          }, false);

          if (!$("#show-subtitle").is(':checked')) break;
          const subtitleJSON = JSON.parse(httpGet("assets/res/data/subtitle.json"));
          if (subtitleJSON[this.folderName]) {
            if (subtitleJSON[this.folderName][motionId]) {
              const subtitleElement = $(".subtitle").first();
              subtitleElement.text(subtitleJSON[this.folderName][motionId]);
              subtitleElement.addClass("in");

              setTimeout(() => {
                subtitleElement.css("display", "block");
              }, 500);

              this.audio.onended = () => {
                subtitleElement.removeClass("in");
                subtitleElement.addClass("out");

                setTimeout(() => {
                  subtitleElement.css("display", "none");
                  subtitleElement.removeClass("out");
                }, 500);
              };
            }
          }
          break;
        }
        l.play(m);
      }
    }
  }

  isHit(id, posX: number, posY: number) {
    if (!this.model) return false;

    const m = this.model.getModelMeshById(id);
    if (!m) return false;

    const vertexOffset = 0;
    const vertexStep = 2;
    const vertices = m.vertices;

    let left = vertices[0];
    let right = vertices[0];
    let top = vertices[1];
    let bottom = vertices[1];

    for (let i = 1; i < 4; ++i) {
      const x = vertices[vertexOffset + i * vertexStep];
      const y = vertices[vertexOffset + i * vertexStep + 1];

      if (x < left) {
        left = x;
      }
      if (x > right) {
        right = x;
      }
      if (y < top) {
        top = y;
      }
      if (y > bottom) {
        bottom = y;
      }
    }

    const mouseX = m.worldTransform.tx - posX;
    const mouseY = m.worldTransform.ty - posY;
    const tx = -mouseX / m.worldTransform.a;
    const ty = -mouseY / m.worldTransform.d;

    return left <= tx && tx <= right && top <= ty && ty <= bottom;
  }

  static createInstance(args: Live2dV3Args) {
    if (typeof Live2DCubismCore === "undefined") {
      throw new Error(
        `live2dv3 failed to load:
        Missing live2dcubismcore.js
        Please add "https://cdn.jsdelivr.net/gh/HCLonely/Live2dV3/js/live2dcubismcore.min.js" to the "<script>" tag.
        Look at https://github.com/HCLonely/Live2dV3`
      );
    }

    const { width, height, sizeLimit, mobileLimit } = args;
    let el = args.el;

    if (!el) {
      throw new Error("`el` parameter is required");
    }

    if (!isDom(el)) {
      if (el.length === 0) {
        throw new Error(`live2dv3 failed to load: ${el} is not a HTMLElement object`);
      }

      if (!isDom(el[0])) {
        throw new Error(`live2dv3 failed to load: ${el[0]} is not a HTMLElement object`);
      }

      el = el[0];
    }

    if (
      sizeLimit &&
      (document.documentElement.clientWidth < width ||
        document.documentElement.clientHeight < height)
    ) {
      throw new Error("The current viewport size does not meet the minimum requirements for this application.")
      // throw new Error(`Minimum screen size required is ${width}x${height}px. Please resize your window to continue.`);
    }

    if (
      mobileLimit &&
      /Mobile|Mac OS|Android|iPhone|iPad/i.test(navigator.userAgent)
    ) {
      throw new Error("Mobile devices are currently not supported. Please use a desktop device.");
    }

    return new Live2dV3({...args, el});
  }
}
