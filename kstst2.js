(function () {
    'use strict';

    function isPortraitMode() {
        return $('body').hasClass('orientation--portrait') || window.innerHeight > window.innerWidth;
    }

    function addTitleLogo(render, card) {
        console.log('Adding title logo, card:', card);
        
        if (!card || !isPortraitMode()) return;

        var $poster = $('.full-start-new__poster', render);
        if (!$poster.length) return;

        // Удаляем существующий логотип
        $('.title-logo', $poster).remove();

        // Ищем путь к логотипу в разных местах карточки
        var logoPath = null;
        
        // Проверяем прямой путь к логотипу
        if (card.logo_path) {
            logoPath = card.logo_path;
        }
        // Проверяем в images.logos (если есть)
        else if (card.images && card.images.logos && card.images.logos.length) {
            logoPath = card.images.logos[0].file_path;
        }

        if (!logoPath) return;

        // Создаем элементы так же, как для логотипа студии
        var imgUrl = Lampa.TMDB.image('t/p/w154' + logoPath);
        
        var $logoContainer = $('<div>')
            .addClass('title-logo')
            .css({
                'position': 'absolute',
                'top': '-2em',
                'left': '50%',
                'transform': 'translateX(-50%)',
                'background-color': '#fff',
                'padding': '0.3em 1em',
                'border-radius': '0.7em',
                'z-index': '2',
                'display': 'flex',
                'align-items': 'center'
            });

        var $logo = $('<img>')
            .attr('src', imgUrl)
            .css({
                'height': '100%',
                'max-height': '1.5em',
                'max-width': '4.5em',
                'object-fit': 'contain'
            })
            .on('error', function() {
                $logoContainer.remove();
            });

        $logoContainer.append($logo);

        // Добавляем логотип к постеру
        if ($poster.css('position') !== 'relative') {
            $poster.css('position', 'relative');
        }
        $poster.append($logoContainer);
    }

    function initPlugin() {
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                var render = e.object.activity.render();
                var card = e.object.card;
                
                console.log('Card data:', card);
                addTitleLogo(render, card);
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