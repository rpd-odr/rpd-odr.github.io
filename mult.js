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
                component: "category_full",
                source: "animation_kids",
                back: true
            });
        });

        const menuList = document.querySelector(".menu .menu__list");
        if (menuList && !document.querySelector('.menu__item[data-action="animation"]')) {
            menuList.appendChild(menuItem);
        }
    }

    // Класс для отображения эпизодов
    var Episode = function(data) {
        var card = data.card || data;
        var episode = data.next_episode_to_air || data.episode || {};
        if (card.source == undefined) card.source = 'tmdb';
        
        Lampa.Arrays.extend(card, {
            title: card.name,
            original_title: card.original_name,
            release_date: card.first_air_date
        });
        
        card.release_year = ((card.release_date || '0000') + '').slice(0, 4);

        function remove(elem) {
            if (elem) elem.remove();
        }

        this.build = function() {
            this.card = Lampa.Template.js('card_episode');
            this.img_poster = this.card.querySelector('.card__img') || {};
            this.img_episode = this.card.querySelector('.full-episode__img img') || {};
            
            this.card.querySelector('.card__title').innerText = card.title;
            this.card.querySelector('.full-episode__num').innerText = card.unwatched || '';
            
            if (episode && episode.air_date) {
                this.card.querySelector('.full-episode__name').innerText = 
                    ('s' + (episode.season_number || '?') + 'e' + (episode.episode_number || '?') + '. ') + 
                    (episode.name || Lampa.Lang.translate('noname'));
                this.card.querySelector('.full-episode__date').innerText = 
                    episode.air_date ? Lampa.Utils.parseTime(episode.air_date).full : '----';
            }

            if (card.release_year == '0000') {
                remove(this.card.querySelector('.card__age'));
            } else {
                this.card.querySelector('.card__age').innerText = card.release_year;
            }

            this.card.addEventListener('visible', this.visible.bind(this));
        };

        this.image = function() {
            var _this = this;
            this.img_poster.onload = function() {};
            this.img_poster.onerror = function() {
                _this.img_poster.src = './img/img_broken.svg';
            };
            this.img_episode.onload = function() {
                _this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
            };
            this.img_episode.onerror = function() {
                _this.img_episode.src = './img/img_broken.svg';
            };
        };

        this.create = function() {
            var _this2 = this;
            this.build();
            
            this.card.addEventListener('hover:focus', function() {
                if (_this2.onFocus) _this2.onFocus(_this2.card, card);
            });
            
            this.card.addEventListener('hover:hover', function() {
                if (_this2.onHover) _this2.onHover(_this2.card, card);
            });
            
            this.card.addEventListener('hover:enter', function() {
                if (_this2.onEnter) _this2.onEnter(_this2.card, card);
            });
            
            this.image();
        };

        this.visible = function() {
            if (card.poster_path) this.img_poster.src = Lampa.Api.img(card.poster_path);
            else if (card.profile_path) this.img_poster.src = Lampa.Api.img(card.profile_path);
            else if (card.poster) this.img_poster.src = card.poster;
            else if (card.img) this.img_poster.src = card.img;
            else this.img_poster.src = './img/img_broken.svg';
            
            if (card.still_path) this.img_episode.src = Lampa.Api.img(episode.still_path, 'w300');
            else if (card.backdrop_path) this.img_episode.src = Lampa.Api.img(card.backdrop_path, 'w300');
            else if (episode.img) this.img_episode.src = episode.img;
            else if (card.img) this.img_episode.src = card.img;
            else this.img_episode.src = './img/img_broken.svg';
            
            if (this.onVisible) this.onVisible(this.card, card);
        };

        this.destroy = function() {
            this.img_poster.onerror = function() {};
            this.img_poster.onload = function() {};
            this.img_episode.onerror = function() {};
            this.img_episode.onload = function() {};
            this.img_poster.src = '';
            this.img_episode.src = '';
            remove(this.card);
            this.card = null;
            this.img_poster = null;
            this.img_episode = null;
        };

        this.render = function(js) {
            return js ? this.card : $(this.card);
        };
    };

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
            var partsLimit = 6;

            var sortOptions = [
                { key: 'popularity.desc', title: 'Популярные' },
                { key: 'first_air_date.desc', title: 'Новинки' },
                { key: 'revenue.desc', title: 'Интересное' }
            ];

            var kidsGenres = [
                { id: 16, title: 'мультфильмы' },
                { id: 10751, title: 'семейные' }
            ];

            var kidsStudios = [
                { id: 2, title: 'Disney' },
                { id: 3, title: 'Pixar' },
                { id: 521, title: 'DreamWorks' },
                { id: 6704, title: 'Illumination' },
                { id: 9383, title: 'Blue Sky' },
                { id: 11106, title: 'Sony Animation' }
            ];

            var ratingFilter = 'certification_country=US&certification.lte=' + ratingLimit;

            function shuffleArray(array) {
                for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }

            function createRequest(endpoint, titleSuffix, callback) {
                var sort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
                owner.get(endpoint + '&sort_by=' + sort.key + '&' + ratingFilter, params, function(json) {
                    if (json.results) {
                        json.results = filterOutAnime(json.results);
                    }
                    json.title = Lampa.Lang.translate(sort.title + ' ' + titleSuffix);
                    callback(json);
                }, callback);
            }

            function getStudioMovies(studioName, studioId) {
                return function(callback) {
                    createRequest(
                        'discover/movie?with_companies=' + studioId + '&with_genres=16,10751',
                        'от ' + studioName,
                        callback
                    );
                };
            }

            var partsData = [
                function(callback) {
                    createRequest('discover/movie?with_genres=16,10751', 'мультфильмы для детей', callback);
                },
                function(callback) {
                    createRequest('discover/tv?with_genres=16,10751', 'мультсериалы для детей', callback);
                }
            ];

            kidsStudios.forEach(function(studio) {
                partsData.push(getStudioMovies(studio.title, studio.id));
            });

            kidsGenres.forEach(function(genre) {
                partsData.push(function(callback) {
                    createRequest('discover/movie?with_genres=' + genre.id, genre.title, callback);
                });
            });

            function randomWideFlag() {
                return Math.random() < 0.2;
            }

            function wrapWithWideFlag(requestFunc) {
                return function(callback) {
                    requestFunc(function(json) {
                        if (randomWideFlag()) {
                            json.small = true;
                            json.wide = true;

                            if (Array.isArray(json.results)) {
                                json.results.forEach(function(card) {
                                    card.promo = card.overview;
                                    card.promo_title = card.title || card.name;
                                });
                            }
                        }
                        callback(json);
                    });
                };
            }

            partsData = partsData.map(wrapWithWideFlag);
            shuffleArray(partsData);

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