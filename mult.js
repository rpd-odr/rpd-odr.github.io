(function () {
    'use strict';

    function showCollectionsMenu() {
        const controller = Lampa.Controller.enabled().name;

        // Определяем подборки для мультфильмов и мультсериалов
        const collections = [
            // Мультфильмы по студиям
            {
                title: 'Disney',
                url: 'discover/movie',
                filter: { with_companies: '2', with_genres: '16' }, // 2 - Disney, 16 - Animation
                sort: 'vote_average.desc',
                type: 'movie'
            },
            {
                title: 'Pixar',
                url: 'discover/movie',
                filter: { with_companies: '3', with_genres: '16' }, // 3 - Pixar
                sort: 'vote_average.desc',
                type: 'movie'
            },
            // Мультсериалы по студиям
            {
                title: 'Cartoon Network',
                url: 'discover/tv',
                filter: { with_networks: '56', with_genres: '16' }, // 56 - Cartoon Network
                sort: 'vote_average.desc',
                type: 'tv'
            },
            // По годам
            {
                title: 'Новинки 2020-х',
                url: 'discover/movie',
                filter: { 
                    with_genres: '16', 
                    'primary_release_date.gte': '2020-01-01',
                    'primary_release_date.lte': '2029-12-31'
                },
                sort: 'primary_release_date.desc',
                type: 'movie'
            },
            {
                title: 'Классика 90-х',
                url: 'discover/movie',
                filter: { 
                    with_genres: '16', 
                    'primary_release_date.gte': '1990-01-01',
                    'primary_release_date.lte': '1999-12-31'
                },
                sort: 'vote_average.desc',
                type: 'movie'
            },
            // По рейтингу и популярности
            {
                title: 'Высокий рейтинг',
                url: 'discover/movie',
                filter: { with_genres: '16', 'vote_count.gte': 100, 'vote_average.gte': 8 },
                sort: 'vote_average.desc',
                type: 'movie'
            },
            {
                title: 'Популярные сериалы',
                url: 'discover/tv',
                filter: { with_genres: '16', 'vote_count.gte': 50 },
                sort: 'popularity.desc',
                type: 'tv'
            },
            // Дополнительная подборка
            {
                title: 'Семейные мультфильмы',
                url: 'discover/movie',
                filter: { with_genres: '16,10751' }, // 10751 - Family
                sort: 'vote_average.desc',
                type: 'movie'
            }
        ];

        Lampa.Select.show({
            title: 'Подборки мультфильмов',
            items: collections.map(collection => ({
                title: collection.title,
                collection: collection
            })),
            onBack: function() {
                Lampa.Controller.toggle(controller);
            },
            onSelect: function(item) {
                Lampa.Activity.push({
                    url: item.collection.url,
                    title: item.collection.title,
                    component: 'category_full',
                    source: 'tmdb',
                    card_type: true,
                    page: 1,
                    sort_by: item.collection.sort,
                    filter: item.collection.filter
                });
            }
        });
    }

    function addCollectionsButton() {
        if ($('.menu__collections-button').length) return;

        const menu = $('.menu .menu__list');
        if (!menu.length) return;

        const button = $('<li>')
            .addClass('menu__item selector menu__collections-button')
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
            .on('hover:enter', function() {
                showCollectionsMenu();
            });

        menu.append(button);
    }

    function initPlugin() {
        if ($('style#collections-plugin').length === 0) {
            $('<style>')
                .attr('id', 'collections-plugin')
                .html(`
                    .menu__collections-button .menu__ico svg {
                        width: 38px;
                        height: 38px;
                    }
                    .menu__collections-button .menu__text {
                        line-height: 38px;
                    }
                `)
                .appendTo('head');
        }

        Lampa.Listener.follow('menu', function(e) {
            if (e.type === 'load') {
                addCollectionsButton();
            }
        });

        if ($('.menu .menu__list').length) {
            addCollectionsButton();
        }
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && initPlugin());
})();