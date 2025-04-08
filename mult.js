(function () {
    'use strict';

    // Функция для перемешивания массива
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Добавление кнопки в меню
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
                const collections = [
                    { title: 'Disney', url: 'discover/movie', filter: { with_companies: '2', with_genres: '16' }, sort: 'vote_average.desc' },
                    { title: 'Pixar', url: 'discover/movie', filter: { with_companies: '3', with_genres: '16' }, sort: 'vote_average.desc' },
                    { title: 'Cartoon Network', url: 'discover/tv', filter: { with_networks: '56', with_genres: '16' }, sort: 'vote_average.desc' },
                    { title: 'Новинки 2020-х', url: 'discover/movie', filter: { with_genres: '16', 'primary_release_date.gte': '2020-01-01' }, sort: 'primary_release_date.desc' },
                    { title: 'Классика 90-х', url: 'discover/movie', filter: { with_genres: '16', 'primary_release_date.lte': '1999-12-31' }, sort: 'vote_average.desc' },
                    { title: 'Высокий рейтинг', url: 'discover/movie', filter: { with_genres: '16', 'vote_average.gte': 7 }, sort: 'vote_average.desc' },
                    { title: 'Популярные сериалы', url: 'discover/tv', filter: { with_genres: '16' }, sort: 'popularity.desc' },
                    { title: 'Семейные мультфильмы', url: 'discover/movie', filter: { with_genres: '16,10751' }, sort: 'vote_average.desc' }
                ];

                // Перемешиваем подборки
                const shuffledCollections = shuffle([...collections]);

                Lampa.Activity.push({
                    url: '',
                    title: 'Подборки мультфильмов',
                    component: 'category_full',
                    page: 1,
                    categories: shuffledCollections.map(collection => ({
                        title: collection.title,
                        url: collection.url,
                        filter: collection.filter,
                        sort_by: collection.sort,
                        source: 'tmdb',
                        card_type: true
                    }))
                });
            });

        $('.menu .menu__list').append(button);
    }

    // Инициализация плагина
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