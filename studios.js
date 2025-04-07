(function(){
    const plugin_id = 'studios_info';

    function init(){
        Lampa.Listener.follow('full', function(e){
            if(e.type === 'complite'){
                const data = e.data;
                if(!data?.id || !data?.tmdbID) return;

                let btn = $('<div class="full-start__button selector"><span>Производство</span></div>');

                btn.on('hover:enter', function(){
                    Lampa.Api.movie(data.tmdbID, function(result){
                        let studios = result.production_companies || [];
                        let networks = result.networks || [];

                        if(!studios.length && !networks.length){
                            Lampa.Noty.show('Нет данных о производителях');
                            return;
                        }

                        let html = '';

                        if(studios.length){
                            html += '<div class="about"><div class="about__title">Студии:</div><div class="about__text">';
                            html += studios.map(s => s.name).join(', ');
                            html += '</div></div>';
                        }

                        if(networks.length){
                            html += '<div class="about"><div class="about__title">Каналы:</div><div class="about__text">';
                            html += networks.map(n => n.name).join(', ');
                            html += '</div></div>';
                        }

                        Lampa.Modal.open({
                            title: 'Производство',
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
                        Lampa.Noty.show('Ошибка загрузки данных');
                    });
                });

                $('.full-start__buttons').append(btn);
            }
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