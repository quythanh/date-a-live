import $ from 'jquery';
import Live2DViewer, { BackgroundType } from "./user";

window.onload = () => {
  Live2DViewer.init();
  Live2DViewer.initModel();
};

$("#btn-background-menu").on("click", () => {
  $(".bgSelectorContainer").first().addClass("in");
  setTimeout(() => {
    $(".bgSelectorContainer").first().css("display", "table");
  }, 500);
})

$("#bgSelectorCloseButton").on("click", () => {
  Live2DViewer.closeBgContainer();
})

$("#bgNormal").on("click", () => {
  Live2DViewer.switchBgType(BackgroundType.normal, true);
})

$("#bgKanban").on("click", () => {
  Live2DViewer.switchBgType(BackgroundType.kanban);
})
