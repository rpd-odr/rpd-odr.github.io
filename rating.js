// Плагин KUV Rating для Lampa.
// Заменяет возрастной рейтинг в .full-start__pg на SVG-иконку с диапазонной проверкой.
// Иконка добавляется в начало строки .full-start-new__rate-line.
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

  // Кэш для SVG-иконок
  const iconCache = {};

  // Получение нормализованного рейтинга по диапазону
  function getNormalizedRating(ageText) {
    const match = ageText.match(/^(\d+)\+?$/);
    if (!match) return null;

    const age = parseInt(match[1], 10);
    const range = RATING_RANGES.find((r) => age >= r.min && age <= r.max);
    return range ? range.rating : null;
  }

  // Загрузка иконки с кэшированием
  async function fetchIcon(url) {
    if (iconCache[url]) {
      return iconCache[url];
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Ошибка загрузки SVG: ${response.status}`);
      const svg = await response.text();
      iconCache[url] = svg;
      return svg;
    } catch (e) {
      console.error("KUV Rating: Ошибка при загрузке иконки:", e);
      return null;
    }
  }

  // Обработка возрастных рейтингов
  async function processRatings() {
    const ratingBlocks = document.querySelectorAll(".full-start__pg, [class*='pg']");
    for (const block of ratingBlocks) {
      if (block.dataset.kuvProcessed) continue;
      block.dataset.kuvProcessed = "true";

      const ageText = block.textContent.trim();
      const normalizedRating = getNormalizedRating(ageText);
      if (!normalizedRating || !AGE_ICONS[normalizedRating]) continue;

      try {
        const svg = await fetchIcon(AGE_ICONS[normalizedRating]);
        if (!svg) continue;

        const iconContainer = document.createElement("div");
        iconContainer.className = "kuv-age-icon";
        iconContainer.innerHTML = svg;

        // Находим .full-start-new__rate-line или родителя .full-start__pg
        let targetElement = block.closest(".full-start-new__rate-line, .full-start__rate-line, [class*='rate-line']");
        if (!targetElement) {
          targetElement = block.parentNode;
        }

        // Вставляем иконку в начало целевого элемента
        targetElement.insertBefore(iconContainer, targetElement.firstChild);
        block.style.display = "none";
      } catch (e) {
        console.error("KUV Rating: Ошибка при обработке рейтинга:", e);
      }
    }
  }

  // Инициализация плагина
  function initPlugin() {
    // Добавляем стили
    const style = document.createElement("style");
    style.id = "kuv-rating-plugin";
    style.textContent = `
      .kuv-age-icon {
        display: inline-block;
        margin-right: 1.5em!important;
        vertical-align: middle;
      }
      .kuv-age-icon svg {
        width: 2.2em;
        height: 2.2em;
      }
      .full-start__pg, .full-start__status {
        background: rgba(0, 0, 0, 0.15);
        border-radius: 0.3em;
        border: none!important;
      }
    `;
    document.head.appendChild(style);

    // Обрабатываем рейтинги сразу
    processRatings();

    // Наблюдаем за изменениями DOM
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length)) {
        processRatings();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Запуск плагина
  if (document.readyState === "complete") {
    initPlugin();
  } else {
    window.addEventListener("DOMContentLoaded", initPlugin);
  }
})();
