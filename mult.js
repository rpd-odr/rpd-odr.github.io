// animation_plugin.js
(function () {
    'use strict';

    // Ждём полной загрузки Lampa
    function initPlugin() {
        console.log("Инициализация минимального плагина для мультфильмов...");

        // Добавление пункта "Мультфильмы" в меню (без иконки)
        try {
            const menuItem = $(
                '<li class="menu__item selector" data-action="mult">' +
                '<div class="menu__text">Мультфильмы</div>' +
                '</li>'
            );
            menuItem.on('hover:enter', function () {
                console.log("Открытие страницы 'Мультфильмы'...");
                Lampa.Activity.push({
                    url: '',
                    title: 'Мультфильмы',
                    component: 'main',
                    page: 1
                });
                console.log("Активность 'Мультфильмы' запущена.");
            });
            $('.menu .menu__list').eq(0).append(menuItem);
            console.log("Пункт меню 'Мультфильмы' успешно добавлен.");
        } catch (e) {
            console.error("Ошибка при добавлении пункта меню:", e);
        }
    }

    // Запуск плагина после готовности приложения
    if (window.appready) {
        console.log("Lampa уже готова, запускаем плагин...");
        initPlugin();
    } else {
        console.log("Ожидаем готовности Lampa...");
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                console.log("Lampa готова, запускаем плагин...");
                initPlugin();
            }
        });
    }
})();