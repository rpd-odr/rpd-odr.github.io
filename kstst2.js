(function () {
    'use strict';

    function getCardLogo(element) {
        var movie = element.data || element;
        var logo = movie.logo_path;

        if (!logo && movie.images) {
            if (movie.images.logos && movie.images.logos.length) {
                var preferredLogo = movie.images.logos.find(function (l) {
                    return l.iso_639_1 === 'ru';
                }) || movie.images.logos.find(function (l) {
                    return l.iso_639_1 === 'en';
                }) || movie.images.logos[0];

                if (preferredLogo) logo = preferredLogo.file_path;
            }
        }

        return logo;
    }

    function addTitleLogo(render, card) {
        console.log('=== Starting addTitleLogo ===');
        
        // Проверяем наличие постера
        var $img = $('.full-start-new__poster', render).find('img');
        console.log('Poster image found:', $img.length > 0);
        
        if (!$img.length) {
            console.log('No poster image found');
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
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'z-index': 2
            }
        });

        // Создаем изображение логотипа
        var $logo = $('<img>', {
            src: Lampa.TMDB.image('w300' + logoPath),
            css: {
                width: '80%',
                'object-fit': 'contain'
            }
        }).on('error', function() {
            $wrap.remove();
        });

        // Добавляем логотип
        $wrap.append($logo);

        // Добавляем обертку к постеру
        var $poster = $('.full-start-new__poster', render);
        $poster.css('position', 'relative');
        $poster.append($wrap);
        
        console.log('=== Logo addition completed ===');
    }

    function getImages(card) {
        return new Promise(function(resolve, reject) {
            if (!card.id) return reject();
            
            var url = Lampa.TMDB.api((card.name ? 'tv' : 'movie') + '/' + card.id + '/images');
            
            var network = new Lampa.Reguest();
            network.silent(url, function(images) {
                if (images && images.logos) {
                    card.images = images;
                    resolve();
                } else {
                    reject();
                }
            }, function() {
                reject();
            });
        });
    }

    function initPlugin() {
        console.log('=== Plugin initialization started ===');

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                console.log('=== Processing complete event ===');
                
                var render = e.object.activity.render();
                var card = e.object.card;
                
                if (!card) {
                    console.log('No card data found');
                    return;
                }
                
                if (!card.images) {
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