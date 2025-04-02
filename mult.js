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

            var tmdbBaseUrl = "https://api.themoviedb.org/3";
            var ratingFilter = 'certification_country=US&certification.lte=PG-13';

            // Исправленная функция создания запроса
            function createRequest(endpoint, title, callback) {
                let fullUrl = `${tmdbBaseUrl}${endpoint}?${ratingFilter}&language=ru-RU`;  // Исправляем URL
                console.log("Запрос к TMDB:", fullUrl);

                owner.get(fullUrl, params, function (json) {
                    json.title = Lampa.Lang.translate(title);
                    json.results = json.results.filter(item => 
                        item.genre_ids && !item.genre_ids.includes(16) // Исключаем аниме
                    );
                    callback(json);
                }, callback);
            }

            var partsData = [
                function (callback) {
                    createRequest(`${tmdbBaseUrl}/trending/movie/week`, 'Популярные мультфильмы', callback);
                },
                function (callback) {
                    createRequest(`${tmdbBaseUrl}/movie/upcoming`, 'Новые мультфильмы', callback);
                },
                function (callback) {
                    createRequest(`${tmdbBaseUrl}/trending/tv/week`, 'Популярные мультсериалы', callback);
                },
                function (callback) {
                    createRequest(`${tmdbBaseUrl}/tv/on_the_air`, 'Новые мультсериалы', callback);
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
                            if (data.genres && data.genres.some(g => g.id === 16)) return null; // Исключаем аниме
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

    function add() {
        console.log("Добавление источника ANIMATION...");

        var animationSource = Object.assign({}, Lampa.Api.sources.tmdb, new SourceTMDBAnimation(Lampa.Api.sources.tmdb));
        Lampa.Api.sources.animation = animationSource;

        try {
            let menuList = $('.menu .menu__list').eq(0);
            if (menuList.length) {
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

                menuList.append(menuItem);
                console.log("Пункт меню 'Мультфильмы' успешно добавлен.");
            } else {
                console.warn("Меню не найдено, не удалось добавить пункт 'Мультфильмы'.");
            }
        } catch (e) {
            console.error("Ошибка при добавлении пункта меню:", e);
        }

        Lampa.Params.select('source', Object.assign({}, Lampa.Params.values['source'], {
            'animation': 'ANIMATION'
        }), 'tmdb');
    }

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