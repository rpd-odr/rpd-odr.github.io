(function(plugin) {
  'use strict';
  
  // Конфигурация
  const PLUGIN_NAME = 'KidsMult';
  const VERSION = '1.0';
  const ANIMATION_GENRE = 16;
  
  // Подборки
  const COLLECTIONS = [
    {
      id: 'disney',
      title: 'Дисней',
      params: { with_companies: 2 }
    },
    {
      id: 'pixar',
      title: 'Пиксар', 
      params: { with_companies: 3 }
    }
  ];

  class KidsMultPlugin {
    constructor() {
      this.name = PLUGIN_NAME;
      this.version = VERSION;
    }
    
    init() {
      this._addMainSection();
      this._addCollections();
      this._patchAdultFilter();
    }
    
    _addMainSection() {
      Lampa.Menu.add({
        name: 'kids_mult',
        title: 'Детские мультфильмы',
        icon: 'child',
        page: {
          component: 'list',
          request: 'discover/movie',
          params: {
            with_genres: ANIMATION_GENRE,
            include_adult: false
          }
        }
      });
    }
    
    _addCollections() {
      COLLECTIONS.forEach(collection => {
        Lampa.Menu.add({
          name: `kids_collection_${collection.id}`,
          title: collection.title,
          icon: 'collection',
          page: {
            component: 'list',
            request: 'discover/movie',
            params: {
              with_genres: ANIMATION_GENRE,
              ...collection.params,
              include_adult: false
            }
          }
        });
      });
    }
    
    _patchAdultFilter() {
      const original = Lampa.TMDB.request;
      Lampa.TMDB.request = function(url, params) {
        params = Object.assign({}, params, { include_adult: false });
        return original(url, params);
      };
    }
  }
  
  // Регистрация
  if (plugin && plugin.Plugin) {
    plugin.Plugin.register(new KidsMultPlugin());
  }
  
})(window.Lampa || {});