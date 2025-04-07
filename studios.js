(function () {
    'use strict';

    var network = new Lampa.Reguest();

    function getMovieProviders(movie, callback) {
        var allowedCountryCodes = ['US', 'RU'];
        var excludeKeywords = ['Free', 'Ad', 'With Ads', 'Free with Ads', 'Plex', 'Tubi', 'Pluto TV', 'Google Play', 'Youtube', 'Max Amazon Channel'];
        var maxDisplayPriority = 20;

        var url = Lampa.TMDB.api('movie/' + movie.id + '/watch/providers?api_key=' + Lampa.TMDB.key());
        network.silent(url, function (data) {
            if (!data.results) {
                return [];
            }

            var countryCodes = Object.keys(data.results).filter(function(countryCode) {
                return allowedCountryCodes.includes(countryCode);
            });

            var providers = [];
            var uniqueProviders = [];

            countryCodes.forEach(function(countryCode) {
                var countryProviders = (data.results[countryCode].flatrate || [])
                    .concat(data.results[countryCode].rent || [])
                    .concat(data.results[countryCode].buy || []);
            
                countryProviders.forEach(function(provider) { provider.country_code = countryCode });
                providers = providers.concat(countryProviders);
            });

            providers.forEach(function (provider) {
                if (provider.display_priority > maxDisplayPriority) return;

                if (uniqueProviders.some(function(p) { return p.id == provider.provider_id } )) return;

                var name = provider.provider_name;
                var excluded = excludeKeywords.some(function (keyword) {
                    return name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
                });

                if (excluded) return;

                uniqueProviders.push({
                    id: provider.provider_id,
                    name: name,
                    logo_path: provider.logo_path,
                    display_priority: provider.display_priority,
                    country_code: provider.country_code
                });
            });

            uniqueProviders = uniqueProviders.sort(function (a, b) { return a.display_priority - b.display_priority });
            callback(uniqueProviders);
        });
    }

    function getNetworks(object, callback) {
        var movie = object.card;
        if (!movie || movie.source !== 'tmdb') return callback([]);

        var getFn = movie.networksList 
            ? function() { callback(movie.networksList); }
            : movie.networks 
                ? function() { callback(movie.networks); }
                : getMovieProviders;
        
        getFn(movie, function(networks) {
            movie.networksList = networks;
            callback(networks);
        });
    }

    function onNetworkButtonClick(network, element, type) {
        var isTv = type == 'tv';
        var controllerName = Lampa.Controller.enabled().name;
        
        var releaseDateField = isTv ? 'first_air_date' : 'primary_release_date';
        var topFilter = { 'vote_count.gte': 3 };
        var newFilter = { 'vote_count.gte': 3 };
        newFilter[releaseDateField + '.lte'] = new Date().toISOString().split('T')[0];

        var menu = [
            {
                title: 'Открыть популярные',
                sort_by: '',
                type: 'Популярные',
                filter: topFilter
            },
            {
                title: 'Открыть новинки',
                sort_by: releaseDateField + '.desc',
                type: 'Новинки',
                filter: newFilter
            }
        ];

        if (network.country_code) {
            menu.forEach(function(selectItem) {
                selectItem.filter.watch_region = network.country_code;
                selectItem.filter.with_watch_providers = network.id;
            });
        }

        Lampa.Select.show({
            title: network.name + (isTv ? ' Сериалы' : ' Фильмы'),
            items: menu,
            onBack: function () {
                Lampa.Controller.toggle(controllerName);
                if(element) Lampa.Controller.collectionFocus(element, Lampa.Activity.active().activity.render());
            },
            onSelect: function (action) {
                Lampa.Activity.push({
                    url: 'discover/' + type,
                    title: network.name + ' ' + action.type + (isTv ? ' Сериалы' : ' Фильмы'),
                    component: 'category_full',
                    networks: network.id,
                    sort_by: action.sort_by,
                    source: 'tmdb',
                    card_type: true,
                    page: 1,
                    filter: action.filter,
                });
            }
        });
    }

    function renderExtraBtn(render, networks, type) {
        $('.button--plaftorms', render).remove();

        if (!networks || networks.length === 0) return;

        var container = $('.full-start-new__buttons', render);
        var network = networks[0];

        if (!network.logo_path) return;

        var btn = $('<div class="full-start__button selector button--plaftorms"></div>');
        
        btn.html('<img src="' + Lampa.TMDB.image("t/p/w154" + network.logo_path) + '" alt="' + network.name + '">');
        
        btn.on('hover:enter', function () {
            onNetworkButtonClick(network, this, type);
        });

        container.append(btn);
    }

    function renderNetworks() {
        var object = Lampa.Activity.active();
        var render = object.activity.render();

        getNetworks(object, function(networks) {
            if (networks.length == 0) return;

            var type = object.method;
            renderExtraBtn(render, networks, type);
        });
    }

    function startPlugin() {
        if (window.tmdb_networks) return;
        window.tmdb_networks = true;

        $('<style>')
            .html('\
                .button--plaftorms {\
                    margin-left: 10px;\
                    height: 100%;\
                }\
                .button--plaftorms img {\
                    height: 100%;\
                    max-height: 30px;\
                    object-fit: contain;\
                    border-radius: 4px;\
                }\
            ')
            .appendTo('head');

        Lampa.Listener.follow('activity,full', function (e) {
            if (e.type === 'complite' || e.type === 'archive') {
                renderNetworks();
            }
        });
    }

    if (window.appready) {
        setTimeout(startPlugin, 500);
    } else {
        var onAppReady = function (event) {
            if (event.type !== 'ready') return;
            Lampa.Listener.remove('app', onAppReady);
            setTimeout(startPlugin, 500);
        };
        Lampa.Listener.follow('app', onAppReady);
    }
})();