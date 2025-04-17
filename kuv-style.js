// Плагин KUV style для Lampa.
// Заменяет большинство иконок и шрифты в интерфейсе.
// Частично переработан интерфейс.
// Заменяет возрастной рейтинг на SVG-иконку из TMDb данных.
// Добавлена кнопка перезагрузки в шапку.

// Для корректной работы из локального источника необходима папка kuv со всеми подпапками.
// А также нужно заменить gitpath на localpath в коде ниже!

(function () {
  "use strict";

  // const localpath = "/plugins/kuv/"; // раскомментировать и заменить gitpath на localpath, если расположен локально
  const gitpath = "https://rpd-odr.github.io/kuv/";

  // Карта иконок: ключ — часть класса, значения — пути к SVG
  const ICONS = {
    "head__logo-icon": { main: gitpath + "img/logo-icon.svg" },
    "open--search": { main: gitpath + "icons/magnifying-glass-duotone.svg" },
    "n-search": { main: gitpath + "icons/magnifying-glass-duotone.svg" },
    "-settings": { main: gitpath + "icons/gear-duotone.svg" },
    "reload-icon": { main: gitpath + "icons/arrows-clockwise-duotone.svg" },
    "full-screen": { main: gitpath + "icons/arrows-out-simple-duotone.svg" },
    "head__menu-icon": { main: gitpath + "icons/list-bullets-duotone.svg" },
    "-main": { main: gitpath + "icons/house-duotone.svg" },
    "n-movie": { main: gitpath + "icons/film-slate-duotone.svg" },
    "n-tv": { main: gitpath + "icons/television-duotone.svg" },
    "n-cartoons": { main: gitpath + "icons/rabbit-duotone.svg" },
    "-favorite": { main: gitpath + "icons/list-heart-duotone.svg" },
    "-relise": { main: gitpath + "icons/high-definition-duotone.svg" },
    "-mytorrents": { main: gitpath + "icons/magnet-duotone.svg" },
    "-console": { main: gitpath + "icons/terminal-window-duotone.svg" },
    "n-back": { main: gitpath + "icons/arrow-u-up-left-duotone.svg" },
    "nt-interface": { main: gitpath + "icons/layout-duotone.svg" },
    "nt-player": { main: gitpath + "icons/play-circle-duotone.svg" },
    "nt-server": { main: gitpath + "icons/hard-drives-duotone.svg" },
    "nt-more": { main: gitpath + "icons/sliders-horizontal-duotone.svg" },
    "nt-backup": { main: gitpath + "icons/vault-duotone.svg" },
    "button--book": { main: gitpath + "icons/heart-fill.svg", alt: gitpath + "icons/heart-duotone.svg" },
    "button--play": { main: gitpath + "icons/play-duotone.svg" },
    "button--subscribe": { main: gitpath + "icons/bell-duotone.svg" },
    "view--trailer": { main: gitpath + "icons/youtube-logo-duotone.svg" },
    "view--online": { main: gitpath + "icons/queue-duotone.svg" },
    "view--torrent": { main: gitpath + "icons/download-simple-duotone.svg" },
    "filter--back": { main: gitpath + "icons/arrow-left-duotone.svg" },
    "filter--search": { main: gitpath + "icons/magnifying-glass-duotone.svg" },
    "watched__icon": { main: gitpath + "icons/play-circle-duotone.svg" },
    "prestige__viewed": { main: gitpath + "icons/eye-duotone.svg" },
    "item__viewed": { main: gitpath + "icons/play-duotone.svg" },
    "head-rate": { main: gitpath + "icons/star-duotone.svg" },
    "open--premium": { main: gitpath + "icons/star-duotone.svg" },
    "open--feed": { main: gitpath + "icons/star-four-duotone.svg" },
    "open--notice": { main: gitpath + "icons/bell-duotone.svg" },
    "n-about": { main: gitpath + "icons/info-duotone.svg" },
    "open--broadcast": { main: gitpath + "icons/broadcast-duotone.svg" },
    "button--reaction": { main: gitpath + "icons/smiley-sticker-duotone.svg" },
    "nt-account": { main: gitpath + "icons/user-gear-duotone.svg" },
    "nt-parser": { main: gitpath + "icons/list-magnifying-glass-duotone.svg" },
    "nt-tmdb": { main: gitpath + "icons/database-duotone.svg" },
    "nt-plugins": { main: gitpath + "icons/puzzle-piece-duotone.svg" },
    "nt-parental_control": { main: gitpath + "icons/lock-duotone.svg" },
    "nt-add_plugin": { main: gitpath + "icons/skull-duotone.svg" },
    "nt-pirate_store": { main: gitpath + "icons/puzzle-piece-duotone.svg" },
    "simple-keyboard-mic": { main: gitpath + "icons/microphone-duotone.svg" },
    "close-button": { main: gitpath + "icons/x-circle-duotone.svg" },
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
      console.error("KUV style: Ошибка загрузки иконки:", error);
      return null;
    }
  }

  // Получение российского рейтинга из TMDb
  function getRussianRating(card) {
    if (!card || !card.release_dates || !card.release_dates.results) {
      console.warn("KUV style: Данные release_dates отсутствуют:", card.title || card.name || "неизвестный фильм");
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
    console.warn("KUV style: Российский рейтинг не найден для:", card.title || card.name || "неизвестный фильм");
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
  async function replaceAgeRatings(targetElement, card) {
    const rateLineElements = targetElement.querySelectorAll(".full-start-new__rate-line");
    console.log("KUV style: Найдено элементов .full-start-new__rate-line:", rateLineElements.length);

    for (const rateLine of rateLineElements) {
      // Проверяем, не вставлена ли уже иконка или статус
      if (rateLine.querySelector(".ageicon") || rateLine.querySelector(".status-text")) {
        console.log("KUV style: Иконка рейтинга или статус уже вставлены");
        continue;
      }

      // Если card не передан, пропускаем
      if (!card) {
        console.warn("KUV style: Объект card не предоставлен");
        continue;
      }

      // Получаем российский рейтинг
      const rating = getRussianRating(card);
      if (rating) {
        let key = null;
        if (rating === "18+") key = "age-18";
        else if (rating === "16+") key = "age-16";
        else if (rating === "12+") key = "age-12";
        else if (rating === "6+") key = "age-6";
        else if (rating === "0+") key = "age-0";

        if (key && ICONS[key]) {
          console.log("KUV style: Заменяем рейтинг:", key);
          const paths = ICONS[key];
          const svgContent = await fetchIcon(paths.main);
          if (svgContent) {
            const svgDoc = new DOMParser().parseFromString(svgContent, "image/svg+xml");
            const svgElement = svgDoc.querySelector("svg");
            if (svgElement) {
              svgElement.classList.add("ageicon");
              rateLine.insertAdjacentHTML("beforeend", svgElement.outerHTML); // Вставляем иконку
              console.log("KUV style: Иконка рейтинга вставлена:", rating);
            } else {
              console.error("KUV style: SVG не найден в содержимом:", paths.main);
            }
          } else {
            console.error("KUV style: Не удалось загрузить SVG:", paths.main);
          }
        } else {
          console.warn("KUV style: Рейтинг не поддерживается или отсутствует в ICONS:", rating);
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
          console.log("KUV style: Статус сериала вставлен:", status);
        }
      }

      // Удаляем старый .full-start__pg, если иконка или статус добавлены
      if (rateLine.querySelector(".ageicon") || rateLine.querySelector(".status-text")) {
        const pgElement = rateLine.closest(".card")?.querySelector(".full-start__pg");
        if (pgElement) {
          pgElement.remove();
          console.log("KUV style: Старый элемент .full-start__pg удален");
        }
      }
    }
  }

  // Присваивает классы по data-action
  function assignActionClasses(targetElement) {
    targetElement.querySelectorAll("[data-action]").forEach((parentElement) => {
      const action = parentElement.dataset.action;
      if (action) {
        const childElement = parentElement.querySelector(".menu__ico, .navigation-bar__icon");
        if (childElement) {
          childElement.classList.forEach((className) => {
            if (className.startsWith("data-action-")) {
              childElement.classList.remove(className);
            }
          });
          childElement.classList.add(`data-action-${action}`);
        }
      }
    });
  }

  // Присваивает классы по data-component
  function assignComponentClasses(targetElement) {
    targetElement.querySelectorAll("[data-component]").forEach((parentElement) => {
      const component = parentElement.dataset.component;
      if (component) {
        const childElement = parentElement.querySelector(".settings-folder__icon");
        if (childElement) {
          childElement.classList.forEach((className) => {
            if (className.startsWith("data-component-")) {
              childElement.classList.remove(className);
            }
          });
          childElement.classList.add(`data-component-${component}`);
        }
      }
    });
  }

  // Заменяет иконки на SVG
  async function replaceIcons(targetElement) {
    for (const [key, paths] of Object.entries(ICONS)) {
      const elements = targetElement.querySelectorAll(`[class*="${key}"]`);
      if (elements.length === 0) continue;

      for (const element of elements) {
        const existingSvg = element.querySelector("svg");
        const existingImg = element.querySelector("img");

        if (!existingSvg && !existingImg) continue;

        if (existingSvg) existingSvg.remove();
        if (existingImg) existingImg.remove();

        const mainPath = paths.main;
        const altPath = paths.alt;
        let pathToUse = mainPath;

        // Проверка на fill="transparent" у старого SVG
        const childFillTransparent = existingSvg && Array.from(existingSvg.querySelectorAll("*")).some(
          (child) => child.getAttribute("fill") === "transparent"
        );
        if (childFillTransparent && altPath) {
          pathToUse = altPath;
        }

        const svgContent = await fetchIcon(pathToUse);
        if (svgContent) {
          const svgDoc = new DOMParser().parseFromString(svgContent, "image/svg+xml");
          const svgElement = svgDoc.querySelector("svg");
          if (svgElement) {
            svgElement.classList.add("kuvicon");
            element.insertAdjacentHTML("afterbegin", svgElement.outerHTML);
          }
        }
      }
    }
  }

  // Добавляет кнопку "Перезагрузить" в шапку
  function addReloadButton() {
    const reloadButton = $(
      '<div id="RELOAD" class="head__action selector reload-screen">' +
      '<div class="reload-icon"><svg></svg></div>' +
      '</div>'
    );
    replaceIcons(reloadButton[0]); // применяем иконку
    $('.head__actions').append(reloadButton);
    $('#RELOAD').on('hover:enter hover:click hover:touch', function () {
      location.reload();
    });
  }

  // Добавляет кастомные стили
  function addStyles() {
    if (!document.querySelector('link[href="' + gitpath + 'styles/kuv-style.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = gitpath + "styles/kuv-style.css"; // заменить на localpath при необходимости
      document.head.appendChild(link);
    }
  }

  // Настраивает левое меню
  function customizeMenu() {
    Lampa.Storage.set("menu_hide", JSON.stringify(["Персоны", "Аниме", "Лента", "История", "Расписание", "Подписки", "Фильтр", "Каталог"]));
    Lampa.Storage.set("menu_sort", JSON.stringify(["Главная", "Фильмы", "Сериалы", "Мультики", "Избранное", "Релизы", "Торренты"]));
  }

  // Инициализация плагина
  async function initPlugin() {
    addReloadButton();
    addStyles();
    customizeMenu();
    assignActionClasses(document.body);
    assignComponentClasses(document.body);
    await replaceIcons(document.body);

    // Обработка карточек через событие full
    Lampa.Listener.follow('full', async function(e) {
      if (e.type === 'complite') {
        const render = e.object.activity.render();
        const card = e.object.card;
        assignActionClasses(render);
        assignComponentClasses(render);
        await replaceIcons(render);
        await replaceAgeRatings(render, card); // Передаем card
      }
    });

    // Обработка активности
    Lampa.Listener.follow("activity:start", async () => {
      assignActionClasses(document.body);
      assignComponentClasses(document.body);
      await replaceIcons(document.body);
      // Для активности используем movie из активной карточки
      await replaceAgeRatings(document.body, Lampa.Activity.active()?.movie);
    });

    Lampa.Listener.follow("activity:archive", async () => {
      assignActionClasses(document.body);
      assignComponentClasses(document.body);
      await replaceIcons(document.body);
      // Для архива используем movie из активной карточки
      await replaceAgeRatings(document.body, Lampa.Activity.active()?.movie);
    });

    observeDOMChanges(); // Отслеживаем изменения DOM
  }

  // Следим за DOM и заменяем иконки и возрастные рейтинги при динамических изменениях
  function observeDOMChanges() {
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
              assignActionClasses(node);
              assignComponentClasses(node);
              replaceIcons(node);
              // Для новых узлов используем активный movie
              replaceAgeRatings(node, Lampa.Activity.active()?.movie);
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Запуск плагина
  if (window.appready) {
    initPlugin();
  } else {
    Lampa.Listener.follow("app", (e) => {
      if (e.type === "ready") {
        initPlugin();
      }
    });
  }
})();