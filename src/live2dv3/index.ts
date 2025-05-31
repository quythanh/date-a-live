import $ from 'jquery';
import Live2DViewer, { BackgroundType } from "./user";

window.onload = () => {
  Live2DViewer.init();
  Live2DViewer.initModel();
};

$("#btn-background-menu").on("click", () => {
  $(".bgSelectorContainer").first().addClass("show");
})

$("#bgSelectorCloseButton").on("click", () => {
  $('.bgSelectorContainer').first().removeClass("show");
})

$("#bgNormal").on("click", () => {
  Live2DViewer.switchBgType(BackgroundType.normal, true);
})

$("#bgKanban").on("click", () => {
  Live2DViewer.switchBgType(BackgroundType.kanban);
})

$("#show-furigana").on("change", () => {
  $("#subtitle").toggleClass("no-furi");
})
