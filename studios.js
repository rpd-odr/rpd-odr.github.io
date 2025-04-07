(function () {
    'use strict';

    var network = new Lampa.Reguest();

    function getMovieProviders(movie, callback) {
        var url = Lampa.TMDB.api('movie/' + movie.id + '/watch/providers');
        network.silent(url, function (data) {
            var providers = [];
            var allowedCountryCodes = ['US', 'RU'];  // Добавили страну RU

            allowedCountryCodes.forEach(function (countryCode) {
                if (data.results && data.results[countryCode]) {
                    providers = providers.concat(
                        (data.results[countryCode].flatrate || [])
                            .concat(data.results[countryCode].rent || [])
                            .concat(data.results[countryCode].buy || [])
                    );
                }
            });

            callback(providers.filter(p => p.logo_path));  // Возвращаем провайдеров с логотипами
        });
    }

    function getNetworks(object, callback) {
        var item = object.card;
        if (!item || item.source !== 'tmdb') return callback([]);

        if (item.networks) return callback(item.networks);
        if (item.production_companies) return callback(item.production_companies);
        
        getMovieProviders(item, callback);
    }

    function showNetworkMenu(network, type, element) {
        var isTv = type === 'tv';
        var controller = Lampa.Controller.enabled().name;
        var dateField = isTv ? 'first_air_date' : 'primary_release_date';

        Lampa.Select.show({
            title: network.name,
            items: [
                {
                    title: 'Популярные',
                    sort: '',
                    filter: { 'vote_count.gte': 10 }
                },
                {
                    title: 'Новые',
                    sort: dateField + '.desc',
                    filter: { 
                        'vote_count.gte': 10,
                        [dateField + '.lte']: new Date().toISOString().split('T')[0] 
                    }
                }
            ],
            onBack: function() {
                Lampa.Controller.toggle(controller);
                if (element) Lampa.Controller.collectionFocus(element, Lampa.Activity.active().activity.render());
            },
            onSelect: function(action) {
                Lampa.Activity.push({
                    url: 'discover/' + type,
                    title: network.name + ' ' + action.title,
                    component: 'category_full',
                    source: 'tmdb',
                    card_type: true,
                    page: 1,
                    sort_by: action.sort,
                    filter: Object.assign(
                        { [isTv ? 'with_networks' : 'with_companies']: network.id },
                        action.filter
                    )
                });
            }
        });
    }

    function addNetworkButton(render, networks, type) {
        $('.button--network, .button--studio', render).remove(); // Удаляем старые кнопки

        if (!networks || !networks[0] || !networks[0].logo_path) return;

        var btn = $('<div class="full-start__button selector button--network"></div>')
        .append(
            '<div class="network-innie">' +
                '<img src="' + Lampa.TMDB.image('t/p/w154' + (networks[0].logo_path || '')) +
                '" alt="' + (networks[0].name || '').replace(/"/g, '&quot;') + '">' +
            '</div>'
        )
    .on('hover:enter', function () {
        showNetworkMenu(networks[0], type, this);
    });

        $('.full-start-new__buttons', render).append(btn);
    }

    function initPlugin() {
        $('<style>')
            .html(`
                .button--network, 
                .button--studio {
                    padding: .3em;
                }
                
                .network-innie {
                    background-color: rgba(255,255,255,1);
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
                    max-height: 1.8em;
                    max-width: 4.5em;
                    object-fit: contain;
                }
            `)
            .appendTo('head');

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                getNetworks(e.object, function(networks) {
                    if (networks && networks.length) {
                        addNetworkButton(e.object.activity.render(), networks, e.object.method);
                    }
                });
            }
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') initPlugin();
    });
})();