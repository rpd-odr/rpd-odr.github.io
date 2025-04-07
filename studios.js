(function () {
    'use strict';

    var network = new Lampa.Reguest();
    var cache = new Map();

    // [Предыдущие функции остаются без изменений: getMovieProviders, getNetworks, showNetworkMenu, addNetworkButton]

    function initPlugin() {
        if ($('style#network-plugin').length === 0) {
            $('<style>')
                .attr('id', 'network-plugin')
                .html(`
                    .button--network, 
                    .button--studio {
                        padding: .3em;
                    }
                    
                    .network-innie {
                        background-color: #fff;
                        width: 100%;
                        height: 100%;
                        border-radius: .7em;
                        display: flex;
                        align-items: center;
                        padding: 0 1em;
                    }

                    .button--network img,
                    .button--studio img {
                        height: 100%;
                        max-height: 1.5em;
                        max-width: 4.5em;
                        object-fit: contain;
                    }

                    .full-start-new__title {
                        position: relative;
                    }

                    .original-title {
                        font-size: 0.8em;
                        color: rgba(255, 255, 255, 0.7);
                        margin-top: 0.2em;
                        font-weight: normal;
                    }
                `)
                .appendTo('head');
        }

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                // Добавляем оригинальное название
                const render = e.object.activity.render();
                const card = e.object.card;
                const titleElement = $('.full-start-new__title', render);
                
                if (card && titleElement.length) {
                    const originalTitle = card.original_title || card.original_name;
                    if (originalTitle && originalTitle !== card.title && originalTitle !== card.name) {
                        titleElement.find('.original-title').remove(); // Удаляем старое, если есть
                        $('<div>')
                            .addClass('original-title')
                            .text(originalTitle)
                            .appendTo(titleElement);
                    }
                }

                // Оригинальная логика кнопки сети
                getNetworks(e.object, networks => {
                    if (networks.length) {
                        addNetworkButton(render, networks, e.object.method);
                    }
                });
            }
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && initPlugin());
})();