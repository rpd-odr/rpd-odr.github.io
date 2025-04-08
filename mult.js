(function () {
    'use strict';

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
                Lampa.Activity.push({
                    url: '',
                    title: 'Подборки мультфильмов',
                    component: 'collections_main',
                    page: 1
                });
            });

        $('.menu .menu__list').append(button);
    }

    // Регистрация компонента
    Lampa.Component.add('collections_main', function () {
        this.create = function () {
            const collections = [
                {
                    title: 'Disney',
                    url: 'discover/movie',
                    filter: { with_companies: '2', with_genres: '16', sort_by: 'vote_average.desc' }
                },
                {
                    title: 'Pixar',
                    url: 'discover/movie',
                    filter: { with_companies: '3', with_genres: '16', sort_by: 'vote_average.desc' }
                },
                {
                    title: 'Cartoon Network',
                    url: 'discover/tv',
                    filter: { with_networks: '56', with_genres: '16', sort_by: 'vote_average.desc' }
                },
                {
                    title: 'Новинки 2020-х',
                    url: 'discover/movie',
                    filter: { with_genres: '16', 'primary_release_date.gte': '2020-01-01', sort_by: 'primary_release_date.desc' }
                },
                {
                    title: 'Классика 90-х',
                    url: 'discover/movie',
                    filter: { with_genres: '16', 'primary_release_date.lte': '1999-12-31', sort_by: 'vote_average.desc' }
                },
                {
                    title: 'Высокий рейтинг',
                    url: 'discover/movie',
                    filter: { with_genres: '16', 'vote_average.gte': 7, sort_by: 'vote_average.desc' }
                },
                {
                    title: 'Популярные сериалы',
                    url: 'discover/tv',
                    filter: { with_genres: '16', sort_by: 'popularity.desc' }
                },
                {
                    title: 'Семейные мультфильмы',
                    url: 'discover/movie',
                    filter: { with_genres: '16,10751', sort_by: 'vote_average.desc' }
                }
            ];

            // Перемешиваем категории
            const shuffledCollections = Lampa.Arrays.shuffle(collections);

            // Создаём страницу
            this.page = new Lampa.Main({
                title: 'Подборки мультфильмов',
                categories: shuffledCollections.map(c => ({
                    title: c.title,
                    url: c.url,
                    filter: c.filter,
                    source: 'tmdb',
                    card_type: true
                }))
            });

            this.page.render();
            return this.page;
        };

        this.destroy = function () {
            if (this.page) this.page.destroy();
        };
    });

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