// animation_plugin.js
(function () {
    // Используем встроенный API-ключ Lampa
    var apiKey = Lampa.Storage.get("tmdb_key");
    var tmdbBaseUrl = "https://api.themoviedb.org/3";

    // --- Иконка для меню (SVG, можно заменить на встроенную) ---
    var multIcon = '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm0-4H9V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';

    // --- Добавление пункта "Мультфильмы" в меню ---
    function addMultMenu() {
        const menuItem = $(
            '<li class="menu__item selector" data-action="mult">' +
            '<div class="menu__ico"></div>' +
            '<div class="menu__text">Мультфильмы</div>' +
            '</li>'
        );
        loadInlineSVG(multIcon, menuItem.find('.menu__ico'));
        menuItem.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Мультфильмы',
                component: 'main', // Используем main для кастомной страницы
                page: 1
            });
        });
        $('.menu .menu__list').eq(0).append(menuItem);
    }

    // --- Подборки ---
    // 1. Популярные мультфильмы
    Lampa.Component.add('animation_trending_movies', {
        title: "Популярные мультфильмы",
        source: function (params, oncomplete) {
            var url = `${tmdbBaseUrl}/trending/movie/week?api_key=${apiKey}&language=ru-RU&with_genres=16`;
            $.get(url, function (data) {
                var items = data.results.map(item => ({
                    title: item.title,
                    poster: "https://image.tmdb.org/t/p/w300" + item.poster_path,
                    id: item.id,
                    year: item.release_date ? item.release_date.split("-")[0] : "",
                    vote_average: item.vote_average,
                    type: "movie"
                }));
                oncomplete(items.slice(0, 10));
            });
        }
    });

    // 2. Новые мультфильмы
    Lampa.Component.add('animation_upcoming', {
        title: "Новые мультфильмы",
        source: function (params, oncomplete) {
            var url = `${tmdbBaseUrl}/movie/upcoming?api_key=${apiKey}&language=ru-RU&with_genres=16`;
            $.get(url, function (data) {
                var items = data.results.map(item => ({
                    title: item.title,
                    poster: "https://image.tmdb.org/t/p/w300" + item.poster_path,
                    id: item.id,
                    year: item.release_date ? item.release_date.split("-")[0] : "",
                    vote_average: item.vote_average,
                    type: "movie"
                }));
                oncomplete(items.slice(0, 10));
            });
        }
    });

    // 3. Популярные мультсериалы
    Lampa.Component.add('animation_trending_series', {
        title: "Популярные мультсериалы",
        source: function (params, oncomplete) {
            var url = `${tmdbBaseUrl}/trending/tv/week?api_key=${apiKey}&language=ru-RU&with_genres=16`;
            $.get(url, function (data) {
                var items = data.results.map(item => ({
                    title: item.name,
                    poster: "https://image.tmdb.org/t/p/w300" + item.poster_path,
                    id: item.id,
                    year: item.first_air_date ? item.first_air_date.split("-")[0] : "",
                    vote_average: item.vote_average,
                    type: "series"
                }));
                oncomplete(items.slice(0, 10));
            });
        }
    });

    // 4. Новые мультсериалы
    Lampa.Component.add('animation_on_air', {
        title: "Новые мультсериалы",
        source: function (params, oncomplete) {
            var url = `${tmdbBaseUrl}/tv/on_the_air?api_key=${apiKey}&language=ru-RU&with_genres=16`;
            $.get(url, function (data) {
                var items = data.results.map(item => ({
                    title: item.name,
                    poster: "https://image.tmdb.org/t/p/w300" + item.poster_path,
                    id: item.id,
                    year: item.first_air_date ? item.first_air_date.split("-")[0] : "",
                    vote_average: item.vote_average,
                    type: "series"
                }));
                oncomplete(items.slice(0, 10));
            });
        }
    });

    // 5. Вы смотрели (история просмотров с фильтром по анимации)
    Lampa.Component.add('animation_viewed', {
        title: "Вы смотрели",
        source: function (params, oncomplete) {
            var viewed = Lampa.Storage.get("viewed", "{}"); // Получаем историю просмотров
            var items = [];
            
            // Проходим по просмотренным элементам
            for (var id in viewed) {
                var item = viewed[id];
                // Проверяем, является ли элемент анимацией (нужен запрос к TMDB)
                var url = `${tmdbBaseUrl}/${item.type}/${id}?api_key=${apiKey}&language=ru-RU`;
                $.ajax({
                    url: url,
                    async: false, // Синхронно, чтобы собрать данные
                    success: function (data) {
                        if (data.genres && data.genres.some(g => g.id === 16)) {
                            items.push({
                                title: data.title || data.name,
                                poster: "https://image.tmdb.org/t/p/w300" + data.poster_path,
                                id: data.id,
                                year: (data.release_date || data.first_air_date)?.split("-")[0] || "",
                                vote_average: data.vote_average,
                                type: item.type
                            });
                        }
                    }
                });
            }
            oncomplete(items.slice(0, 10)); // Ограничим до 10 элементов
        }
    });

    // --- Перехват открытия страницы и рендеринг подборок ---
    if (window.Lampa) {
        addMultMenu();

        Lampa.Listener.follow('activity', function (e) {
            if (e.activity && e.activity.title === 'Мультфильмы' && e.activity.component === 'main') {
                setTimeout(() => {
                    // Очищаем страницу и добавляем подборки
                    $('.scroll__content').empty();
                    Lampa.Component.render('animation_trending_movies', '.scroll__content');
                    Lampa.Component.render('animation_upcoming', '.scroll__content');
                    Lampa.Component.render('animation_trending_series', '.scroll__content');
                    Lampa.Component.render('animation_on_air', '.scroll__content');
                    Lampa.Component.render('animation_viewed', '.scroll__content');
                }, 500); // Задержка для загрузки страницы
            }
        });

        console.log("Плагин для мультфильмов с подборками загружен!");
    } else {
        console.error("Lampa не найдена. Убедись, что плагин загружается после инициализации.");
    }
})();