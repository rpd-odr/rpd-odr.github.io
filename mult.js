!function() {
    "use strict";
    
    // Ждём загрузки приложения
    Lampa.Listener.follow("app", function(e) {
        if (e.type === "ready") {
            // Создаём элемент меню
            var menuItem = $('<li class="menu__item selector" data-action="cartoons">\
                <div class="menu__ico">\
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" id="Icons" version="1.1" viewBox="0 0 32 32">\<style>\.st0{fill:none;stroke:"currentColor";stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10}</style>\<ellipse cx="16" cy="12.9" class="st0" rx="8" ry="8.1"/>\<path d="M8 12c-1.7-.4-3-2-3-4 0-2.2 1.8-4 4-4 1.3 0 2.5.7 3.2 1.7m7.6 0c.7-1 1.9-1.7 3.2-1.7 2.2 0 4 1.8 4 4.1 0 1.9-1.3 3.5-3 4M14 12v1m4-1v1m-2 1v2" class="st0"/>\<ellipse cx="8.5" cy="24.5" class="st0" rx="2.8" ry="4.1" transform="rotate(-45 8.5 24.5)"/>\<ellipse cx="23.5" cy="24.5" class="st0" rx="4.1" ry="2.8" transform="rotate(-45 23.5 24.5)"/>\<path d="M9 21.4V21c0-1.1.3-2.2.7-3.1m10.5 8.7C19 27.5 17.6 28 16 28s-3-.5-4.2-1.4m10.5-8.7c.5.9.7 2 .7 3.1v.4m-16.8-.1c-.1-.4-.2-.9-.2-1.3 0-2 1.1-3.7 2.6-4m14.8 0c1.5.2 2.6 1.9 2.6 4 0 .4-.1.9-.2 1.3M10 18c0-2.2 2.7-4 6-4s6 1.8 6 4" class="st0"/>\</svg>\                 </div>\
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
