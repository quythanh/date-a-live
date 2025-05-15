// stored data
let selected: string = 'tohka';
let selectedLocation: string = '';
let selectedRoute: string = '';
const data = JSON.parse(httpGet('assets/res/data/dailydate.json'));

var dailyDate = {
  loadData : () => {
    if (localStorage['dalDDSelected']) {
      selected = localStorage['dalDDSelected'];
    }
    if (localStorage['dalDDSelectedLocation']) {
      selectedLocation = localStorage['dalDDSelectedLocation'];
    }
    if (localStorage['dalDDSelectedRoute']) {
      selectedRoute = localStorage['dalDDSelectedRoute'];
    }
  },

  preloadImages : () => {
    for (const i in data.spirit) {
      new Image().src = data.spirit[i].data.img;
      for (const k in data.spirit[i].date) {
        for (const j in data.spirit[i].date[k].ending) {
          for (const n in data.spirit[i].date[k].ending[j]) {
            if (data.spirit[i].date[k].ending[j][n].cg) {
              new Image().src = data.spirit[i].date[k].ending[j][n].cg;
            }
          }
        }
      }
    }
  },

  dismissLoading : () => {
    $('.loadingcontainer').addClass('out');
    setTimeout(() => {
      $('div').remove('.loadingcontainer');
    }, 500)
  },

  init : () => {
    // dismiss loading
    $('#dismissLoading').on("click", () => {
      dailyDate.dismissLoading();
    })

    // preload images
    dailyDate.preloadImages();
    for (const i in data.spirit) {
      const img = document.createElement('img');
      img.classList.add('thumb');
      img.src = data.spirit[i].data.img;

      const div = document.createElement('div');
      div.classList.add('spirit');
      div.id = i;
      div.appendChild(img);
      $('.left').first().append(div);
    }
    $(`#${selected}`).addClass('selected');
    dailyDate.loadLocation(selected);

    $('.spirit').on("click", (e: Event) => {
      const el = e.currentTarget as HTMLDivElement;

      $(`#${selected}`).removeClass('selected');
      $(el).addClass('selected');
      $('#routelist').hide();
      selected = el.id;
      localStorage['dalDDSelected'] = selected;
      //nullify #1
      $('#locationlist').text('');
      $('#guidelist').text('');
      $('#routelist').text('');
      $('#name').text('');
      dailyDate.loadLocation(selected);

      //nullify
      selectedLocation = '';
      selectedRoute = '';

      //banish cg
      $("div").remove(".cg");
    });

    $('.popup').on("click", () => {
      $('.poppedcg').addClass('out');
      setTimeout(() => {
        $('.popup').css('display', 'none');
        $('.poppedcg').removeClass('out');
      }, 400)
    })
  },

  loadGuide : (spirit, location, route, int) => {
    $("div").remove(".cg");

    for (let i = 0; i < data.spirit[spirit].date[location].ending[route][int].guide.length; i++) {
      //console.log(i);
      const guide = document.createElement('li');
      guide.classList.add('guidebox');
      guide.innerHTML = data.spirit[spirit].date[location].text[data.spirit[spirit].date[location].ending[route][int].guide[i]];
      $('#guidelist').append(guide);
      //console.log(data.spirit[spirit].date[location].text[i])
    }

    //edname
    $('#name').text(`"${data.spirit[spirit].date[location].ending[route][int].name}"`);

    //cg
    if (data.spirit[spirit].date[location].ending[route][int].cg) {
      const div = document.createElement('div');
      div.classList.add('cg');
      div.style.content = `url("${data.spirit[spirit].date[location].ending[route][int].cg}")`;
      $('#edinfo').append(div);
      $('.poppedcg').css('content', div.style.content);
      $('.cg').on("click", () => {
        $('.popup').css('display', 'table');
      })
    }
  },

  loadRoute : (spirit, location) => {
    for (const i in data.spirit[spirit].date[location].ending) { //i want to delete ending part
      for (const t in data.spirit[spirit].date[location].ending[i]) {
        const route = document.createElement('li');
        route.classList.add('routebox');
        route.textContent = `${i} ${parseInt(t) + 1}`;
        route.id = `${i}-${t}`;
        $('#routelist').append(route);
      }
    }
    $("#routelist li").on("click", (e) => {
      const routeId = e.target.id;

      if (routeId == selectedRoute) return;
      $(e.target).css('background', '#ca3e47');
      if (selectedRoute != '') {
        $(`#${selectedRoute}`).css('background', '#313131');
      }
      selectedRoute = routeId;
      $('#guidelist').text('');
      dailyDate.loadGuide(selected, selectedLocation.substring(1), routeId.split('-')[0], routeId.split('-')[1]);
      //$('#routelist').show();
    });
  },

  loadLocation : (spirit) => {
    dailyDate.loadFavorite(spirit);
    for (const i in data.spirit[spirit].date) {
      const location = document.createElement('li');
      location.classList.add('routebox');
      location.textContent = data.spirit[spirit].date[i].name;
      location.id = `d${i}`;
      $('#locationlist').append(location);
    }
    $("#locationlist li").on("click", (e) => {
      if (e.target.id == selectedLocation) return;

      //banish name
      $("#name").html('');
      //vanish cg
      $("div").remove(".cg");
      //banish route
      selectedRoute = '';
      //banish guide
      $('#guidelist').html('');

      $(e.target).css('background', '#ca3e47');
      if (selectedLocation !== '') {
        $(`#${selectedLocation}`).css('background', '#313131');
        //console.log('ayy ' + selectedLocation);
      }
      selectedLocation = e.target.id;
      $('#routelist').html('');
      dailyDate.loadRoute(selected, e.target.id.substring(1));
      $('#routelist').show();
    });
  },

  loadFavorite : (spirit) => {
    $('#gift1d').html(data.spirit[spirit].data.like.gift[1])
    $('#gift2d').html(data.spirit[spirit].data.like.food[1])
    $('#gift1').attr("src", `assets/res/basic/icon/item/gift/${data.spirit[spirit].data.like.gift[0]}.png`);
    $('#gift2').attr("src", `assets/res/basic/icon/item/food/${data.spirit[spirit].data.like.food[0]}.png`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  dailyDate.loadData();
  dailyDate.init();
}, false);

window.onload = () => {
  dailyDate.dismissLoading();
}
