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

    function createNetworkButton(network, index, type) {
        var networkBtn = $('<div class="tag-count selector network-btn"></div>');

        if (network.logo_path) {
            networkBtn.addClass('network-logo');
            networkBtn.addClass(type);

            networkBtn.append($('<div class="tag-count overlay"></div>'));
            var logo = $('<img/>').attr({
                src: Lampa.TMDB.image("t/p/w300" + network.logo_path),
                alt: network.name
            });
            networkBtn.append(logo);
        }

        networkBtn.on('hover:enter', function () {
            onNetworkButtonClick(network, this, type);
        });

        return networkBtn;
    }

    function onNetworkButtonClick(network, element, type) {
        var isTv = type == 'tv';
        var controllerName = Lampa.Controller.enabled().name;
        
        var releaseDateField = isTv ? 'first_air_date' : 'primary_release_date';
        var topFilter = { 'vote_count.gte': 10 };
        var newFilter = { 'vote_count.gte': 10 };
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

        var categoryLangKey = isTv ? 'Сериалы' : 'Фильмы';

        Lampa.Select.show({
            title: network.name + ' ' + categoryLangKey,
            items: menu,
            onBack: function () {
                Lampa.Controller.toggle(controllerName);
                Lampa.Controller.collectionFocus(element, Lampa.Activity.active().activity.render());
            },
            onSelect: function (action) {
                Lampa.Activity.push({
                    url: 'discover/' + type,
                    title: network.name + ' ' + action.type + ' ' + categoryLangKey,
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

    function renderNetworks() {
        var object = Lampa.Activity.active();
        var render = object.activity.render();
        $('.tmdb-networks', render).remove();

        getNetworks(object, function(networks) {
            if (networks.length == 0) return;

            var type = object.method;
            var networksLine = $(
                '<div class="tmdb-networks">' +
                    '<div class="items-line__body" style="margin-bottom:3em;">' +
                        '<div class="full-descr">' +
                            '<div class="full-descr__left">' +
                                '<div class="full-descr__tags" style="margin-top:0;"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );

            var container = $('.full-descr__tags', networksLine);

            networks.forEach(function (network, index) {
                container.append(createNetworkButton(network, index, type));
            });

            $('.items-line', render).eq(0).prepend(networksLine);
        });
    }

    function startPlugin() {
        if (window.tmdb_networks) return;
        window.tmdb_networks = true;

        $('<style>').prop('type', 'text/css').html(
            '.tmdb-networks { margin-top: -3em; } ' +
            '.network-btn { height: 2.94em; } ' +
            '.network-btn.movie { height: 4em; } ' +
            '.network-logo { background-color: #fff; position: relative; } ' +
            '.network-logo.movie { background: none; padding: 0; } ' +
            '.network-logo .overlay { ' +
                'position: absolute; top: 0; left: 0; right: 0; bottom: 0; ' +
                'background: rgba(0, 0, 0, 0); ' +
            '} ' +
            '.network-logo img { border-radius: 0.6em; height: 100%; } ' +
            '.network-logo.focus .overlay { background: rgba(0, 0, 0, 0.3); } ' +
            '.network-logo.focus { box-shadow: 0 0 0 0.2em rgb(255, 255, 255); }'
        ).appendTo('head');

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