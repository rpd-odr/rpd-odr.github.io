// animation_plugin.js
(function () {
    var apiKey = "YOUR_API_KEY"; // Замени на свой ключ TMDB или используй Lampa.Storage.get("tmdb_key")
    var tmdbBaseUrl = "https://api.themoviedb.org/3";

    // --- Каталоги ---
    var AnimationMoviesCatalog = {
        name: "Мультфильмы",
        version: "1.0",
        get: function (params, oncomplete, onerror) {
            var page = params.page || 1;
            var url = `${tmdbBaseUrl}/discover/movie?api_key=${apiKey}&language=ru-RU&sort_by=popularity.desc&with_genres=16&page=${page}`;
            $.ajax({
                url: url,
                success: function (data) {
                    var items = data.results.map(item => ({
                        title: item.title,
                        original_title: item.original_title,
                        poster: "https://image.tmdb.org/t/p/w300" + item.poster_path,
                        year: item.release_date ? item.release_date.split("-")[0] : "",
                        id: item.id,
                        type: "movie",
                        vote_average: item.vote_average,
                        overview: item.overview
                    }));
                    oncomplete({ results: items, page: data.page, total_pages: data.total_pages });
                },
                error: function () {
                    onerror("Не удалось загрузить каталог мультфильмов");
                }
            });
        }
    };

    var AnimationSeriesCatalog = {
        name: "Мультсериалы",
        version: "1.0",
        get: function (params, oncomplete, onerror) {
            var page = params.page || 1;
            var url = `${tmdbBaseUrl}/discover/tv?api_key=${apiKey}&language=ru-RU&sort_by=popularity.desc&with_genres=16&page=${page}`;
            $.ajax({
                url: url,
                success: function (data) {
                    var items = data.results.map(item => ({
                        title: item.name,
                        original_title: item.original_name,
                        poster: "https://image.tmdb.org/t/p/w300" + item.poster_path,
                        year: item.first_air_date ? item.first_air_date.split("-")[0] : "",
                        id: item.id,
                        type: "series",
                        vote_average: item.vote_average,
                        overview: item.overview
                    }));
                    oncomplete({ results: items, page: data.page, total_pages: data.total_pages });
                },
                error: function () {
                    onerror("Не удалось загрузить каталог мультсериалов");
                }
            });
        }
    };

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
                oncomplete(items.slice(0, 10)); // Ограничим до 10 элементов
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

    // --- Регистрация в Lampa ---
    if (window.Lampa) {
        // Регистрация каталогов
        Lampa.Catalog.add({
            id: "animation_movies",
            title: "Мультфильмы",
            type: "movie",
            plugin: AnimationMoviesCatalog
        });

        Lampa.Catalog.add({
            id: "animation_series",
            title: "Мультсериалы",
            type: "series",
            plugin: AnimationSeriesCatalog
        });

        console.log("Плагин с каталогами и подборками для мультфильмов и мультсериалов загружен!");
    } else {
        console.error("Lampa не найдена. Убедись, что плагин загружается после инициализации.");
    }
})();
