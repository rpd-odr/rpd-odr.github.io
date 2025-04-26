(function () {
    'use strict';

    function addTitleLogo(render, card) {
        console.log('=== Starting addTitleLogo ===');
        console.log('Card:', card);
        console.log('Render:', render);

        // Проверяем наличие постера
        var $poster = $('.full-start-new__poster', render);
        console.log('Poster found:', $poster.length > 0);
        
        if (!$poster.length) {
            console.log('No poster element found');
            return;
        }

        // Пытаемся найти логотип в данных карточки
        var logoPath = null;
        
        // Проверка production_companies
        if (card.production_companies && card.production_companies.length > 0) {
            console.log('Found production_companies:', card.production_companies);
            var company = card.production_companies[0];
            if (company.logo_path) {
                logoPath = company.logo_path;
                console.log('Using company logo:', logoPath);
            }
        }

        if (!logoPath) {
            console.log('No logo found');
            return;
        }

        console.log('Creating logo container');
        
        // Создаем контейнер для логотипа
        var $logoContainer = $('<div>')
            .addClass('network-innie title-logo')
            .css({
                'position': 'absolute',
                'top': '-2em',
                'left': '50%',
                'transform': 'translateX(-50%)',
                'background-color': '#fff',
                'padding': '0.3em 1em',
                'border-radius': '0.7em',
                'z-index': '2'
            });

        console.log('Creating logo image');
        
        // Создаем изображение
        var imgUrl = Lampa.TMDB.image('t/p/w154' + logoPath);
        console.log('Logo URL:', imgUrl);
        
        var $logo = $('<img>')
            .attr('src', imgUrl)
            .css({
                'height': '1.5em',
                'max-width': '4.5em',
                'object-fit': 'contain'
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

        console.log('Setting poster position');
        
        // Устанавливаем position: relative для постера
        $poster.css('position', 'relative');

        console.log('Removing old logo if exists');
        // Удаляем старый логотип если есть
        $('.title-logo', $poster).remove();

        console.log('Appending new logo');
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
            console.log('Full event caught:', e.type);
            
            if (e.type === 'complite') {
                console.log('=== Processing complete event ===');
                console.log('Event object:', e);
                
                var render = e.object.activity.render();
                var card = e.object.card;
                
                if (!card) {
                    console.log('No card data found');
                    return;
                }
                
                if (!render) {
                    console.log('No render found');
                    return;
                }
                
                addTitleLogo(render, card);
            }
        });
        
        console.log('=== Plugin initialization completed ===');
    }

    // Запускаем плагин
    if (window.appready) {
        console.log('Window ready - initializing immediately');
        initPlugin();
    } else {
        console.log('Waiting for window ready event');
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                console.log('Got window ready event - initializing');
                initPlugin();
            }
        });
    }
})();