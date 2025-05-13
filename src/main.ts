function loadContent(link: string) {
  $('#main-content').fadeOut(200, () => {
    $('#main-content').load(`${link} #main-content`, () => {
      history.pushState(null, "", link);
      $('#main-content').fadeIn(200, () => {
       	if (link == "dailydate.html") {
          if (typeof dailyDate == "undefined") {
            $.getScript('js/dailydate.js', () => {
              dailyDate.loadData();
              dailyDate.init();
              dailyDate.dismissLoading();
            });
          } else {
            dailyDate.loadData();
            dailyDate.init();
            dailyDate.dismissLoading();
            selectedLocation = '';
          }
       	}
       	if (link == "live2dv3.html") {
          if (typeof Live2DViewer == "undefined") {
            $.getScript('js/pixi-spine.js');
            $.getScript('js/background_effect.js');
            $.getScript('js/live2dv3.js', () => {
              $.getScript('js/live2dv3_user.js', () => {
                Live2DViewer.init();
                Live2DViewer.initModel();
              })
            })
          } else {
            Live2DViewer.init();
            Live2DViewer.initModel();
          }
       	}
      });
    })
  })
}

$(() => {
  let isSideNavOpened = false;

  $('#buttonNav').on("click", () => {
    if (isSideNavOpened) {
      $('#mySidenav').css('left','-250px');
      $('body').css('marginLeft','0px');
    } else {
      $('#mySidenav').css('left','0px');
      $('body').css('marginLeft','250px');
    }
    isSideNavOpened = !isSideNavOpened;
  })
});

$(() => {
  if (Modernizr.history) {
    // history is supported; do magical things
    $('ul.pagenav>li>a').on('click', function(e) {
      $('.selected').removeClass('selected');
      $(this).parent().addClass('selected');
      e.preventDefault();
      const _href = $(this).attr("href") ?? "index.html";
      loadContent(_href);
      $('#buttonNav').trigger("click");
    })
  } else {
    // history is not supported; nothing fancy here
  }
});

$(window).on("popstate", () => {
  const link = location.pathname.replace(/^.*[\\/]/, ""); // get filename only
  loadContent(link);
});
