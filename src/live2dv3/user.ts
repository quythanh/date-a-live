enum BackgroundType {
  normal = 0,
  kanban = 1
};

// opt
let modelName: string;
let folderName: string;

// misc
let selectedBgType: BackgroundType = BackgroundType.normal;
var currentBgIndex: number = 0; // reduce data consumption & optimization

// bruh
let favorPoint: number = 0;
let favorLevel: number = 1;

const Live2DViewer = {
  model: '',

  checkInView: (elem, partial) => {
    const container = $("#bgNormal");
    const contHeight = container.height();

    const elemTop = $(elem).offset().top - container.offset().top;
    const elemBottom = elemTop + $(elem).height();

    const isTotal = (elemTop >= 0 && elemBottom <= contHeight);
    const isPart = ((elemTop < 0 && elemBottom > 0) || (elemTop > 0 && elemTop <= container.height())) && partial;

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

  switchBgType: (type: BackgroundType, isAdd = false) => {
    const bg = JSON.parse(httpGet('assets/res/data/bg.json'));
    //to do without reload, faster loading
    selectedBgType = type;
    $('.bgCategory').removeClass('selected');
    $('.bgCategory').eq(selectedBgType).addClass('selected');

    if (selectedBgType == BackgroundType.normal) {
      if ($('#bgNormal').html() != "") {
        $('#bgNormal').css("display", "flex");
        $('#bgKanban').css("display", "none");
        return;
      }
      if(!isAdd) return;
      if (currentBgIndex >= Object.keys(bg.normal).length) return;

      // load more
      let n = currentBgIndex;
      currentBgIndex += 20;
      if (currentBgIndex >= Object.keys(bg.normal).length) {
        currentBgIndex = Object.keys(bg.normal).length;
      }

      // better approach
      const key = Object.keys(bg.normal);
      for (; n < currentBgIndex; n++) {
        const div = document.createElement('div');
        div.classList.add('l2dv3-thumb');
        div.style.content = `url("${key[n]}")`;
        div.setAttribute("data-url", key[n]);
        div.onclick = (e: Event) => {
          changeBackground((e.target as HTMLDivElement).getAttribute('data-url'), Live2DViewer.model);
          Live2DViewer.closeBgContainer();
        }
        if (n === currentBgIndex - 1 && n !== key.length - 1) {
          div.id = "scspy";
        }

        $('#bgNormal').append(div);
      }

      $('#bgNormal').css("display", "flex");
      $('#bgKanban').css("display", "none");
    } else if (selectedBgType == BackgroundType.kanban) {
      if ($('#bgKanban').html() != "") {
        $('#bgKanban').css("display", "flex");
        $('#bgNormal').css("display", "none");
        return;
      }
      for (const i in bg.kanban) {
        const div = document.createElement('div');
        div.classList.add('l2dv3-thumb');
        div.style.content = `url("${i}")`;
        div.setAttribute("data-url", i);
        div.onclick = (e: Event) => {
          changeBackground((e.target as HTMLDivElement).getAttribute('data-url'), Live2DViewer.model);
          Live2DViewer.closeBgContainer();
        }
        $('#bgKanban').append(div);
      }
      $('#bgKanban').css("display", "flex");
      $('#bgNormal').css("display", "none");
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

  bgLoader : () => {
    $(".bgSelectorContainer").first().addClass("in");
    setTimeout(() => {
      $(".bgSelectorContainer").first().css("display", "table");
    }, 500);
  },

  init: () => {
    const models = JSON.parse(httpGet('assets/res/data/live2dv3_models.json'));
    for (const i in models) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.innerHTML = models[i];
      $('#models').append(opt);
    }
    folderName = $("#models option:selected").val();
    modelName = folderName.replace(folderName.split('_')[2], 'new');

    // check _new first
    Live2DViewer.loadMotion(`assets/res/basic/modle/bust_kanban/${folderName}/${modelName}.model3.json`);

    // bg3
    Live2DViewer.switchBgType(selectedBgType, true);

    // pos
    $('#posx').val(window.innerWidth * 0.5);
    $('#posy').val(window.innerHeight * 0.5);

    $("#bgNormal").on("scroll", () => {
      if (!$("#scspy").length) return;
      if (Live2DViewer.checkInView('#scspy', true)) {
        $('#scspy').removeAttr('id');
        Live2DViewer.switchBgType(BackgroundType.normal, true);
      }
    });

    $('#models').on("change", () => {
      folderName = $("#models option:selected").val();
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
      const motionName = $("#motions option:selected").val();
      Live2DViewer.model.startAnimation(motionName, 'base');
    });

    $('#posx').on("change", (e) => {
      if (e.target.value == '') e.target.value = 0;
      changePosition(e.target.value, $('#posy').val(), Live2DViewer.model);
    });

    $('#posy').on("change", (e) => {
      if (e.target.value == '') e.target.value = 0;
      changePosition($('#posx').val(), e.target.value, Live2DViewer.model);
    });
  },

  initModel: () => {
    Live2DViewer.model = new l2dViewer({
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

window.onload = () => {
  Live2DViewer.init();
  Live2DViewer.initModel();
};
