// Плагин KUV mult для Lampa.

// Добавляет кнопку "Мультики".
// Открывает страничку с мультиками, учитывая источник в настройках (TMDb или CUB).
// Подходит как для отдельного использования, так и в комплексе с kuv-style.

(function() {
    'use strict';

    // Функция инициализации плагина
    function initPlugin() {
        // Создание элемента меню
        var menuItem = $('<li class="menu__item selector" data-action="cartoons">\
            <div class="menu__ico data-action-cartoons">\
                <svg viewBox="0 0 32 27" fill="none"><path d="M12.846 6.303l.238 1.51 1.505-.267c.517-.092 1.05-.14 1.596-.14.437 0 .866.03 1.286.09l1.45.206.24-1.445c.448-2.698 2.799-4.757 5.63-4.757 3.155 0 5.708 2.553 5.708 5.698 0 2.678-1.852 4.93-4.352 5.537l-1.424.346.313 1.432c.137.624.209 1.273.209 1.94 0 4.995-4.055 9.047-9.061 9.047-5.006 0-9.061-4.052-9.061-9.047 0-.644.067-1.271.194-1.875l.316-1.503-1.503-.286c-2.639-.502-4.63-2.82-4.63-5.597 0-3.145 2.554-5.698 5.708-5.698 2.848 0 5.209 2.083 5.638 4.803z" stroke="currentColor" stroke-width="3"/></svg>\
            </div>\
            <div class="menu__text">Мультики</div>\
        </li>');

        // Обработка события клика по элементу меню
        menuItem.on("hover:enter", function() {
            var source = Lampa.Storage.get('source', 'cub');

            if (source === 'tmdb') {
                Lampa.Activity.push({
                    url: "discover/movie?with_genres=16&sort_by=popularity.desc",
                    title: "Мультики - TMDB",
                    component: "category_full",
                    source: "tmdb",
                    genres: 16,
                    card_type: true,
                    page: 1
                });
            } else {
                Lampa.Activity.push({
                    url: "",
                    title: "Мультики - CUB",
                    component: "category",
                    genres: 16,
                    id: 16,
                    source: "cub",
                    card_type: true,
                    page: 1
                });
            }
        });

        // Вставка элемента меню в интерфейс
        var tvItem = $(".menu .menu__list").eq(0).find("[data-action=tv]");
        if (tvItem.length) {
            tvItem.before(menuItem);
        } else {
            $(".menu .menu__list").eq(0).append(menuItem);
        }
    }

    // Проверка готовности приложения и инициализация плагина
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow("app", function(e) {
            if (e.type === "ready") {
                initPlugin();
            }
        });
    }
})();