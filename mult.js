// Фильтр для исключения аниме (id жанра 16)
function filterOutAnime(results) {
    return results.filter(function (item) {
        return !(item.genre_ids && item.genre_ids.includes(16));
    });
}

(function () {
    'use strict';

    // Добавляем кнопку в меню
    function addAnimationButton() {
        const menuItem = document.createElement("li");
        menuItem.className = "menu__item selector";
        menuItem.dataset.action = "animation";
        menuItem.innerHTML = `
            <div class="menu__ico"><svg><use xlink:href="#animation"></use></svg></div>
            <div class="menu__text">Анимация</div>
        `;
        
        menuItem.addEventListener("click", function() {
            Lampa.Activity.push({
                title: "Детская анимация",
                component: "main",
                source: "animation_kids",
                back: true
            });
        });

        const menuList = document.querySelector(".menu .menu__list");
        if (menuList && !document.querySelector('.menu__item[data-action="animation"]')) {
            menuList.appendChild(menuItem);
        }
    }

    // Источник данных для детской анимации
    var SourceAnimationKids = function(parent) {
        this.network = new Lampa.Reguest();
        this.discovery = false;

        var ratingLimit = 'PG';

        this.main = function() {
            var owner = this;
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var onComplete = arguments.length > 1 ? arguments[1] : undefined;
            var onError = arguments.length > 2 ? arguments[2] : undefined;
            var partsLimit = 8; // Фиксированное количество подборок

            var sortOptions = [
                { key: 'popularity.desc', title: 'Популярные' },
                { key: 'vote_average.desc', title: 'С лучшим рейтингом' },
                { key: 'release_date.desc', title: 'Новинки' }
            ];

            // Список анимационных студий
            var animationStudios = [
                { id: 2, title: 'Disney' },
                { id: 3, title: 'Pixar' },
                { id: 521, title: 'DreamWorks' },
                { id: 6704, title: 'Illumination' },
                { id: 9383, title: 'Blue Sky' },
                { id: 11106, title: 'Sony Animation' }
            ];

            // Базовый фильтр
            var baseFilter = [
                'certification_country=US',
                'certification.lte=' + ratingLimit,
                'with_genres=16', // Только мультфильмы
                'without_genres=10751' // Исключаем семейное кино
            ].join('&');

            // Создаем подборки
            var partsData = [];
            
            // Подборки по студиям
            animationStudios.forEach(function(studio) {
                partsData.push(function(callback) {
                    owner.get(
                        'discover/movie?with_companies=' + studio.id + '&' + baseFilter,
                        params,
                        function(json) {
                            if (json.results) {
                                json.results = filterOutAnime(json.results);
                            }
                            json.title = studio.title;
                            callback(json);
                        },
                        callback
                    );
                });
            });

            // Общие подборки
            partsData.push(
                function(callback) {
                    owner.get(
                        'discover/movie?' + baseFilter + '&sort_by=popularity.desc',
                        params,
                        function(json) {
                            if (json.results) {
                                json.results = filterOutAnime(json.results);
                            }
                            json.title = 'Популярные мультфильмы';
                            callback(json);
                        },
                        callback
                    );
                },
                function(callback) {
                    owner.get(
                        'discover/movie?' + baseFilter + '&sort_by=vote_average.desc&vote_count.gte=100',
                        params,
                        function(json) {
                            if (json.results) {
                                json.results = filterOutAnime(json.results);
                            }
                            json.title = 'Лучшие мультфильмы';
                            callback(json);
                        },
                        callback
                    );
                },
                function(callback) {
                    owner.get(
                        'discover/movie?' + baseFilter + '&sort_by=release_date.desc',
                        params,
                        function(json) {
                            if (json.results) {
                                json.results = filterOutAnime(json.results);
                            }
                            json.title = 'Новые мультфильмы';
                            callback(json);
                        },
                        callback
                    );
                }
            );

            // Загрузка подборок с использованием стандартного механизма Lampa
            function loadPart(partLoaded, partEmpty) {
                Lampa.Api.partNext(partsData, partsLimit, partLoaded, partEmpty);
            }

            loadPart(onComplete, onError);
            return loadPart;
        };
    };

    // Инициализация плагина
    function initPlugin() {
        if (!window.plugin_animation_kids_ready) {
            window.plugin_animation_kids_ready = true;
            
            // Регистрируем источник данных
            Lampa.Api.sources.animation_kids = Object.assign(
                {}, 
                Lampa.Api.sources.tmdb, 
                new SourceAnimationKids(Lampa.Api.sources.tmdb)
            );
            
            // Добавляем кнопку в меню
            addAnimationButton();
        }
    }

    // Запускаем после загрузки приложения
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow("app", function(e) {
            if (e.type == "ready") {
                initPlugin();
            }
        });
    }
})();