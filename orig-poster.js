(function() {
    'use strict';
    window.lampa_settings = window.lampa_settings || {};
    Lampa.Storage.set('metadata_language', 'ru'); // Названия и описания на русском
    Lampa.Listener.follow('tmdb', function(e) {
        if (e.type === 'request' && e.data.movie) {
            // Устанавливаем язык постеров на основе original_language
            var originalLang = e.data.movie.original_language || 'en'; // Английский как запасной
            e.data.params.language = originalLang; // Язык постеров
            e.data.params.metadata_language = 'ru'; // Язык метаданных
            console.log('Poster language set to: ' + originalLang); // Для отладки
        }
    });
})();