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

        this.get = function(url, params, onSuccess, onError) {
            return parent.get(url, params, onSuccess, onError || function(){});
        };

        this.main = function(params, onComplete, onError) {
            var owner = this;
            var partsLimit = 8;
            var loadedParts = 0;
            var results = [];

            // Основные параметры фильтрации
            var baseParams = {
                with_genres: '16', // Только анимация
                without_genres: '10751', // Исключаем семейное кино
                certification_country: 'US',
                certification: 'PG',
                sort_by: 'popularity.desc'
            };

            // Список студий анимации
            var studios = [
                {id: 2, name: 'Disney'},
                {id: 3, name: 'Pixar'},
                {id: 521, name: 'DreamWorks'},
                {id: 6704, name: 'Illumination'},
                {id: 9383, name: 'Blue Sky'},
                {id: 11106, name: 'Sony Animation'}
            ];

            // Создаем подборки
            var parts = [];
            
            // Подборки по студиям
            studios.forEach(function(studio) {
                parts.push(function(callback) {
                    var params = Object.assign({}, baseParams, {
                        with_companies: studio.id
                    });
                    owner.get('discover/movie', params, function(json) {
                        if (json.results && json.results.length > 0) {
                            json.title = studio.name;
                            callback(json);
                        } else {
                            callback({results: []});
                        }
                    });
                });
            });

            // Общие подборки
            parts.push(
                function(callback) {
                    owner.get('discover/movie', baseParams, function(json) {
                        json.title = 'Популярные';
                        callback(json);
                    });
                },
                function(callback) {
                    var params = Object.assign({}, baseParams, {
                        sort_by: 'vote_average.desc',
                        'vote_count.gte': 100
                    });
                    owner.get('discover/movie', params, function(json) {
                        json.title = 'Лучшие';
                        callback(json);
                    });
                },
                function(callback) {
                    var params = Object.assign({}, baseParams, {
                        sort_by: 'release_date.desc',
                        'primary_release_date.lte': new Date().toISOString().split('T')[0]
                    });
                    owner.get('discover/movie', params, function(json) {
                        json.title = 'Новинки';
                        callback(json);
                    });
                }
            );

            // Функция загрузки
            function loadNext() {
                if (loadedParts >= parts.length || results.length >= partsLimit) {
                    if (results.length > 0) {
                        onComplete(results.slice(0, partsLimit));
                    } else {
                        onError();
                    }
                    return;
                }

                parts[loadedParts](function(result) {
                    if (result.results && result.results.length > 0) {
                        results.push(result);
                    }
                    loadedParts++;
                    loadNext();
                });
            }

            // Начинаем загрузку
            loadNext();
            
            return function() {};
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