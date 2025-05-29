import $ from 'jquery';
import { Point } from "pixi.js";
import L2D from "./L2D";
import Live2dV3 from "./Live2dV3";
import { httpGet } from '../utility';

export enum BackgroundType {
  normal = 0,
  kanban = 1
};

type TLive2DViewer = {
  model: Live2dV3 | null;
  checkInView: (elQuerySelector: string, partial: boolean) => boolean;
  closeBgContainer: () => void;
  switchBgType: (type: BackgroundType, isAdd?: boolean) => void;
  loadMotion: (model: string) => void;
  init: () => void;
  initModel: () => void;
}

// opt
let modelName: string;
let folderName: string;

// misc
let selectedBgType: BackgroundType = BackgroundType.normal;
var currentBgIndex: number = 0; // reduce data consumption & optimization

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

  closeBgContainer: () => {
    $('.bgSelectorContainer').first().removeClass("in");
    $('.bgSelectorContainer').first().addClass("out");
    setTimeout(() => {
      $('.bgSelectorContainer').first().css("display", "none");
      $('.bgSelectorContainer').first().removeClass("out");
    }, 100);
  },

  switchBgType: (type: BackgroundType, isAdd: boolean = false) => {
    const bg = JSON.parse(httpGet('assets/res/data/bg.json'));
    //to do without reload, faster loading
    selectedBgType = type;
    $('.bgCategory').removeClass('selected');
    $('.bgCategory').eq(selectedBgType).addClass('selected');

    const __createBackgroundImg = (bgPath: string = "assets/res/basic/scene/bg/kanban/green.png") => {
      const img = document.createElement('img');
      img.classList.add('l2dv3-thumb');
      img.src = bgPath;
      img.onclick = () => {
        changeBackground(bgPath, Live2DViewer.model);
        Live2DViewer.closeBgContainer();
      }
      return img;
    }

    switch (selectedBgType) {
      case BackgroundType.normal:
        $('#bgNormalContainer').css("display", "flex");
        $('#bgKanbanContainer').css("display", "none");

        if (!isAdd) return;

        const keys = Object.keys(bg.normal);
        if (currentBgIndex === keys.length) return;

        // load more
        let n = currentBgIndex;
        currentBgIndex = Math.min(currentBgIndex + 15, keys.length);

        // better approach
        for (; n < currentBgIndex; n++) {
          const img = __createBackgroundImg(keys[n]);

          if (n === currentBgIndex - 1 && n !== keys.length - 1) {
            img.id = "scspy";
          }

          $('#bgNormalContainer').append(img);
        }
        break;

      case BackgroundType.kanban:
        if ($('#bgKanbanContainer').html() != "") {
          $('#bgKanbanContainer').css("display", "flex");
          $('#bgNormalContainer').css("display", "none");
          return;
        }
        for (const i in bg.kanban) {
          const img = __createBackgroundImg(i);
          $('#bgKanbanContainer').append(img);
        }
        $('#bgKanbanContainer').css("display", "flex");
        $('#bgNormalContainer').css("display", "none");
        break;
    }
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
    Live2DViewer.switchBgType(selectedBgType, true);

    // pos
    $('#posx').val(window.innerWidth * 0.5);
    $('#posy').val(window.innerHeight * 0.5);

    $("#bgNormalContainer").on("scroll", () => {
      if (!$("#scspy").length) return;
      if (Live2DViewer.checkInView('#scspy', true)) {
        $('#scspy').removeAttr('id');
        Live2DViewer.switchBgType(BackgroundType.normal, true);
      }
    });

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
          changeModel('assets/res/basic/modle/bust_kanban/', folderName, modelName, Live2DViewer.model, Live2DViewer.model.bg)
          Live2DViewer.loadMotion(url)
        }
      });
    });

    // onchange motions
    $('#motions').on("change", () => {
      if (Live2DViewer.model == null) {
        throw new Error("`model` hasn't been initialized.");
      }

      const motionName = $("#motions option:selected").val() as string;
      Live2DViewer.model.startAnimation(motionName, 'base');
    });

    const _onPosChange = (e: JQuery.ChangeEvent) => {
      if (Live2DViewer.model == null) {
        throw new Error("`model` hasn't been initialized.");
      }

      const el = $(e.target);
      if (el.val() == '') el.val(0);
      const x = Number.parseInt($('$posx').val() as string);
      const y = Number.parseInt($('#posy').val() as string);
      changePosition(x, y, Live2DViewer.model);
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
      mobileLimit: true
    });
  }
}

function changeModel(
  basePath: string,
  folderName: string,
  modelName: string,
  l2dViewer: Live2dV3,
  bg: string = 'assets/res/basic/scene/bg/kanban/green.png',
) {
  l2dViewer.modelName = modelName;
  l2dViewer.folderName = folderName;
  l2dViewer.model = null;
  const l2d = new L2D(basePath);
  l2dViewer.bg = bg;
  l2d.load(folderName, modelName, l2dViewer, bg);
};

function changeBackground(bgPath: string, l2dViewer: Live2dV3) {
  changeModel(l2dViewer.basePath, l2dViewer.folderName, l2dViewer.modelName, l2dViewer, bgPath);
};

function changePosition(x: number, y: number, l2dViewer: Live2dV3) {
  l2dViewer.model.position = new Point(x, y);
};

export default Live2DViewer;
