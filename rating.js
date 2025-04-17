// Плагин KUV Rating для Lampa.
// Заменяет возрастной рейтинг в .full-start__pg на SVG-иконку с диапазонной проверкой.
// Добавляет статус сериала в .full-start-new__rate-line.
// Совместим с KUV style и KUV studios.

(function () {
  "use strict";

  // const localpath = "/plugins/kuv/"; // раскомментировать для локального использования
  const gitpath = "https://rpd-odr.github.io/kuv/";

  // Иконки возрастных рейтингов
  const AGE_ICONS = {
    "0+": gitpath + "icons/age0.svg",
    "6+": gitpath + "icons/age6.svg",
    "12+": gitpath + "icons/age12.svg",
    "16+": gitpath + "icons/age16.svg",
    "18+": gitpath + "icons/age18.svg"
  };

  // Диапазоны для возрастных рейтингов
  const RATING_RANGES = [
    { min: 0, max: 5, rating: "0+" },
    { min: 6, max: 11, rating: "6+" },
    { min: 12, max: 15, rating: "12+" },
    { min: 16, max: 17, rating: "16+" },
    { min: 18, max: Infinity, rating: "18+" }
  ];

  // Получение нормализованного рейтинга по диапазону
  function getNormalizedRating(ageText) {
    console.log("KUV Rating: Обрабатываем рейтинг:", ageText);
    const match = ageText.match(/^(\d+)\+?$/);
    if (!match) {
      console.warn("KUV Rating: Неверный формат рейтинга:", ageText);
      return null;
    }

    const age = parseInt(match[1], 10);
    const range = RATING_RANGES.find((r) => age >= r.min && age <= r.max);
    if (range) {
      console.log("KUV Rating: Нормализованный рейтинг:", range.rating);
      return range.rating;
    }

    console.warn("KUV Rating: Рейтинг вне диапазона:", age);
    return null;
  }

  // Перевод статуса сериала
  function getStatusText(status) {
    console.log("KUV Rating: Обрабатываем статус:", status);
    if (status === "Ended") return "Завершён";
    if (status === "Canceled") return "Отменён";
    if (status === "Returning Series") return "Выходит";
    if (status === "In Production") return "В производстве";
    return "";
  }

  // Асинхронное получение данных TMDb
  async function fetchCardData(id, type) {
    if (!id) return null;
    try {
      console.log("KUV Rating: Запрашиваем данные TMDb для ID:", id, "Тип:", type);
      const data = await Lampa.TMDB.getMovie(id, { extended: true, type: type || "movie" });
      console.log("KUV Rating: Получены данные TMDb:", data);
      return data;
    } catch (error) {
      console.error("KUV Rating: Ошибка загрузки данных TMDb:", error);
      return null;
    }
  }

  // Обработка возрастных рейтингов
  async function processRatings() {
    const ratingBlocks = document.querySelectorAll(".full-start__pg, [class*='pg']");
    console.log("KUV Rating: Найдено блоков рейтинга:", ratingBlocks.length);

    for (const block of ratingBlocks) {
      if (block.dataset.kuvProcessed) {
        console.log("KUV Rating: Блок уже обработан:", block.textContent);
        continue;
      }
      block.dataset.kuvProcessed = "true";

      const ageText = block.textContent.trim();
      const normalizedRating = getNormalizedRating(ageText);
      if (!normalizedRating || !AGE_ICONS[normalizedRating]) {
        console.warn("KUV Rating: Иконка для рейтинга не найдена:", normalizedRating || ageText);
        continue;
      }

      try {
        console.log("KUV Rating: Загружаем иконку для:", normalizedRating);
        const response = await fetch(AGE_ICONS[normalizedRating]);
        if (!response.ok) throw new Error(`Ошибка загрузки SVG: ${response.status}`);
        const svg = await response.text();

        const iconContainer = document.createElement("div");
        iconContainer.className = "kuv-age-icon";
        iconContainer.innerHTML = svg;

        block.parentNode.insertBefore(iconContainer, block.nextSibling);
        block.style.display = "none";
        console.log("KUV Rating: Иконка вставлена для:", normalizedRating);
      } catch (e) {
        console.error("KUV Rating: Ошибка при обработке рейтинга:", e);
      }
    }
  }

  // Обработка статуса сериала
  async function processSeriesStatus(render, card) {
    console.log("KUV Rating: Запуск processSeriesStatus, render:", !!render, "card:", !!card);
    if (!render) {
      console.warn("KUV Rating: render отсутствует");
      return;
    }

    let localCard = card;
    if (!localCard || (!localCard.number_of_seasons && !localCard.status)) {
      console.log("KUV Rating: Данные сериала отсутствуют, пробуем загрузить");
      const cardElement = render.querySelector(".card, [class*='card']");
      let id = cardElement?.dataset.id;
      if (!id && cardElement?.dataset.params) {
        try {
          const params = JSON.parse(cardElement.dataset.params);
          id = params?.id || params?.movie?.id;
          console.log("KUV Rating: ID из dataset.params:", id);
        } catch (e) {
          console.warn("KUV Rating: Ошибка парсинга dataset.params:", e);
        }
      }
      const type = localCard?.number_of_seasons ? "tv" : "movie";
      if (id) {
        localCard = await fetchCardData(id, type);
      } else {
        console.warn("KUV Rating: ID карточки не найден");
        return;
      }
    }

    if (!localCard) {
      console.warn("KUV Rating: Объект card не удалось получить");
      return;
    }

    console.log("KUV Rating: card:", localCard, "status:", localCard.status, "number_of_seasons:", localCard.number_of_seasons);
    if (!localCard.number_of_seasons && !localCard.status) {
      console.warn("KUV Rating: Это не сериал или данные отсутствуют");
      return;
    }

    const rateLine = render.querySelector(".full-start-new__rate-line, .full-start__rate-line, .card__rate, [class*='rate-line']");
    console.log("KUV Rating: rateLine найден:", !!rateLine);
    let targetElement = rateLine;
    if (!rateLine) {
      console.warn("KUV Rating: Элемент rate-line не найден, пробуем .full-start__pg");
      targetElement = render.querySelector(".full-start__pg, [class*='pg']")?.parentNode;
      if (!targetElement) {
        console.warn("KUV Rating: Альтернативный элемент не найден");
        return;
      }
    }

    if (targetElement.querySelector(".status-text")) {
      console.log("KUV Rating: Статус уже вставлен");
      return;
    }

    // Тестовая вставка
    console.log("KUV Rating: Тестовая вставка");
    targetElement.insertAdjacentHTML("beforeend", '<span class="kuv-test">TEST</span>');

    const status = getStatusText(localCard.status);
    if (status) {
      const statusElement = document.createElement("span");
      statusElement.className = "status-text";
      statusElement.textContent = status;
      targetElement.appendChild(statusElement);
      console.log("KUV Rating: Статус сериала вставлен:", status);
    } else {
      console.warn("KUV Rating: Статус пустой или неизвестный");
    }
  }

  // Инициализация плагина
  function initPlugin() {
    console.log("KUV Rating: Инициализация плагина");

    // Добавляем стили
    const style = document.createElement("style");
    style.id = "kuv-rating-plugin";
    style.textContent = `
      .kuv-age-icon {
        display: inline-block;
        margin-left: 6px;
        vertical-align: middle;
      }
      .kuv-age-icon svg {
        width: 22px;
        height: 22px;
      }
      .status-text {
        font-size: .9em;
        color: rgba(255, 255, 255, .8);
        margin-left: 8px;
        vertical-align: middle;
      }
      .kuv-test {
        color: red;
        font-size: .8em;
        margin-left: 5px;
      }
    `;
    document.head.appendChild(style);
    console.log("KUV Rating: Стили добавлены");

    // Обрабатываем рейтинги сразу
    processRatings();

    // Наблюдаем за изменениями DOM для рейтингов
    const observer = new MutationObserver((mutations) => {
      let needsUpdate = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          needsUpdate = true;
        }
      });
      if (needsUpdate) {
        console.log("KUV Rating: Обнаружены изменения DOM, обновляем рейтинги");
        processRatings();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    console.log("KUV Rating: MutationObserver запущен");

    // Обработка статуса сериала через событие full
    Lampa.Listener.follow("full", async function (e) {
      console.log("KUV Rating: Событие full, тип:", e.type);
      if (e.type === "complite") {
        console.log("KUV Rating: Событие full complite, card:", e.object.card?.title || e.object.card?.name);
        const render = e.object.activity.render();
        const card = e.object.card;
        await processSeriesStatus(render, card);
      }
    });

    // Альтернативная обработка статуса через activity:start
    Lampa.Listener.follow("activity:start", async () => {
      console.log("KUV Rating: Событие activity:start");
      const render = document.body;
      const card = Lampa.Activity.active()?.movie;
      await processSeriesStatus(render, card);
    });
  }

  // Запуск плагина
  if (document.readyState === "complete") {
    console.log("KUV Rating: Документ готов, запускаем плагин");
    initPlugin();
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      console.log("KUV Rating: DOMContentLoaded, запускаем плагин");
      initPlugin();
    });
  }
})();