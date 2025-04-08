'use strict';

Plugin.create({
    id: 'cartoon_collections',
    title: 'Мультфильмы',
    version: '1.0',
    description: 'Подборки мультфильмов по студиям и годам',
    author: 'ChatGPT',

    // Функция, выполняющаяся при активации плагина
    onSelect: function() {
        // Переход к компоненту с подборками мультфильмов
        Activity.push({
            url: '',
            title: 'Подборки мультфильмов',
            component: 'cartoon_collections_main',
            page: 1
        });
    }
});

// Определение компонента для отображения подборок мультфильмов
Component.add('cartoon_collections_main', {
    create: function() {
        // Создание прокручиваемого списка
        this.scroll = new Scroll({ mask: true });
        this.body = this.scroll.render();
        this.build();
    },

    build: function() {
        // Добавление категорий: по студиям и по годам
        this.appendCategory('По студиям', [
            { title: 'Pixar', id: 3 },
            { title: 'DreamWorks', id: 521 },
            { title: 'Ghibli', id: 10342 },
            { title: 'Walt Disney', id: 2 },
            { title: 'Blue Sky', id: 9383 }
        ], 'studio');

        this.appendCategory('По годам', [
            { title: '2020-е', year: '2020' },
            { title: '2010-е', year: '2010' },
            { title: '2000-е', year: '2000' },
            { title: '1990-е', year: '1990' }
        ], 'year');
    },

    appendCategory: function(title, items, type) {
        // Создание и отображение категории
        let view = Template.get('items_line', { title: title });
        let container = view.querySelector('.items-line__container');

        items.forEach(item => {
            let card = Template.get('card', { title: item.title });

            card.addEventListener('hover:enter', () => {
                // Переход к фильтру фильмов по выбранной категории
                if (type === 'studio') {
                    Activity.push({
                        url: '/discover/movie?with_companies=' + item.id + '&with_genres=16',
                        component: 'category',
                        page: 1,
                        source: 'tmdb',
                        title: item.title
                    });
                } else if (type === 'year') {
                    Activity.push({
                        url: '/discover/movie?primary_release_year=' + item.year + '&with_genres=16',
                        component: 'category',
                        page: 1,
                        source: 'tmdb',
                        title: item.title
                    });
                }
            });

            container.append(card);
        });

        this.body.append(view);
    },

    render: function() {
        // Отображение компонента
        return this.body;
    },

    destroy: function() {
        // Очистка ресурсов при уничтожении компонента
        this.scroll.destroy();
    }
});