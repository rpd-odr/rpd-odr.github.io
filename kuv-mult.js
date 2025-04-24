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
            <svg viewBox="0 0 32 27" fill="none"><path d="M12.846 6.303l.238 1.51 1.505-.267c.517-.092 1.05-.14 1.596-.14.437 0 .866.03 1.286.09l1.45.206.24-1.445c.448-2.698 2.799-4.757 5.63-4.757 2.831 0 5.182 2.059 5.63 4.757l.24 1.445 1.45-.206c.42-.06.85-.09 1.286-.09.547 0 1.08.048 1.596.14l1.505.267.238-1.51c.366-2.321 2.377-4.103 4.8-4.103 2.661 0 4.8 2.14 4.8 4.8 0 2.422-1.782 4.433-4.103 4.8l-1.51.237.268 1.506c.091.517.139 1.049.139 1.596 0 .437-.03.866-.09 1.286l-.206 1.45 1.445.24c2.698.448 4.757 2.799 4.757 5.63 0 2.831-2.059 5.182-4.757 5.63l-1.445.24.206 1.45c.06.42.09.85.09 1.286 0 .547-.048 1.08-.14 1.596l-.267 1.505 1.51.238c2.321.366 4.103 2.377 4.103 4.8 0 2.661-2.14 4.8-4.8 4.8-2.422 0-4.433-1.782-4.8-4.103l-.237-1.51-1.506.268c-.517.091-1.049.139-1.596.139-.437 0-.866-.03-1.286-.09l-1.45-.206-.24 1.445c-.448 2.698-2.799 4.757-5.63 4.757-2.831 0-5.182-2.059-5.63-4.757l-.24-1.445-1.45.206c-.42.06-.85.09-1.286.09-.547 0-1.08-.048-1.596-.14l-1.505-.267-.238 1.51c-.366 2.321-2.377 4.103-4.8 4.103-2.661 0-4.8-2.14-4.8-4.8 0-2.422 1.782-4.433 4.103-4.8l1.51-.237-.268-1.506c-.091-.517-.139-1.049-.139-1.596 0-.437.03-.866.09-1.286l.206-1.45-1.445-.24C4.259 19.182 2.2 16.831 2.2 14c0-2.831 2.059-5.182 4.757-5.63l1.445-.24-.206-1.45c-.06-.42-.09-.85-.09-1.286 0-.547.048-1.08.14-1.596l.267-1.505-1.51-.238C4.682 1.689 2.9-.322 2.9-2.7c0-2.661 2.14-4.8 4.8-4.8 2.422 0 4.433 1.782 4.8 4.103z" stroke-width="2"/></svg>\
        </div>\
        <div class="menu__text">Мультики</div>\
    </li>');

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
