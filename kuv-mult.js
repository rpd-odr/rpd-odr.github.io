// Плагин KUV mult для Lampa.

// Добавляет кнопку "Мультики".
// Открывает страничку с мультиками, учитывая источник в настройках (TMDb или CUB).
// Подходит как для отдельного использования, так и в комплексе с kuv-style.

(function() {
    'use strict';

    // Конфигурация активностей
    var activities = {
        tmdb: {
            url: "discover/movie?with_genres=16&sort_by=popularity.desc",
            title: "Мультики - TMDB",
            component: "category_full",
            source: "tmdb",
            genres: 16,
            card_type: true,
            page: 1
        },
        cub: {
            url: "",
            title: "Мультики - CUB",
            component: "category",
            genres: 16,
            id: 16,
            source: "cub",
            card_type: true,
            page: 1
        }
    };

    // Функция создания элемента меню
    function createMenuItem() {
        var menuItem = $('<li class="menu__item selector" data-action="cartoons">\
            <div class="menu__ico data-action-cartoons">\
                <svg viewBox="0 0 32 27" fill="none"><path d="M12.846 6.303l.238 1.51 1.505-.267c.517-.092 1.05-.14 1.596-.14.437 0 .866.03 1.286.09l1.45.206.24-1.445c.448-2.698 2.799-4.757 5.63-4[...]</div>\
            <div class="menu__text">Мультики</div>\
        </li>');

        // Добавляем обработчик события
        menuItem.on("hover:enter", function() {
            var source = Lampa.Storage.get('source', 'cub');
            Lampa.Activity.push(activities[source]);
        });

        return menuItem;
    }

    // Функция вставки элемента меню
    function insertMenuItem(menuItem) {
        var menuList = $(".menu .menu__list").eq(0);
        var tvItem = menuList.find("[data-action=tv]");
        
        if (tvItem.length) {
            tvItem.before(menuItem);
        } else {
            menuList.append(menuItem);
        }
    }

    // Функция инициализации плагина
    function initPlugin() {
        var menuItem = createMenuItem();
        insertMenuItem(menuItem);
    }

    // Инициализация при загрузке
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
