(function () {
    'use strict';

    function addLogo(render, movie) {
        console.log('=== Adding logo ===');
        
        // Находим постер
        var $poster = $('.full-start-new__poster', render);
        console.log('Poster found:', $poster.length > 0);
        
        if (!$poster.length) return;

        // Получаем URL для запроса изображений
        var url = Lampa.TMDB.api((movie.name ? 'tv' : 'movie') + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language'));
        console.log('Fetching images from:', url);

        // Делаем запрос
        $.get(url, function(response) {
            if (response.logos && response.logos[0]) {
                var logoPath = response.logos[0].file_path;
                
                if (logoPath) {
                    console.log('Logo path:', logoPath);

                    // Удаляем старый логотип если есть
                    $('.logo-container').remove();

                    // Добавляем relative к постеру
                    $poster.css('position', 'relative');

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
                        .attr('src', Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')))
                        .css({
                            'max-width': '200px',
                            'max-height': '100px',
                            'object-fit': 'contain'
                        });

                    // Добавляем логотип в контейнер
                    $container.append($logo);

                    // Добавляем контейнер к постеру
                    $poster.append($container);
                    
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