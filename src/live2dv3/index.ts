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
