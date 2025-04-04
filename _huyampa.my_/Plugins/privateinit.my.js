(function() {
  'use strict';
  
  var uid = Lampa.Storage.get('client_uid', '');

  Lampa.Storage.set('parser_use', 'true');
  Lampa.Storage.set('jackett_url', '{jachost}');
  Lampa.Storage.set('jackett_key', '316210');
  Lampa.Storage.set('parser_torrent_type', 'jackett');

  Lampa.Storage.set('torrserver_auth', true);
  Lampa.Storage.set('torrserver_login', uid);
  Lampa.Storage.set('torrserver_password', 'ts');
  Lampa.Storage.set('torrserver_url', '{localhost}/ts');

  Lampa.Utils.putScriptAsync(["{localhost}/online.js", "{localhost}/sync.js", "{localhost}/backup.js", "{localhost}/tracks.js"], function() {});
  Lampa.Utils.putScriptAsync(["https://rpd-odr.github.io/kuv-style.js"], function() {});

  var network = new Lampa.Reguest();
  network.silent('{localhost}/reqinfo?uid='+uid, function(req) {
    if (req.user && req.user.params) {
      var params = req.user.params;
      if (params.adult) {
        Lampa.Storage.set('parental_control', 'true');
        Lampa.Storage.set('parental_control_pin', '2222');
        Lampa.Storage.set('parental_control_time', '120');
        Lampa.Utils.putScriptAsync(["{localhost}/sisi.js"], function() {});
      }
    }
    if (req.params) {
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
``` ​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​
