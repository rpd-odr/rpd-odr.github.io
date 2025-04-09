(function () {
    'use strict';
	
    var timer = setInterval(function(){
        if(typeof Lampa !== 'undefined'){
            clearInterval(timer);
  
Lampa.Utils.putScriptAsync([
"https://rpd-odr.github.io/mult.js",
"https://rpd-odr.github.io/studios.js",
"https://rpd-odr.github.io/kuv-style.js"
], function() {});
        }
    },200);
})();
