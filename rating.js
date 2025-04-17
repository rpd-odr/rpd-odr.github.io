// Плагин KUV Rating для Lampa.
// Заменяет возрастной рейтинг на SVG-иконку из TMDb данных.
// Добавляет статус сериала (например, "Выходит", "Завершён") в карточку.
// Совместим с KUV style и KUV studios.

(function () {
  "use strict";

  // const localpath = "/plugins/kuv/"; // раскомментировать и заменить gitpath на localpath, если расположен локально
  const gitpath = "https://rpd-odr.github.io/kuv/";

  // Карта иконок для возрастных рейтингов (совместимо с KUV style)
  const ICONS = {
    "age-18": { main: gitpath + "icons/age18.svg" },
    "age-16": { main: gitpath + "icons/age16.svg" },
    "age-12": { main: gitpath + "icons/age12.svg" },
    "age-6":  { main: gitpath + "icons/age6.svg" },
    "age-0":  { main: gitpath + "icons/age0.svg" }
  };

  const iconCache = {}; // Кэш иконок

  // Загружает иконку с кэшированием
  async function fetchIcon(path) {
    if (iconCache[path]) return iconCache[path];
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Ошибка загрузки SVG (${path}): ${response.status}`);
      const svgContent = await response.text();
      iconCache[path] = svgContent;
      return svgContent;
    } catch (error) {
      console.error("KUV Rating: Ошибка загрузки иконки:", error);
      return null;
    }
  }

  // Получение российского рейтинга из TMDb
  function getRussianRating(card) {
    if (!card || !card.release_dates || !card.release_dates.results) {
      console.warn("KUV Rating: Данные release_dates отсутствуют:", card.title || card.name || "неизвестный фильм");
      return null;
    }

    const ruRelease = card.release_dates.results.find((release) => release.iso_3166_1 === "RU");
    if (ruRelease && ruRelease.release_dates && ruRelease.release_dates.length > 0) {
      const certification = ruRelease.release_dates[0].certification;
      if (certification) {
        // Нормализуем рейтинг
        if (certification.match(/18/)) return "18+";
        if (certification.match(/16/)) return "16+";
        if (certification.match(/12/)) return "12+";
        if (certification.match(/6/)) return "6+";
        if (certification.match(/0/)) return "0+";
      }
    }
    console.warn("KUV Rating: Российский рейтинг не найден для:", card.title || card.name || "неизвестный фильм");
    return null;
  }

  // Перевод статуса сериала
  function getStatusText(status) {
    if (status === 'Ended') return 'Завершён';
    if (status === 'Canceled') return 'Отменён';
    if (status === 'Returning Series') return 'Выходит';
    if (status === 'In Production') return 'В производстве';
    return status || 'Неизвестно';
  }

  // Замена возрастного рейтинга и добавление статуса сериала
  async function replaceAgeRatings(render, card) {
    const rateLineElements = render.querySelectorAll(".full-start-new__rate-line");
    console.log("KUV Rating: Найдено элементов .full-start-new__rate-line:", rateLineElements.length);

    for (const rateLine of rateLineElements) {
      // Проверяем, не вставлена ли уже иконка или статус
      if (rateLine.querySelector(".ageicon") || rateLine.querySelector(".status-text")) {
        console.log("KUV Rating: Иконка рейтинга или статус уже вставлены");
        continue;
      }

      // Если card не передан, пропускаем
      if (!card) {
        console.warn("KUV Rating: Объект card не предоставлен");
        continue;
      }

      // Получаем российский рейтинг
      let addedContent = false;
      const rating = getRussianRating(card);
      if (rating) {
        let key = null;
        if (rating === "18+") key = "age-18";
        else if (rating === "16+") key = "age-16";
        else if (rating === "12+") key = "age-12";
        else if (rating === "6+") key = "age-6";
        else if (rating === "0+") key = "age-0";

        if (key && ICONS[key]) {
          console.log("KUV Rating: Заменяем рейтинг:", key);
          const paths = ICONS[key];
          const svgContent = await fetchIcon(paths.main);
          if (svgContent) {
            const svgDoc = new DOMParser().parseFromString(svgContent, "image/svg+xml");
            const svgElement = svgDoc.querySelector("svg");
            if (svgElement) {
              svgElement.classList.add("ageicon");
              rateLine.insertAdjacentHTML("beforeend", svgElement.outerHTML); // Вставляем иконку
              console.log("KUV Rating: Иконка рейтинга вставлена:", rating);
              addedContent = true;
            } else {
              console.error("KUV Rating: SVG не найден в содержимом:", paths.main);
            }
          } else {
            console.error("KUV Rating: Не удалось загрузить SVG:", paths.main);
          }
        } else {
          console.warn("KUV Rating: Рейтинг не поддерживается или отсутствует в ICONS:", rating);
        }
      }

      // Добавляем статус для сериалов
      if (card.number_of_seasons || card.status) {
        const status = getStatusText(card.status);
        if (status && status !== 'Неизвестно') {
          const statusElement = document.createElement("span");
          statusElement.className = "status-text";
          statusElement.textContent = status;
          rateLine.appendChild(statusElement);
          console.log("KUV Rating: Статус сериала вставлен:", status);
          addedContent = true;
        }
      }

      // Удаляем старый .full-start__pg, если добавлены иконка или статус
      if (addedContent) {
        const pgElement = rateLine.closest(".card")?.querySelector(".full-start__pg");
        if (pgElement) {
          pgElement.remove();
          console.log("KUV Rating: Старый элемент .full-start__pg удален");
        }
      }
    }
  }

  // Добавление стилей
  function addStyles() {
    if ($('style#kuv-rating-plugin').length === 0) {
      $('<style>')
        .attr('id', 'kuv-rating-plugin')
        .html(`
          .ageicon {
            width: 24px;
            height: 24px;
            fill: currentColor;
            vertical-align: middle;
            margin-left: 5px;
          }
          .status-text {
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.8);
            margin-left: 8px;
            vertical-align: middle;
          }
        `)
        .appendTo('head');
    }
  }

  // Инициализация плагина
  function initPlugin() {
    addStyles();

    // Обработка карточек через событие full
    Lampa.Listener.follow('full', async function(e) {
      if (e.type === 'complite') {
        const render = e.object.activity.render();
        const card = e.object.card;
        await replaceAgeRatings(render, card);
      }
    });
  }

  // Запуск плагина
  if (window.appready) {
    initPlugin();
  } else {
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') {
        initPlugin();
      }
    });
  }
})();