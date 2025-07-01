(function() {
    'use strict';

    // Проверяем, загружен ли уже плагин
    if (window.TMDBOriginalLangLoaded) return;
    window.TMDBOriginalLangLoaded = true;

    // Основной класс плагина
    class TMDBOriginalLang {
        constructor() {
            // Сохраняем оригинальный язык интерфейса
            this.interfaceLang = 'ru';
            
            // Инициализируем перехватчики
            this.initInterceptors();
            
            console.log('[TMDB Original Lang] Plugin initialized');
        }

        initInterceptors() {
            // Перехватчик для XMLHttpRequest
            this.interceptXHR();
            
            // Перехватчик для Fetch API
            this.interceptFetch();
        }

        interceptXHR() {
            const originalOpen = XMLHttpRequest.prototype.open;
            const that = this;
            
            XMLHttpRequest.prototype.open = function(method, url) {
                // Сохраняем URL для последующего использования
                this._requestUrl = url;
                return originalOpen.apply(this, arguments);
            };

            const originalSend = XMLHttpRequest.prototype.send;
            
            XMLHttpRequest.prototype.send = function(body) {
                if (this._requestUrl && this._requestUrl.includes('api.themoviedb.org')) {
                    const originalOnload = this.onload;
                    
                    this.onload = function() {
                        if (this.responseText) {
                            try {
                                const response = JSON.parse(this.responseText);
                                if (response.original_language) {
                                    // Сохраняем язык оригинала для последующих запросов
                                    that.currentOriginalLang = response.original_language;
                                }
                            } catch (e) {
                                console.error('[TMDB Original Lang] Error parsing response', e);
                            }
                        }
                        
                        if (originalOnload) {
                            return originalOnload.apply(this, arguments);
                        }
                    };
                }
                
                return originalSend.apply(this, arguments);
            };
        }

        interceptFetch() {
            const originalFetch = window.fetch;
            const that = this;
            
            window.fetch = async function(input, init) {
                let url = typeof input === 'string' ? input : input.url;
                let modified = false;
                
                // Модифицируем запросы к TMDB API
                if (url.includes('api.themoviedb.org')) {
                    // Для основных запросов метаданных
                    if (url.includes('/movie/') || url.includes('/tv/')) {
                        url = that.modifyUrlLang(url, 'original');
                        modified = true;
                    }
                    // Для запросов изображений
                    else if (url.includes('image.tmdb.org')) {
                        if (that.currentOriginalLang) {
                            url = that.addImageLanguage(url, that.currentOriginalLang);
                            modified = true;
                        }
                    }
                }
                
                // Возвращаем оригинальный fetch с модифицированным URL при необходимости
                return originalFetch(modified ? url : input, init);
            };
        }

        modifyUrlLang(url, newLang) {
            // Заменяем параметр language в URL
            if (url.includes('language=')) {
                return url.replace(/([?&])language=[^&]*/, `$1language=${newLang}`);
            }
            return url + (url.includes('?') ? '&' : '?' + `language=${newLang}`;
        }

        addImageLanguage(url, lang) {
            // Добавляем параметр языка для изображений
            if (url.includes('?')) {
                return `${url}&language=${lang}`;
            }
            return `${url}?language=${lang}`;
        }
    }

    // Запускаем плагин после полной загрузки Lampa
    if (window.Lampa && window.Lampa.ready) {
        new TMDBOriginalLang();
    } else {
        document.addEventListener('lampa_ready', () => {
            new TMDBOriginalLang();
        });
    }
})();