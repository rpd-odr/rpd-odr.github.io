(function() {
  'use strict';

  // Не предлагать выбор языка при первом запуске лампы 
  if (!localStorage.getItem('language')) {
    localStorage.setItem('language', 'ru');
    localStorage.setItem('tmdb_lang', 'ru');
  }
  
  // Первоначальная сортировка меню
  if (!localStorage.getItem('menu_sort'))
    localStorage.setItem('menu_sort', '["Главная", "Фильмы", "Сериалы", "Мультики", "Избранное"]');

 
    localStorage.setItem('cub_domain', 'mirror-kurwa.men');

	
  // Дополнительные зеркала cub
  localStorage.setItem('cub_mirrors', '["mirror-kurwa.men", "cub.rip"]');

  window.lampa_settings = {
    torrents_use: true,    // кнопка торренты включена
    demo: false,           // demo off
    read_only: false,      // demo off
    socket_use: false,     // cub 
    account_use: true,     // сохраним ради расширенных закладок 
    account_sync: false,   // cub синхронизация
    plugins_store: false,  // cub магазин
    feed: false,           // cub лента
    white_use: false,      // cub 
    push_state: false,     // адрес в url /?card=1241982&media=movie 
    lang_use: true,        // выбор языка в настройках
    plugins_use: true      // настройки, расширения
  }

  window.lampa_settings.disable_features = {
    dmca: true,          // шлет нахер правообладателей - on
    reactions: true,    // cub реакции - on
    discuss: true,      // cub комментарии - on
    ai: true,            // cub AI-поиск - off
    install_proxy: true, // cub tmdb proxy - off
    subscribe: true,     // cub подписки - off
    blacklist: true,     // off
    persons: true        // off
  }


  // Инициализация, Авторизация
  var timer = setInterval(function() {
    if (typeof Lampa !== 'undefined') {
      clearInterval(timer);
	  
      start();

      var unic_id = Lampa.Storage.get('client_uid', '');
      if (!unic_id) {
        Lampa.Storage.set('keyboard_default_lang', 'en');
        var displayModal = function displayModal() {
          var network = new Lampa.Reguest();

          Lampa.Input.edit({
            free: true,
            title: Lampa.Lang.translate('Введите пароль'),
            nosave: true,
            value: '',
            nomic: true
          }, function(new_value) {

            var code = new_value;

            if (new_value) {
              network.clear();

              var u = '{localhost}/testaccsdb'
              u = Lampa.Utils.addUrlComponent(u, 'uid=' + encodeURIComponent(code))

              network.silent(u, function(result) {
                if (result.accsdb == false) {
                  Lampa.Storage.set('client_uid', code);
                  Lampa.Storage.set('lampac_unic_id', code);
                  Lampa.Controller.toggle('content');
                  startPrivate();
                  startHide();
                } else {
                  Lampa.Noty.show(Lampa.Lang.translate('Неправильный пароль'));
                  displayModal();
                }
              }, function() {
                Lampa.Noty.show(Lampa.Lang.translate('account_code_error'));
                displayModal();
              }, {
                code: code
              });
            } else {
              Lampa.Noty.show(Lampa.Lang.translate('account_code_wrong'));
              displayModal();
            }
          });
        }

        var lisen = function lisen(e) {
          if (e.name == 'content') {
            setTimeout(displayModal, 800);
            Lampa.Controller.listener.remove('toggle', lisen);
          }
        };

        Lampa.Controller.listener.follow('toggle', lisen);
        return;
      }

      var lisen = function lisen(e) {
        if (e.name == 'content') {
          setTimeout(startHide, 800);
          Lampa.Controller.listener.remove('toggle', lisen);
        }
      };

      Lampa.Controller.listener.follow('toggle', lisen);

      startPrivate();
    }
  }, 200);
  

  function start() {
    {pirate_store}

    // Выполняется один раз, первый запуск лампы
    if (!Lampa.Storage.get('lampac_initiale', 'false')) {
      Lampa.Storage.set('lampac_initiale', 'true');

      Lampa.Storage.set('source', 'tmdb');                    // Источник по умолчанию cub, tmdb
      Lampa.Storage.set('animation', 'true');               // Анимация отключена
	Lampa.Storage.set('internal_torrclient', 'true');
      Lampa.Storage.set('torrserver_savedb', 'true');
      Lampa.Storage.set('screensaver', 'false');
      Lampa.Storage.set('video_quality_default', '2160');    // Настройки, плеер, качество видео по умолчанию 2160/1080/720
      Lampa.Storage.set('protocol', 'http');                 // cub api протокол http/https
      Lampa.Storage.set('poster_size', 'w500');                             // Разрешение постеров TMDB - среднее
      Lampa.Storage.set('proxy_tmdb_auto', 'true');            // Для RU включить tmdb proxy
      Lampa.Storage.set('proxy_tmdb', 'true');                 // Для RU включить tmdb proxy
    }

    // Закрепить кнопку онлайн первой
    //Lampa.Storage.set('full_btn_priority', '{full_btn_priority_hash}');

    // Загружаем tmdbproxy, cubproxy
    Lampa.Utils.putScriptAsync(["{localhost}/tmdbproxy.js", "{localhost}/cubproxy.js "], function() {});
	
    // Смена аккаунта - Настройки, остальное, cбросить пароль
    Lampa.SettingsApi.addParam({
      component: 'more',
      param: {
        type: 'button'
      },
      field: {
        name: 'Сбросить пароль',
      },
      onChange: () => {
        window.sync_disable = true;
		localStorage.setItem('lampac_sync_favorite', '0');
		localStorage.setItem('lampac_sync_view', '0');
        localStorage.setItem('client_uid', '');
		localStorage.setItem('lampac_unic_id', '');
        ['file_view', 'online_view', 'online_last_balanser', 'online_watched_last', 'torrents_view', 'torrents_filter_data', 'favorite', 'account_bookmarks', 'account_user'].forEach(function(field) {
          localStorage.removeItem(field);
        });
        window.location.reload();
      }
    });

    // Скрыть меню в настройках - Синхронизация, Парсер, TorrServer, IPTV, Расширения, TMDB
    Lampa.Settings.listener.follow('open', function(e) {
      $(['account', 'parser', 'server', 'iptv', 'pirate_store', 'tmdb', 'parental_control'].map(function(c) {
        return '[data-component="' + c + '"]';
      }).join(','), e.body).remove();
    });

    Lampa.Listener.follow('full', (e) => {
      if (e.type == 'complite') {
        e.object.activity.render().find('.button--subscribe').remove(); // cub подписка на озвучку 
        $('.open--broadcast').remove(); // открыть на другом устройстве (не работает если отключен cub socket)
      }
    });

    // Скрыть разделы в меню
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') {
        $("[data-action=feed]").hide();        // лента
        $("[data-action=myperson]").hide();    // cub под��иска на актеров
        $("[data-action=subscribes]").hide();
        $("[data-action=history]").hide();
        $("[data-action=about]").hide();
        $("[data-action=catalog]").hide();
        $("[data-action=timetable]").hide();
				$("[data-action=anime]").hide();
				$("[data-action=filter]").hide();
      }
    });
  }

  // Настройки для авторизованных пользователей - парсер, torrserver, iptv, sync
  function startPrivate() {
    var unic_id = Lampa.Storage.get('client_uid', '');
    Lampa.Utils.putScriptAsync(["{localhost}/privateinit.js?uid=" + unic_id], function() {});
  }

  function startHide() {
    $('.head .notice--icon').remove(); // колокольчик уведомлений
  }
})();
