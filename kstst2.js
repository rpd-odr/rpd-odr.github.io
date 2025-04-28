(function () {
    'use strict';

    function addLogo(render, movie) {
        console.log('=== Adding logo ===');
        
        // Проверяем, находимся ли мы в портретном режиме
        var $portrait = $('.full-start-new__poster', render);
        if (!$portrait.length) return;

        // Получаем URL для запроса изображений
        var url = Lampa.TMDB.api((movie.name ? 'tv' : 'movie') + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language'));
        console.log('Fetching images from:', url);

        // Делаем запрос
        $.get(url, function(response) {
            if (response.logos && response.logos[0]) {
                var logoPath = response.logos[0].file_path;
                
                if (logoPath) {
                    console.log('Logo path:', logoPath);

                    // Скрываем оригинальное название
                    $('.full-start-new__title', render).hide();

                    // Удаляем старый логотип если есть
                    $('.logo-container').remove();

                    // Добавляем relative к постеру
                    $portrait.css('position', 'relative');

                    // Создаем контейнер для логотипа
                    var $container = $('<div>')
                        .addClass('logo-container')
                        .css({
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: '999'
                        });

                    // Создаем изображение логотипа
                    var $logo = $('<img>')
                        .attr('src', Lampa.TMDB.image('/t/p/w300' + logoPath))
                        .css({
                            'max-width': '12.5em',    // 200px -> 12.5em (при базовом размере 16px)
                            'max-height': '6.25em',   // 100px -> 6.25em
                            'object-fit': 'contain',
                            'filter': 'drop-shadow(0px 0px 0.125em rgba(0,0,0,0.5))'  // 2px -> 0.125em
                        });

                    // Добавляем логотип в контейнер
                    $container.append($logo);

                    // Добавляем контейнер к постеру
                    $portrait.append($container);
                    
                    console.log('=== Logo added ===');
                }
            }
        });
    }

    function initPlugin() {
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                var render = e.object.activity.render();
                var movie = e.data.movie;
                if (movie) {
                    addLogo(render, movie);
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