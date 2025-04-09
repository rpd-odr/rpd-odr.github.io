(function () {
    'use strict';
	
Lampa.Listener.follow("app", function(e) {
    if (e.type === "ready") {
        // Ваш код инициализации здесь
        Lampa.Utils.putScriptAsync([
            "https://rpd-odr.github.io/mult.js",
            "https://rpd-odr.github.io/studios.js",
            "https://rpd-odr.github.io/kuv-style.js"
        ], function() {});
    }
});
})();
