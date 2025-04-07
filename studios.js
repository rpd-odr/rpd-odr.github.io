(function(){
    'use strict';

    const plugin_id = 'studios_and_networks';

    function createTag(count){
        let tag = $(`
            <div class="tag-count selector" data-studios>
                <div class="tag-count__name">Каналы / телесети</div>
                <div class="tag-count__count">${count}</div>
            </div>
        `);

        tag.on('hover:enter', function(){
            let card = Lampa.Activity.active().data;
            let tmdb_id = getTmdbId(card);

            if (!tmdb_id) {
                Lampa.Noty.show('TMDb ID не найден');
                return;
            }

            // Используем метод get для запроса информации о фильме
            Lampa.Api.get(`movie/${tmdb_id}`, function(result){
                let studios = result.production_companies || [];
                let networks = result.networks || [];

                if(!studios.length && !networks.length){
                    Lampa.Noty.show('Нет данных о каналах или студиях');
                    return;
                }

                let html = '';

                if(studios.length){
                    html += `<div class="about"><div class="about__title">Студии:</div><div class="about__text">`;
                    html += studios.map(s => s.name).join(', ');
                    html += `</div></div>`;
                }

                if(networks.length){
                    html += `<div class="about"><div class="about__title">Каналы / Телесети:</div><div class="about__text">`;
                    html += networks.map(n => n.name).join(', ');
                    html += `</div></div>`;
                }

                Lampa.Modal.open({
                    title: 'Каналы / телесети',
                    html: html,
                    onBack: () => {
                        Lampa.Controller.toggle('content');
                    }
                });

                Lampa.Controller.add('modal', {
                    toggle: function(){
                        Lampa.Controller.collectionSet($('.modal__content'), this);
                        Lampa.Controller.collectionFocus(false, $('.modal__content .selector').eq(0)[0]);
                    },
                    back: function(){
                        Lampa.Modal.close();
                        Lampa.Controller.toggle('content');
                    }
                });

                Lampa.Controller.toggle('modal');
            }, function(){
                Lampa.Noty.show('Ошибка при получении данных TMDb');
            });
        });

        return tag;
    }

    function getTmdbId(card){
        console.log('Card data:', card); // Отладка

        // Проверим, какие поля существуют в объекте card
        for (let key in card) {
            console.log(`Key: ${key}, Value:`, card[key]);
        }

        // Попробуем найти id в другом месте объекта
        if(card?.movie?.id) {
            console.log('Using id from movie:', card.movie.id); // Отладка
            return card.movie.id;
        }

        // Если не находим, вернем null
        return null;
    }

    function insertTag(card){
        console.log('Inserting tag...'); // Отладка

        let container = $('.full-descr__tags');
        if(container.length && !container.find('[data-studios]').length){
            console.log('Found container, checking for TMDb ID...'); // Отладка

            let tmdb_id = getTmdbId(card);
            if (!tmdb_id) {
                console.log('TMDb ID not found'); // Отладка
                return;
            }

            // Используем Lampa.Api.get для получения информации о фильме
            Lampa.Api.get(`movie/${tmdb_id}`, function(result){
                let studios = result.production_companies || [];
                let networks = result.networks || [];
                let total = studios.length + networks.length;

                console.log('Total studios and networks:', total); // Отладка

                if(total === 0) return;

                container.append(createTag(total));
                console.log('Tag inserted successfully'); // Отладка
            });
        } else {
            console.log('Container not found or tag already exists'); // Отладка
        }
    }

    function init(){
        Lampa.Listener.follow('full', function(e){
            if(e.type === 'complite') insertTag(e.data);
        });
    }

    if(window.appready){
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();