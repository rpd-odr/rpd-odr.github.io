// animation_plugin.js
(function () {
    'use strict';

    // Источник для мультфильмов
    var SourceTMDBAnimation = function (parent) {
        this.network = new Lampa.Reguest();

        this.main = function () {
            var owner = this;
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var onComplete = arguments.length > 1 ? arguments[1] : undefined;
            var onError = arguments.length > 2 ? arguments[2] : undefined;
            var partsLimit = 6;

            var apiKey = Lampa.Storage.get("tmdb_key", "");
            var tmdbBaseUrl = "https://api.themoviedb.org/3";
            var ratingFilter = 'certification_country=US&certification.lte=PG-13';

            // Функция для создания запроса
            function createRequest(endpoint, title, callback) {
                owner.get(endpoint + '&' + ratingFilter + '&language=ru-RU', params, function (json) {
                    json.title = Lampa.Lang.translate(title);
                    callback(json);
                }, callback);
            }

            // Массив подборок
            var partsData = [
                function (callback) {
                    createRequest(
                        `${tmdbBaseUrl}/trending/movie/week?api_key=${apiKey}&with_genres=16`,
                        'Популярные мультфильмы',
                        callback
                    );
                },
                function (callback) {
                    createRequest(
                        `${tmdbBaseUrl}/movie/upcoming?api_key=${apiKey}&with_genres=16`,
                        'Новые мультфильмы',
                        callback
                    );
                },
                function (callback) {
                    createRequest(
                        `${tmdbBaseUrl}/trending/tv/week?api_key=${apiKey}&with_genres=16`,
                        'Популярные мультсериалы',
                        callback
                    );
                },
                function (callback) {
                    createRequest(
                        `${tmdbBaseUrl}/tv/on_the_air?api_key=${apiKey}&with_genres=16`,
                        'Новые мультсериалы',
                        callback
                    );
                },
                function (callback) {
                    console.log("Загрузка 'Вы смотрели'...");
                    let viewed = Lampa.Storage.get("viewed", "{}");
                    let viewedIds = Object.keys(viewed);

                    if (viewedIds.length === 0) {
                        callback({ title: Lampa.Lang.translate('Вы смотрели'), results: [] });
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
                                    poster_path: data.poster_path,
                                    id: data.id,
                                    release_date: data.release_date || data.first_air_date,
                                    vote_average: data.vote_average,
                                    type: item.type
                                };
                            }
                            return null;
                        }).catch(() => null);
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

            // Загрузка частей данных
            function loadPart(partLoaded, partEmpty) {
                Lampa.Api.partNext(partsData, partsLimit, partLoaded, partEmpty);
            }

            loadPart(onComplete, onError);
            return loadPart;
        };
    };

    // Функция добавления плагина
    function add() {
        console.log("Добавление источника ANIMATION...");

        // Создаём источник
        var animationSource = Object.assign({}, Lampa.Api.sources.tmdb, new SourceTMDBAnimation(Lampa.Api.sources.tmdb));
        Lampa.Api.sources.animation = animationSource;

        // Добавляем пункт меню
        try {
            const menuItem = $(
                '<li class="menu__item selector" data-action="mult">' +
                '<div class="menu__text">Мультфильмы</div>' +
                '</li>'
            );
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
            $('.menu .menu__list').eq(0).append(menuItem);
            console.log("Пункт меню 'Мультфильмы' успешно добавлен.");
        } catch (e) {
            console.error("Ошибка при добавлении пункта меню:", e);
        }

        // Добавляем источник в настройки
        Lampa.Params.select('source', Object.assign({}, Lampa.Params.values['source'], {
            'animation': 'ANIMATION'
        }), 'tmdb');
    }

    // Запуск плагина
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