!function() {
    "use strict";
    
    // Ждём загрузки приложения
    Lampa.Listener.follow("app", function(e) {
        if (e.type === "ready") {
            // Создаём элемент меню
            var menuItem = $('<li class="menu__item selector" data-action="cartoons">\
                <div class="menu__ico">\
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 1000 1000">\<path fill="currentColor" d="M865 304c-11-33-31-61-60-82-31-24-66-39-106-41-29-2-56 3-82 17-33 17-56 44-69 79-6 17-10 35-11 53 0 4-2 5-6 4-12-3-24-2-36-2l-29 2c-2 1-5 1-5-3 1-5-1-11-2-16a146 146 0 0 0-54-96c-24-20-51-31-82-34-28-2-55 2-80 13a186 186 0 0 0-118 150 160 160 0 0 0 65 151c20 14 43 20 68 24 4 0 5 1 4 5a239 239 0 0 0 16 146 237 237 0 0 0 203 145 243 243 0 0 0 256-291c0-3 0-5 4-5l30-6c25-8 47-22 64-42a175 175 0 0 0 30-170zm-21 85c-4 28-16 52-36 72-17 16-36 26-59 30-8 2-17 2-26 3l-21-2c-3 0-4 1-3 4l7 23a187 187 0 0 1 4 95 218 218 0 0 1-162 171 214 214 0 0 1-157-24c-40-24-69-58-87-101a205 205 0 0 1-17-105c3-21 8-40 14-59 2-4 0-3-3-3-12 1-24 2-36 1a115 115 0 0 1-103-85 145 145 0 0 1 31-141c19-21 43-37 71-47 21-7 43-9 65-6 38 6 68 24 88 57a150 150 0 0 1 17 95c0 4 0 5 5 4a214 214 0 0 1 128-1c5 2 4 0 4-3-3-12-3-23-2-34 2-35 13-67 39-91 16-15 34-24 55-29 18-5 36-5 55-2 25 5 48 16 69 31a148 148 0 0 1 60 147z"/>\</svg>\
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
