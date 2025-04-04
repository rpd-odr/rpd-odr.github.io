(function() {
  'use strict';

  localStorage.setItem('cub_mirrors', '["mirror-kurwa.men", "cub.rip"]');
  
  window.lampa_settings = {
    torrents_use: true,
    demo: false,
    read_only: false,
    socket_use: true,
    account_use: true,
    account_sync: true,
    plugins_store: true,
    feed: true,
    white_use: true,
    push_state: true,
    lang_use: true,
    plugins_use: true
  }

  window.lampa_settings.disable_features = {
    dmca: true,
    reactions: false,
    discuss: false,
    ai: false,
    install_proxy: false,
    subscribe: false,
    blacklist: false,
    persons: false
  }
  
  {lampainit-invc}

  var timer = setInterval(function() {
    if (typeof Lampa !== 'undefined') {
      clearInterval(timer);
	  
      if (window.lampainit_invc)
        window.lampainit_invc.appload();

      if ({btn_priority_forced})
        Lampa.Storage.set('full_btn_priority', '{full_btn_priority_hash}');

      var unic_id = Lampa.Storage.get('lampac_unic_id', '');
      if (!unic_id) {
        unic_id = Lampa.Utils.uid(8).toLowerCase();
        Lampa.Storage.set('lampac_unic_id', unic_id);
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

    /*
    setTimeout(function(){
        Lampa.Noty.show('Плагины установлены, перезагрузка через 5 секунд.',{time: 5000})
    },5000)
    */
  }
})();
