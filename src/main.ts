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
