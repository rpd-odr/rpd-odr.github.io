// animation_plugin.js
(function () {
    'use strict';

    // Ждём полной загрузки Lampa
    function initPlugin() {
        console.log("Инициализация плагина для мультфильмов...");

        let apiKey = Lampa.Storage.get("tmdb_key", "");
        let tmdbBaseUrl = "https://api.themoviedb.org/3";

        // Иконка для меню
        let multIcon = '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm0-4H9V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';

        // Добавление пункта меню
        function addMultMenu() {
            console.log("Добавление пункта меню 'Мультфильмы'...");
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
                    console.log("Открытие страницы 'Мультфильмы'...");
                    Lampa.Activity.push({
                        url: '',
                        title: 'Мультфильмы',
                        component: 'main',
                        page: 1
                    });
                });
                $('.menu .menu__list').eq(0).append(menuItem);
            } catch (e) {
                console.error("Ошибка при добавлении меню:", e);
            }
        }

        // Универсальная функция для подборок
        function addComponent(name, title, url, type) {
            console.log(`Регистрация подборки: ${title}`);
            Lampa.Component.add(name, {
                title: title,
                source: function (params, oncomplete) {
                    Lampa.TMDB.get(url).then(function (data) {
                        let items = data.results.map(item => ({
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
        function registerComponents() {
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
                    console.log("Загрузка 'Вы смотрели'...");
                    let viewed = Lampa.Storage.get("viewed", "{}");
                    let viewedIds = Object.keys(viewed);

                    if (viewedIds.length === 0) {
                        oncomplete([]);
                        return;
                    }

                    let promises = viewedIds.map(id => {
                        let item = viewed[id];
                        let url = `${tmdbBaseUrl}/${item.type}/${id}?api_key=${apiKey}&language=ru-RU`;
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
                        }).catch(() => null);
                    });

                    Promise.all(promises).then(results => {
                        let items = results.filter(item => item !== null).slice(0, 10);
                        oncomplete(items);
                    }).catch(e => {
                        console.error("Ошибка в 'Вы смотрели':", e);
                        oncomplete([]);
                    });
                }
            });
        }

        // Рендеринг страницы
        function renderPage() {
            console.log("Настройка рендеринга страницы...");
            Lampa.Listener.follow('activity', function (e) {
                if (e.activity && e.activity.title === 'Мультфильмы' && e.activity.component === 'main') {
                    console.log("Страница 'Мультфильмы' открыта, рендеринг подборок...");
                    setTimeout(() => {
                        let $content = $('.page__content'); // Пробуем другой селектор
                        if ($content.length === 0) {
                            $content = $('.scroll__content'); // Запасной вариант
                        }
                        if ($content.length === 0) {
                            console.error("Контейнер для контента не найден.");
                            return;
                        }
                        $content.empty();
                        Lampa.Component.render('animation_trending_movies', $content);
                        Lampa.Component.render('animation_upcoming', $content);
                        Lampa.Component.render('animation_trending_series', $content);
                        Lampa.Component.render('animation_on_air', $content);
                        Lampa.Component.render('animation_viewed', $content);
                        console.log("Подборки отрендерены.");
                    }, 500);
                }
            });
        }

        // Инициализация
        addMultMenu();
        registerComponents();
        renderPage();
        console.log("Плагин для мультфильмов с подборками загружен!");
    }

    // Ожидание полной загрузки Lampa
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'app_ready') {
                initPlugin();
            }
        });
    }
})();