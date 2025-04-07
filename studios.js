(function () {
    'use strict';

    // Регистрация плагина
    Lampa.Plugin.register('tmdb_networks_simple', {
        name: 'TMDB Networks Simple',
        version: '0.1',
        description: 'Показывает логотипы студий/сетей производства',
        author: 'Your Name'
    });

    // Стили для плагина
    $('<style>')
        .html(`
            .network-btn { 
                height: 2.94em;
                margin-right: 10px;
                background-color: #fff;
                position: relative;
                border-radius: 0.6em;
            }
            .network-btn img {
                height: 100%;
                border-radius: 0.6em;
            }
            .network-btn .overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0);
            }
            .network-btn.focus .overlay {
                background: rgba(0, 0, 0, 0.3);
            }
            .network-btn.focus {
                box-shadow: 0 0 0 0.2em rgb(255, 255, 255);
            }
            .tmdb-networks {
                margin-top: -3em;
            }
        `)
        .appendTo('head');

    // Основная функция
    function initPlugin() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(function() {
                    try {
                        processCard(e.object);
                    } catch (err) {
                        console.error('TMDB Networks plugin error:', err);
                    }
                }, 300);
            }
        });
    }

    function processCard(cardObject) {
        var item = cardObject.item;
        if (!item) return;

        var networks = item.networks || item.production_companies || [];
        if (networks.length === 0) return;

        var tagsContainer = $('.full-descr__tags', cardObject.nodes.body);
        if (!tagsContainer.length) return;

        // Удаляем старые элементы, если есть
        $('.network-btn', tagsContainer).remove();

        // Создаем кнопки с логотипами
        networks.forEach(function(network) {
            if (!network.logo_path) return;

            var btn = $(`
                <div class="tag-count selector network-btn">
                    <div class="overlay"></div>
                    <img src="${Lampa.TMDB.image('t/p/h30' + network.logo_path)}" alt="${network.name}" loading="lazy">
                </div>
            `);

            btn.on('hover:enter', function() {
                openNetworkContent(network, cardObject);
            });

            tagsContainer.append(btn);
        });
    }

    function openNetworkContent(network, cardObject) {
        var isTv = cardObject.method === 'tv';
        var type = isTv ? 'tv' : 'movie';
        var filterField = isTv ? 'with_networks' : 'with_companies';

        Lampa.Activity.push({
            url: 'discover/' + type,
            title: network.name,
            component: 'category_full',
            source: 'tmdb',
            card_type: true,
            page: 1,
            filter: {
                [filterField]: network.id,
                'vote_count.gte': 10
            },
            sort_by: isTv ? 'first_air_date.desc' : 'primary_release_date.desc'
        });
    }

    // Запускаем плагин
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initPlugin();
        });
    }
})();