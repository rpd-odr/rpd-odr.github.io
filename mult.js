import { TMDB } from 'lampa/tmdb';
import { Storage } from 'lampa/storage';

export default function(lampa) {
    // Конфиг плагина
    const config = {
        name: 'kuv-animation',
        title: 'Детская анимация',
        icon: 'animation',
        adult: false,
        genres: [16], // Анимация
        sort: 'popularity.desc'
    };

    // Регистрация пункта меню
    lampa.Menu.add({
        name: config.name,
        title: config.title,
        icon: config.icon,
        component: 'Lampa.TMDBGrid',
        params: {
            type: 'movie',
            query: {
                with_genres: config.genres.join(','),
                include_adult: config.adult,
                sort_by: config.sort,
                with_original_language: 'ru'
            }
        }
    });

    // Фильтрация результатов
    lampa.TMDB.onLoad((data, type) => {
        if(type === 'movie' && data.query?.with_genres === config.genres.join(',')) {
            return {
                ...data,
                items: data.items.filter(item => 
                    config.genres.some(g => item.genre_ids.includes(g)) &&
                    (config.adult ? true : !item.adult)
                )
            };
        }
        return data;
    });

    // Кеширование запросов
    const cache = new Storage(config.name);
    const originalGet = lampa.TMDB.get;
    
    lampa.TMDB.get = async function(params) {
        const key = JSON.stringify(params);
        
        if(cache.has(key)) {
            return cache.get(key);
        }

        const data = await originalGet.call(this, params);
        cache.set(key, data, 3600); // Кеш на 1 час
        return data;
    };

    console.log(`[${config.name}] Плагин успешно загружен`);
}