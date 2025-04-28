(function () {
    'use strict';

    function addRect(render) {
        console.log('=== Adding rectangle ===');
        
        // Находим постер
        var $poster = $('.full-start-new__poster', render);
        console.log('Poster found:', $poster.length > 0);
        
        if (!$poster.length) return;

        // Удаляем старый прямоугольник если есть
        $('.test-rect').remove();

        // Добавляем relative к постеру
        $poster.css('position', 'relative');

        // Создаем прямоугольник
        var $rect = $('<div>')
            .addClass('test-rect')
            .css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '100px',
                backgroundColor: 'red',
                zIndex: '999'
            });

        // Добавляем прямоугольник
        $poster.append($rect);
        
        console.log('=== Rectangle added ===');
    }

    function initPlugin() {
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                var render = e.object.activity.render();
                addRect(render);
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