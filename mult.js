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
                    url: '',
                    title: 'Подборки мультфильмов',
                    component: 'collections_main',
                    page: 1
                });
            });

        $('.menu .menu__list').append(button);
    }

    Lampa.Component.add('collections_main', function () {
        this.create = function () {
            var categories = [
                { title: 'Новинки', url: 'discover/movie', filter: { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': new Date().toISOString().split('T')[0], 'vote_count.gte': '100' } },
                { title: 'Популярное', url: 'discover/movie', filter: { sort_by: 'popularity.desc', 'vote_count.gte': '100' } },
                { title: 'Ожидаемое', url: 'movie/upcoming', filter: { sort_by: 'popularity.desc' } }
            ];
            categories = Lampa.Arrays.shuffle(categories);
            this.page = new Lampa.Main({
                title: 'Подборки мультфильмов',
                categories: categories.map(function (c) {
                    return { title: c.title, url: c.url, filter: c.filter, source: 'tmdb', card_type: true };
                })
            });
            this.page.render();
            return this.page;
        };
        this.destroy = function () { if (this.page) this.page.destroy(); };
    });

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