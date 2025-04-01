// animation_plugin.js
(function () {
    'use strict';

    // Ждём полной загрузки Lampa
    function initPlugin() {
        console.log("Инициализация минимального плагина для мультфильмов...");

        // Иконка для меню
        let multIcon = '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm0-4H9V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';

        // Добавление пункта "Мультфильмы" в меню
        try {
            const menuItem = $(
                '<li class="menu__item selector" data-action="mult">' +
                '<div class="menu__ico"></div>' +
                '<div class="menu__text">Мультфильмы</div>' +
                '</li>'
            );
            if (typeof loadInlineSVG === "function") {
                loadInlineSVG(multIcon, menuItem.find('.menu__ico'));
            } else {
                menuItem.find('.menu__ico').html(multIcon);
            }
            menuItem.on('hover:enter', function () {
                console.log("Открытие страницы 'Мультфильмы'...");
                Lampa.Activity.push({
                    url: '',
                    title: 'Мультфильмы',
                    component: 'main',
                    page: 1
                });
            });
            $('.menu .menu__list').eq(0).append(menuItem);
            console.log("Пункт меню 'Мультфильмы' успешно добавлен.");
        } catch (e) {
            console.error("Ошибка при добавлении пункта меню:", e);
        }
    }

    // Ожидание полной загрузки Lampa
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'app_ready') {
                initPlugin();
            }
        });
    }
})();