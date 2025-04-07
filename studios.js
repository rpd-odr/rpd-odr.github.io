(function () {
    'use strict';

    var network = new Lampa.Reguest();

    function getMovieProviders(movie, callback) {
        var allowedCountryCodes = ['US', 'RU'];
        var excludeKeywords = ['Free', 'Ad', 'With Ads'];
        var maxDisplayPriority = 20;

        var url = Lampa.TMDB.api('movie/' + movie.id + '/watch/providers');
        network.silent(url, function (data) {
            if (!data.results) return callback([]);

            var providers = [];
            Object.keys(data.results).forEach(function(country) {
                if (!allowedCountryCodes.includes(country)) return;
                
                var items = [].concat(
                    data.results[country].flatrate || [],
                    data.results[country].buy || [],
                    data.results[country].rent || []
                );
                
                items.forEach(function(provider) {
                    if (provider.display_priority > maxDisplayPriority) return;
                    if (excludeKeywords.some(k => provider.provider_name.includes(k))) return;
                    providers.push({
                        id: provider.provider_id,
                        name: provider.provider_name,
                        logo_path: provider.logo_path
                    });
                });
            });
            
            callback(providers);
        });
    }

    function getNetworks(card, callback) {
        if (card.networks) return callback(card.networks);
        if (card.production_companies) return callback(card.production_companies);
        if (card.source === 'tmdb') getMovieProviders(card, callback);
        else callback([]);
    }

    function createProviderButton(network) {
        if (!network.logo_path) return null;
        
        var btn = $(`
            <div class="full-start__button selector button--platform">
                <img src="${Lampa.TMDB.image('t/p/h30' + network.logo_path)}" 
                     alt="${network.name}" 
                     style="height: 70%; border-radius: 0.3em;">
            </div>
        `);
        
        btn.on('hover:enter', function() {
            Lampa.Activity.push({
                url: 'discover/' + (card.method === 'tv' ? 'tv' : 'movie'),
                title: network.name,
                component: 'category_full',
                filter: {
                    [card.method === 'tv' ? 'with_networks' : 'with_companies']: network.id
                }
            });
        });
        
        return btn;
    }

    function addPlatformButton() {
        Lampa.Listener.follow('full', function(e) {
            if (e.type !== 'complite') return;
            
            var card = e.object;
            var buttonsContainer = $('.full-start-new__buttons', card.nodes.body);
            if (!buttonsContainer.length) return;
            
            $('.button--platform', buttonsContainer).remove();
            
            getNetworks(card.item, function(networks) {
                if (networks.length === 0) return;
                
                var mainProvider = networks[0];
                var btn = createProviderButton(mainProvider);
                if (btn) buttonsContainer.append(btn);
            });
        });
    }

    // Запуск
    if (window.appready) addPlatformButton();
    else Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') addPlatformButton();
    });

})();