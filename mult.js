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

        const button = Lampa.Template.get('menu_button', {
            title: 'Подборки',
            class: 'menu__item-collections'
        });

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Подборки мультфильмов',
                component: 'collections_page',
                page: 1
            });
        });

        $('.menu .menu__list').append(button);
    }

    // Регистрация кастомного компонента для страницы подборок
    Lampa.Component.add('collections_page', function () {
        this.create = function () {
            const collections = [
                { title: 'Disney', url: 'discover/movie', filter: { with_companies: '2', with_genres: '16' }, sort: 'vote_average.desc' },
                { title: 'Pixar', url: 'discover/movie', filter: { with_companies: '3', with_genres: '16' }, sort: 'vote_average.desc' },
                { title: 'Cartoon Network', url: 'discover/tv', filter: { with_networks: '56', with_genres: '16' }, sort: 'vote_average.desc' },
                { title: 'Новинки 2020-х', url: 'discover/movie', filter: { with_genres: '16', 'primary_release_date.gte': '2020-01-01', 'primary_release_date.lte': '2029-12-31' }, sort: 'primary_release_date.desc' },
                { title: 'Классика 90-х', url: 'discover/movie', filter: { with_genres: '16', 'primary_release_date.gte': '1990-01-01', 'primary_release_date.lte': '1999-12-31' }, sort: 'vote_average.desc' },
                { title: 'Высокий рейтинг', url: 'discover/movie', filter: { with_genres: '16', 'vote_count.gte': 100, 'vote_average.gte': 8 }, sort: 'vote_average.desc' },
                { title: 'Популярные сериалы', url: 'discover/tv', filter: { with_genres: '16', 'vote_count.gte': 50 }, sort: 'popularity.desc' },
                { title: 'Семейные мультфильмы', url: 'discover/movie', filter: { with_genres: '16,10751' }, sort: 'vote_average.desc' }
            ];

            // Перемешиваем подборки
            const shuffledCollections = shuffle([...collections]);

            // Создаём объект страницы
            this.page = new Lampa.Main({
                title: 'Подборки мультфильмов',
                categories: shuffledCollections.map(collection => ({
                    title: collection.title,
                    url: collection.url,
                    filter: collection.filter,
                    sort: collection.sort,
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
        addCollectionsButton();

        // Добавляем кнопку при загрузке меню
        Lampa.Listener.follow('menu', function (e) {
            if (e.type === 'load') {
                addCollectionsButton();
            }
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && initPlugin());
})();