(function () {
    'use strict';

    // Ожидаем полной загрузки приложения
    function waitAppReady() {
        if (window.appready) {
            initPlugin();
        } else {
            var listener = Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    Lampa.Listener.remove('app', listener);
                    initPlugin();
                }
            });
        }
    }

    function initPlugin() {
        // Добавляем локализацию
        Lampa.Lang.add({
            tmdb_networks_production: {
                en: 'Production',
                uk: 'Виробництво',
                ru: 'Производство'
            }
        });

        // Добавляем стили
        var style = document.createElement('style');
        style.textContent = `
            .network-btn {
                margin-right: 10px;
                cursor: pointer;
            }
            .network-btn:hover {
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);

        // Обработчик для карточек контента
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

        // Удаляем старую кнопку, если есть
        $('.network-btn', tagsContainer).remove();

        // Создаем новую кнопку
        var btn = $(`
            <div class="tag-count selector network-btn">
                <div class="tag-count__name">${Lampa.Lang.translate('tmdb_networks_production')}</div>
                <div class="tag-count__count">${networks.length}</div>
            </div>
        `);

        btn.on('hover:enter', function() {
            showNetworksList(networks, cardObject);
        });

        tagsContainer.append(btn);
    }

    function showNetworksList(networks, cardObject) {
        var currentController = Lampa.Controller.enabled().name;
        
        var items = networks.map(function(network) {
            return {
                title: network.name,
                network: network,
                image: network.logo_path ? Lampa.TMDB.image('w45' + network.logo_path) : null
            };
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('tmdb_networks_production'),
            items: items,
            onBack: function() {
                Lampa.Controller.toggle(currentController);
            },
            onSelect: function(action) {
                openNetworkContent(action.network, cardObject, currentController);
            }
        });
    }

    function openNetworkContent(network, cardObject, prevController) {
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
    waitAppReady();
})();