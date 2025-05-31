import $ from "jquery";

const subEl = $("#subtitle");

const Subtitle = {
  setText: (text: string) => {
    subEl.html(text);
  },
  show: () => {
    subEl.addClass("show");
  },
  hide: () => {
    subEl.removeClass("show");
  },
  toggleFuriSub: () => {
    subEl.toggleClass("no-furi");
  },
  isShow: () => $("#show-subtitle").is(':checked'),
}

export default Subtitle;
