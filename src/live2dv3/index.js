//custom modification
const changeModel = (
  basePath,
  folderName,
  modelName,
  l2dViewer,
  bg = 'assets/res/basic/scene/bg/kanban/green.png',
  x,
  y,
) => {
  x = x || l2dViewer.model.position.x;
  y = x || l2dViewer.model.position.y;
  l2dViewer.modelName = modelName;
  l2dViewer.folderName = folderName;
  l2dViewer.model = null;
  const l2d = new L2D(basePath);
  l2dViewer.bg = bg;
  l2d.load(folderName, modelName, l2dViewer, bg);
};

const changeBackground = (bgPath, l2dViewer) => {
  changeModel(l2dViewer.basePath, l2dViewer.folderName, l2dViewer.modelName, l2dViewer, bgPath);
};

const changePosition = (x, y, l2dViewer) => {
  l2dViewer.model.position = new PIXI.Point(x, y);
};

window.l2dViewer = function (options) {
  return new Live2dV3(options)
}

// (() => {
//   const VERSION = '1.2.2';
//   let _a;
//   if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
//     const args = [
//       `\n\n       %c %c %c \u2730 Live2dV3 ${VERSION} \u2730  %c  \n%c  https://github.com/HCLonely/Live2dV3  %c\n\n`,
//       'background: #ff66a5; padding:5px 0;',
//       'background: #ff66a5; padding:5px 0;',
//       'color: #ff66a5; background: #030307; padding:5px 0;',
//       'background: #ff66a5; padding:5px 0;',
//       'background: #ffc3dc; padding:5px 0;',
//       'background: #ff66a5; padding:5px 0;',
//     ];
//     (_a = window.console).log.apply(_a, args);
//   } else {
//     console.log(`Live2dV3 ${VERSION} - https://github.com/HCLonely/Live2dV3`);
//   }
// })();
