!function() {
    "use strict";
    
    // Ждём загрузки приложения
    Lampa.Listener.follow("app", function(e) {
        if (e.type === "ready") {
            // Создаём элемент меню
            var menuItem = $('<li class="menu__item selector" data-action="cartoons">\
                <div class="menu__ico">\
                    <svg fill="currentColor">\
                        <image xlink:href="https://rpd-odr.github.io/kuv/icons/rabbit-duotone.svg"/>\
                    </svg>\
                </div>\
                <div class="menu__text">Мультики</div>\
            </li>');

            // Обработка клика
            menuItem.on("hover:enter", function() {
                var source = Lampa.Storage.get('source', 'cub'); // Получаем текущий источник
                
                if (source === 'tmdb') {
                    // Для TMDB - объединённая подборка мультфильмов и мультсериалов
                    Lampa.Activity.push({
                        url: "discover/movie?with_genres=16&sort_by=popularity.desc",
                        title: "Мультики – TMDB",
                        component: "category_full",
                        source: "tmdb",
                        genres: 16,
                        card_type: true,
                        page: 1
                    });
                }
                else {
                    // Для CUB - стандартная категория мультфильмов
                    Lampa.Activity.push({
                        url: "",
                        title: "Мультики – CUB",
                        component: "category",
                        genres: 16,
                        id: 16,
                        source: "cub",
                        card_type: true,
                        page: 1
                    });
                }
            });

            // Вставляем кнопку в меню перед пунктом "Сериалы"
            $(".menu .menu__list").eq(0).find("[data-action=tv]").before(menuItem);
        }
    });
}();
