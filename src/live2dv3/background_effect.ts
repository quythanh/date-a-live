import $ from 'jquery';
import { httpGet } from "../utility";
import { Assets } from "pixi.js";
import { Spine } from 'pixi-spine';
import type Live2dV3 from './Live2dV3';
//backup abyss diva, because it will throw an error if enable it
/*
pixi-spine.js:4717 Uncaught Error: Invalid timeline type for a bone: flipX (yu3)
"bust_11006_superKanban": {
"0": {
"path": "effect/dating/ui_superKanban_11006/meirenyubeijing",
"action": "animation"
}
},

//natsumi lucky queen .skel file, idk
"bust_11308_superKanban": {
"0": {
"path": "effect/dating/ui_superKanban_11308/effect_main_11308",
"action": "animation"
}
},
*/

/*
to do :
10511 layering
12302 layering
offset = {
y = 20,
x = 127,
},
path = "effect/dating/ui_superKanban_10808/main_effect_10808_renwu",
offset = {
y = -30,
x = 15,
},
path = "effect/dating/ui_superKanban_12202/effect_main_12202",
offset = {
y = 46,
x = -11,
},
path = "effect/dating/ui_superKanban_12504/junai_kanban",
action = "texiao_qian",
*/

type BackgroundEffectData = {
  url: string;
  state: string;
}

type BackgroundEffect = {
  list: {
    [bgName: string]: {
      x: number;
      y: number;
      scale: number;
    }
  },
  isLoaded: boolean;
  backgroundManager: (model: string, l2dViewer: Live2dV3) => void;
  addEffect: (data: BackgroundEffectData[], l2dViewer: Live2dV3) => void;
  addSetting: (l2dViewer: Live2dV3) => void;
  changePosX: (index: number, value: number, l2dViewer: Live2dV3) => void;
  changePosY: (index: number, value: number, l2dViewer: Live2dV3) => void;
  changeScale: (index: number, value: number, l2dViewer: Live2dV3) => void;
}

const charaEffect = JSON.parse(httpGet("assets/res/data/bgeffect.json"));

const bgEffect: BackgroundEffect = {
  list: {},
  isLoaded: false,

  backgroundManager: (model: string, l2dViewer: Live2dV3) => {
    bgEffect.list = {};
    bgEffect.isLoaded = false;

    if (charaEffect[model]) {
      const tempArr: BackgroundEffectData[] = [];
      for (const i in charaEffect[model]) {
        tempArr.push({
          url: `assets/res/basic/${charaEffect[model][i].path}.json`,
          state: charaEffect[model][i].action
        });
      }
      bgEffect.addEffect(tempArr, l2dViewer);
    } else {
      bgEffect.isLoaded = true;
    }
  },

  addEffect: (data: BackgroundEffectData[], l2dViewer: Live2dV3) => {
    (async () => {
      for (let i = 0; i < data.length; i++) {
        const { url, state } = data[i];
        const _spine = await Assets.load(url);
        const s = new Spine(_spine.spineData);

        // to do idk how to automaticly set based resolution, so i'll set this for by screen reso / 2
        s.scale.x = s.scale.y = 1;
        s.x = window.innerWidth / 2;
        s.y = window.innerHeight / 2;

        s.state.setAnimation(0, state, true);
        l2dViewer.app.stage.addChild(s);
        bgEffect.list[`bgEffect${i}`] = {
          x: s.x,
          y: s.y,
          scale: s.scale.x
        }
      }
      bgEffect.addSetting(l2dViewer);
    })();
  },

  addSetting: (l2dViewer: Live2dV3) => {
    $('#bg-effect').text('');
    let n = l2dViewer.app.stage.children.findIndex(c => c.constructor.name === "Spine");

    for (const i in bgEffect.list) {
      const div = document.createElement('div');
      div.classList.add('l2dv3-collapsible');

      const x = document.createElement('input');
      x.type = 'number';
      x.min = '0';
      x.value = bgEffect.list[i].x.toString();
      x.id = x.name = `${i}x`;

      const y = document.createElement('input');
      y.type = 'number';
      y.min = '0';
      y.value = bgEffect.list[i].y.toString();
      y.id = y.name = `${i}y`;

      const scale = document.createElement('input');
      scale.type = 'number';
      scale.min = '50';
      scale.value = (bgEffect.list[i].scale * 100).toString();
      scale.id = scale.name = `${i}scale`;

      //label
      const label1 = document.createElement('label');
      label1.htmlFor = x.name
      label1.textContent = 'X';
      const label2 = document.createElement('label');
      label2.htmlFor = y.name
      label2.textContent = 'Y';
      const label3 = document.createElement('label');
      label3.htmlFor = scale.name
      label3.textContent = 'Scale';

      //to do customization effect
      x.setAttribute('index', n.toString());
      y.setAttribute('index', n.toString());
      scale.setAttribute('index', n.toString());

      const __change = (
        fn: (index: number, value: number, l2dViewer: Live2dV3) => void
      ) => {
        return (e: Event) => {
          const el = e.target as HTMLInputElement;
          const index = Number.parseInt(el.getAttribute('index')!);
          const value = Number.parseInt(el.value);
          fn(index, value, l2dViewer);
        }
      }
      x.onchange = __change(bgEffect.changePosX);
      y.onchange = __change(bgEffect.changePosY);
      scale.onchange = __change(bgEffect.changeScale);

      //t
      let t = document.createElement('div');
      let t1 = document.createElement('div');
      let t2 = document.createElement('div');
      let mainButton = document.createElement('button');
      mainButton.classList.add('l2dv3-collapsible-main');
      mainButton.classList.add('customButton');
      mainButton.textContent = i;

      t.appendChild(x);
      t1.appendChild(y);
      t2.appendChild(scale);

      div.appendChild(label1);

      div.appendChild(t);
      div.appendChild(label2);

      div.appendChild(t1);
      div.appendChild(label3);

      div.appendChild(t2);
      $('#bg-effect').append(mainButton)
      $('#bg-effect').append(div);
      n++;
    }

    bgEffect.isLoaded = true;
    $('.l2dv3-collapsible-main').on("click", (e: JQuery.TriggeredEvent) => {
      const el = e.target as HTMLButtonElement;
      const content = el.nextElementSibling as HTMLDivElement;

      if (content.style.lineHeight !== "normal") {
        content.style.lineHeight = "normal";
        content.style.height = "150px";
      } else {
        content.style.lineHeight = '0';
        content.style.height = '0';
      }
    })
  },

  changePosX: (index: number, value: number, l2dViewer: Live2dV3) => {
    l2dViewer.app.stage.children[index].x = value;
  },

  changePosY: (index: number, value: number, l2dViewer: Live2dV3) => {
    l2dViewer.app.stage.children[index].y = value;
  },

  changeScale: (index: number, value: number, l2dViewer: Live2dV3) => {
    l2dViewer.app.stage.children[index].scale.x = value / 100;
    l2dViewer.app.stage.children[index].scale.y = value / 100;
  },
};

export default bgEffect;
