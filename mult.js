(function () {
    'use strict';

    function showFilterMenu() {
        const controller = Lampa.Controller.enabled().name;
        const type = Lampa.Storage.get('menu_type', 'movie'); // Получаем текущий тип (movie или tv)
        const isTv = type === 'tv';
        const dateField = isTv ? 'first_air_date' : 'primary_release_date';
        const currentDate = new Date().toISOString().split('T')[0];

        Lampa.Select.show({
            title: 'Фильтр контента',
            items: [
                {
                    title: 'Популярные',
                    sort: '',
                    filter: { 'vote_count.gte': 10 }
                },
                {
                    title: 'Новые',
                    sort: `${dateField}.desc`,
                    filter: { 
                        'vote_count.gte': 10,
                        [`${dateField}.lte`]: currentDate
                    }
                }
            ],
            onBack: function() {
                Lampa.Controller.toggle(controller);
            },
            onSelect: function(action) {
                Lampa.Activity.push({
                    url: `discover/${type}`,
                    title: action.title,
                    component: 'category_full',
                    source: 'tmdb',
                    card_type: true,
                    page: 1,
                    sort_by: action.sort,
                    filter: action.filter
                });
            }
        });
    }

    function addFilterButton() {
        // Проверяем, не добавлена ли кнопка ранее
        if ($('.menu__filter-button').length) return;

        const menu = $('.menu .menu__list');
        if (!menu.length) return;

        const button = $('<li>')
            .addClass('menu__item selector menu__filter-button')
            .append(
                $('<div>')
                    .addClass('menu__ico')
                    .append('<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><use xlink:href="#filter"></use></svg>')
            )
            .append(
                $('<div>')
                    .addClass('menu__text')
                    .text('Фильтр')
            )
            .on('hover:enter', function() {
                showFilterMenu();
            });

        // Добавляем кнопку в конец списка меню
        menu.append(button);
    }

    function initPlugin() {
        // Добавляем стили
        if ($('style#filter-plugin').length === 0) {
            $('<style>')
                .attr('id', 'filter-plugin')
                .html(`
                    .menu__filter-button .menu__ico svg {
                        width: 38px;
                        height: 38px;
                    }
                    .menu__filter-button .menu__text {
                        line-height: 38px;
                    }
                `)
                .appendTo('head');
        }

        // Добавляем кнопку при загрузке меню
        Lampa.Listener.follow('menu', function(e) {
            if (e.type === 'load') {
                addFilterButton();
            }
        });

        // Добавляем кнопку сразу, если меню уже загружено
        if ($('.menu .menu__list').length) {
            addFilterButton();
        }
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && initPlugin());
})();