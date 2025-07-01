(function() {
    'use strict';
    if (!localStorage.getItem('language')) {
        localStorage.setItem('language', 'ru'); // Названия и описания на русском
    }
    // Перехватываем запросы к TMDB
    Lampa.Listener.follow('tmdb', function(e) {
        if (e.type === 'request' && e.data.movie) {
            var originalLang = e.data.movie.original_language || 'en'; // Язык оригинала или английский
            e.data.params.language = originalLang; // Язык для постеров
            e.data.params.metadata_language = 'ru'; // Язык для названий и описаний
            localStorage.setItem('tmdb_lang', originalLang); // Устанавливаем tmdb_lang
            console.log('TMDB poster language: ' + originalLang); // Для отладки
        }
    });
})();