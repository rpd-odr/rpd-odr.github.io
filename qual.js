(function () {
    'use strict';
    
    // Кэш для хранения результатов запросов
    const qualityCache = new Map();
    const CACHE_TIMEOUT = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
    const API_KEY = 'GLr6bZLZgY0ww04GnDUY5on1Z4PcaKlM6IyZU8J2';

    // Функция очистки старых записей кэша
    function cleanOldCache() {
        const now = Date.now();
        for (const [key, value] of qualityCache.entries()) {
            if (now - value.timestamp > CACHE_TIMEOUT) {
                qualityCache.delete(key);
            }
        }
    }

    // Основная функция для поиска качества
    function findBestQualityItem(object) {
        return new Promise((resolve, reject) => {
            let mediaType = object?.media_type || (object?.first_air_date ? "tv" : "movie");
            let tid = object?.card?.imdb_id || `${mediaType}-${object.id}`;
            
            // Проверяем кэш
            if (qualityCache.has(tid)) {
                const cachedData = qualityCache.get(tid);
                if (Date.now() - cachedData.timestamp < CACHE_TIMEOUT) {
                    return resolve(cachedData.quality);
                }
            }

            let settings = {
                url: `https://iboouvfabveldaehdnia.supabase.co/functions/v1/watchmode-proxy?tid=${tid}&apiKey=${API_KEY}&tmdbId=${mediaType}-${object.id}`,
                method: "GET",
                timeout: 0
            };

            $.ajax(settings)
                .done(response => {
                    // Сохраняем в кэш
                    qualityCache.set(tid, {
                        quality: response.quality,
                        timestamp: Date.now()
                    });
                    resolve(response.quality);
                })
                .fail(error => {
                    console.error("KUV", error);
                    resolve(null);
                });
        });
    }

    // Функция добавления элемента качества
    function appendQualityElement(bestItem, selector) {
        if (!bestItem) return;
        
        if (Lampa.Platform.screen('mobile') !== true) {
            let container = $(selector);
            container.find('.card__quality').remove();
            
            let quality = $("<div>", {
                "class": "card__quality",
                css: {
                    zIndex: 999,
                    fontSize: "75%"
                }
            });
            
            quality.append($("<div>", {
                text: bestItem
            }));
            
            $(selector).append(quality);
        }
    }

    // Основная функция модуля
    function mainQuality() {
        // Периодическая очистка кэша
        setInterval(cleanOldCache, CACHE_TIMEOUT);

        Lampa.Listener.follow("full", function (e) {
            if (e.type === "complite") {
                findBestQualityItem(e.object).then(bestItem => {
                    console.log("response", bestItem);
                    appendQualityElement(bestItem, ".full-start-new__poster");
                });
            }
        });

        Lampa.Listener.follow("line", function (e) {
            if (e.type === "append" && Lampa.Storage.field("source") !== "cub") {
                $.each(e.items, function (_, movieCard) {
                    if (movieCard.data && (movieCard.data.id || movieCard.data.number_of_seasons)) {
                        findBestQualityItem(movieCard.data).then(bestItem => {
                            appendQualityElement(bestItem, movieCard.card.find(".card__view"));
                        });
                    } else {
                        console.warn("KUV", "movieCard.data is undefined or missing id/number_of_seasons:", movieCard);
                    }
                });
            }
        });
    }

    // Функция инициализации
    function startPlugin() {
        window.plugin_kuv_ready = true;
        if (window.appready) {
            mainQuality();
        } else {
            Lampa.Listener.follow("app", function (e) {
                if (e.type === "ready") {
                    mainQuality();
                }
            });
        }
    }

    if (!window.plugin_kuv_ready) startPlugin();

})();
