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
                    component: 'custom_collections',
                    page: 1
                });
            });

        $('.menu .menu__list').append(button);
    }

    Lampa.Component.add('custom_collections', function () {
        this.create = function () {
            const collections = [
                { title: 'Disney', url: 'discover/movie', filter: { with_companies: '2', with_genres: '16', sort_by: 'vote_average.desc' } },
                { title: 'Pixar', url: 'discover/movie', filter: { with_companies: '3', with_genres: '16', sort_by: 'vote_average.desc' } },
                { title: 'Cartoon Network', url: 'discover/tv', filter: { with_networks: '56', with_genres: '16', sort_by: 'vote_average.desc' } },
                { title: 'Новинки 2020-х', url: 'discover/movie', filter: { with_genres: '16', 'primary_release_date.gte': '2020-01-01', sort_by: 'primary_release_date.desc' } }
            ];

            const shuffledCollections = Lampa.Arrays.shuffle(collections);

            this.container = $('<div class="categories"></div>');

            shuffledCollections.forEach(collection => {
                const categoryBlock = $('<div class="category"><h2>' + collection.title + '</h2><div class="category-list"></div></div>');

                Lampa.TMDB.get({
                    url: collection.url,
                    filter: collection.filter,
                    source: 'tmdb',
                    page: 1
                }, (data) => {
                    if (data && data.results && data.results.length) {
                        const list = categoryBlock.find('.category-list');
                        data.results.slice(0, 10).forEach(item => {
                            const card = $('<div class="card card--small">' +
                                '<img src="' + (item.poster_path ? 'https://image.tmdb.org/t/p/w200' + item.poster_path : '') + '" />' +
                                '<div class="card__title">' + (item.title || item.name) + '</div>' +
                                '</div>');
                            card.on('hover:enter', () => {
                                Lampa.Activity.push({
                                    url: 'movie/' + item.id,
                                    title: item.title || item.name,
                                    component: 'full',
                                    id: item.id,
                                    source: 'tmdb'
                                });
                            });
                            list.append(card);
                        });
                    } else {
                        console.log('No results for:', collection.title);
                    }
                }, () => {
                    console.log('Error loading:', collection.title);
                });

                this.container.append(categoryBlock);
            });

            return this.container;
        };

        this.destroy = function () {
            if (this.container) this.container.remove();
        };
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
                    .categories { padding: 20px; }
                    .category { margin-bottom: 20px; }
                    .category h2 { font-size: 24px; color: #fff; margin-bottom: 10px; }
                    .category-list { display: flex; flex-wrap: wrap; gap: 10px; }
                    .card--small { width: 120px; cursor: pointer; }
                    .card--small img { width: 100%; border-radius: 8px; }
                    .card__title { font-size: 14px; color: #fff; text-align: center; margin-top: 5px; }
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