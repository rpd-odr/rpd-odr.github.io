(function(plugin) {
    plugin.start = function() {
        // Устанавливаем язык интерфейса и текста на русский
        localStorage.setItem('language', 'ru');
        localStorage.setItem('tmdb_lang', 'ru');

        // Перехватываем запросы к TMDB API
        plugin.apps.tmdb = {
            request: function(url, callback, error) {
                if (url.includes('api.themoviedb.org')) {
                    // Оставляем русский для текста, но запрашиваем оригинальные постеры
                    url = url.replace(/(language=)[^&]*/, '$1ru');
                    if (!url.includes('include_image_language')) {
                        url += '&include_image_language=null';
                    }
                }
                plugin.request(url, callback, error);
            }
        };
    };
    return plugin;
})(window.plugin || {});