import $ from 'jquery';
import { httpGet } from '../utility';
import Live2DViewer from './user';
import L2D from './L2D';

export enum BackgroundType {
  normal = 0,
  kanban = 1
};

const menu = $('.bgSelectorContainer').first();
const bg: { [key: string]: string[] } = JSON.parse(httpGet('assets/res/data/bg.json'));

const BackgroundMenu = {
  hide: () => {
    menu.removeClass("show");
  },
  show: () => {
    menu.addClass("show");
  },
  changeCategory: (type: BackgroundType) => {
    const __createBackgroundImg = (
      bgPath: string = "assets/res/basic/scene/bg/kanban/green.png",
      observer?: IntersectionObserver
    ) => {
      const img = document.createElement('img');
      img.classList.add('l2dv3-thumb');
      img.src = bgPath;
      img.onclick = () => {
        L2D.load(Live2DViewer.model!, bgPath);
        BackgroundMenu.hide();
      }

      if (observer) {
        observer.observe(img);
      }
      return img;
    }

    const __addBackgroundImg = (
      container: JQuery<HTMLElement>,
      bgImgs: string[]
    ) => {
      const currLoadedIndex = container.children().length;
      if (currLoadedIndex === bgImgs.length) return;

      const newLoadedIndex = Math.min(currLoadedIndex + 15, bgImgs.length);

      const imgs = bgImgs
        .slice(currLoadedIndex, newLoadedIndex)
        .map((imgUrl, i) => {
          const currIndex = i + currLoadedIndex + 1;
          if (currIndex === newLoadedIndex && currIndex !== bgImgs.length) {
            const observer = new IntersectionObserver((entries, observer) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  observer.unobserve(entry.target);
                  BackgroundMenu.changeCategory(type);
                }
              });
            });
            return __createBackgroundImg(imgUrl, observer);
          }
          return __createBackgroundImg(imgUrl);
        });

      container.append(imgs);
    }

    $(".bgSelectorUI .selector").css("display", "none");
    if (type === BackgroundType.normal) {
      $('#bgNormalContainer').css("display", "flex");
      __addBackgroundImg($('#bgNormalContainer'), bg.normal);
    } else {
      $('#bgKanbanContainer').css("display", "flex");
      __addBackgroundImg($('#bgKanbanContainer'), bg.kanban);
    }
  }
}

export default BackgroundMenu;
