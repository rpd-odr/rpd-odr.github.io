(function () {
    'use strict';

    var network = new Lampa.Reguest();
    var cache = {
        data: new Map(),
        ttl: 3600000,
        set: function(key, value) {
            this.data.set(key, {
                value: value,
                timestamp: Date.now()
            });
        },
        get: function(key) {
            var item = this.data.get(key);
            if (item && Date.now() - item.timestamp < this.ttl) {
                return item.value;
            }
            this.data.delete(key);
            return null;
        }
    };

    function isPortraitMode() {
        return $('body').hasClass('orientation--portrait') || window.innerHeight > window.innerWidth;
    }

function getMovieImages(movie, callback) {
    console.log('Getting images for movie:', movie);
    var type = movie.name ? 'tv' : 'movie';
    var cacheKey = 'images_' + type + '_' + movie.id;
    var cachedData = cache.get(cacheKey);
    
    if (cachedData) {
        console.log('Found cached images:', cachedData);
        return callback(cachedData);
    }

    var url = Lampa.TMDB.api(type + '/' + movie.id + '/images') + '?api_key=' + Lampa.TMDB.key();
    console.log('Fetching images from URL:', url);
    
    network.silent(url, 
        function(data) {
            console.log('Received images data:', data);
            if (data && data.logos && data.logos.length) {
                data.logos = data.logos.filter(function(logo) {
                    return logo.iso_639_1 === null || logo.iso_639_1 === 'en' || logo.iso_639_1 === 'ru';
                });
                cache.set(cacheKey, data);
                callback(data);
            } else if (data && data.images && data.images.logos && data.images.logos.length) {
                // В некоторых случаях логотипы могут быть вложены в объект images
                var logos = data.images.logos.filter(function(logo) {
                    return logo.iso_639_1 === null || logo.iso_639_1 === 'en' || logo.iso_639_1 === 'ru';
                });
                var result = { logos: logos };
                cache.set(cacheKey, result);
                callback(result);
            } else {
                callback(null);
            }
        },
        function(error) {
            console.log('Error fetching images:', error);
            // Попробуем альтернативный URL
            var altUrl = Lampa.TMDB.api(type + '/' + movie.id) + '?append_to_response=images&api_key=' + Lampa.TMDB.key();
            console.log('Trying alternative URL:', altUrl);
            
            network.silent(altUrl,
                function(data) {
                    console.log('Received data from alternative URL:', data);
                    if (data && data.images && data.images.logos && data.images.logos.length) {
                        var logos = data.images.logos.filter(function(logo) {
                            return logo.iso_639_1 === null || logo.iso_639_1 === 'en' || logo.iso_639_1 === 'ru';
                        });
                        var result = { logos: logos };
                        cache.set(cacheKey, result);
                        callback(result);
                    } else {
                        callback(null);
                    }
                },
                function(error) {
                    console.log('Error fetching from alternative URL:', error);
                    callback(null);
                }
            );
        }
    );
}

    function addTitleLogo(render, card) {
        console.log('Adding title logo, card:', card);
        console.log('Is portrait mode:', isPortraitMode());
        
        if (!card || !isPortraitMode()) return;

        var $poster = $('.full-start-new__poster', render);
        console.log('Found poster element:', $poster.length > 0);
        
        if (!$poster.length) return;

        // Удаляем существующий логотип
        $('.title-logo', $poster).remove();

        // Проверяем наличие логотипа
        var logoPath = null;
        if (card.images && card.images.logos && card.images.logos.length) {
            var ruLogo = card.images.logos.find(function(l) { return l.iso_639_1 === 'ru'; });
            var enLogo = card.images.logos.find(function(l) { return l.iso_639_1 === 'en'; });
            var anyLogo = card.images.logos[0];
            
            logoPath = (ruLogo || enLogo || anyLogo).file_path;
            console.log('Found logo path:', logoPath);
        }

        if (!logoPath) {
            console.log('No logo path found');
            return;
        }

        var imgUrl = Lampa.TMDB.image('w500' + logoPath);
        console.log('Image URL:', imgUrl);

        // Создаем контейнер для логотипа
        var $logoContainer = $('<div>')
            .addClass('title-logo')
            .css({
                'position': 'absolute',
                'top': '-2em',
                'left': '50%',
                'transform': 'translateX(-50%)',
                'background-color': '#1e1e1e',
                'padding': '0.3em 1em',
                'border-radius': '0.7em',
                'z-index': '2'
            });

        // Создаем изображение логотипа
        var $logo = $('<img>')
            .attr('src', imgUrl)
            .css({
                'height': '2em',
                'max-width': '200px',
                'object-fit': 'contain'
            })
            .on('load', function() {
                console.log('Logo image loaded successfully');
            })
            .on('error', function() {
                console.log('Logo image failed to load');
                $logoContainer.remove();
            });

        $logoContainer.append($logo);

        // Добавляем логотип к постеру
        if ($poster.css('position') !== 'relative') {
            $poster.css('position', 'relative');
        }
        $poster.append($logoContainer);
        console.log('Logo container added to poster');
    }

    function initPlugin() {
        console.log('Plugin initialization started');
        
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                console.log('Full event completed');
                var render = e.object.activity.render();
                var card = e.object.card;
                
                console.log('Card data:', card);
                
                if (card && !card.images) {
                    getMovieImages(card, function(images) {
                        if (images) {
                            card.images = images;
                        }
                        addTitleLogo(render, card);
                    });
                } else {
                    addTitleLogo(render, card);
                }
            }
        });
    }

    if (window.appready) {
        console.log('Window already ready, initializing plugin');
        initPlugin();
    } else {
        console.log('Waiting for window ready event');
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                console.log('Window ready event received');
                initPlugin();
            }
        });
    }
})();