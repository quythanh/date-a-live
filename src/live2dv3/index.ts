import $ from 'jquery';
import Live2DViewer from "./user";
import Subtitle from './subtitle';
import BackgroundMenu from './background_menu';
import { BackgroundType } from './background_menu';

window.onload = () => {
  Live2DViewer.init();
  Live2DViewer.initModel();
};

$("#btn-background-menu").on("click", BackgroundMenu.show)
$("#bgSelectorCloseButton").on("click", BackgroundMenu.hide)

$("#bgNormal").on("change", () => {
  BackgroundMenu.changeCategory(BackgroundType.normal);
})

$("#bgKanban").on("change", () => {
  BackgroundMenu.changeCategory(BackgroundType.kanban);
})

$("#show-furigana").on("change", Subtitle.toggleFuriSub)
