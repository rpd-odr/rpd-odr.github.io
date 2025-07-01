(function() {
    'use strict';
    window.lampa_settings = window.lampa_settings || {};
    Lampa.Storage.set('metadata_language', 'ru'); // Названия и описания на русском
    Lampa.Listener.follow('tmdb', function(e) {
        if (e.type === 'request') {
            // Используем оригинальный язык для постеров
            e.data.params.language = e.data.movie.original_language || 'en'; // Оригинальный язык или английский по умолчанию
            e.data.params.metadata_language = 'ru'; // Названия и описания на русском
        }
    });
})();