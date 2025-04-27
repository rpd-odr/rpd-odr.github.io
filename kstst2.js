(function () {
    'use strict';

    function addTitleLogo(render, card) {
        console.log('=== Starting addTitleLogo ===');
        
        // Проверяем наличие постера
        var $poster = $('.full-start-new__poster', render);
        console.log('Poster found:', $poster.length > 0);
        
        if (!$poster.length) {
            console.log('No poster element found');
            return;
        }

        // Пытаемся найти логотип в данных карточки
        var logoPath = null;
        
        if (card.images && card.images.logos && card.images.logos.length > 0) {
            // Пытаемся найти русский или английский логотип
            var ruLogo = card.images.logos.find(function(l) { return l.iso_639_1 === 'ru'; });
            var enLogo = card.images.logos.find(function(l) { return l.iso_639_1 === 'en'; });
            var anyLogo = card.images.logos[0];
            
            if (ruLogo || enLogo || anyLogo) {
                logoPath = (ruLogo || enLogo || anyLogo).file_path;
                console.log('Found logo in card.images.logos:', logoPath);
            }
        }

        if (!logoPath) {
            console.log('No logo found');
            return;
        }

        // Удаляем старый логотип если есть
        $('.title-logo', $poster).remove();

        // Создаем контейнер для логотипа
        var $logoContainer = $('<div>')
            .addClass('title-logo')
            .css({
                'position': 'absolute',
                'top': '50%',
                'left': '50%',
                'transform': 'translate(-50%, -50%)',
                'width': '80%',
                'height': '25%',
                'z-index': '2',
                'pointer-events': 'none'
            });

        // Создаем изображение
        var imgUrl = Lampa.TMDB.image('w500' + logoPath);
        console.log('Logo URL:', imgUrl);
        
        var $logo = $('<img>')
            .attr('src', imgUrl)
            .css({
                'width': '100%',
                'height': '100%',
                'object-fit': 'contain',
                'opacity': '0.7',
                'filter': 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.5))'
            })
            .on('load', function() {
                console.log('Logo image loaded successfully');
            })
            .on('error', function() {
                console.log('Logo image failed to load');
                $logoContainer.remove();
            });

        // Добавляем изображение в контейнер
        $logoContainer.append($logo);

        // Устанавливаем position: relative для постера
        if ($poster.css('position') !== 'relative') {
            $poster.css('position', 'relative');
        }

        // Добавляем логотип
        $poster.append($logoContainer);
        
        console.log('=== Logo addition completed ===');
    }

    function initPlugin() {
        console.log('=== Plugin initialization started ===');

        // Добавляем базовые стили
        if (!$('#title-logo-style').length) {
            $('<style>')
                .attr('id', 'title-logo-style')
                .text('.title-logo img { display: block !important; }')
                .appendTo('head');
            console.log('Base styles added');
        }

        // Следим за событием
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                console.log('=== Processing complete event ===');
                
                var render = e.object.activity.render();
                var card = e.object.card;
                
                if (!card) {
                    console.log('No card data found');
                    return;
                }
                
                // Проверяем наличие данных с логотипами
                if (!card.images) {
                    console.log('No images data, fetching...');
                    var url = card.name ? 
                        Lampa.TMDB.api('tv/' + card.id + '/images') : 
                        Lampa.TMDB.api('movie/' + card.id + '/images');
                        
                    var network = new Lampa.Reguest();
                    network.silent(url, function(data) {
                        if (data && data.logos) {
                            card.images = data;
                            addTitleLogo(render, card);
                        }
                    });
                } else {
                    addTitleLogo(render, card);
                }
            }
        });
    }

    // Запускаем плагин
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