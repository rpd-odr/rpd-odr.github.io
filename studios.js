(function(){
    const plugin_id = 'studios_and_networks';

    function createTag(){
        let tag = $('<div class="tag tag--gray selector" data-studios><span>Каналы / телесети</span></div>');

        tag.on('hover:enter', function(){
            let card = Lampa.Activity.active().data;
            let tmdb_id = card?.tmdbID;

            if(!tmdb_id) {
                Lampa.Noty.show('TMDb ID не найден');
                return;
            }

            Lampa.Api.movie(tmdb_id, function(result){
                let studios = result.production_companies || [];
                let networks = result.networks || [];

                if(!studios.length && !networks.length){
                    Lampa.Noty.show('Нет данных о каналах или телесетях');
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

    function insertTag(){
        let container = $('.full-descr__tags');
        if(container.length && !container.find('[data-studios]').length){
            container.append(createTag());
        }
    }

    function init(){
        Lampa.Listener.follow('full', function(e){
            if(e.type === 'complite') insertTag();
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