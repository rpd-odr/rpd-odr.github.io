// animation_plugin.js
(function () {
    // Проверка доступности Lampa
    if (!window.Lampa) {
        console.error("Lampa не найдена. Плагин не может быть загружен.");
        return;
    }

    // Получение API-ключа
    var apiKey = Lampa.Storage.get("tmdb_key", "");
    if (!apiKey) {
        console.error("TMDB API-ключ не найден в настройках Lampa. Зайдите в настройки и укажите ключ.");
        Lampa.Noty.show("Ошибка: TMDB API-ключ не задан. Укажите его в настройках Lampa.");
        return;
    }
    var tmdbBaseUrl = "https://api.themoviedb.org/3";

    // Иконка для меню
    var multIcon = '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm0-4H9V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';

    // Добавление пункта "Мультфильмы" в меню
    function addMultMenu() {
        try {
            const menuItem = $(
                '<li class="menu__item selector" data-action="mult">' +
                '<div class="menu__ico"></div>' +
                '<div class="menu__text">Мультфильмы</div>' +
                '</li>'
            );
            if (typeof loadInlineSVG === "function") {
                loadInlineSVG(multIcon, menuItem.find('.menu__ico'));
            } else {
                menuItem.find('.menu__ico').html(multIcon);
            }
            menuItem.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: 'Мультфильмы',
                    component: 'main',
                    page: 1
                });
            });
            $('.menu .menu__list').eq(0).append(menuItem);
        } catch (e) {
            console.error("Ошибка при добавлении пункта меню:", e);
        }
    }

    // Универсальная функция для добавления подборок
    function addComponent(name, title, url, type) {
        Lampa.Component.add(name, {
            title: title,
            source: function (params, oncomplete) {
                Lampa.TMDB.get(url).then(function (data) {
                    var items = data.results.map(item => ({
                        title: item.title || item.name,
                        poster: "https://image.tmdb.org/t/p/w300" + item.poster_path,
                        id: item.id,
                        year: (item.release_date || item.first_air_date)?.split("-")[0] || "",
                        vote_average: item.vote_average,
                        type: type
                    }));
                    oncomplete(items.slice(0, 10));
                }).catch(function (e) {
                    console.error(`Ошибка загрузки ${title}:`, e);
                    oncomplete([]);
                });
            }
        });
    }

    // Регистрация подборок
    addComponent('animation_trending_movies', "Популярные мультфильмы", 
        `${tmdbBaseUrl}/trending/movie/week?api_key=${apiKey}&language=ru-RU&with_genres=16`, "movie");
    addComponent('animation_upcoming', "Новые мультфильмы", 
        `${tmdbBaseUrl}/movie/upcoming?api_key=${apiKey}&language=ru-RU&with_genres=16`, "movie");
    addComponent('animation_trending_series', "Популярные мультсериалы", 
        `${tmdbBaseUrl}/trending/tv/week?api_key=${apiKey}&language=ru-RU&with_genres=16`, "series");
    addComponent('animation_on_air', "Новые мультсериалы", 
        `${tmdbBaseUrl}/tv/on_the_air?api_key=${apiKey}&language=ru-RU&with_genres=16`, "series");

    // Подборка "Вы смотрели"
    Lampa.Component.add('animation_viewed', {
        title: "Вы смотрели",
        source: function (params, oncomplete) {
            try {
                var viewed = Lampa.Storage.get("viewed", "{}");
                var viewedIds = Object.keys(viewed);

                if (viewedIds.length === 0) {
                    oncomplete([]);
                    return;
                }

                var promises = viewedIds.map(id => {
                    var item = viewed[id];
                    var url = `${tmdbBaseUrl}/${item.type}/${id}?api_key=${apiKey}&language=ru-RU`;
                    return Lampa.TMDB.get(url).then(data => {
                        if (data.genres && data.genres.some(g => g.id === 16)) {
                            return {
                                title: data.title || data.name,
                                poster: "https://image.tmdb.org/t/p/w300" + data.poster_path,
                                id: data.id,
                                year: (data.release_date || data.first_air_date)?.split("-")[0] || "",
                                vote_average: data.vote_average,
                                type: item.type
                            };
                        }
                        return null;
                    }).catch(() => null); // Игнорируем ошибки для отдельных элементов
                });

                Promise.all(promises).then(results => {
                    var items = results.filter(item => item !== null).slice(0, 10);
                    oncomplete(items);
                }).catch(e => {
                    console.error("Ошибка при загрузке 'Вы смотрели':", e);
                    oncomplete([]);
                });
            } catch (e) {
                console.error("Ошибка в 'Вы смотрели':", e);
                oncomplete([]);
            }
        }
    });

    // Рендеринг страницы
    Lampa.Listener.follow('activity', function (e) {
        if (e.activity && e.activity.title === 'Мультфильмы' && e.activity.component === 'main') {
            setTimeout(() => {
                try {
                    var $content = $('.scroll__content');
                    if ($content.length === 0) {
                        console.error("Контейнер .scroll__content не найден. Проверь DOM.");
                        return;
                    }
                    $content.empty();
                    Lampa.Component.render('animation_trending_movies', $content);
                    Lampa.Component.render('animation_upcoming', $content);
                    Lampa.Component.render('animation_trending_series', $content);
                    Lampa.Component.render('animation_on_air', $content);
                    Lampa.Component.render('animation_viewed', $content);
                } catch (e) {
                    console.error("Ошибка при рендеринге страницы:", e);
                }
            }, 500);
        }
    });

    // Инициализация
    addMultMenu();
    console.log("Плагин для мультфильмов с подборками загружен!");
})();