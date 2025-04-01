// animation_plugin.js
(function () {
    'use strict';

    // Ждём полной загрузки Lampa
    function initPlugin() {
        console.log("Инициализация плагина для мультфильмов...");

        let apiKey = Lampa.Storage.get("tmdb_key", "");
        let tmdbBaseUrl = "https://api.themoviedb.org/3";

        // Добавление пункта "Мультфильмы" в меню
        try {
            const menuItem = $(
                '<li class="menu__item selector" data-action="mult">' +
                '<div class="menu__text">Мультфильмы</div>' +
                '</li>'
            );
            menuItem.on('hover:enter', function () {
                console.log("Открытие каталога 'Мультфильмы'...");
                Lampa.Activity.push({
                    url: 'discover/movie?with_genres=16&sort_by=popularity.desc&certification_country=US&certification.lte=PG-13',
                    title: 'Мультфильмы',
                    component: 'category_full',
                    source: 'tmdb',
                    genres: 16,
                    page: 1
                });
                console.log("Активность 'Мультфильмы' запущена.");
            });
            $('.menu .menu__list').eq(0).append(menuItem);
            console.log("Пункт меню 'Мультфильмы' успешно добавлен.");
        } catch (e) {
            console.error("Ошибка при добавлении пункта меню:", e);
        }

        // Универсальная функция для добавления подборок
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
        addComponent('animation_trending_movies', "Популярные мультфильмы", 
            `${tmdbBaseUrl}/trending/movie/week?api_key=${apiKey}&language=ru-RU&with_genres=16&certification_country=US&certification.lte=PG-13`, "movie");
        addComponent('animation_upcoming', "Новые мультфильмы", 
            `${tmdbBaseUrl}/movie/upcoming?api_key=${apiKey}&language=ru-RU&with_genres=16&certification_country=US&certification.lte=PG-13`, "movie");
        addComponent('animation_trending_series', "Популярные мультсериалы", 
            `${tmdbBaseUrl}/trending/tv/week?api_key=${apiKey}&language=ru-RU&with_genres=16&certification_country=US&certification.lte=PG-13`, "series");
        addComponent('animation_on_air', "Новые мультсериалы", 
            `${tmdbBaseUrl}/tv/on_the_air?api_key=${apiKey}&language=ru-RU&with_genres=16&certification_country=US&certification.lte=PG-13`, "series");

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
                            if (data.certifications && data.certifications.US && data.certifications.US.certification) {
                                let rating = data.certifications.US.certification;
                                if (rating === "R" || rating === "NC-17") return null;
                            }
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

        // Рендеринг подборок поверх category_full
        Lampa.Listener.follow('activity', function (e) {
            console.log("Событие activity сработало:", e.activity);
            if (e.activity && e.activity.title === 'Мультфильмы' && e.activity.component === 'category_full') {
                console.log("Рендеринг подборок для 'Мультфильмы'...");
                setTimeout(() => {
                    let $content = $('.category-full');
                    if ($content.length === 0) {
                        console.error("Контейнер .category-full не найден. Доступные классы:", document.querySelectorAll('.category-full, .scroll, .page__content'));
                        return;
                    }
                    console.log("Найден контейнер:", $content.attr('class'));
                    // Вставляем подборки перед основным каталогом
                    let $customContent = $('<div class="custom-podborki"></div>');
                    $content.prepend($customContent);
                    Lampa.Component.render('animation_trending_movies', $customContent);
                    Lampa.Component.render('animation_upcoming', $customContent);
                    Lampa.Component.render('animation_trending_series', $customContent);
                    Lampa.Component.render('animation_on_air', $customContent);
                    Lampa.Component.render('animation_viewed', $customContent);
                    console.log("Подборки отрендерены в контейнер:", $customContent.attr('class'));
                }, 500);
            }
        });
    }

    // Запуск плагина после готовности приложения
    if (window.appready) {
        console.log("Lampa уже готова, запускаем плагин...");
        initPlugin();
    } else {
        console.log("Ожидаем готовности Lampa...");
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                console.log("Lampa готова, запускаем плагин...");
                initPlugin();
            }
        });
    }
})();