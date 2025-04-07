(function () {
    'use strict';

    var network = new Lampa.Reguest();

    function getMovieProviders(movie, callback) {
        var allowedCountryCodes = ['US', 'RU'];
        var excludeKeywords = ['Free', 'Ad', 'With Ads', 'Free with Ads', 'Plex', 'Tubi', 'Pluto TV', 'Google Play', 'Youtube', 'Max Amazon Channel'];
        var maxDisplayPriority = 20;

        var url = Lampa.TMDB.api('movie/' + movie.id + '/watch/providers?api_key=' + Lampa.TMDB.key());
        network.silent(url, function (data) {
            if (!data.results) return callback([]);

            var providers = [];
            var uniqueProviders = [];

            allowedCountryCodes.forEach(function(countryCode) {
                if (data.results[countryCode]) {
                    var countryProviders = [].concat(
                        data.results[countryCode].flatrate || [],
                        data.results[countryCode].rent || [],
                        data.results[countryCode].buy || []
                    );
                    
                    countryProviders.forEach(function(provider) {
                        provider.country_code = countryCode;
                        if (provider.display_priority <= maxDisplayPriority && 
                            !excludeKeywords.some(k => provider.provider_name.toLowerCase().includes(k.toLowerCase())) {
                            providers.push(provider);
                        }
                    });
                }
            });

            providers.forEach(function(provider) {
                if (!uniqueProviders.some(p => p.provider_id === provider.provider_id)) {
                    uniqueProviders.push({
                        id: provider.provider_id,
                        name: provider.provider_name,
                        logo_path: provider.logo_path,
                        country_code: provider.country_code
                    });
                }
            });

            callback(uniqueProviders.sort((a, b) => a.display_priority - b.display_priority));
        });
    }

    function getNetworks(object, callback) {
        var movie = object.card;
        if (!movie || movie.source !== 'tmdb') return callback([]);

        if (movie.networksList) return callback(movie.networksList);
        if (movie.networks) return callback(movie.networks);
        
        getMovieProviders(movie, function(networks) {
            movie.networksList = networks;
            callback(networks);
        });
    }

    function createNetworkButton(network) {
        if (!network.logo_path) return null;

        var btn = $(`
            <div class="tag-count selector network-btn network-logo">
                <div class="overlay"></div>
                <img src="${Lampa.TMDB.image('t/p/w300' + network.logo_path)}" alt="${network.name}">
            </div>
        `);

        btn.on('hover:enter', function() {
            openNetworkContent(network, Lampa.Activity.active());
        });

        return btn;
    }

    function openNetworkContent(network, object) {
        var isTv = object.method === 'tv';
        var filterField = isTv ? 'with_networks' : 'with_companies';
        var sortField = isTv ? 'first_air_date.desc' : 'primary_release_date.desc';

        Lampa.Activity.push({
            url: 'discover/' + (isTv ? 'tv' : 'movie'),
            title: network.name + ' ' + (isTv ? 'Сериалы' : 'Фильмы'),
            component: 'category_full',
            source: 'tmdb',
            card_type: true,
            page: 1,
            filter: {
                [filterField]: network.id,
                'vote_count.gte': 10
            },
            sort_by: sortField
        });
    }

    function renderNetworks() {
        var object = Lampa.Activity.active();
        var render = object.activity.render();
        $('.tmdb-networks', render).remove();

        getNetworks(object, function(networks) {
            if (!networks || networks.length === 0) return;

            var container = $(`
                <div class="tmdb-networks">
                    <div class="items-line__body" style="margin-bottom:3em;">
                        <div class="full-descr">
                            <div class="full-descr__left">
                                <div class="full-descr__tags" style="margin-top:0;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            var tags = container.find('.full-descr__tags');
            
            networks.forEach(function(network) {
                var btn = createNetworkButton(network);
                if (btn) tags.append(btn);
            });

            if (tags.children().length > 0) {
                $('.items-line', render).eq(0).prepend(container);
            }
        });
    }

    function startPlugin() {
        if (window.tmdb_networks) return;
        window.tmdb_networks = true;

        $('<style>')
            .html(`
                .tmdb-networks { margin-top: -3em; }
                .network-btn { 
                    height: 2.94em;
                    margin-right: 10px;
                    background-color: #fff;
                    position: relative;
                }
                .network-btn.movie { height: 4em; }
                .network-logo { border-radius: 0.6em; }
                .network-logo .overlay { 
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0);
                    border-radius: 0.6em;
                }
                .network-logo img { 
                    height: 100%;
                    border-radius: 0.6em;
                }
                .network-logo.focus .overlay { 
                    background: rgba(0,0,0,0.3); 
                }
                .network-logo.focus { 
                    box-shadow: 0 0 0 0.2em rgb(255,255,255); 
                }
            `)
            .appendTo('head');

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') renderNetworks();
        });
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();