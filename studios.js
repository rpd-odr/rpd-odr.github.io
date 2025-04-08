// Плагин KUV studios для Lampa.

// Добавляет кнопку студии/телесети (источник — TMDb) в карточку .
// Добавляет оригинальное название второй строкой в карточку.
// Подходит как для отдельного использования, так и в комплексе с kuv-style.

// Частично основано на плагине tmdb-networks v2.0.3 от levende (https://t.me/levende).
// https://levende.github.io/lampa-plugins/tmdb-networks.js

(function () {
    'use strict';

    var network = new Lampa.Reguest();
    var cache = new Map();

    function getMovieProviders(movie, callback) {
        const cacheKey = `providers_${movie.id}`;
        if (cache.has(cacheKey)) {
            return callback(cache.get(cacheKey));
        }

        const url = Lampa.TMDB.api(`movie/${movie.id}/watch/providers`);
        network.silent(url, 
            function (data) {
                const providers = [];
                const allowedCountryCodes = ['US', 'RU'];

                allowedCountryCodes.forEach(countryCode => {
                    if (data.results?.[countryCode]) {
                        providers.push(
                            ...(data.results[countryCode].flatrate || []),
                            ...(data.results[countryCode].rent || []),
                            ...(data.results[countryCode].buy || [])
                        );
                    }
                });

                const filteredProviders = providers.filter(p => p.logo_path);
                cache.set(cacheKey, filteredProviders);
                callback(filteredProviders);
            },
            function (error) {
                console.error('Provider fetch error:', error);
                callback([]);
            }
        );
    }

    function getNetworks(object, callback) {
        if (!object?.card || object.card.source !== 'tmdb') {
            return callback([]);
        }

        if (object.card.networks?.length) {
            return callback(object.card.networks);
        }
        if (object.card.production_companies?.length) {
            return callback(object.card.production_companies);
        }

        getMovieProviders(object.card, callback);
    }

    function showNetworkMenu(network, type, element) {
        const isTv = type === 'tv';
        const controller = Lampa.Controller.enabled().name;
        const dateField = isTv ? 'first_air_date' : 'primary_release_date';
        const currentDate = new Date().toISOString().split('T')[0];

        Lampa.Select.show({
            title: network.name || 'Network',
            items: [
                {
                    title: 'Популярные',
                    sort: '',
                    filter: { 'vote_count.gte': 10 }
                },
                {
                    title: 'Новые',
                    sort: `${dateField}.desc`,
                    filter: { 
                        'vote_count.gte': 10,
                        [`${dateField}.lte`]: currentDate
                    }
                }
            ],
            onBack: function() {
                Lampa.Controller.toggle(controller);
                if (element) {
                    Lampa.Controller.collectionFocus(element, Lampa.Activity.active().activity.render());
                }
            },
            onSelect: function(action) {
                Lampa.Activity.push({
                    url: `discover/${type}`,
                    title: `${network.name || 'Network'} ${action.title}`,
                    component: 'category_full',
                    source: 'tmdb',
                    card_type: true,
                    page: 1,
                    sort_by: action.sort,
                    filter: {
                        [isTv ? 'with_networks' : 'with_companies']: network.id,
                        ...action.filter
                    }
                });
            }
        });
    }

    function addNetworkButton(render, networks, type) {
        $('.button--network, .button--studio', render).remove();

        if (!networks?.length || !networks[0]?.logo_path) return;

        const network = networks[0];
        const imgSrc = Lampa.TMDB.image(`t/p/w154${network.logo_path}`);
        const imgAlt = (network.name || '').replace(/"/g, '"');

        const btn = $('<div>')
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
            )
            .on('hover:enter', function() {
                showNetworkMenu(network, type, this);
            });

        $('.full-start-new__buttons', render).append(btn);
    }

    function initPlugin() {
        if ($('style#network-plugin').length === 0) {
            $('<style>')
                .attr('id', 'network-plugin')
                .html(`
                    .button--network, 
                    .button--studio {
                        padding: .3em;
                    }
                    
                    .network-innie {
                        background-color: #fff;
                        width: 100%;
                        height: 100%;
                        border-radius: .7em;
                        display: flex;
                        align-items: center;
                        padding: 0 1em;
                    }

                    .button--network img,
                    .button--studio img {
                        height: 100%;
                        max-height: 1.5em;
                        max-width: 4.5em;
                        object-fit: contain;
                    }

                    .full-start-new__title {
                        position: relative;
                        margin-bottom: 0.6em !important;
                    }
                    
                    .full--tagline {
                        margin-bottom: 0.6em !important;
                    }

                    .original-title {
                        font-size: 0.8em;
                        color: rgba(255, 255, 255, 0.7);
                        font-weight: normal;
                    }
                `)
                .appendTo('head');
        }

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                // Добавление оригинального названия
                const render = e.object.activity.render();
                const card = e.object.card;
                const titleElement = $('.full-start-new__title', render);
                
                if (card && titleElement.length) {
                    const originalTitle = card.original_title || card.original_name;
                    if (originalTitle && originalTitle !== card.title && originalTitle !== card.name) {
                        titleElement.find('.original-title').remove();
                        $('<div>')
                            .addClass('original-title')
                            .text(originalTitle)
                            .appendTo(titleElement);
                    }
                }

                // Логика кнопки сети
                getNetworks(e.object, networks => {
                    if (networks.length) {
                        addNetworkButton(render, networks, e.object.method);
                    }
                });
            }
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && initPlugin());
})();