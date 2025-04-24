// Плагин KUV studios для Lampa.

// Добавляет кнопку студии/телесети (источник — TMDb) в карточку.
// Добавляет оригинальное название второй строкой в карточку.
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
        // Добавляем дату динамически для избежания проблем с ES5
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
                
                addOriginalTitle(render, e.object.card);
                
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