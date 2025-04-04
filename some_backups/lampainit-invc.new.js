// //////////////
// Переименуйте файл lampainit-invc.js в lampainit-invc.my.js
// //////////////


window.lampainit_invc = {};


// Лампа готова для использования 
window.lampainit_invc.appload = function appload() {
  // Lampa.Utils.putScriptAsync(["{localhost}/myplugin.js"]);  // wwwroot/myplugin.js
  // Lampa.Utils.putScriptAsync(["{localhost}/plugins/ts-preload.js", "https://nb557.github.io/plugins/online_mod.js"]);
  // Lampa.Storage.set('proxy_tmdb', 'true');
  // etc
    Lampa.Utils.putScriptAsync(["{localhost}/online.js", "{localhost}/sync.js", "{localhost}/backup.js", "{localhost}/tracks.js"], function() {});
}


// Лампа полностью загружена, можно работать с интерфейсом 
window.lampainit_invc.appready = function appready() {
  $('.head .notice--icon').remove();
}


// Выполняется один раз, когда пользователь впервые открывает лампу
window.lampainit_invc.first_initiale = function firstinitiale() {
  // Здесь можно указать/изменить первоначальные настройки 
  Lampa.Storage.set('source', 'tmdb');                    // Источник по умолчанию cub, tmdb
  Lampa.Storage.set('animation', 'true');               // Анимация включена
  Lampa.Storage.set('internal_torrclient', 'true');
  Lampa.Storage.set('torrserver_savedb', 'true');
      Lampa.Storage.set('screensaver', 'false');
      Lampa.Storage.set('video_quality_default', '2160');    // Настройки, плеер, качество видео по умолчанию 2160/1080/720
      Lampa.Storage.set('protocol', 'http');                 // cub api протокол http/https
      Lampa.Storage.set('poster_size', 'w500');                             // Разрешение постеров TMDB - среднее
      Lampa.Storage.set('proxy_tmdb_auto', 'true');            // Для RU включить tmdb proxy
      Lampa.Storage.set('proxy_tmdb', 'true');                 // Для RU включить tmdb proxy
    }
}


// Ниже код выполняется до загрузки лампы, например можно изменить настройки 
// window.lampa_settings.push_state = false;
localStorage.setItem('cub_domain', 'cub.rip');
localStorage.setItem('cub_mirrors', '["cub.rip", "mirror-kurwa.men", "lampadev.ru"]');
