// animation_plugin.js
(function () {
    'use strict';

    var SourceTMDBAnimation = function (parent) {
        this.network = new Lampa.Reguest();

        this.main = function () {
            var owner = this;
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var onComplete = arguments.length > 1 ? arguments[1] : undefined;
            var onError = arguments.length > 2 ? arguments[2] : undefined;
            var partsLimit = 6;

            var tmdbBaseUrl = "https://api.themoviedb.org/3";  // Базовый URL для TMDB
            var ratingFilter = 'certification_country=US&certification.lte=PG-13';

            // Исправленная функция создания запроса
            function createRequest(endpoint, title, callback) {
                // Формируем корректный запрос к TMDB
                let fullUrl = `${tmdbBaseUrl}${endpoint}?${ratingFilter}&language=ru-RU`;
                console.log("Запрос к TMDB:", fullUrl);

                owner.get(fullUrl, params, function (json) {
                    json.title = Lampa.Lang.translate(title);

                    // Формируем ссылку на изображение
                    json.results.forEach(item => {
                        if (item.poster_path) {
                            item.poster_url = `http://192.168.0.247:9118/tmdb/img/t/p/w500/${item.poster_path}?uid=114576`;
                        }
                    });

                    callback(json);
                }, callback);
            }

            var partsData = [
                function (callback) {
                    createRequest(`/trending/movie/week`, 'Популярные мультфильмы', callback);
                },
                function (callback) {
                    createRequest(`/movie/upcoming`, 'Новые мультфильмы', callback);
                },
                function (callback) {
                    createRequest(`/trending/tv/week`, 'Популярные мультсериалы', callback);
                },
                function (callback) {
                    createRequest(`/tv/on_the_air`, 'Новые мультсериалы', callback);
                },
                function (callback) {
                    console.log("Загрузка 'Вы смотрели'...");
                    let viewed = JSON.parse(Lampa.Storage.get("viewed", "{}"));
                    let viewedIds = Object.keys(viewed);

                    if (viewedIds.length === 0) {
                        callback({ title: Lampa.Lang.translate('Вы смотрели'), results: [] });
                        return;
                    }

                    let promises = viewedIds.map(id => {
                        let item = viewed[id];
                        let url = `${tmdbBaseUrl}/${item.type}/${id}`;

                        return Lampa.TMDB.get(url, { language: 'ru-RU' }).then(data => {
                            if (data.genres && data.genres.some(g => g.id === 16)) return null;
                            return {
                                title: data.title || data.name,
                                poster_path: data.poster_path,
                                id: data.id,
                                release_date: data.release_date || data.first_air_date,
                                vote_average: data.vote_average,
                                type: item.type
                            };
                        }).catch(err => {
                            console.error("Ошибка загрузки элемента 'Вы смотрели':", err);
                            return null;
                        });
                    });

                    Promise.all(promises).then(results => {
                        let items = results.filter(item => item !== null).slice(0, 10);
                        callback({ title: Lampa.Lang.translate('Вы смотрели'), results: items });
                    }).catch(e => {
                        console.error("Ошибка в 'Вы смотрели':", e);
                        callback({ title: Lampa.Lang.translate('Вы смотрели'), results: [] });
                    });
                }
            ];

            function loadPart(partLoaded, partEmpty) {
                Lampa.Api.partNext(partsData, partsLimit, partLoaded, partEmpty);
            }

            loadPart(onComplete, onError);
            return loadPart;
        };
    };

    // Функция для добавления кнопки в боковом меню
    function add() {
        console.log("Добавление источника ANIMATION...");

        // Создаем источник анимации, но не добавляем в настройки
        var animationSource = Object.assign({}, Lampa.Api.sources.tmdb, new SourceTMDBAnimation(Lampa.Api.sources.tmdb));
        Lampa.Api.sources.animation = animationSource;

        // Добавляем кнопку в боковое меню
        try {
            const menuItem = $('<li class="menu__item selector" data-action="mult">' +
                '<div class="menu__text">Мультфильмы</div>' +
                '</li>');

            menuItem.on('hover:enter', function () {
                console.log("Открытие страницы 'Мультфильмы'...");
                Lampa.Activity.push({
                    title: 'Мультфильмы',
                    component: 'main',
                    source: 'animation',
                    page: 1
                });
                console.log("Активность 'Мультфильмы' запущена.");
            });

            // Вставляем кнопку в меню
            $('.menu .menu__list').eq(0).append(menuItem);
            console.log("Пункт меню 'Мультфильмы' успешно добавлен.");
        } catch (e) {
            console.error("Ошибка при добавлении пункта меню:", e);
        }
    }

    // Проверяем готовность приложения и запускаем добавление
    if (window.appready) {
        add();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                add();
            }
        });
    }
})();