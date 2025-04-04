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

  localStorage.setItem('cub_mirrors', '["mirror-kurwa.men", "cub.rip"]');
  
  window.lampa_settings = {
    torrents_use: true,
    demo: false,
    read_only: false,
    socket_use: false,
    account_use: true,
    account_sync: true,
    plugins_store: false,
    feed: false,
    white_use: false,
    push_state: false,
    lang_use: true,
    plugins_use: true
  }

  window.lampa_settings.disable_features = {
    dmca: true,
    reactions: true,
    discuss: true,
    ai: false,
    install_proxy: true,
    subscribe: true,
    blacklist: true,
    persons: true
  }
  
  {lampainit-invc}

  var timer = setInterval(function() {
    if (typeof Lampa !== 'undefined') {
      clearInterval(timer);
	  
      if (window.lampainit_invc)
        window.lampainit_invc.appload();

      if ({btn_priority_forced})
        Lampa.Storage.set('full_btn_priority', '{full_btn_priority_hash}');

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

      Lampa.Utils.putScriptAsync(["{localhost}/cubproxy.js", "{localhost}/privateinit.js?account_email=" + encodeURIComponent(Lampa.Storage.get('account_email', '')) + "&uid=" + encodeURIComponent(Lampa.Storage.get('lampac_unic_id', ''))], function() {});

      if (!Lampa.Storage.get('lampac_initiale', 'false')) {
        if (window.appready) {
          if (window.lampainit_invc) window.lampainit_invc.appready();
          start();
        }
        else {
          Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
              if (window.lampainit_invc) window.lampainit_invc.appready();
              start();
            }
          })
        }
      }

      {deny} 
	  {pirate_store}
    }
  }, 200);

  function start() {		
    Lampa.Storage.set('lampac_initiale', 'true');
    Lampa.Storage.set('source', 'cub');
    Lampa.Storage.set('video_quality_default', '2160');
    Lampa.Storage.set('full_btn_priority', '{full_btn_priority_hash}');
    Lampa.Storage.set('proxy_tmdb', '{country}' == 'RU');
    Lampa.Storage.set('poster_size', 'w300');

    Lampa.Storage.set('parser_use', 'true');
    Lampa.Storage.set('jackett_url', '{jachost}');
    Lampa.Storage.set('jackett_key', '1');
    Lampa.Storage.set('parser_torrent_type', 'jackett');

    var plugins = Lampa.Plugins.get();

    var plugins_add = [{initiale}];

    var plugins_push = []

    plugins_add.forEach(function(plugin) {
      if (!plugins.find(function(a) {
          return a.url == plugin.url
        })) {
        Lampa.Plugins.add(plugin);
        Lampa.Plugins.save();

        plugins_push.push(plugin.url)
      }
    });

    if (plugins_push.length) Lampa.Utils.putScript(plugins_push, function() {}, function() {}, function() {}, true);
	
    if (window.lampainit_invc)
      window.lampainit_invc.first_initiale();
    
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

    /*
    setTimeout(function(){
        Lampa.Noty.show('Плагины установлены, перезагрузка через 5 секунд.',{time: 5000})
    },5000)
    */
  }
})();
