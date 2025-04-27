(function () {
    'use strict';

    function getCardLogo(element) {
        console.log('Getting logo for card:', element);
        var movie = element.data || element;
        var logo = movie.logo_path;

        if (!logo && movie.images) {
            console.log('Looking in movie.images:', movie.images);
            if (movie.images.logos && movie.images.logos.length) {
                var preferredLogo = movie.images.logos.find(function (l) {
                    return l.iso_639_1 === 'ru';
                }) || movie.images.logos.find(function (l) {
                    return l.iso_639_1 === 'en';
                }) || movie.images.logos[0];

                if (preferredLogo) {
                    logo = preferredLogo.file_path;
                    console.log('Found preferred logo:', logo);
                }
            }
        }

        return logo;
    }

    function addTitleLogo(render, card) {
        console.log('=== Starting addTitleLogo ===');
        console.log('Card:', card);
        console.log('Render:', render);
        
        // Пробуем найти постер разными способами
        var $poster = $('.full-start-new__img', render);
        if (!$poster.length) {
            $poster = $('.full-start-new__poster', render);
        }
        
        console.log('Poster element found:', $poster.length > 0);
        
        if (!$poster.length) {
            console.log('No poster element found');
            return;
        }

        // Получаем путь к логотипу
        var logoPath = getCardLogo(card);
        console.log('Logo path:', logoPath);

        if (!logoPath) {
            console.log('No logo found');
            return;
        }

        // Удаляем старый логотип если есть
        $('.title-logo').remove();

        // Создаем контейнер для логотипа
        var $wrap = $('<div>', {
            class: 'title-logo',
            css: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'z-index': 999,
                'pointer-events': 'none'
            }
        });

        // Создаем изображение логотипа
        var imgUrl = Lampa.TMDB.image('w300' + logoPath);
        console.log('Creating logo with URL:', imgUrl);
        
        var $logo = $('<img>', {
            src: imgUrl,
            css: {
                'max-width': '80%',
                'max-height': '50%',
                'object-fit': 'contain',
                'display': 'block'
            }
        }).on('load', function() {
            console.log('Logo image loaded successfully');
        }).on('error', function() {
            console.log('Logo image failed to load');
            $wrap.remove();
        });

        // Добавляем логотип в контейнер
        $wrap.append($logo);

        // Убеждаемся что у постера есть relative positioning
        $poster.css('position', 'relative');

        // Добавляем контейнер с логотипом
        $poster.append($wrap);
        
        console.log('=== Logo addition completed ===');
    }

    function getImages(card) {
        return new Promise(function(resolve, reject) {
            if (!card.id) {
                console.log('No card ID found');
                return reject();
            }
            
            var url = Lampa.TMDB.api((card.name ? 'tv' : 'movie') + '/' + card.id + '/images');
            console.log('Fetching images from:', url);
            
            var network = new Lampa.Reguest();
            network.silent(url, function(images) {
                console.log('Received images data:', images);
                if (images && images.logos) {
                    card.images = images;
                    resolve();
                } else {
                    reject();
                }
            }, function(err) {
                console.log('Failed to fetch images:', err);
                reject();
            });
        });
    }

    function initPlugin() {
        console.log('=== Plugin initialization started ===');

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                console.log('=== Processing complete event ===');
                console.log('Event object:', e);
                
                var render = e.object.activity.render();
                var card = e.object.card;
                
                if (!card) {
                    console.log('No card data found');
                    return;
                }
                
                if (!card.images) {
                    console.log('No images in card, fetching...');
                    getImages(card).then(function() {
                        addTitleLogo(render, card);
                    }).catch(function() {
                        console.log('Failed to get images');
                    });
                } else {
                    addTitleLogo(render, card);
                }
            }
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                initPlugin();
            }
        });
    }
})();