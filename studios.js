(function () {
    'use strict';

    var network = new Lampa.Reguest();

    function getMovieProviders(movie, callback) {
        var url = Lampa.TMDB.api('movie/' + movie.id + '/watch/providers');
        network.silent(url, function (data) {
            var providers = [];
            if (data.results && data.results.US) {
                providers = (data.results.US.flatrate || [])
                    .concat(data.results.US.rent || [])
                    .concat(data.results.US.buy || []);
            }
            callback(providers.filter(p => p.logo_path));
        });
    }

    function getNetworks(object, callback) {
        var item = object.card;
        if (!item || item.source !== 'tmdb') return callback([]);

        if (item.networks) return callback(item.networks);
        if (item.production_companies) return callback(item.production_companies);
        
        getMovieProviders(item, callback);
    }

    // Функция для отображения меню с фильмами/сериалами
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

    // Функция для добавления кнопки с логотипом студии или телесети
    function addNetworkButton(render, networks, type) {
        $('.button--platform', render).remove();
        if (!networks || !networks[0] || !networks[0].logo_path) return;

        var btn = $('<div class="full-start__button selector button--platform"></div>')
            .append('<img src="' + Lampa.TMDB.image('w154' + networks[0].logo_path) + '">')
            .on('hover:enter', function() {
                showNetworkMenu(networks[0], type, this);
            });

        $('.full-start-new__buttons', render).append(btn);
    }

    // Инициализация плагина
    function initPlugin() {
        $('<style>').html(`
            .button--platform {
                margin-left: 10px;
                height: 100%;
            }
            .button--platform img {
                height: 100%;
                max-height: 30px;
                object-fit: contain;
                border-radius: 4px;
            }
        `).appendTo('head');

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