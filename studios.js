(function () {
    'use strict';

    // Регистрация плагина
    Lampa.Plugin.register('tmdb_networks_simple', {
        name: 'TMDB Networks Simple',
        version: '0.1',
        description: 'Показывает студии/сети производства',
        author: 'Your Name'
    });

    // Добавляем локализацию
    Lampa.Lang.add({
        tmdb_networks_production: {
            en: 'Production',
            uk: 'Виробництво',
            ru: 'Производство'
        }
    });

    // Стили для плагина
    $('<style>')
        .html(`
            .network-btn { 
                margin-right: 10px;
                cursor: pointer;
            }
            .network-btn:hover {
                opacity: 0.8;
            }
            .network-list-item {
                padding: 10px;
                border-bottom: 1px solid #333;
            }
            .network-list-item:hover {
                background: rgba(255,255,255,0.1);
            }
        `)
        .appendTo('head');

    // Основная функция
    function initNetworks() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                var item = e.object.item;
                var networks = item.networks || item.production_companies || [];
                
                if (networks.length > 0) {
                    var tagsContainer = $('.full-descr__tags', e.object.nodes.body);
                    
                    if (tagsContainer.length) {
                        // Создаем кнопку
                        var btn = $(`
                            <div class="tag-count selector network-btn">
                                <div class="tag-count__name">${Lampa.Lang.translate('tmdb_networks_production')}</div>
                                <div class="tag-count__count">${networks.length}</div>
                            </div>
                        `);
                        
                        // Добавляем обработчик клика
                        btn.on('hover:enter', function() {
                            showNetworksList(networks, e.object);
                        });
                        
                        tagsContainer.append(btn);
                    }
                }
            }
        });
    }

    // Показываем список сетей
    function showNetworksList(networks, cardObject) {
        var items = networks.map(function(network) {
            return {
                title: network.name,
                network: network,
                image: network.logo_path 
                    ? Lampa.TMDB.image('t/p/w45' + network.logo_path) 
                    : null
            };
        });
        
        Lampa.Select.show({
            title: Lampa.Lang.translate('tmdb_networks_production'),
            items: items,
            onBack: function() {
                Lampa.Controller.toggle(Lampa.Controller.enabled().name);
            },
            onSelect: function(action) {
                // При выборе сети открываем её контент
                openNetworkContent(action.network, cardObject);
            }
        });
    }

    // Открываем контент сети
    function openNetworkContent(network, cardObject) {
        var isTv = cardObject.method === 'tv';
        var type = isTv ? 'tv' : 'movie';
        
        Lampa.Activity.push({
            url: 'discover/' + type,
            title: network.name,
            component: 'category_full',
            source: 'tmdb',
            card_type: true,
            page: 1,
            filter: {
                with_companies: network.id,
                'vote_count.gte': 10
            },
            sort_by: isTv ? 'first_air_date.desc' : 'primary_release_date.desc'
        });
    }

    // Запуск плагина
    if (window.appready) {
        initNetworks();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initNetworks();
        });
    }
})();