(function() {
  'use strict';
  
  var uid = Lampa.Storage.get('client_uid', '');

  Lampa.Storage.set('parser_use', 'true');             // парсер включен
  Lampa.Storage.set('jackett_url', '{jachost}');       // локальный ip:9118 / jacred.xyz
  Lampa.Storage.set('jackett_key', 'gsu53it69rg');     // ключ доступа
  Lampa.Storage.set('parser_torrent_type', 'jackett');

  Lampa.Storage.set('torrserver_auth', true);      // ts включен
  Lampa.Storage.set('torrserver_login', uid);      // пароль пользователя для доступа к ts 
  Lampa.Storage.set('torrserver_password', 'ts');
  Lampa.Storage.set('torrserver_url', '{localhost}/ts');  // http://ip:9118/ts

  //Lampa.Storage.set('surs_name', 'KUV');
  //Lampa.Storage.set('source','KUV');

  // Онлайн, Синхронизация
  //Lampa.Utils.putScriptAsync(["{localhost}/online.js", "{localhost}/sync.js", "{localhost}/backup.js", "{localhost}/tracks.js", "https://levende.github.io/lampa-plugins/tmdb-networks.js", "https://aviamovie.github.io/surs.js", "{localhost}/plugins/kuv.js"], function() {});
  Lampa.Utils.putScriptAsync(["{localhost}/online.js", "{localhost}/sync.js", "{localhost}/backup.js", "{localhost}/tracks.js"], function() {});

  var plugins = Lampa.Plugins.get();

    var plugins_add = [{ "url": "https://rpd-odr.github.io/kuv-style.js", "status": 1, "name": "Стиль KUV для Lampa", "author": "rpd@odr.su" }];
      //[{initiale}];

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
  // Запрашиваем дополнительные настройки пользователя
  // init.conf - accsdb - users - params
  var network = new Lampa.Reguest();
  network.silent('{localhost}/reqinfo?uid='+uid, function(req) {
    if (req.user && req.user.params) { // пользовательский params
      var params = req.user.params;
      if (params.adult) { // 18+ для пользователя включен
        Lampa.Storage.set('parental_control', 'true');     // родительский контроль включен
        Lampa.Storage.set('parental_control_pin', '2222'); // пин-код 2222
        Lampa.Storage.set('parental_control_time', '120'); // запрашивать пин-код через 2 часа неактивности
        Lampa.Utils.putScriptAsync(["{localhost}/sisi.js"], function() {});
      }
    }
	if (req.params) { // общий params
      var params = req.params;
      if (params.iptv) {
        Lampa.Storage.set('iptv_view_in_main', 'false');
        Lampa.Storage.set('iptv_guide_custom', 'true');
        Lampa.Storage.set('iptv_guide_save', '1');
        Lampa.Storage.set('iptv_guide_interval', '14');
        Lampa.Storage.set('iptv_guide_url', params.iptv.epg);
        Lampa.Storage.set('iptv_playlist_custom', '[{"id":"iptv","custom":true,"url":"' + params.iptv.m3u + '","name":"IPTV"}]');
        Lampa.Utils.putScriptAsync(["{localhost}/iptv.js"], function() {});
      }
    }
  });

})();
