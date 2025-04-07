(function () {
    'use strict';

    var network = new Lampa.Reguest();

    function getCompanyOrNetwork(movie, callback) {
        var isTV = !!movie.name;
        var url = Lampa.TMDB.api((isTV ? 'tv/' : 'movie/') + movie.id + '?api_key=' + Lampa.TMDB.key());

        network.silent(url, function (data) {
            let result = [];

            if (isTV && data.networks && data.networks.length) {
                result = data.networks;
            } else if (!isTV && data.production_companies && data.production_companies.length) {
                result = data.production_companies;
            }

            callback(result, isTV);
        });
    }

    function getRelevantData(object, callback) {
        var movie = object.card;
        if (!movie || movie.source !== 'tmdb') return callback([], false);

        if (movie._companyData) {
            callback(movie._companyData.list, movie._companyData.isTV);
        } else {
            getCompanyOrNetwork(movie, function(list, isTV) {
                movie._companyData = { list, isTV };
                callback(list, isTV);
            });
        }
    }

    function onCompanyClick(item, element, isTV) {
        var controllerName = Lampa.Controller.enabled().name;
        var releaseDateField = isTV ? 'first_air_date' : 'primary_release_date';
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

        if (isTV) {
            menu.forEach(item => item.filter.with_networks = item.id);
        } else {
            menu.forEach(item => item.filter.with_companies = item.id);
        }

        Lampa.Select.show({
            title: item.name + (isTV ? ' Сериалы' : ' Фильмы'),
            items: menu,
            onBack: function () {
                Lampa.Controller.toggle(controllerName);
                if(element) Lampa.Controller.collectionFocus(element, Lampa.Activity.active().activity.render());
            },
            onSelect: function (action) {
                Lampa.Activity.push({
                    url: 'discover/' + (isTV ? 'tv' : 'movie'),
                    title: item.name + ' ' + action.type + (isTV ? ' Сериалы' : ' Фильмы'),
                    component: 'category_full',
                    sort_by: action.sort_by,
                    source: 'tmdb',
                    card_type: true,
                    page: 1,
                    filter: action.filter
                });
            }
        });
    }

    function renderButton(render, items, isTV) {
        var className = isTV ? 'button--network' : 'button--studio';
        $('.' + className, render).remove();

        if (!items || items.length === 0) return;

        var container = $('.full-start-new__buttons', render);
        var item = items.find(c => c.logo_path);

        if (!item) return;

        var btn = $('<div class="full-start__button selector ' + className + '"></div>');
        btn.html('<img src="' + Lampa.TMDB.image("t/p/w154" + item.logo_path) + '" alt="' + item.name + '">');

        btn.on('hover:enter', function () {
            onCompanyClick(item, this, isTV);
        });

        container.append(btn);
    }

    function renderCompanyOrNetwork() {
        var object = Lampa.Activity.active();
        var render = object.activity.render();

        getRelevantData(object, function(items, isTV) {
            if (items.length === 0) return;
            renderButton(render, items, isTV);
        });
    }

    function startPlugin() {
        if (window.tmdb_company_selector) return;
        window.tmdb_company_selector = true;
        
          $('<style>')
            .html(`
                .button--network, 
                .button--studio
                {
                    overflow: hidden;
                    background-color: rgba(255,255,255,.7);
                }
                .button--network img,
                .button--studio img
                 {
                    height: 100%;
                    max-height: 1.6em;
                    max-width: 4.8em;
                    object-fit: contain;
                }
            `)
            .appendTo('head');

        Lampa.Listener.follow('activity,full', function (e) {
            if (e.type === 'complite' || e.type === 'archive') {
                renderCompanyOrNetwork();
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