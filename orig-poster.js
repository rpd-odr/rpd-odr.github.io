(function() {
    'use strict';

    // Проверка на повторную загрузку
    if (window.__tmdbPosterLangPlugin) return;
    window.__tmdbPosterLangPlugin = true;

    // Ждем полной загрузки Lampa
    function initPlugin() {
        // Проверяем необходимые API
        if (!window.Lampa || !window.Lampa.TMDB) {
            console.error('[PosterLang] Lampa.TMDB not found');
            return;
        }

        // Сохраняем оригинальный метод
        const originalGetImage = Lampa.TMDB.prototype.getImage;

        // Переопределяем метод получения изображений
        Lampa.TMDB.prototype.getImage = function(path, size) {
            // Получаем оригинальный URL
            let url = originalGetImage.call(this, path, size);
            
            // Добавляем параметры языка для постеров
            if (url.includes('image.tmdb.org')) {
                url += (url.includes('?') ? '&' : '?') + 
                      'include_image_language=original,en,null';
            }
            
            return url;
        };

        console.log('[PosterLang] Plugin successfully activated');
    }

    // Варианты инициализации
    if (window.Lampa && window.Lampa.ready) {
        initPlugin();
    } else {
        document.addEventListener('lampa_ready', initPlugin);
    }
})();