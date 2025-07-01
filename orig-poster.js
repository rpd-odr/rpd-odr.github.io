(function() {
    'use strict';

    // Проверка на повторную загрузку
    if (window.__tmdbOriginalLangPluginLoaded) return;
    window.__tmdbOriginalLangPluginLoaded = true;

    // Ждем готовности Lampa
    function initPlugin() {
        // Проверяем доступность необходимых API
        if (!window.XMLHttpRequest || !window.fetch) {
            console.error('[TMDB Original Lang] Required APIs not available');
            return;
        }

        // Основная логика плагина
        class TMDBLangInterceptor {
            constructor() {
                this.originalLang = null;
                this.patchXHR();
                this.patchFetch();
                console.log('[TMDB Original Lang] Plugin activated');
            }

            patchXHR() {
                const originalOpen = XMLHttpRequest.prototype.open;
                const self = this;

                XMLHttpRequest.prototype.open = function() {
                    this._url = arguments[1];
                    return originalOpen.apply(this, arguments);
                };

                const originalSend = XMLHttpRequest.prototype.send;
                
                XMLHttpRequest.prototype.send = function() {
                    if (this._url && this._url.includes('api.themoviedb.org/3/')) {
                        const originalOnload = this.onload;
                        
                        this.onload = function() {
                            try {
                                if (this.responseText) {
                                    const data = JSON.parse(this.responseText);
                                    if (data.original_language) {
                                        self.originalLang = data.original_language;
                                    }
                                }
                            } catch (e) {
                                console.warn('[TMDB Original Lang] XHR parse error', e);
                            }
                            
                            if (originalOnload) {
                                return originalOnload.apply(this, arguments);
                            }
                        };
                    }
                    return originalSend.apply(this, arguments);
                };
            }

            patchFetch() {
                const originalFetch = window.fetch;
                const self = this;

                window.fetch = async function(input, init) {
                    let url = (typeof input === 'string') ? input : input.url;
                    let modifiedUrl = url;

                    if (url.includes('api.themoviedb.org/3/')) {
                        if (url.includes('/movie/') || url.includes('/tv/')) {
                            modifiedUrl = url.replace(/([?&])language=[^&]*/, '$1language=original');
                        }
                    } else if (url.includes('image.tmdb.org') && self.originalLang) {
                        modifiedUrl = url.includes('?') 
                            ? `${url}&language=${self.originalLang}`
                            : `${url}?language=${self.originalLang}`;
                    }

                    if (url !== modifiedUrl) {
                        console.debug('[TMDB Original Lang] Modified URL:', modifiedUrl);
                    }

                    return originalFetch(modifiedUrl, init);
                };
            }
        }

        new TMDBLangInterceptor();
    }

    // Запуск с разными сценариями загрузки
    if (window.Lampa && window.Lampa.ready) {
        initPlugin();
    } else {
        const listener = () => {
            document.removeEventListener('lampa_ready', listener);
            initPlugin();
        };
        document.addEventListener('lampa_ready', listener);
    }
})();