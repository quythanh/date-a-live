// stored data
let selected: string = 'tohka';
let selectedLocation: string = '';
let selectedRoute: string = '';
const data = JSON.parse(httpGet('assets/res/data/dailydate.json'));

const dailyDate = {
  loadData: () => {
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

  dismissLoading: () => {
    $('.loadingcontainer').addClass('out');
    setTimeout(() => {
      $('div').remove('.loadingcontainer');
    }, 500)
  },

  init: () => {
    $('#dismissLoading').on("click", () => {
      dailyDate.dismissLoading();
    })

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

      $("#cg").remove();
    });

    $('.popup').on("click", () => {
      $('#poppedcg').addClass('out');
      setTimeout(() => {
        $('.popup').css('display', 'none');
        $('#poppedcg').removeClass('out');
      }, 400)
    })
  },

  loadGuide: (spirit: string, location: string, route: string, int: string) => {
    $("#cg").remove();

    for (let i = 0; i < data.spirit[spirit].date[location].ending[route][int].guide.length; i++) {
      //console.log(i);
      const guide = document.createElement('li');
      guide.classList.add('guidebox');
      guide.textContent = data.spirit[spirit].date[location].text[data.spirit[spirit].date[location].ending[route][int].guide[i]];
      $('#guidelist').append(guide);
      //console.log(data.spirit[spirit].date[location].text[i])
    }

    //edname
    $('#name').text(`"${data.spirit[spirit].date[location].ending[route][int].name}"`);

    //cg
    if (data.spirit[spirit].date[location].ending[route][int].cg) {
      const img = document.createElement('img');
      img.id = 'cg';
      img.src = data.spirit[spirit].date[location].ending[route][int].cg;
      img.onclick = () => {
        $('.popup').css('display', 'table');
      }
      $('#edinfo').append(img);
      $('#poppedcg').attr('src', img.src);
    }
  },

  loadRoute: (spirit: string, location: string) => {
    for (const i in data.spirit[spirit].date[location].ending) { //i want to delete ending part
      for (const t in data.spirit[spirit].date[location].ending[i]) {
        const route = document.createElement('li');
        route.classList.add('routebox');
        route.textContent = `${i} ${parseInt(t) + 1}`;
        route.id = `${i}-${t}`;
        $('#routelist').append(route);
      }
    }
    $("#routelist li").on("click", (e: Event) => {
      const el = e.target as HTMLLIElement;
      const routeId = el.id;

      if (routeId == selectedRoute) return;
      $(el).css('background', '#ca3e47');
      if (selectedRoute != '') {
        $(`#${selectedRoute}`).css('background', '#313131');
      }
      selectedRoute = routeId;
      $('#guidelist').text('');
      dailyDate.loadGuide(selected, selectedLocation.substring(1), routeId.split('-')[0], routeId.split('-')[1]);
      //$('#routelist').show();
    });
  },

  loadLocation: (spirit: string) => {
    dailyDate.loadFavorite(spirit);
    for (const i in data.spirit[spirit].date) {
      const location = document.createElement('li');
      location.classList.add('routebox');
      location.textContent = data.spirit[spirit].date[i].name;
      location.id = `d${i}`;
      $('#locationlist').append(location);
    }
    $("#locationlist li").on("click", (e: Event) => {
      const el = e.target as HTMLLIElement;
      if (el.id == selectedLocation) return;

      $("#name").text('');
      $("#cg").remove();
      selectedRoute = '';
      $('#guidelist').text('');

      $(el).css('background', '#ca3e47');
      if (selectedLocation !== '') {
        $(`#${selectedLocation}`).css('background', '#313131');
        //console.log('ayy ' + selectedLocation);
      }
      selectedLocation = el.id;
      $('#routelist').text('');
      dailyDate.loadRoute(selected, el.id.substring(1));
      $('#routelist').show();
    });
  },

  loadFavorite: (spirit: string) => {
    $('#gift1').attr("src", `assets/res/basic/icon/item/gift/${data.spirit[spirit].data.like.gift[0]}.png`);
    $('#gift2').attr("src", `assets/res/basic/icon/item/food/${data.spirit[spirit].data.like.food[0]}.png`);
    $('#gift1d').text(data.spirit[spirit].data.like.gift[1])
    $('#gift2d').text(data.spirit[spirit].data.like.food[1])
  }
}

document.addEventListener('DOMContentLoaded', () => {
  dailyDate.loadData();
  dailyDate.init();
}, false);

window.onload = () => {
  dailyDate.dismissLoading();
}
