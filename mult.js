(function() {
    'use strict';
    
    var checkLampa = setInterval(function() {
        if (typeof Lampa !== 'undefined' && Lampa.Storage && Lampa.Activity) {
            clearInterval(checkLampa);
            
            // Создаем элемент меню
            var menuItem = $('<li class="menu__item selector" data-action="cartoons">\
                <div class="menu__ico">\
                    <svg viewBox="0 0 32 27" fill="none"><path d="M12.846 6.303l.238 1.51 1.505-.267c.517-.092 1.05-.14 1.596-.14.437 0 .866.03 1.286.09l1.45.206.24-1.445c.448-2.698 2.799-4.757 5.63-4.757 3.155 0 5.708 2.553 5.708 5.698 0 2.678-1.852 4.93-4.352 5.537l-1.424.346.313 1.432c.137.624.209 1.273.209 1.94 0 4.995-4.055 9.047-9.061 9.047-5.006 0-9.061-4.052-9.061-9.047 0-.644.067-1.271.194-1.875l.316-1.503-1.503-.286c-2.639-.502-4.63-2.82-4.63-5.597 0-3.145 2.554-5.698 5.708-5.698 2.848 0 5.209 2.083 5.638 4.803z" stroke="currentColor" stroke-width="3"/></svg>\
                </div>\
                <div class="menu__text">Мультики</div>\
            </li>');

            // Обработка клика
            menuItem.on("hover:enter", function() {
                var source = Lampa.Storage.get('source', 'cub');
                
                if (source === 'tmdb') {
                    Lampa.Activity.push({
                        url: "discover/movie?with_genres=16&sort_by=popularity.desc",
                        title: "Мультики — TMDB",  // Изменённое название для TMDB
                        component: "category_full",
                        source: "tmdb",
                        genres: 16,
                        card_type: true,
                        page: 1
                    });
                }
                else {
                    Lampa.Activity.push({
                        url: "",
                        title: "Мультики — CUB",  // Изменённое название для CUB
                        component: "category",
                        genres: 16,
                        id: 16,
                        source: "cub",
                        card_type: true,
                        page: 1
                    });
                }
            });

            // Функция для вставки в меню
            var insertMenuItem = function() {
                var menuList = $(".menu .menu__list").eq(0);
                if (menuList.length) {
                    var tvItem = menuList.find("[data-action=tv]");
                    if (tvItem.length) {
                        tvItem.before(menuItem);
                    } else {
                        menuList.append(menuItem);
                    }
                    return true;
                }
                return false;
            };

            // Пытаемся вставить сразу
            if (!insertMenuItem()) {
                // Если меню еще не готово, проверяем периодически
                var insertTimer = setInterval(function() {
                    if (insertMenuItem()) {
                        clearInterval(insertTimer);
                    }
                }, 100);
            }
        }
    }, 100);
})();
