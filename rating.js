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
    if (iconCache[path]) {
      console.log("KUV Rating: Используем кэшированную иконку:", path);
      return iconCache[path];
    }
    try {
      console.log("KUV Rating: Загружаем иконку:", path);
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Ошибка загрузки SVG (${path}): ${response.status}`);
      const svgContent = await response.text();
      iconCache[path] = svgContent;
      console.log("KUV Rating: Иконка загружена:", path);
      return svgContent;
    } catch (error) {
      console.error("KUV Rating: Ошибка загрузки иконки:", error);
      return null;
    }
  }

  // Получение российского рейтинга из TMDb
  function getRussianRating(card) {
    console.log("KUV Rating: Проверяем card для рейтинга:", card?.title || card?.name || "неизвестный");
    console.log("KUV Rating: release_dates:", card?.release_dates);
    if (!card || !card.release_dates || !card.release_dates.results) {
      console.warn("KUV Rating: Данные release_dates отсутствуют");
      return null;
    }

    const ruRelease = card.release_dates.results.find((release) => release.iso_3166_1 === "RU");
    console.log("KUV Rating: ruRelease:", ruRelease);
    if (ruRelease && ruRelease.release_dates && ruRelease.release_dates.length > 0) {
      const certification = ruRelease.release_dates[0].certification;
      console.log("KUV Rating: Найден certification:", certification);
      if (certification) {
        // Нормализуем рейтинг
        if (certification.match(/18/)) return "18+";
        if (certification.match(/16/)) return "16+";
        if (certification.match(/12/)) return "12+";
        if (certification.match(/6/)) return "6+";
        if (certification.match(/0/)) return "0+";
      }
    }
    console.warn("KUV Rating: Российский рейтинг не найден");
    return null;
  }

  // Перевод статуса сериала
  function getStatusText(status) {
    console.log("KUV Rating: Обрабатываем статус:", status);
    if (status === 'Ended') return 'Завершён';
    if (status === 'Canceled') return 'Отменён';
    if (status === 'Returning Series') return 'Выходит';
    if (status === 'In Production') return 'В производстве';
    return status || 'Неизвестно';
  }

  // Асинхронное получение данных TMDb, если card неполный
  async function fetchCardData(id, type) {
    if (!id) return null;
    try {
      console.log("KUV Rating: Запрашиваем данные TMDb для ID:", id, "Тип:", type);
      const data = await Lampa.TMDB.getMovie(id, { extended: true, type: type || 'movie' });
      console.log("KUV Rating: Получены данные TMDb:", data);
      return data;
    } catch (error) {
      console.error("KUV Rating: Ошибка загрузки данных TMDb:", error);
      return null;
    }
  }

  // Замена возрастного рейтинга и добавление статуса сериала
  async function replaceAgeRatings(render, card) {
    console.log("KUV Rating: Запуск replaceAgeRatings, render:", !!render, "card:", !!card);
    const rateLineElements = render.querySelectorAll(".full-start-new__rate-line");
    console.log("KUV Rating: Найдено элементов .full-start-new__rate-line:", rateLineElements.length);

    if (!rateLineElements.length) {
      console.warn("KUV Rating: Элементы .full-start-new__rate-line не найдены, пробуем альтернативные селекторы");
      const altRateLineElements = render.querySelectorAll("[class*='rate-line']");
      console.log("KUV Rating: Найдено альтернативных rate-line:", altRateLineElements.length);
      if (!altRateLineElements.length) return;
    }

    for (const rateLine of rateLineElements) {
      // Проверяем наличие дубликатов
      console.log("KUV Rating: Проверка дублирования, .ageicon:", !!rateLine.querySelector(".ageicon"), ".status-text:", !!rateLine.querySelector(".status-text"));
      if (rateLine.querySelector(".ageicon") || rateLine.querySelector(".status-text")) {
        console.log("KUV Rating: Иконка рейтинга или статус уже вставлены");
        continue;
      }

      let localCard = card;
      // Если card отсутствует или неполный, пытаемся загрузить данные
      if (!localCard || (!localCard.release_dates && !localCard.status)) {
        const cardElement = rateLine.closest(".card");
        const id = cardElement?.dataset.id;
        const type = cardElement?.dataset.type || (localCard?.number_of_seasons ? 'tv' : 'movie');
        console.log("KUV Rating: Card отсутствует или неполный, ID:", id, "Тип:", type);
        if (id) {
          localCard = await fetchCardData(id, type);
        } else {
          console.warn("KUV Rating: Не удалось определить ID карточки");
          continue;
        }
      }

      if (!localCard) {
        console.warn("KUV Rating: Объект card не удалось получить");
        continue;
      }

      // Тестовая вставка для проверки DOM
      console.log("KUV Rating: Тестовая вставка");
      rateLine.insertAdjacentHTML("beforeend", '<span class="kuv-test">TEST</span>');

      // Получаем российский рейтинг
      let addedContent = false;
      const rating = getRussianRating(localCard);
      if (rating) {
        let key = null;
        if (rating === "18+") key = "age-18";
        else if (rating === "16+") key = "age-16";
        else if (rating === "12+") key = "age-12";
        else if (rating === "6+") key = "age-6";
        else if (rating === "0+") key = "age-0";

        if (key && ICONS[key]) {
          console.log("KUV Rating: Подготовка вставки рейтинга:", key);
          const paths = ICONS[key];
          const svgContent = await fetchIcon(paths.main);
          if (svgContent) {
            const svgDoc = new DOMParser().parseFromString(svgContent, "image/svg+xml");
            const svgElement = svgDoc.querySelector("svg");
            if (svgElement) {
              svgElement.classList.add("ageicon");
              rateLine.insertAdjacentHTML("beforeend", svgElement.outerHTML);
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
      console.log("KUV Rating: Проверка сериала, number_of_seasons:", localCard.number_of_seasons, "status:", localCard.status);
      if (localCard.number_of_seasons || localCard.status) {
        const status = getStatusText(localCard.status);
        if (status && status !== 'Неизвестно') {
          const statusElement = document.createElement("span");
          statusElement.className = "status-text";
          statusElement.textContent = status;
          rateLine.appendChild(statusElement);
          console.log("KUV Rating: Статус сериала вставлен:", status);
          addedContent = true;
        }
      }

      // Удаляем старый .full-start__pg
      if (addedContent) {
        const pgElement = rateLine.closest(".card")?.querySelector(".full-start__pg, [class*='pg']");
        console.log("KUV Rating: Поиск .full-start__pg, найдено:", !!pgElement);
        if (pgElement) {
          pgElement.remove();
          console.log("KUV Rating: Старый элемент .full-start__pg удален");
        } else {
          console.warn("KUV Rating: Элемент .full-start__pg не найден для удаления");
        }
      }
    }
  }

  // Добавление стилей
  function addStyles() {
    if ($('style#kuv-rating-plugin').length === 0) {
      console.log("KUV Rating: Добавляем стили");
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
          .kuv-test {
            color: red;
            font-size: 0.8em;
            margin-left: 5px;
          }
        `)
        .appendTo('head');
    } else {
      console.log("KUV Rating: Стили уже добавлены");
    }
  }

  // Отслеживание изменений DOM
  function observeDOMChanges() {
    if (typeof MutationObserver === "undefined") {
      console.warn("KUV Rating: MutationObserver не поддерживается");
      return;
    }
    const observer = new MutationObserver((mutations) => {
      console.log("KUV Rating: Обнаружены изменения DOM");
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1 && node.querySelector(".full-start-new__rate-line")) {
              console.log("KUV Rating: Найден новый узел с .full-start-new__rate-line");
              replaceAgeRatings(node, Lampa.Activity.active()?.movie);
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    console.log("KUV Rating: MutationObserver запущен");
  }

  // Инициализация плагина
  function initPlugin() {
    console.log("KUV Rating: Инициализация плагина");
    addStyles();

    // Обработка карточек через событие full
    Lampa.Listener.follow('full', async function(e) {
      console.log("KUV Rating: Событие full сработало, тип:", e.type);
      if (e.type === 'complite') {
        const render = e.object.activity.render();
        const card = e.object.card;
        console.log("KUV Rating: Обработка карточки, render:", !!render, "card:", !!card);
        await replaceAgeRatings(render, card);
      }
    });

    // Обработка активности
    Lampa.Listener.follow("activity:start", async () => {
      console.log("KUV Rating: Событие activity:start");
      document.querySelectorAll(".card").forEach(card => {
        replaceAgeRatings(card, Lampa.Activity.active()?.movie);
      });
    });

    // Отслеживание изменений DOM
    observeDOMChanges();
  }

  // Запуск плагина
  if (window.appready) {
    console.log("KUV Rating: Приложение готово, запускаем плагин");
    initPlugin();
  } else {
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') {
        console.log("KUV Rating: Событие app:ready, запускаем плагин");
        initPlugin();
      }
    });
  }
})();