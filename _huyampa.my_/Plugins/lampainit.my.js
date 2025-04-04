(function() {
  'use strict';

  if (!localStorage.getItem('language')) {
    localStorage.setItem('language', 'ru');
    localStorage.setItem('tmdb_lang', 'ru');
  }
  
  if (!localStorage.getItem('menu_sort'))
    localStorage.setItem('menu_sort', '["Главная", "Фильмы", "Сериалы", "Мультики", "Избранное"]');

  localStorage.setItem('cub_domain', 'mirror-kurwa.men');
  localStorage.setItem('cub_mirrors', '["mirror-kurwa.men", "cub.rip"]');

  window.lampa_settings = {
    torrents_use: true,
    demo: false,
    read_only: false,
    socket_use: false,
    account_use: true,
    account_sync: false,
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
    ai: true,
    install_proxy: true,
    subscribe: true,
    blacklist: true,
    persons: true
  }

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

    if (!Lampa.Storage.get('lampac_initiale', 'false')) {
      Lampa.Storage.set('lampac_initiale', 'true');
      Lampa.Storage.set('source', 'cub');
      Lampa.Storage.set('animation', 'true');
      Lampa.Storage.set('internal_torrclient', 'true');
      Lampa.Storage.set('torrserver_savedb', 'true');
      Lampa.Storage.set('screensaver', 'false');
      Lampa.Storage.set('video_quality_default', '2160');
      Lampa.Storage.set('protocol', 'http');
      Lampa.Storage.set('poster_size', 'w500');
      Lampa.Storage.set('proxy_tmdb_auto', 'true');
      Lampa.Storage.set('proxy_tmdb', 'true');
    }

    Lampa.Utils.putScriptAsync(["{localhost}/tmdbproxy.js", "{localhost}/cubproxy.js "], function() {});

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

    Lampa.Settings.listener.follow('open', function(e) {
      $(['account', 'parser', 'server', 'iptv', 'plugins', 'tmdb', 'parental_control'].map(function(c) {
        return '[data-component="' + c + '"]';
      }).join(','), e.body).remove();
    });

    Lampa.Listener.follow('full', (e) => {
      if (e.type == 'complite') {
        e.object.activity.render().find('.button--subscribe').remove();
        $('.open--broadcast').remove();
      }
    });

    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') {
        $("[data-action=feed]").hide();
        $("[data-action=myperson]").hide();
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

  function startPrivate() {
    var unic_id = Lampa.Storage.get('client_uid', '');
    Lampa.Utils.putScriptAsync(["{localhost}/privateinit.js?uid=" + unic_id], function() {});
  }

  function startHide() {
    $('.head .notice--icon').remove();
  }
})();
