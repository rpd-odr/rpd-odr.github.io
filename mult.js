!function() {
    "use strict";
    
    // Ждём загрузки приложения
    Lampa.Listener.follow("app", function(e) {
        if (e.type === "ready") {
            // Создаём элемент меню
            var menuItem = $('<li class="menu__item selector" data-action="cartoons">\
                <div class="menu__ico">\
                    <svg viewBox="0 0 514 514" xmlns="http://www.w3.org/2000/svg">\
                        <path d="m400 2c-79 6-142 75-142 156v14h-99l-98 1-5 2c-38 17-23 63 21 65h15l-3 6c-10 20-10 24-11 76v45l-5-8c-7-12-13-26-18-39-5-15-6-17-11-21-13-12-35-7-41 10-6 16 17 70 46 105 116 145 347 127 439-34 31-54 31-87-1-87-15 0-21 5-28 27-6 18-28 58-31 58-1 0-1-22-1-49v-50l-11-55c-12-60-12-58-6-63 8-7 15-3 24 11 14 24 29 30 47 21 20-9 21-17 10-71-10-52-10-53 2-53s21-14 20-28c-1-6-2-7-10-13-30-20-65-29-103-26m43 74c-10 3-14 17-6 25 13 13 32-4 23-19-3-5-11-8-17-6m-289 114v27l1 26 2 3 3 3h46 46l3-3 2-3v-27-27h-51c-36 0-51 0-52 1m78 116c-54 9-96 54-102 109l-1 6 10 6c70 45 158 47 230 4 9-5 8-4 7-15-7-71-73-122-144-110" fill="currentColor" fill-rule="evenodd"/>\
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
                        title: "Мультики (TMDB)",
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
                        title: "Мультики",
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