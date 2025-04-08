(() => {
    if (!window.Plugin) return;

    Plugin.register('cartoon_collections', {
        title: 'Мультфильмы',
        icon: 'emoji_people',
        description: 'Подборки мультфильмов по студиям, годам и жанрам',
        type: 'menu',
        onClick: function () {
            Activity.push({
                url: '',
                title: 'Подборки мультфильмов',
                component: 'cartoon_collections_main',
                page: 1
            });
        },
        init: function () {
            Lampa.Menu.add({
                name: 'cartoon_collections',
                title: 'Мультфильмы',
                icon: 'emoji_people',
                class: 'menu-item-cartoon',
                onClick: () => {
                    Activity.push({
                        url: '',
                        title: 'Подборки мультфильмов',
                        component: 'cartoon_collections_main',
                        page: 1
                    });
                }
            });
        }
    });

    // Компонент главной страницы
    Lampa.Component.add('cartoon_collections_main', {
        create: function () {
            this.scroll = new Lampa.Scroll({ mask: true });
            this.body = this.scroll.render();

            this.build();
        },
        build: function () {
            this.appendCategory('По студиям', [
                { title: 'Pixar', id: 3 }, // TMDB company ID
                { title: 'DreamWorks', id: 521 },
                { title: 'Ghibli', id: 10342 }
            ], 'studio');

            this.appendCategory('По годам', [
                { title: '2020-е', year: '2020' },
                { title: '2010-е', year: '2010' },
                { title: '2000-е', year: '2000' }
            ], 'year');
        },
        appendCategory: function (title, items, type) {
            let view = Lampa.Template.get('items_line', { title });

            let container = view.querySelector('.items-line__container');

            items.forEach(item => {
                let card = Lampa.Template.get('card', {
                    title: item.title
                });

                card.addEventListener('hover:enter', () => {
                    if (type === 'studio') {
                        Lampa.Activity.push({
                            url: `https://api.themoviedb.org/3/discover/movie?with_companies=${item.id}&with_genres=16`,
                            component: 'category',
                            page: 1,
                            title: item.title
                        });
                    } else if (type === 'year') {
                        Lampa.Activity.push({
                            url: `https://api.themoviedb.org/3/discover/movie?primary_release_year=${item.year}&with_genres=16`,
                            component: 'category',
                            page: 1,
                            title: item.title
                        });
                    }
                });

                container.append(card);
            });

            this.body.append(view);
        },
        render: function () {
            return this.body;
        },
        destroy: function () {
            this.scroll.destroy();
        }
    });
})();