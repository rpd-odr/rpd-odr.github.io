// Плагин KUV studios для Lampa.

// Добавляет кнопку студии/телесети (источник — TMDb) в карточку.
// Добавляет оригинальное название второй строкой в карточку.
// Добавляет логотип фильма/сериала над постером в портретном режиме.
// Подходит как для отдельного использования, так и в комплексе с kuv-style.

// Частично основано на плагине tmdb-networks v2.0.3 от levende (https://t.me/levende)
// https://levende.github.io/lampa-plugins/tmdb-networks.js

(function () {
    'use strict';

    var network = new Lampa.Reguest();
    var cache = {
        data: new Map(),
        ttl: 3600000, // 1 час в миллисекундах
        set: function(key, value) {
            this.data.set(key, {
                value: value,
                timestamp: Date.now()
            });
        },
        get: function(key) {
            var item = this.data.get(key);
            if (item && Date.now() - item.timestamp < this.ttl) {
                return item.value;
            }
            this.data.delete(key);
            return null;
        }
    };

    function isPortraitMode() {
        return $('body').hasClass('orientation--portrait') || window.innerHeight > window.innerWidth;
    }

    function getMovieProviders(movie, callback) {
        var cacheKey = 'providers_' + movie.id;
        var cachedData = cache.get(cacheKey);
        if (cachedData) {
            return callback(cachedData);
        }

        var url = Lampa.TMDB.api('movie/' + movie.id + '/watch/providers');
        network.silent(url, 
            function(data) {
                var providers = [];
                var allowedCountryCodes = ['US', 'RU'];

                allowedCountryCodes.forEach(function(countryCode) {
                    var countryData = data.results && data.results[countryCode];
                    if (countryData) {
                        if (countryData.flatrate) providers = providers.concat(countryData.flatrate);
                        if (countryData.rent) providers = providers.concat(countryData.rent);
                        if (countryData.buy) providers = providers.concat(countryData.buy);
                    }
                });

                var filteredProviders = providers.filter(function(p) {
                    return p.logo_path;
                });
                cache.set(cacheKey, filteredProviders);
                callback(filteredProviders);
            },
            function() {
                callback([]);
            }
        );
    }

    function getMovieImages(movie, callback) {
        var type = movie.name ? 'tv' : 'movie';
        var cacheKey = 'images_' + type + '_' + movie.id;
        var cachedData = cache.get(cacheKey);
        if (cachedData) {
            return callback(cachedData);
        }

        var url = Lampa.TMDB.api(type + '/' + movie.id + '/images');
        network.silent(url, 
            function(data) {
                if (data && data.logos && data.logos.length) {
                    // Фильтруем только английские и русские логотипы
                    data.logos = data.logos.filter(function(logo) {
                        return logo.iso_639_1 === null || logo.iso_639_1 === 'en' || logo.iso_639_1 === 'ru';
                    });
                    cache.set(cacheKey, data);
                    callback(data);
                } else {
                    callback(null);
                }
            },
            function() {
                callback(null);
            }
        );
    }

    function getNetworks(object, callback) {
        if (!object || !object.card || object.card.source !== 'tmdb') {
            return callback([]);
        }

        if (object.card.networks && object.card.networks.length) {
            return callback(object.card.networks);
        }
        if (object.card.production_companies && object.card.production_companies.length) {
            return callback(object.card.production_companies);
        }

        getMovieProviders(object.card, callback);
    }

    function showNetworkMenu(network, type, element) {
        var isTv = type === 'tv';
        var controller = Lampa.Controller.enabled().name;
        var dateField = isTv ? 'first_air_date' : 'primary_release_date';
        var currentDate = new Date().toISOString().split('T')[0];

        var menuItems = [
            { 
                title: 'Популярные', 
                sort: '', 
                filter: { 'vote_count.gte': 10 } 
            },
            { 
                title: 'Новые', 
                sort: dateField + '.desc', 
                filter: { 
                    'vote_count.gte': 10
                } 
            }
        ];
        menuItems[1].filter[dateField + '.lte'] = currentDate;

        Lampa.Select.show({
            title: network.name || 'Network',
            items: menuItems,
            onBack: function() {
                Lampa.Controller.toggle(controller);
                if (element) {
                    Lampa.Controller.collectionFocus(
                        element, 
                        Lampa.Activity.active().activity.render()
                    );
                }
            },
            onSelect: function(action) {
                var filter = { 'vote_count.gte': action.filter['vote_count.gte'] };
                filter[isTv ? 'with_networks' : 'with_companies'] = network.id;
                if (action.filter[dateField + '.lte']) {
                    filter[dateField + '.lte'] = action.filter[dateField + '.lte'];
                }

                Lampa.Activity.push({
                    url: 'discover/' + type,
                    title: (network.name || 'Network') + ' ' + action.title,
                    component: 'category_full',
                    source: 'tmdb',
                    card_type: true,
                    page: 1,
                    sort_by: action.sort,
                    filter: filter
                });
            }
        });
    }

    function addNetworkButton(render, networks, type) {
        $('.button--network, .button--studio', render).remove();

        if (!networks || !networks.length || !networks[0] || !networks[0].logo_path) return;

        var network = networks[0];
        var imgSrc = Lampa.TMDB.image('t/p/w154' + network.logo_path);
        var imgAlt = (network.name || '').replace(/"/g, '"');

        var $networkButton = $('<div>')
            .addClass('full-start__button selector button--network')
            .append(
                $('<div>')
                    .addClass('network-innie')
                    .append(
                        $('<img>')
                            .attr('src', imgSrc)
                            .attr('alt', imgAlt)
                            .on('error', function() {
                                $(this).parent().parent().remove();
                            })
                    )
            );

        $networkButton.on('hover:enter', function() {
            showNetworkMenu(network, type, this);
        });

        $('.full-start-new__buttons', render).append($networkButton);
    }

    function addTitleLogo(render, card) {
        if (!card || !isPortraitMode()) return;

        var $poster = $('.full-start-new__poster', render);
        if (!$poster.length) return;

        // Удаляем существующий логотип, если есть
        $('.title-logo', $poster).remove();

        // Проверяем наличие логотипа
        var logoPath = null;
        if (card.images && card.images.logos && card.images.logos.length) {
            // Предпочитаем русский логотип, затем английский, затем любой другой
            var ruLogo = card.images.logos.find(function(l) { return l.iso_639_1 === 'ru'; });
            var enLogo = card.images.logos.find(function(l) { return l.iso_639_1 === 'en'; });
            var anyLogo = card.images.logos[0];
            
            logoPath = (ruLogo || enLogo || anyLogo).file_path;
        }

        if (!logoPath) return;

        var imgUrl = Lampa.TMDB.image('w500' + logoPath);

        // Создаем контейнер для логотипа
        var $logoContainer = $('<div>')
            .addClass('title-logo')
            .css({
                'position': 'absolute',
                'top': '-2em',
                'left': '50%',
                'transform': 'translateX(-50%)',
                'background-color': '#1e1e1e',
                'padding': '0.3em 1em',
                'border-radius': '0.7em',
                'z-index': '2'
            });

        // Создаем изображение логотипа
        var $logo = $('<img>')
            .attr('src', imgUrl)
            .css({
                'height': '2em',
                'max-width': '200px',
                'object-fit': 'contain'
            })
            .on('error', function() {
                $logoContainer.remove();
            });

        $logoContainer.append($logo);

        // Добавляем логотип к постеру
        if ($poster.css('position') !== 'relative') {
            $poster.css('position', 'relative');
        }
        $poster.append($logoContainer);
    }

    function addOriginalTitle(render, card) {
        var $titleElement = $('.full-start-new__title', render);
        if (!card || !$titleElement.length) return;

        var originalTitle = card.original_title || card.original_name;
        var currentTitle = card.title || card.name;

        if (originalTitle && originalTitle !== currentTitle) {
            $titleElement.find('.original-title').remove();
            $('<div>')
                .addClass('original-title')
                .text(originalTitle)
                .appendTo($titleElement);
        }
    }

    function initPlugin() {
        // Добавление CSS-стилей (однократно)
        if ($('style#network-plugin').length === 0) {
            $('<style>')
                .attr('id', 'network-plugin')
                .html([
                    '.button--network, .button--studio { padding: .3em; }',
                    '.network-innie {',
                    '    background-color: #fff;',
                    '    width: 100%;',
                    '    height: 100%;',
                    '    border-radius: .7em;',
                    '    display: flex;',
                    '    align-items: center;',
                    '    padding: 0 1em;',
                    '}',
                    '.button--network img, .button--studio img {',
                    '    height: 100%;',
                    '    max-height: 1.5em;',
                    '    max-width: 4.5em;',
                    '    object-fit: contain;',
                    '}',
                    '.full-start-new__title {',
                    '    position: relative;',
                    '    margin-bottom: 0.6em !important;',
                    '}',
                    '.full--tagline {',
                    '    margin-bottom: 0.6em !important;',
                    '}',
                    '.original-title {',
                    '    font-size: 0.8em;',
                    '    color: rgba(255, 255, 255, 0.7);',
                    '    font-weight: normal;',
                    '}'
                ].join('\n'))
                .appendTo('head');
        }

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                var render = e.object.activity.render();
                var card = e.object.card;
                
                addOriginalTitle(render, card);
                
                // Получаем изображения перед добавлением логотипа
                if (card && !card.images) {
                    getMovieImages(card, function(images) {
                        if (images) {
                            card.images = images;
                        }
                        addTitleLogo(render, card);
                    });
                } else {
                    addTitleLogo(render, card);
                }
                
                getNetworks(e.object, function(networks) {
                    if (networks.length) {
                        addNetworkButton(render, networks, e.object.method);
                    }
                });
            }
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                initPlugin();
            }
        });
    }
})();