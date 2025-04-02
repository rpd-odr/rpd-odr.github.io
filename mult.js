// Фильтр для исключения аниме (id жанра 16)
function filterOutAnime(results) {
    return results.filter(function (item) {
        return !(item.genre_ids && item.genre_ids.includes(16));
    });
}

(function () {
    'use strict';

    function startPlugin() {
        window.plugin_kuv_ready = true;

        // Добавляем кнопку в меню
        function addKuvButton() {
            const menuItem = document.createElement("li");
            menuItem.className = "menu__item selector";
            menuItem.dataset.action = "kuv";
            menuItem.innerHTML = `
                <div class="menu__ico menu-mult"><svg></svg></div>
                <div class="menu__text">Детские подборки</div>
            `;
            
            menuItem.addEventListener("click", () => {
                Lampa.Activity.push({
                    title: 'KUV - Детские подборки',
                    component: 'main',
                    source: 'tmdb',
                    params: {
                        kuv_mode: true
                    }
                });
            });

            const menuList = document.querySelector(".menu .menu__list");
            if (menuList && !document.querySelector('.menu__item[data-action="kuv"]')) {
                menuList.appendChild(menuItem);
            }
        }

        var Episode = function (data) {
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

            this.build = function () {
                this.card = Lampa.Template.js('card_episode');
                this.img_poster = this.card.querySelector('.card__img') || {};
                this.img_episode = this.card.querySelector('.full-episode__img img') || {};
                this.card.querySelector('.card__title').innerText = card.title;
                this.card.querySelector('.full-episode__num').innerText = card.unwatched || '';
                if (episode && episode.air_date) {
                    this.card.querySelector('.full-episode__name').innerText = ('s' + (episode.season_number || '?') + 'e' + (episode.episode_number || '?') + '. ') + (episode.name || Lampa.Lang.translate('noname'));
                    this.card.querySelector('.full-episode__date').innerText = episode.air_date ? Lampa.Utils.parseTime(episode.air_date).full : '----';
                }

                if (card.release_year == '0000') {
                    remove(this.card.querySelector('.card__age'));
                } else {
                    this.card.querySelector('.card__age').innerText = card.release_year;
                }

                this.card.addEventListener('visible', this.visible.bind(this));
            };

            this.image = function () {
                var _this = this;
                this.img_poster.onload = function () {
                };
                this.img_poster.onerror = function () {
                    _this.img_poster.src = './img/img_broken.svg';
                };
                this.img_episode.onload = function () {
                    _this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
                };
                this.img_episode.onerror = function () {
                    _this.img_episode.src = './img/img_broken.svg';
                };
            };

            this.create = function () {
                var _this2 = this;
                this.build();
                this.card.addEventListener('hover:focus', function () {
                    if (_this2.onFocus) _this2.onFocus(_this2.card, card);
                });
                this.card.addEventListener('hover:hover', function () {
                    if (_this2.onHover) _this2.onHover(_this2.card, card);
                });
                this.card.addEventListener('hover:enter', function () {
                    if (_this2.onEnter) _this2.onEnter(_this2.card, card);
                });
                this.image();
            };

            this.visible = function () {
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

            this.destroy = function () {
                this.img_poster.onerror = function () { };
                this.img_poster.onload = function () { };
                this.img_episode.onerror = function () { };
                this.img_episode.onload = function () { };
                this.img_poster.src = '';
                this.img_episode.src = '';
                remove(this.card);
                this.card = null;
                this.img_poster = null;
                this.img_episode = null;
            };

            this.render = function (js) {
                return js ? this.card : $(this.card);
            };
        }

        // Модифицируем стандартный TMDB источник для детского режима
        var originalTmdbMain = Lampa.Api.sources.tmdb.main;

        Lampa.Api.sources.tmdb.main = function() {
            var args = arguments;
            var params = arguments[0] || {};
            
            // Если это вызов из нашей кнопки KUV
            if (params.kuv_mode) {
                var owner = this;
                var onComplete = arguments[1];
                var onError = arguments[2];
                var partsLimit = 6;

                var sortOptions = [
                    { key: 'popularity.desc', title: 'Популярные' },
                    { key: 'first_air_date.desc', title: 'Новинки' },
                    { key: 'revenue.desc', title: 'Интересное' }
                ];

                var kidsGenres = [
                    { id: 16, title: 'мультфильмы' },
                    { id: 10751, title: 'семейные' },
                    { id: 14, title: 'фэнтези' },
                    { id: 28, title: 'боевики' },
                    { id: 35, title: 'комедии' },
                    { id: 12, title: 'приключения' },
                    { id: 878, title: 'фантастика' }
                ];

                var streamingServices = [
                    { id: 49, title: 'HBO' },
                    { id: 2552, title: 'Apple TV+' },
                    { id: 453, title: 'Hulu' },
                    { id: 1024, title: 'Amazon Prime' },
                    { id: 213, title: 'Netflix' },
                    { id: 3186, title: 'HBO Max' }
                ];

                var kidsStudios = [
                    { id: 2, title: 'Disney' },
                    { id: 3, title: 'Pixar' },
                    { id: 521, title: 'DreamWorks Animation' },
                    { id: 6704, title: 'Illumination' },
                    { id: 9383, title: 'Blue Sky Studios' },
                    { id: 11106, title: 'Sony Pictures Animation' },
                    { id: 11238, title: 'Studio Ghibli' },
                    { id: 7576, title: 'Cartoon Network' },
                    { id: 1701, title: 'Nickelodeon' },
                    { id: 116645, title: 'Laika' },
                    { id: 10210, title: 'Aardman Animations' }
                ];

                var ratingFilter = 'certification_country=US&certification.lte=PG';

                function shuffleArray(array) {
                    for (var i = array.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        [array[i], array[j]] = [array[j], array[i]];
                    }
                }

                function createRequest(endpoint, titleSuffix, callback) {
                    var sort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
                    owner.get(endpoint + '&sort_by=' + sort.key + '&' + ratingFilter, params, function (json) {
                        if (json.results) {
                            json.results = filterOutAnime(json.results);
                        }
                        json.title = Lampa.Lang.translate(sort.title + ' ' + titleSuffix);
                        callback(json);
                    }, callback);
                }

                function getStreaming(serviceName, serviceId) {
                    return function (callback) {
                        createRequest(
                            'discover/tv?with_networks=' + serviceId + '&with_genres=16,10751',
                            'на ' + serviceName,
                            callback
                        );
                    };
                }

                function getStudioMovies(studioName, studioId) {
                    return function (callback) {
                        var endpoint = 'discover/movie?with_companies=' + studioId;
                        createRequest(endpoint, 'от студии ' + studioName, function (json) {
                            callback(json);
                        });
                    };
                }

                function getMoviesWithoutGenre() {
                    return function (callback) {
                        createRequest(
                            'discover/movie?' + ratingFilter,
                            'Фильмы',
                            callback
                        );
                    };
                }

                var partsData = [
                    function (callback) {
                        createRequest('discover/movie?with_genres=10751,16&with_original_language=ru', 'русские мультфильмы', callback);
                    },
                    function (callback) {
                        createRequest('discover/movie?with_genres=10751,16&with_original_language=uk|en|be|zh|cn', 'иностранные мультфильмы', callback);
                    }
                ];

                streamingServices.forEach(function (service) {
                    partsData.push(getStreaming(service.title, service.id));
                });

                kidsGenres.forEach(function (genre) {
                    partsData.push(function (callback) {
                        createRequest('discover/movie?with_genres=' + genre.id, '(' + genre.title + ')', callback);
                    });
                });

                kidsStudios.forEach(function (studio) {
                    partsData.push(getStudioMovies(studio.title, studio.id));
                });

                function randomWideFlag() {
                    return Math.random() < 0.2;
                }

                function wrapWithWideFlag(requestFunc) {
                    return function (callback) {
                        requestFunc(function (json) {
                            if (randomWideFlag()) {
                                json.small = true;
                                json.wide = true;

                                if (Array.isArray(json.results)) {
                                    json.results.forEach(function (card) {
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
                partsData.push(getMoviesWithoutGenre());
                shuffleArray(partsData);

                function loadPart(partLoaded, partEmpty) {
                    Lampa.Api.partNext(partsData, partsLimit, partLoaded, partEmpty);
                }

                loadPart(onComplete, onError);
                return loadPart;
            }
            else {
                // Стандартное поведение TMDB
                return originalTmdbMain.apply(this, args);
            }
        };

        function add() {
            // Добавляем кнопку в меню
            if (window.appready) {
                addKuvButton();
            } else {
                Lampa.Listener.follow('app', function (e) {
                    if (e.type == 'ready') {
                        addKuvButton();
                    }
                });
            }
        }

        if (!window.plugin_kuv_ready) startPlugin();
    }

    if (!window.plugin_kuv_ready) startPlugin();
})();