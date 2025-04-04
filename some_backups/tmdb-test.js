(function () {
  "use strict";

  const tmdbCache = {};

  async function getTMDBData(url, cacheKey) {
    if (tmdbCache[cacheKey]) {
      console.log(`Используем кэш для ключа: ${cacheKey}`);
      return tmdbCache[cacheKey];
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Ошибка при запросе к TMDB API по URL ${url}: ${response.status}`);
      }
      const data = await response.json();
      tmdbCache[cacheKey] = data;
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  Lampa.Listener.follow("full", async (event) => {
    if (event.type === "complite") {
      const movie = event.data.movie;
      const isTVShow = movie.name ? true : false;
      const tmdbEndpoint = isTVShow ? "tv" : "movie";
      const language = Lampa.Storage.get("language");
      const apiKey = Lampa.TMDB.key();
      const logoLanguage = Lampa.Storage.get("tmdb_logo_language", "null");

      const tmdbImagesUrl = Lampa.TMDB.api(
        `${tmdbEndpoint}/${movie.id}/images?api_key=${apiKey}&language=${logoLanguage === "null" ? language : logoLanguage}`
      );
      const imagesCacheKey = `${tmdbEndpoint}_${movie.id}_images_${language}_${logoLanguage}`;

      const imagesResponse = await getTMDBData(tmdbImagesUrl, imagesCacheKey);

      if (imagesResponse && imagesResponse.logos && imagesResponse.logos.length > 0) {
        const logoPath = imagesResponse.logos[0].file_path;

        if (logoPath) {
          const logoUrl = Lampa.TMDB.image(`/t/p/w500${logoPath}`);

          const logoElement = document.createElement("img");
          logoElement.className = "db-mov-logo";
          logoElement.src = logoUrl;
          logoElement.onload = function () {
            console.log("Логотип загружен");
            logoElement.classList.add("logo-loaded");
          };

          async function displayLogoWithNetworkOrStudio(networkOrStudioContent = "") {
            const titleElement = event.object.activity.render().find(".full-start-new__title");
            console.log("Название элемента:", titleElement.text()); // Отладка. use .text() for jquery object.

            const titleWrapper = document.createElement("span");
            titleWrapper.className = "title-wrapper";
            titleWrapper.textContent = titleElement.text(); // use .text() for jquery object.
            titleElement.empty().append(titleWrapper); // use jquery append() method.

            titleWrapper.classList.add("fade-out");
            console.log("Добавлен класс fade-out:", titleWrapper.classList.contains("fade-out")); // Отладка

            setTimeout(() => {
              titleElement.append(logoElement); // use jquery append() method.
              console.log("Логотип добавлен:", logoElement.parentElement === titleElement[0]); // Отладка. titleElement[0] to access the native DOM element.
            }, 300);

            if (networkOrStudioContent) {
              event.object.activity.render().find(".full-start-new__rate-line").append(networkOrStudioContent);
            }
          }

          const tmdbDetailsUrl = Lampa.TMDB.api(`${tmdbEndpoint}/${movie.id}?api_key=${apiKey}&language=${language}`);
          const detailsCacheKey = `${tmdbEndpoint}_${movie.id}_details_${language}`;

          const detailsResponse = await getTMDBData(tmdbDetailsUrl, detailsCacheKey);

          if (detailsResponse) {
            if (isTVShow && detailsResponse.networks && detailsResponse.networks.length > 0) {
              const network = detailsResponse.networks[0];
              let networkContent = "";

              if (network.logo_path) {
                const networkLogoUrl = Lampa.TMDB.image(`/t/p/w92${network.logo_path}`);
                networkContent = `<img class="db-net-logo" src="${networkLogoUrl}" />`;
              } else if (network.name) {
                networkContent = `<span style="margin-left: 10px;">${network.name}</span>`;
              }

              await displayLogoWithNetworkOrStudio(networkContent);
            } else if (!isTVShow && detailsResponse.production_companies && detailsResponse.production_companies.length > 0) {
              const studio = detailsResponse.production_companies[0];
              let studioContent = "";

              if (studio.logo_path) {
                const studioLogoUrl = Lampa.TMDB.image(`/t/p/w92${studio.logo_path}`);
                studioContent = `<img class="db-net-logo" src="${studioLogoUrl}" />`;
              } else if (studio.name) {
                studioContent = `<span style="margin-left: 10px;">${studio.name}</span>`;
              }

              await displayLogoWithNetworkOrStudio(studioContent);
            } else {
              await displayLogoWithNetworkOrStudio();
            }
          } else {
            await displayLogoWithNetworkOrStudio();
          }
        }
      } else {
        console.warn("Логотипы не найдены для данного контента.");
      }
    }
  });
})();
