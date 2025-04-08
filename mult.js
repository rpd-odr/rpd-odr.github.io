(function () {
    'use strict';

    function addCollectionsButton() {
        if ($('.menu .menu__item-collections').length) return;

        const button = $('<li>')
            .addClass('menu__item selector menu__item-collections')
            .append(
                $('<div>')
                    .addClass('menu__ico')
                    .append('<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><use xlink:href="#filter"></use></svg>')
            )
            .append(
                $('<div>')
                    .addClass('menu__text')
                    .text('Подборки')
            )
            .on('hover:enter', function () {
                Lampa.Activity.push({
                    url: 'discover/movie',
                    title: 'Подборки мультфильмов',
                    component: 'category_full',
                    source: 'tmdb',
                    page: 1,
                    filter: {
                        with_genres: '16', // Только мультфильмы
                        sort_by: 'popularity.desc'
                    }
                });
            });

        $('.menu .menu__list').append(button);
    }

    function initPlugin() {
        if ($('style#collections-plugin').length === 0) {
            $('<style>')
                .attr('id', 'collections-plugin')
                .html(`
                    .menu__item-collections .menu__ico svg {
                        width: 38px;
                        height: 38px;
                    }
                    .menu__item-collections .menu__text {
                        line-height: 38px;
                    }
                `)
                .appendTo('head');
        }

        addCollectionsButton();
        Lampa.Listener.follow('menu', function (e) {
            if (e.type === 'load') {
                addCollectionsButton();
            }
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && initPlugin());
})();