(function () {
    'use strict';

    // Ждём готовности приложения
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
        // Добавляем стили для кнопки
        var style = document.createElement('style');
        style.textContent = `
            .button--platforms {
                margin-left: 10px;
                height: 100%;
            }
            .button--platforms img {
                height: 100%;
                max-height: 30px;
                object-fit: contain;
                border-radius: 4px;
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
                        console.error('Platforms plugin error:', err);
                    }
                }, 300);
            }
        });
    }

    function processCard(cardObject) {
        var item = cardObject.item;
        if (!item) return;

        // Получаем список сетей/студий
        var networks = item.networks || item.production_companies || [];
        if (networks.length === 0) return;

        // Находим первую сеть с логотипом
        var network = networks.find(n => n.logo_path) || networks[0];
        if (!network) return;

        var buttonsContainer = $('.full-start-new__buttons', cardObject.nodes.body);
        if (!buttonsContainer.length) return;

        // Удаляем старую кнопку, если есть
        $('.button--platforms', buttonsContainer).remove();

        // Создаем кнопку с логотипом
        var btn = $(`
            <div class="full-start__button selector button--platforms">
                <img src="${Lampa.TMDB.image('w154' + network.logo_path)}" alt="${network.name}">
            </div>
        `);

        btn.on('hover:enter', function() {
            openNetworkContent(network, cardObject);
        });

        buttonsContainer.append(btn);
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
    waitAppReady();
})();