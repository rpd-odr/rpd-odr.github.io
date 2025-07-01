(function() {
    'use strict';

    if (window.__tmdbLangForcePlugin) return;
    window.__tmdbLangForcePlugin = true;

    function init() {
        const IMAGE_REGEX = /\/tmdb\/img\/t\/p\/([^/]+)\/(.+\.(jpg|png))(\?|$)/;
        const API_REGEX = /\/tmdb\/api\/3\/(movie|tv)\/\d+/;
        
        // Главный перехватчик
        const intercept = () => {
            const originalFetch = window.fetch;
            
            window.fetch = async function(input, init) {
                const url = typeof input === 'string' ? input : input.url;
                let newUrl = url;
                
                // Обработка API запросов
                if (API_REGEX.test(url)) {
                    newUrl = modifyApiUrl(url);
                }
                // Обработка изображений
                else if (IMAGE_REGEX.test(url)) {
                    newUrl = modifyImageUrl(url);
                }
                
                if (newUrl !== url) {
                    console.log('[LangForce] Modified URL:', newUrl);
                    if (typeof input !== 'string') {
                        return originalFetch(new Request(newUrl, input), init);
                    }
                    return originalFetch(newUrl, init);
                }
                
                return originalFetch(input, init);
            };
        };
        
        // Модификация URL API
        const modifyApiUrl = (url) => {
            return url.replace(/([?&])language=[^&]*/, '$1language=original')
                     .replace(/([?&]include_image_language)=[^&]*/, '');
        };
        
        // Модификация URL изображений
        const modifyImageUrl = (url) => {
            // Удаляем все существующие параметры языка
            let cleanUrl = url.split('?')[0];
            
            // Добавляем приоритетные языки
            return cleanUrl + '?language=original,en,null&' + (url.split('?')[1] || '');
        };
        
        // Запускаем перехватчик
        intercept();
        console.log('[LangForce] Plugin activated');
    }

    // Инициализация
    if (window.Lampa?.ready) init();
    else document.addEventListener('lampa_ready', init);
})();