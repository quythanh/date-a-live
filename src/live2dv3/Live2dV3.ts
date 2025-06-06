import $ from 'jquery';
import { Application, Point, Sprite } from "pixi.js";
import L2D from "./L2D";
import { httpGet, isDom } from "../utility";
import BuiltinAnimationBlenders from './live2dcubism/framework/builtin/BuiltinAnimationBlenders';
import bgEffect from './background_effect';
import Subtitle from './subtitle';
import type Model from './live2dcubism/pixi/Model';

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

// let favorPoint: number = 0;
let favorLevel: number = 1;

export default class Live2dV3 {
  public audio: HTMLAudioElement;
  public basePath: string;
  public bg: string;
  public modelName: string;
  public folderName: string;
  public app: Application;
  public model?: Model;

  private constructor({
    folderName,
    basePath,
    modelName,
    width = 500,
    height = 300,
    bg = "assets/res/basic/scene/bg/kanban/green.png",
    el
  }: Live2dV3Args) {
    this.audio = new Audio();
    this.basePath = basePath;
    this.bg = bg;
    this.folderName = folderName;
    this.modelName = modelName;

    L2D.load(this);

    this.app = new Application({
      width,
      height,
      backgroundAlpha: 0,
      powerPreference: "high-performance"
    });
    el.replaceWith(this.app.view);

    this.app.ticker.add((deltaTime) => {
      if (!this.model) return;

      this.model.update(deltaTime);
      this.model.masks.update(this.app.renderer);
    });

    window.onresize = () => {
      const _w = window.innerWidth;
      const _h = window.innerHeight;
      this.app.view.style!.width = `${_w}px`;
      this.app.view.style!.height = `${_h}px`;
      this.app.renderer.resize(_w, _h);

      if (this.model) {
        $("#posx").val(_w * 0.5);
        $("#posy").val(_h * 0.5);

        this.model.position = new Point(_w * 0.5, _h * 0.5);

        this.model.scale = new Point(_w * 0.5, _w * 0.5);
        this.model.masks.resize(_w, _h);
      }
    };

    let isClick = false;

    this.app.view.addEventListener!("mousedown", () => {
      isClick = true;
    });
    this.app.view.addEventListener!("mousemove", (event: Event) => {
      if (isClick) {
        isClick = false;
        if (this.model) {
          this.model.inDrag = true;
        }
      }

      if (this.model && event instanceof MouseEvent) {
        const mouseX = this.model.position.x - event.offsetX;
        const mouseY = this.model.position.y - event.offsetY;
        this.model.pointerX = -mouseX / this.app.view.height;
        this.model.pointerY = -mouseY / this.app.view.width;
      }
    });
    this.app.view.addEventListener!("mouseup", (event: Event) => {
      if (!this.model) return;

      if (isClick && event instanceof MouseEvent) {
        if (this.isHit("HitArea", event.offsetX, event.offsetY)) {
          if (this.model.motions.get(`id_favor${favorLevel}_${1}`))
          this.startAnimation(`id_favor${favorLevel}_${1}`, "base");
        } else if (this.isHit("HitArea2", event.offsetX, event.offsetY)) {
          if (this.model.motions.get(`id_favor${favorLevel}_${2}`))
          this.startAnimation(`id_favor${favorLevel}_${2}`, "base");
        } else if (this.isHit("HitArea3", event.offsetX, event.offsetY)) {
          if (this.model.motions.get(`id_favor${favorLevel}_${3}`))
          this.startAnimation(`id_favor${favorLevel}_${3}`, "base");
        }
      }

      isClick = false;
      this.model.inDrag = false;
    });
  }

  changeCanvas(model: Model, bg = "assets/res/basic/scene/bg/kanban/green.png") {
    this.app.stage.removeChildren();

    this.bg = bg;
    this.model = model;
    this.model.animator.addLayer(
      "base",
      BuiltinAnimationBlenders.OVERRIDE,
      1,
    );
    //background
    const foreground = Sprite.from(bg);
    const __scaleFg = (fg: Sprite) => {
      const ratio = Math.max(window.innerWidth / fg.width, window.innerHeight / fg.height);
      fg.width *= ratio;
      fg.height *= ratio;
    }

    if (foreground.height !== 1) __scaleFg(foreground);
    foreground.texture.baseTexture.on("loaded", () => {
      __scaleFg(foreground);
    });

    this.app.stage.addChild(foreground);

    bgEffect.backgroundManager(this.folderName, this);
    const waitBg = setInterval(() => {
      if (bgEffect.isLoaded) {
        clearInterval(waitBg);
        this.app.stage.addChild(this.model!);
        this.app.stage.addChild(this.model!.masks);
      }
    }, 500);

    window.dispatchEvent(new Event('resize'));
  }

  startAnimation(motionId: string, layerId: string) {
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
    const motions = JSON.parse(
      httpGet(
        `${this.basePath}/${this.folderName}/${this.modelName}.model3.json`,
      ),
    );

    for (const i in motions.FileReferences.Motions) {
      if (i.toLowerCase() === motionId) {
        if (motions.FileReferences.Motions[i][0].Sound) {
          const audioPath = `assets/res/basic/${motions.FileReferences.Motions[i][0].Sound}`;
          this.audio = new Audio(audioPath);
          this.audio.play();

          this.audio.addEventListener("canplay", () => {
            l.play(m);
          }, false);

          if (!Subtitle.isShow()) break;

          const lang = $("#language option:selected").val() as string;
          let subJson: string = '';
          try {
            subJson = httpGet(`assets/res/data/subtitle/${this.folderName}/${lang}.json`);
          } catch (e) {
            subJson = httpGet(`assets/res/data/subtitle/${this.folderName}/en.json`);
          } finally {
            const subtitle = JSON.parse(subJson);
            if (subtitle[motionId]) {
              Subtitle.setText(subtitle[motionId]);
              Subtitle.show();
              this.audio.onended = Subtitle.hide;
            }
          }
          break;
        }
        l.play(m);
      }
    }
  }

  isHit(id: string, posX: number, posY: number) {
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

      left = Math.min(x, left);
      right = Math.max(x, right);
      top = Math.min(y, top);
      bottom = Math.max(y, bottom);
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
