import $ from 'jquery';
import { Point } from "pixi.js";
import L2D from "./L2D";
import Live2dV3 from "./Live2dV3";
import { httpGet } from '../utility';
import BackgroundMenu from './background_menu';
import { BackgroundType } from './background_menu';

type TLive2DViewer = {
  model: Live2dV3 | null;
  checkInView: (elQuerySelector: string, partial: boolean) => boolean;
  loadMotion: (model: string) => void;
  init: () => void;
  initModel: () => void;
}

// opt
let modelName: string;
let folderName: string;

const Live2DViewer: TLive2DViewer = {
  model: null,

  checkInView: (elQuerySelector: string, partial: boolean) => {
    const container = $("#bgNormalContainer") as JQuery<HTMLDivElement>;
    const contHeight = container.height() ?? 0;

    const el = $(elQuerySelector) as JQuery<HTMLDivElement>;
    const elHeight = el.height() ?? 0;
    const elTop = el.offset()!.top - container.offset()!.top;
    const elBottom = elTop + elHeight;

    const isTotal = (elTop >= 0 && elBottom <= contHeight);
    const isPart = ((elTop < 0 && elBottom > 0) || (elTop > 0 && elTop <= contHeight)) && partial;

    return isTotal || isPart;
  },

  loadMotion: (model: string) => {
    $('#motions').text('');

    const motions = JSON.parse(httpGet(model)).FileReferences.Motions;
    for (const motion in motions) {
      const opt = document.createElement('option');
      opt.value = motion.toLowerCase();
      opt.innerHTML = motion;
      $('#motions').append(opt);
    }

    // select to idle
    $("#motions").val("idle").trigger("change");
  },

  init: () => {
    const models = JSON.parse(httpGet('assets/res/data/live2dv3_models.json'));
    for (const i in models) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.innerHTML = models[i];
      $('#models').append(opt);
    }
    folderName = $("#models option:selected").val() as string;
    modelName = folderName.replace(folderName.split('_')[2], 'new');

    // check _new first
    Live2DViewer.loadMotion(`assets/res/basic/modle/bust_kanban/${folderName}/${modelName}.model3.json`);

    // bg3
    BackgroundMenu.changeCategory(BackgroundType.normal);

    // pos
    $('#posx').val(window.innerWidth * 0.5);
    $('#posy').val(window.innerHeight * 0.5);

    $('#models').on("change", () => {
      folderName = $("#models option:selected").val() as string;
      modelName = folderName.replace(folderName.split('_')[2], 'new');

      let url = `assets/res/basic/modle/bust_kanban/${folderName}/${modelName}.model3.json`;
      $.ajax({
        url,
        type: 'HEAD',
        error: () => {
          modelName = modelName.replace("_new", "");
          url = `assets/res/basic/modle/bust_kanban/${folderName}/${modelName}.model3.json`;
        },
        complete: () => {
          changeModel(Live2DViewer.model!, Live2DViewer.model!.bg, 'assets/res/basic/modle/bust_kanban/', folderName, modelName)
          Live2DViewer.loadMotion(url)
        }
      });
    });

    // onchange motions
    $('#motions').on("change", () => {
      const motionName = $("#motions option:selected").val() as string;
      Live2DViewer.model!.startAnimation(motionName, 'base');
    });

    const _onPosChange = (e: JQuery.ChangeEvent) => {
      const el = $(e.target);
      if (el.val() == '') el.val(0);
      const x = Number.parseInt($('#posx').val() as string);
      const y = Number.parseInt($('#posy').val() as string);
      Live2DViewer.model!.model!.position = new Point(x, y);
    };

    $('#posx').on("change", _onPosChange);
    $('#posy').on("change", _onPosChange);
  },

  initModel: () => {
    Live2DViewer.model = Live2dV3.createInstance({
      el: $('#L2dCanvas'),
      basePath: 'assets/res/basic/modle/bust_kanban/',
      modelName,
      folderName,
      sizeLimit: false,
      width: window.innerWidth,
      height: window.innerHeight,
      mobileLimit: false
    });
  }
}

function changeModel(
  l2dViewer: Live2dV3,
  bg: string = 'assets/res/basic/scene/bg/kanban/green.png',
  basePath: string,
  folderName: string,
  modelName: string,
) {
  l2dViewer.modelName = modelName;
  l2dViewer.folderName = folderName;
  l2dViewer.model = undefined;
  L2D.load(l2dViewer, bg, basePath);
};

export default Live2DViewer;
