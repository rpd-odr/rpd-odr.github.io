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

            // Расширенный список анимационных студий
            var animationStudios = [
                { id: 2, title: 'Disney' },
                { id: 3, title: 'Pixar' },
                { id: 521, title: 'DreamWorks' },
                { id: 6704, title: 'Illumination' },
                { id: 9383, title: 'Blue Sky' },
                { id: 11106, title: 'Sony Animation' },
                { id: 14160, title: 'Studio Ghibli' },
                { id: 16, title: 'Warner Animation' },
                { id: 5219, title: 'Laika' },
                { id: 10210, title: 'Aardman' },
                { id: 7, title: 'MGM Animation' },
                { id: 15357, title: 'Paramount Animation' },
                { id: 20478, title: 'Netflix Animation' },
                { id: 13252, title: 'Cartoon Network' },
                { id: 3172, title: 'Nickelodeon' }
            ];

            // Базовый фильтр (ТОЛЬКО анимация)
            var baseFilter = [
                'certification_country=US',
                'certification.lte=' + ratingLimit,
                'with_genres=16', // ТОЛЬКО мультфильмы
                'without_genres=10751' // Исключаем семейное кино
            ].join('&');

            // Создаем подборки
            var partsData = [];
            
            // 1. Подборки по студиям
            animationStudios.forEach(function(studio) {
                partsData.push(createStudioRequest(studio));
            });

            // 2. Тематические подборки
            partsData.push(
                createRequest('discover/movie?with_keywords=210024', 'классические мультфильмы'),
                createRequest('discover/movie?with_keywords=180449', 'приключения'),
                createRequest('discover/movie?with_keywords=181317', 'сказки'),
                createRequest('trending/movie/week', 'популярные сейчас'),
                createRequest('movie/top_rated', 'лучшие за все время'),
                createRequest('movie/now_playing', 'в кинотеатрах')
            );

            // Оставляем только первые 12 подборок (чтобы после фильтрации осталось 8)
            partsData = partsData.slice(0, 12);

            // Функции для создания запросов
            function createStudioRequest(studio) {
                return function(callback) {
                    owner.get(
                        'discover/movie?with_companies=' + studio.id + '&' + baseFilter,
                        params,
                        function(json) {
                            if (json.results) {
                                json.results = filterOutAnime(json.results);
                            }
                            json.title = studio.title + ' мультфильмы';
                            callback(json);
                        },
                        callback
                    );
                };
            }

            function createRequest(endpoint, title) {
                return function(callback) {
                    owner.get(
                        endpoint + '&' + baseFilter,
                        params,
                        function(json) {
                            if (json.results) {
                                json.results = filterOutAnime(json.results);
                            }
                            json.title = title;
                            callback(json);
                        },
                        callback
                    );
                };
            }

            // Гарантированная загрузка 8 подборок
            function loadParts() {
                var loaded = 0;
                var results = [];
                
                function checkComplete() {
                    if (loaded >= partsLimit && onComplete) {
                        onComplete(results.slice(0, partsLimit)); // Возвращаем ровно 8 подборок
                    }
                }
                
                partsData.forEach(part => {
                    part(function(json) {
                        if (json.results && json.results.length > 0) {
                            results.push(json);
                            loaded++;
                            checkComplete();
                        }
                    }, function() {
                        loaded++;
                        checkComplete();
                    });
                });
            }
            
            loadParts();
            return function() {}; // Пустая функция для совместимости
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